import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import { OperationalPageHeader } from "../../components/ui/OperationalPage";
import { Select } from "../../components/ui/Select";
import { TabbedFormCard } from "../../components/ui/TabbedFormCard";
import { Textarea } from "../../components/ui/Textarea";
import { useAuth } from "../../contexts/AuthContext";
import { storageService } from "../../services/storageService";
import { StockMovement, WorkOrder, WorkOrderStatus } from "../../types";
import { getAvailableStock, reconcileMaterial, updateOrderMaterialAvailability } from "../../utils/stock";

type MovementType = "Entrada" | "Sa\u00EDda" | "Ajuste";

export const NovaMovimentacaoEstoque = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const queryType = searchParams.get("tipo");
  const initialType: MovementType =
    queryType === "Sa\u00EDda" ? "Sa\u00EDda" : queryType === "Ajuste" ? "Ajuste" : "Entrada";

  const [type, setType] = useState<MovementType>(initialType);
  const [data, setData] = useState({
    materialId: "",
    quantity: "",
    unitId: "",
    locationId: "",
    sector: "",
    providerId: "",
    invoice: "",
    technicianId: "",
    workOrderId: "",
    observations: "",
  });
  const [error, setError] = useState("");

  const materials = storageService.get("gsi_stock_materials") || [];
  const units = storageService.get("gsi_units") || [];
  const locations = storageService.get("gsi_locations") || [];
  const users = storageService.get("gsi_users") || [];
  const orders = (storageService.get("gsi_work_orders") || []).filter(
    (order: WorkOrder) => !["Conclu\u00EDda", "Cancelada"].includes(order.status),
  );

  const activeMaterials = useMemo(
    () => materials.filter((item: any) => item.active !== false),
    [materials],
  );

  const selectedMaterial = activeMaterials.find((item: any) => item.id === data.materialId);

  useEffect(() => {
    setType(initialType);
  }, [initialType]);

  useEffect(() => {
    if (!selectedMaterial) return;

    setData((current) => ({
      ...current,
      unitId: selectedMaterial.unitId || "",
      locationId: selectedMaterial.locationId || "",
    }));
  }, [selectedMaterial]);

  const setField = (field: keyof typeof data, value: string) => {
    setData((current) => ({ ...current, [field]: value }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const quantity = Number(data.quantity);

    if (!data.materialId || !data.unitId || !quantity || quantity <= 0) {
      setError("Preencha material, quantidade e unidade.");
      return;
    }

    if (type === "Ajuste" && !data.observations.trim()) {
      setError("Informe a justificativa do ajuste de inventario.");
      return;
    }

    const allMaterials = storageService.get("gsi_stock_materials") || [];
    const materialIndex = allMaterials.findIndex((item: any) => item.id === data.materialId);

    if (materialIndex === -1) {
      setError("Material nao encontrado.");
      return;
    }

    const material = { ...allMaterials[materialIndex] };
    const previousBalance = Number(material.physicalBalance || 0);
    const previousReserved = Number(material.reservedBalance || 0);
    const available = getAvailableStock(material);

    if (type === "Sa\u00EDda" && available < quantity) {
      setError(`Saldo disponivel insuficiente. Disponivel: ${available}.`);
      return;
    }

    const newBalance =
      type === "Entrada"
        ? previousBalance + quantity
        : type === "Sa\u00EDda"
          ? previousBalance - quantity
          : quantity;

    const newReserved =
      type === "Sa\u00EDda" && data.workOrderId
        ? Math.max(0, previousReserved - Math.min(previousReserved, quantity))
        : previousReserved;

    allMaterials[materialIndex] = reconcileMaterial({
      ...material,
      physicalBalance: newBalance,
      reservedBalance: newReserved,
    });

    storageService.set("gsi_stock_materials", allMaterials);

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      type,
      materialId: data.materialId,
      quantity: type === "Ajuste" ? Math.abs(newBalance - previousBalance) : quantity,
      previousBalance,
      newBalance,
      unitId: data.unitId,
      locationId: data.locationId || undefined,
      sector: data.sector || undefined,
      providerId: data.providerId || undefined,
      technicianId: data.technicianId || undefined,
      workOrderId: data.workOrderId || undefined,
      invoice: data.invoice || undefined,
      observations: data.observations || undefined,
      userId: currentUser?.id || "usr-1",
      date: new Date().toISOString(),
    };

    storageService.set("gsi_stock_movements", [
      ...(storageService.get("gsi_stock_movements") || []),
      movement,
    ]);

    if (data.workOrderId) {
      storageService.set(
        "gsi_work_orders",
        (storageService.get("gsi_work_orders") || []).map((order: WorkOrder) =>
          order.id !== data.workOrderId
            ? order
            : {
                ...updateOrderMaterialAvailability(
                  order,
                  data.materialId,
                  undefined,
                  (item) => ({
                    ...item,
                    availability: type === "Entrada" ? "Reservado" : "Consumido",
                    quantityUsed: type === "Sa\u00EDda" ? quantity : item.quantityUsed,
                  }),
                ),
                status:
                  type === "Sa\u00EDda" &&
                  ["Material liberado", "Aguardando material", "Aguardando estoque"].includes(order.status)
                    ? ("Em execu\u00E7\u00E3o" as WorkOrderStatus)
                    : order.status,
                updatedAt: new Date().toISOString(),
              },
        ),
      );
    }

    storageService.logAudit(
      currentUser?.id || "system",
      "Registrou movimentacao de estoque",
      movement.id,
      "StockMovement",
      undefined,
      movement,
    );

    navigate("/estoque/movimentacoes", {
      state: { message: `${type} registrada com sucesso.` },
    });
  };

  const formSectionTitleClass = "text-base font-semibold text-slate-900";
  const formSectionDescriptionClass = "mt-1 text-sm text-slate-600";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <OperationalPageHeader
        title={`Registrar ${type}`}
        description={
          type === "Entrada"
            ? "Registre o recebimento e atualize o saldo fisico do estoque."
            : type === "Sa\u00EDda"
              ? "Vincule a saida ao destino e, quando aplicavel, a Ordem de Servico."
              : "Ajuste o saldo fisico apos conferencia, informando a justificativa."
        }
        backTo="/estoque"
      />

      <form onSubmit={submit}>
        <TabbedFormCard
          submitLabel="Salvar"
          tabs={[
            {
              value: "movimentacao",
              label: "Movimentacao",
              content: (
                <div className="space-y-7 p-6">
                  <div>
                    <h2 className={formSectionTitleClass}>Dados principais</h2>
                    <p className={formSectionDescriptionClass}>
                      Defina o tipo de movimentacao, o material e a quantidade a registrar.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Select
                      label="Tipo de movimentacao"
                      required
                      value={type}
                      onChange={(event) => setType(event.target.value as MovementType)}
                      options={[
                        { value: "Entrada", label: "Entrada" },
                        { value: "Sa\u00EDda", label: "Saida" },
                        { value: "Ajuste", label: "Ajuste de inventario" },
                      ]}
                    />
                    <Select
                      label="Material"
                      required
                      value={data.materialId}
                      onChange={(event) => setField("materialId", event.target.value)}
                      options={activeMaterials.map((item: any) => ({
                        value: item.id,
                        label: `${item.code} - ${item.name}`,
                      }))}
                    />
                    <Input
                      label={type === "Ajuste" ? "Novo saldo fisico" : "Quantidade"}
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={data.quantity}
                      onChange={(event) => setField("quantity", event.target.value)}
                    />
                    <Select
                      label="Unidade"
                      required
                      value={data.unitId}
                      onChange={(event) => setField("unitId", event.target.value)}
                      options={units.map((item: any) => ({
                        value: item.id,
                        label: item.name,
                      }))}
                    />
                  </div>
                  {selectedMaterial && (
                    <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4 text-sm text-blue-950">
                      <strong>Saldo atual:</strong> fisico {selectedMaterial.physicalBalance}, reservado{" "}
                      {selectedMaterial.reservedBalance}, disponivel {getAvailableStock(selectedMaterial)}.
                    </div>
                  )}
                </div>
              ),
            },
            {
              value: "destino",
              label: "Destino e vinculo",
              content: (
                <div className="space-y-7 p-6">
                  <div>
                    <h2 className={formSectionTitleClass}>Destino operacional</h2>
                    <p className={formSectionDescriptionClass}>
                      Informe local, setor e os vinculos necessarios para rastreabilidade.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Select
                      label="Local / almoxarifado"
                      value={data.locationId}
                      onChange={(event) => setField("locationId", event.target.value)}
                      options={locations.map((item: any) => ({
                        value: item.id,
                        label: item.name,
                      }))}
                    />
                    <Input
                      label="Setor solicitante ou destino"
                      value={data.sector}
                      onChange={(event) => setField("sector", event.target.value)}
                      placeholder="Ex.: Manutencao"
                    />
                    {type === "Entrada" && (
                      <>
                        <Input
                          label="Fornecedor"
                          value={data.providerId}
                          onChange={(event) => setField("providerId", event.target.value)}
                        />
                        <Input
                          label="Nota fiscal ou pedido"
                          value={data.invoice}
                          onChange={(event) => setField("invoice", event.target.value)}
                        />
                      </>
                    )}
                    {type === "Sa\u00EDda" && (
                      <>
                        <Select
                          label="Tecnico ou retirante"
                          value={data.technicianId}
                          onChange={(event) => setField("technicianId", event.target.value)}
                          options={users.map((item: any) => ({
                            value: item.id,
                            label: item.name,
                          }))}
                        />
                        <Select
                          label="Ordem de Servico"
                          value={data.workOrderId}
                          onChange={(event) => setField("workOrderId", event.target.value)}
                          options={orders.map((item: WorkOrder) => ({
                            value: item.id,
                            label: `${item.number} - ${item.technicalDescription}`,
                          }))}
                        />
                      </>
                    )}
                  </div>
                </div>
              ),
            },
            {
              value: "observacoes",
              label: "Observacoes",
              content: (
                <div className="space-y-7 p-6">
                  <div>
                    <h2 className={formSectionTitleClass}>Complemento do registro</h2>
                    <p className={formSectionDescriptionClass}>
                      Adicione informacoes que facilitem auditoria e conferencia.
                    </p>
                  </div>
                  <Textarea
                    label={type === "Ajuste" ? "Justificativa do ajuste" : "Observacoes"}
                    required={type === "Ajuste"}
                    value={data.observations}
                    onChange={(event) => setField("observations", event.target.value)}
                    placeholder="Inclua detalhes relevantes para rastreabilidade."
                  />
                  {error && (
                    <p className="rounded-md border-2 border-red-400 bg-red-50 p-3 text-sm text-red-800">
                      {error}
                    </p>
                  )}
                </div>
              ),
            },
          ]}
        />
      </form>
    </div>
  );
};
