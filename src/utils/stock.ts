import { OSMaterial, StockMaterial, StockRequest, StockMaterialStatus, WorkOrder, WorkOrderStatus } from "../types";

export const STOCK_REQUEST_TERMINAL_STATUSES: StockRequest["status"][] = ["Recebido", "Rejeitado", "Cancelado"];

export const STOCK_REQUEST_PENDING_STATUSES: StockRequest["status"][] = [
  "Aguardando análise",
  "Associado a existente",
  "Aprovado para novo cadastro",
  "Aguardando recebimento",
];

export const getAvailableStock = (material: Pick<StockMaterial, "physicalBalance" | "reservedBalance">) =>
  Number(material.physicalBalance || 0) - Number(material.reservedBalance || 0);

export const getStockStatus = (material: Pick<StockMaterial, "active" | "physicalBalance" | "reservedBalance" | "minStock">): StockMaterialStatus => {
  if (!material.active) return "Inativo";

  const physicalBalance = Number(material.physicalBalance || 0);
  const minStock = Number(material.minStock || 0);
  const availableBalance = getAvailableStock(material);

  if (physicalBalance <= 0) return "Sem saldo";
  if (availableBalance <= 0 || availableBalance <= minStock) return "Crítico";
  if (physicalBalance <= minStock) return "Atenção";
  return "Normal";
};

export const reconcileMaterial = (material: StockMaterial): StockMaterial => {
  const reservedBalance = Math.max(0, Number(material.reservedBalance || 0));
  const physicalBalance = Math.max(0, Number(material.physicalBalance || 0));

  return {
    ...material,
    physicalBalance,
    reservedBalance,
    availableBalance: getAvailableStock({ physicalBalance, reservedBalance }),
    status: getStockStatus({
      active: material.active,
      physicalBalance,
      reservedBalance,
      minStock: material.minStock,
    }),
    updatedAt: new Date().toISOString(),
  };
};

export const isPendingStockRequest = (request: StockRequest) => STOCK_REQUEST_PENDING_STATUSES.includes(request.status);

export const isTerminalStockRequest = (request: StockRequest) => STOCK_REQUEST_TERMINAL_STATUSES.includes(request.status);

export const getPendingStockRequests = (requests: StockRequest[]) => requests.filter(isPendingStockRequest);

const isOrderFinished = (status: WorkOrderStatus) => status === "Concluída" || status === "Cancelada";

export const resolveOrderStatusFromMaterials = (order: WorkOrder): WorkOrderStatus => {
  if (isOrderFinished(order.status) || !order.materials?.length) {
    return order.status;
  }

  const hasWaitingMaterial = order.materials.some(
    (material) =>
      material.availability === "Indisponível" ||
      material.availability === "Aguardando validação",
  );

  if (hasWaitingMaterial) {
    return order.materials.some((material) => material.isUnregistered) ? "Aguardando estoque" : "Aguardando material";
  }

  const allSupplyReleased = order.materials.every((material) =>
    ["Disponível", "Reservado", "Liberado", "Retirado", "Consumido"].includes(material.availability || ""),
  );

  if (allSupplyReleased) {
    if (["Aguardando estoque", "Aguardando material"].includes(order.status)) {
      return "Material liberado";
    }
    return order.status;
  }

  return order.status;
};

export const updateOrderMaterialAvailability = (
  order: WorkOrder,
  materialId: string | undefined,
  fallbackDescription: string | undefined,
  updater: (material: OSMaterial) => OSMaterial,
): WorkOrder => {
  if (!order.materials?.length) return order;

  const materials = order.materials.map((material) => {
    const matches = material.materialId
      ? material.materialId === materialId
      : fallbackDescription
        ? material.description === fallbackDescription
        : false;

    return matches ? updater(material) : material;
  });

  return {
    ...order,
    materials,
    status: resolveOrderStatusFromMaterials({ ...order, materials }),
    updatedAt: new Date().toISOString(),
  };
};
