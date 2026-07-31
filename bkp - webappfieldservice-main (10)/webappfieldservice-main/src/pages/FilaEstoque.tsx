import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, Clock, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cnc-ti/layout-basic";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";
import { storageService } from "../services/storageService";
import { StockRequest, StockMaterial, User, WorkOrder } from "../types";
import { getPendingStockRequests, reconcileMaterial, updateOrderMaterialAvailability } from "../utils/stock";

export const FilaEstoque = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [materials, setMaterials] = useState<StockMaterial[]>([]);
  const [resolutionRequest, setResolutionRequest] = useState<StockRequest | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  const loadData = () => {
    setRequests(storageService.get("gsi_stock_requests"));
    setOrders(storageService.get("gsi_work_orders"));
    setUsers(storageService.get("gsi_users"));
    setMaterials((storageService.get("gsi_stock_materials") || []).map(reconcileMaterial));
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableMaterials = useMemo(
    () => materials.filter((material) => material.active),
    [materials],
  );

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
            completedAt: status === "Recebido" || status === "Rejeitado" || status === "Cancelado" ? new Date().toISOString() : request.completedAt,
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
    storageService.logAudit(currentUser?.id || "system", "Registrou entrada para solicitacao de estoque", request.id, "StockRequest", undefined, movement);
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
    storageService.logAudit(currentUser?.id || "system", "Criou material a partir de solicitacao nao cadastrada", newMaterialId, "StockMaterial", undefined, newMaterial);
    setResolutionRequest(null);
    loadData();
  };

  const handleCancelRequest = (request: StockRequest) => {
    updateRequestStatus(request.id, "Cancelado", "Solicitacao cancelada na fila de estoque.");
    syncOrderMaterial(request, "Cancelado");
    storageService.logAudit(currentUser?.id || "system", "Cancelou solicitacao de estoque", request.id, "StockRequest");
    loadData();
  };

  const pendingRequests = getPendingStockRequests(requests);
  const unregisteredRequests = pendingRequests.filter((request) => request.isUnregistered);
  const registeredRequests = pendingRequests.filter((request) => !request.isUnregistered);

  const getStatusBadgeClass = (status: StockRequest["status"]) => {
    if (status === "Aguardando análise") return "bg-slate-100 text-slate-700";
    if (status === "Aguardando recebimento") return "bg-blue-100 text-blue-700";
    if (status === "Associado a existente" || status === "Aprovado para novo cadastro") return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-700";
  };

  const renderRequest = (request: StockRequest) => (
    <div key={request.id} className="mb-3 rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-800">
              {request.isUnregistered ? request.suggestedDescription : materials.find((material) => material.id === request.materialId)?.name || `Material ID: ${request.materialId}`}
            </h3>
            {request.isUnregistered && <Badge variant="default" className="bg-purple-100 text-purple-700">Nao cadastrado</Badge>}
            <Badge variant="default" className={getStatusBadgeClass(request.status)}>{request.status}</Badge>
            <Badge variant="default" className="bg-slate-100 text-slate-700">{request.priority}</Badge>
          </div>
          <p className="text-sm font-medium text-brand-600">
            <Link to={`/ordens/${request.workOrderId}`} className="hover:underline">{getOrderName(request.workOrderId || "")}</Link>
          </p>
        </div>
        <div className="text-right">
          <p className="mb-1 text-xs text-slate-500">Qtd solicitada</p>
          <p className="text-lg font-bold text-slate-800">{request.quantity} {request.estimatedUnit || ""}</p>
        </div>
      </div>

      {request.justification && (
        <div className="mb-3 rounded border border-slate-100 bg-slate-50 p-2 text-sm text-slate-600">
          <span className="font-medium">Justificativa: </span>{request.justification}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Solicitado em: {new Date(request.createdAt).toLocaleDateString()}</span>
          <span>Por: {getUserName(request.requesterId)}</span>
        </div>
        <div className="flex gap-2">
          {request.isUnregistered ? (
            <Button size="sm" variant="secondary" onClick={() => openResolveDialog(request)} className="h-7 py-1 text-xs">Cadastrar/Associar</Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => handleRegistrarEntrada(request)} className="h-7 py-1 text-xs">Registrar Entrada</Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => handleCancelRequest(request)} className="h-7 py-1 text-xs">
            <XCircle className="mr-1 h-3.5 w-3.5" /> Cancelar
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="h-9 w-9 p-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="mb-1 text-[22px] font-semibold text-slate-900">Fila de Solicitacoes</h1>
          <p className="text-sm text-slate-500">Gestao de materiais pendentes, compras e itens nao cadastrados.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-t-4 border-t-purple-500">
          <CardContent className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <AlertCircle className="h-4 w-4" />
                </div>
                Nao Cadastrados ({unregisteredRequests.length})
              </h2>
            </div>
            <div className="space-y-3">
              {unregisteredRequests.length > 0 ? unregisteredRequests.map(renderRequest) : <p className="py-6 text-center text-sm text-slate-500">Nenhuma solicitacao pendente.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-orange-500">
          <CardContent className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <Clock className="h-4 w-4" />
                </div>
                Registrados / Recebimento ({registeredRequests.length})
              </h2>
            </div>
            <div className="space-y-3">
              {registeredRequests.length > 0 ? registeredRequests.map(renderRequest) : <p className="py-6 text-center text-sm text-slate-500">Nenhum material pendente de reposicao.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!resolutionRequest} onOpenChange={(open) => !open && setResolutionRequest(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Resolver material nao cadastrado</DialogTitle>
            <DialogDescription>
              Associe a solicitacao a um material existente ou aprove a criacao imediata de um cadastro base.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Material existente</label>
              <Select onValueChange={setSelectedMaterialId} value={selectedMaterialId}>
                <SelectTrigger><SelectValue placeholder="Selecione um material" /></SelectTrigger>
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
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setResolutionRequest(null)}>Cancelar</Button>
            <Button variant="secondary" onClick={handleAssociateExisting} disabled={!selectedMaterialId}>Associar existente</Button>
            <Button onClick={handleCreateMaterial} disabled={!generatedCode.trim()}>Criar material</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
