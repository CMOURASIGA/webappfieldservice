import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Inbox,
  Maximize2,
  Minimize2,
  PackageSearch,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cnc-ti/layout-basic";
import { Button } from "../components/ui/Button";
import { Drawer } from "../components/ui/Drawer";
import { Input } from "../components/ui/Input";
import { OperationalPageHeader } from "../components/ui/OperationalPage";
import { useAuth } from "../contexts/AuthContext";
import { storageService } from "../services/storageService";
import { StockMaterial, StockRequest, User, WorkOrder } from "../types";
import { getPendingStockRequests, reconcileMaterial, updateOrderMaterialAvailability } from "../utils/stock";

type QueueVariant = "nao-cadastrado" | "registrado";

type QueueItemProps = {
  request: StockRequest;
  variant: QueueVariant;
  materialName: string;
  orderName: string;
  requesterName: string;
  daysInQueue: number;
  onResolve: () => void;
  onRegister: () => void;
  onCancel: () => void;
};

const urgencyStyle: Record<string, string> = {
  Urgente: "bg-red-50 text-red-700 ring-1 ring-red-200",
  Alta: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  Média: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Baixa: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

const statusStyle: Record<string, string> = {
  "Aguardando análise": "bg-slate-100 text-slate-700",
  "Aguardando recebimento": "bg-blue-100 text-blue-700",
  "Associado a existente": "bg-amber-100 text-amber-700",
  "Aprovado para novo cadastro": "bg-amber-100 text-amber-700",
};

const QueueBadge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}>
    {children}
  </span>
);

const QueueItemCard = ({
  request,
  variant,
  materialName,
  orderName,
  requesterName,
  daysInQueue,
  onResolve,
  onRegister,
  onCancel,
}: QueueItemProps) => {
  const isUnregistered = variant === "nao-cadastrado";

  return (
    <div className="queue-card">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold leading-snug text-slate-800">{materialName}</h4>
        <QueueBadge className={urgencyStyle[request.priority] || urgencyStyle.Baixa}>{request.priority}</QueueBadge>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        {isUnregistered && <QueueBadge className="bg-purple-100 text-purple-700">Não cadastrado</QueueBadge>}
        <QueueBadge className={statusStyle[request.status] || "bg-slate-100 text-slate-700"}>{request.status}</QueueBadge>
      </div>

      <div className="mb-3 text-xs text-slate-500">
        <span className="font-medium text-blue-700">
          <Link to={`/ordens/${request.workOrderId}`} className="hover:underline">
            {orderName}
          </Link>
        </span>
      </div>

      <div className="mb-3 text-[11px] text-slate-400">
        Solicitado em {new Date(request.createdAt).toLocaleDateString()} · Por {requesterName}
      </div>

      <p className="mb-3 min-h-[2rem] line-clamp-2 text-xs text-slate-500">
        {request.justification || "Sem justificativa informada."}
      </p>

      <div className="queue-card__actions">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-slate-400">Qtd.</div>
            <div className="text-sm font-semibold text-slate-700">
              {request.quantity} {request.estimatedUnit || ""}
            </div>
          </div>
          <div
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ${
              daysInQueue >= 7
                ? "bg-red-50 text-red-600"
                : daysInQueue >= 3
                  ? "bg-amber-50 text-amber-600"
                  : "bg-slate-50 text-slate-500"
            }`}
          >
            <Clock size={12} />
            {daysInQueue} dia{daysInQueue === 1 ? "" : "s"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            className="queue-action-button queue-action-button--secondary"
          >
            <X size={13} /> Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={isUnregistered ? onResolve : onRegister}
            className="queue-action-button queue-action-button--primary"
          >
            {isUnregistered ? "Cadastrar/Associar" : "Registrar Entrada"}
            <ArrowRight size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
};

type ColumnBlockProps = {
  title: string;
  count: number;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  children: React.ReactNode;
  hasMore: boolean;
  expanded: boolean;
  maximized: boolean;
  onToggleExpanded: () => void;
  onToggleMaximized: () => void;
  hiddenCount: number;
};

const ColumnBlock = ({
  title,
  count,
  description,
  icon,
  iconBg,
  children,
  hasMore,
  expanded,
  maximized,
  onToggleExpanded,
  onToggleMaximized,
  hiddenCount,
}: ColumnBlockProps) => (
  <div className={`queue-panel ${!maximized ? "pb-3" : ""}`}>
    <div className="mb-1 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>{icon}</span>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            {title} <span className="font-normal text-slate-400">({count})</span>
          </h3>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleMaximized}
        title={maximized ? "Minimizar bloco" : "Maximizar bloco"}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
      >
        {maximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
      </button>
    </div>

    {maximized ? (
      <>
        <p className="mb-4 ml-[42px] text-xs text-slate-500">{description}</p>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">{children}</div>

        {hasMore && (
          <Button
            type="button"
            variant="secondary"
            onClick={onToggleExpanded}
            className="mt-4 flex w-full items-center justify-center gap-1.5 border-slate-400 bg-white py-2.5 text-xs"
          >
            {expanded ? (
              <>
                Mostrar menos <ChevronUp size={14} />
              </>
            ) : (
              <>
                Ver todos ({hiddenCount} restante{hiddenCount === 1 ? "" : "s"})
                <ChevronDown size={14} />
              </>
            )}
          </Button>
        )}
      </>
    ) : (
      <p className="ml-[42px] text-xs text-slate-500">
        {count} solicitaç{count === 1 ? "ão oculta" : "ões ocultas"} — clique para expandir
      </p>
    )}
  </div>
);

export const FilaEstoque = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [materials, setMaterials] = useState<StockMaterial[]>([]);
  const [resolutionRequest, setResolutionRequest] = useState<StockRequest | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [showAllUnregistered, setShowAllUnregistered] = useState(false);
  const [showAllRegistered, setShowAllRegistered] = useState(false);
  const [maximizeUnregistered, setMaximizeUnregistered] = useState(true);
  const [maximizeRegistered, setMaximizeRegistered] = useState(true);

  const loadData = () => {
    setRequests(storageService.get("gsi_stock_requests"));
    setOrders(storageService.get("gsi_work_orders"));
    setUsers(storageService.get("gsi_users"));
    setMaterials((storageService.get("gsi_stock_materials") || []).map(reconcileMaterial));
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableMaterials = useMemo(() => materials.filter((material) => material.active), [materials]);

  const getOrderName = (id: string) => {
    const order = orders.find((item) => item.id === id);
    return order ? `${order.number} - ${order.type}` : "OS desconhecida";
  };

  const getUserName = (id: string) => users.find((user) => user.id === id)?.name || id;

  const updateRequestStatus = (requestId: string, status: StockRequest["status"], resolution?: string) => {
    const requestsDb = storageService.get("gsi_stock_requests");
    const nextRequests = requestsDb.map((request) =>
      request.id === requestId
        ? {
            ...request,
            status,
            resolution,
            updatedAt: new Date().toISOString(),
            completedAt:
              status === "Recebido" || status === "Rejeitado" || status === "Cancelado"
                ? new Date().toISOString()
                : request.completedAt,
          }
        : request,
    );
    storageService.set("gsi_stock_requests", nextRequests);
    return nextRequests.find((request) => request.id === requestId) || null;
  };

  const syncOrderMaterial = (request: StockRequest, availability: "Reservado" | "Indisponível" | "Cancelado") => {
    if (!request.workOrderId) return;

    const ordersDb = storageService.get("gsi_work_orders");
    const nextOrders = ordersDb.map((order) => {
      if (order.id !== request.workOrderId) return order;
      return updateOrderMaterialAvailability(order, request.materialId, request.suggestedDescription, (material) => ({
        ...material,
        materialId: request.materialId || material.materialId,
        isUnregistered: availability === "Indisponível" ? material.isUnregistered : false,
        availability,
      }));
    });
    storageService.set("gsi_work_orders", nextOrders);
  };

  const handleRegistrarEntrada = (request: StockRequest) => {
    if (!request.materialId) {
      alert("A solicitacao ainda nao possui material associado.");
      return;
    }

    const materialsDb = storageService.get("gsi_stock_materials");
    const materialIndex = materialsDb.findIndex((material) => material.id === request.materialId);
    if (materialIndex === -1) {
      alert("Material associado nao encontrado.");
      return;
    }

    const material = reconcileMaterial({
      ...materialsDb[materialIndex],
      physicalBalance: Number(materialsDb[materialIndex].physicalBalance || 0) + Number(request.quantity),
      reservedBalance: Number(materialsDb[materialIndex].reservedBalance || 0) + Number(request.quantity),
    });

    materialsDb[materialIndex] = material;
    storageService.set("gsi_stock_materials", materialsDb);

    const movement = {
      id: crypto.randomUUID(),
      type: "Entrada" as const,
      materialId: request.materialId,
      quantity: request.quantity,
      previousBalance: request.previousBalance ?? materialsDb[materialIndex].physicalBalance - request.quantity,
      newBalance: material.physicalBalance,
      workOrderId: request.workOrderId,
      unitId: request.unitId || material.unitId,
      locationId: request.locationId,
      sector: request.sector,
      userId: currentUser?.id || "usr-5",
      observations: `Recebimento da solicitacao ${request.protocol || request.id}`,
      date: new Date().toISOString(),
    };

    const movementsDb = storageService.get("gsi_stock_movements");
    storageService.set("gsi_stock_movements", [...movementsDb, movement]);

    updateRequestStatus(request.id, "Recebido", "Entrada registrada e material reservado para a OS.");
    syncOrderMaterial(request, "Reservado");
    storageService.logAudit(
      currentUser?.id || "system",
      "Registrou entrada para solicitacao de estoque",
      request.id,
      "StockRequest",
      undefined,
      movement,
    );
    loadData();
  };

  const openResolveDialog = (request: StockRequest) => {
    setResolutionRequest(request);
    setSelectedMaterialId("");
    setGeneratedCode(`MAT-${Date.now().toString().slice(-6)}`);
  };

  const handleAssociateExisting = () => {
    if (!resolutionRequest || !selectedMaterialId) return;

    const requestsDb = storageService.get("gsi_stock_requests");
    const nextRequests = requestsDb.map((request) =>
      request.id === resolutionRequest.id
        ? {
            ...request,
            materialId: selectedMaterialId,
            resolutionMaterialId: selectedMaterialId,
            isUnregistered: false,
            status: "Aguardando recebimento" as const,
            updatedAt: new Date().toISOString(),
          }
        : request,
    );

    storageService.set("gsi_stock_requests", nextRequests);
    syncOrderMaterial({ ...resolutionRequest, materialId: selectedMaterialId, isUnregistered: false }, "Indisponível");
    storageService.logAudit(currentUser?.id || "system", "Associou solicitacao a material existente", resolutionRequest.id, "StockRequest");
    setResolutionRequest(null);
    loadData();
  };

  const handleCreateMaterial = () => {
    if (!resolutionRequest) return;

    const materialsDb = storageService.get("gsi_stock_materials");
    const requestsDb = storageService.get("gsi_stock_requests");

    const newMaterialId = crypto.randomUUID();
    const newMaterial = reconcileMaterial({
      id: newMaterialId,
      code: generatedCode,
      name: resolutionRequest.suggestedDescription || "Material nao cadastrado",
      description: resolutionRequest.justification,
      category: "A cadastrar",
      unit: resolutionRequest.estimatedUnit || "UN",
      unitId: resolutionRequest.unitId || "u-df",
      locationId: resolutionRequest.locationId,
      physicalBalance: 0,
      reservedBalance: 0,
      availableBalance: 0,
      minStock: 0,
      idealStock: 0,
      status: "Normal",
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as StockMaterial);

    const nextRequests = requestsDb.map((request) =>
      request.id === resolutionRequest.id
        ? {
            ...request,
            materialId: newMaterialId,
            resolutionMaterialId: newMaterialId,
            isUnregistered: false,
            status: "Aguardando recebimento" as const,
            updatedAt: new Date().toISOString(),
          }
        : request,
    );

    storageService.set("gsi_stock_materials", [...materialsDb, newMaterial]);
    storageService.set("gsi_stock_requests", nextRequests);
    syncOrderMaterial({ ...resolutionRequest, materialId: newMaterialId, isUnregistered: false }, "Indisponível");
    storageService.logAudit(
      currentUser?.id || "system",
      "Criou material a partir de solicitacao nao cadastrada",
      newMaterialId,
      "StockMaterial",
      undefined,
      newMaterial,
    );
    setResolutionRequest(null);
    loadData();
  };

  const handleCancelRequest = (request: StockRequest) => {
    updateRequestStatus(request.id, "Cancelado", "Solicitacao cancelada na fila de estoque.");
    syncOrderMaterial(request, "Cancelado");
    storageService.logAudit(currentUser?.id || "system", "Cancelou solicitacao de estoque", request.id, "StockRequest");
    loadData();
  };

  const pendingRequests = useMemo(
    () =>
      [...getPendingStockRequests(requests)].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      ),
    [requests],
  );

  const getDaysInQueue = (createdAt: string) =>
    Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)));

  const unregisteredRequests = useMemo(
    () =>
      pendingRequests
        .filter((request) => request.isUnregistered)
        .sort((a, b) => getDaysInQueue(b.createdAt) - getDaysInQueue(a.createdAt)),
    [pendingRequests],
  );

  const registeredRequests = useMemo(
    () =>
      pendingRequests
        .filter((request) => !request.isUnregistered)
        .sort((a, b) => getDaysInQueue(b.createdAt) - getDaysInQueue(a.createdAt)),
    [pendingRequests],
  );

  const DEFAULT_COUNT = 2;
  const visibleUnregisteredRequests = showAllUnregistered ? unregisteredRequests : unregisteredRequests.slice(0, DEFAULT_COUNT);
  const visibleRegisteredRequests = showAllRegistered ? registeredRequests : registeredRequests.slice(0, DEFAULT_COUNT);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <OperationalPageHeader
        title="Fila de Solicitações"
        description="Gestão de materiais pendentes, compras e itens não cadastrados."
        backTo="/estoque"
      />

      <div className="flex flex-col gap-5">
        <ColumnBlock
          title="Não Cadastrados"
          count={unregisteredRequests.length}
          description="Ordenado por tempo em fila — mais antigos primeiro"
          icon={<PackageSearch size={16} className="text-purple-600" />}
          iconBg="bg-purple-100"
          hasMore={unregisteredRequests.length > DEFAULT_COUNT}
          expanded={showAllUnregistered}
          maximized={maximizeUnregistered}
          onToggleExpanded={() => setShowAllUnregistered((current) => !current)}
          onToggleMaximized={() => setMaximizeUnregistered((current) => !current)}
          hiddenCount={Math.max(0, unregisteredRequests.length - DEFAULT_COUNT)}
        >
          {visibleUnregisteredRequests.map((request) => (
            <QueueItemCard
              key={request.id}
              request={request}
              variant="nao-cadastrado"
              materialName={request.suggestedDescription || "Material não cadastrado"}
              orderName={getOrderName(request.workOrderId || "")}
              requesterName={getUserName(request.requesterId)}
              daysInQueue={getDaysInQueue(request.createdAt)}
              onResolve={() => openResolveDialog(request)}
              onRegister={() => {}}
              onCancel={() => handleCancelRequest(request)}
            />
          ))}
        </ColumnBlock>

        <ColumnBlock
          title="Registrados / Recebimento"
          count={registeredRequests.length}
          description="Ordenado por tempo em fila — mais antigos primeiro"
          icon={<Inbox size={16} className="text-amber-600" />}
          iconBg="bg-amber-100"
          hasMore={registeredRequests.length > DEFAULT_COUNT}
          expanded={showAllRegistered}
          maximized={maximizeRegistered}
          onToggleExpanded={() => setShowAllRegistered((current) => !current)}
          onToggleMaximized={() => setMaximizeRegistered((current) => !current)}
          hiddenCount={Math.max(0, registeredRequests.length - DEFAULT_COUNT)}
        >
          {visibleRegisteredRequests.map((request) => (
            <QueueItemCard
              key={request.id}
              request={request}
              variant="registrado"
              materialName={materials.find((material) => material.id === request.materialId)?.name || `Material ID: ${request.materialId}`}
              orderName={getOrderName(request.workOrderId || "")}
              requesterName={getUserName(request.requesterId)}
              daysInQueue={getDaysInQueue(request.createdAt)}
              onResolve={() => {}}
              onRegister={() => handleRegistrarEntrada(request)}
              onCancel={() => handleCancelRequest(request)}
            />
          ))}
        </ColumnBlock>
      </div>

      <Drawer
        isOpen={!!resolutionRequest}
        onClose={() => setResolutionRequest(null)}
        title="Resolver material não cadastrado"
      >
        <div className="space-y-5 rounded-lg border border-slate-300 bg-white p-4">
          <div>
            <p className="text-sm text-slate-600">
              Associe a solicitação a um material existente ou aprove a criação imediata de um cadastro base.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Material existente</label>
            <Select onValueChange={setSelectedMaterialId} value={selectedMaterialId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um material" />
              </SelectTrigger>
              <SelectContent>
                {availableMaterials.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.code} - {material.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-800">Criar novo cadastro base</p>
            <Input value={generatedCode} onChange={(event) => setGeneratedCode(event.target.value)} />
            <div className="text-sm text-slate-600">
              {resolutionRequest?.suggestedDescription || "Sem descricao"} ({resolutionRequest?.estimatedUnit || "UN"})
            </div>
          </div>

          <div className="operational-form-actions -mx-4 -mb-4">
            <Button variant="secondary" onClick={() => setResolutionRequest(null)}>
              Cancelar
            </Button>
            <Button variant="secondary" onClick={handleAssociateExisting} disabled={!selectedMaterialId}>
              Associar existente
            </Button>
            <Button onClick={handleCreateMaterial} disabled={!generatedCode.trim()}>
              Criar material
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
