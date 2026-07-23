import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { storageService } from "../services/storageService";
import { WorkOrder, Unit, Location, Category, User, Asset, WorkOrderStatus, Provider, OSMaterial, StockMaterial } from "../types";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../contexts/AuthContext";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Input } from "../components/ui/Input";
import { Paperclip, Plus, Trash2, Printer } from "lucide-react";
import { resolveOrderStatusFromMaterials } from "../utils/stock";

export const DetalheOrdem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stockMaterials, setStockMaterials] = useState<StockMaterial[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  // Action states
  const [assignUser, setAssignUser] = useState("");
  const [assignProvider, setAssignProvider] = useState("");
  const [comment, setComment] = useState("");
  const [trackingComment, setTrackingComment] = useState("");

  const [pauseReason, setPauseReason] = useState("");
  const [isPausing, setIsPausing] = useState(false);

  
  
  const [addingMaterial, setAddingMaterial] = useState(false);
  const [matMode, setMatMode] = useState<"base" | "unregistered">("base");
  const [selectedStockMatId, setSelectedStockMatId] = useState("");
  const [matClass, setMatClass] = useState<any>("Obrigatório");
  const [matQuantity, setMatQuantity] = useState(1);
  const [matJustification, setMatJustification] = useState("");
  const [matDescUnreg, setMatDescUnreg] = useState("");

  const [newMaterial, setNewMaterial] = useState({ description: "", type: "", quantity: 1, unitPrice: 0 });
  const [uploading, setUploading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [modalStartTime, setModalStartTime] = useState("");
  const [modalDuration, setModalDuration] = useState("60");
  const [modalTechId, setModalTechId] = useState("");

  
  const handleAddMaterialNew = () => {
    if (!order || !currentUser) return;
    const orders = storageService.get("gsi_work_orders");
    const idx = orders.findIndex(o => o.id === order.id);
    
    if (idx !== -1) {
      if (!orders[idx].materials) orders[idx].materials = [];
      
      if (matMode === "base" && selectedStockMatId) {
        const stockItem = stockMaterials.find(sm => sm.id === selectedStockMatId);
        if (!stockItem) return;
        
        let availability = "Indisponível";
        if (stockItem.availableBalance >= matQuantity) {
          availability = "Disponível";
        } else if (stockItem.availableBalance > 0) {
          availability = "Parcialmente disponível";
        }
        
        orders[idx].materials.push({
          id: crypto.randomUUID(),
          materialId: stockItem.id,
          description: stockItem.name,
          type: stockItem.unit,
          quantity: matQuantity,
          classification: matClass,
          availability: availability as any,
          isUnregistered: false,
        });
        
        if (availability !== "Disponível") {
           const reqs = storageService.get("gsi_stock_requests");
           reqs.push({
             id: crypto.randomUUID(),
             workOrderId: order.id,
             materialId: stockItem.id,
             isUnregistered: false,
             quantity: matQuantity - stockItem.availableBalance > 0 ? matQuantity - stockItem.availableBalance : matQuantity,
             priority: order.priority,
             requesterId: currentUser.id,
             assetId: order.assetId,
             locationId: order.locationId,
             status: "Aguardando análise",
             createdAt: new Date().toISOString(),
             updatedAt: new Date().toISOString()
           });
           storageService.set("gsi_stock_requests", reqs);
        }
      } else if (matMode === "unregistered" && matDescUnreg) {
        const matId = crypto.randomUUID();
        orders[idx].materials.push({
          id: matId,
          description: matDescUnreg,
          quantity: matQuantity,
          classification: matClass,
          availability: "Aguardando validação",
          isUnregistered: true,
          justification: matJustification
        });
        
        const reqs = storageService.get("gsi_stock_requests");
        reqs.push({
          id: crypto.randomUUID(),
          workOrderId: order.id,
          suggestedDescription: matDescUnreg,
          isUnregistered: true,
          quantity: matQuantity,
          justification: matJustification,
          priority: order.priority,
          requesterId: currentUser.id,
          assetId: order.assetId,
          locationId: order.locationId,
          status: "Aguardando análise",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        storageService.set("gsi_stock_requests", reqs);
      }
      
      // Update OS supplyStatus if it was not informed
      if (!orders[idx].supplyStatus) {
         orders[idx].supplyStatus = "Aguardando análise";
      }
      
      orders[idx].status = resolveOrderStatusFromMaterials(orders[idx]);
      storageService.set("gsi_work_orders", orders);
      if (currentUser) {
         storageService.logAudit(currentUser.id, "Adicionou Material", order.id, "WorkOrder");
      }
      setAddingMaterial(false);
      setSelectedStockMatId("");
      setMatDescUnreg("");
      setMatJustification("");
      setMatQuantity(1);
      loadOrder();
    }
  };


  const handleRemoveMaterial = (mId: string) => {
    if (!order || !currentUser) return;
    const orders = storageService.get("gsi_work_orders");
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      orders[idx].materials = orders[idx].materials?.filter(m => m.id !== mId) || [];
      orders[idx].status = resolveOrderStatusFromMaterials(orders[idx]);
      storageService.set("gsi_work_orders", orders);
      loadOrder();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !order || !currentUser) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const orders = storageService.get("gsi_work_orders");
      const idx = orders.findIndex(o => o.id === order.id);
      if (idx !== -1) {
        if (!orders[idx].attachments) orders[idx].attachments = [];
        orders[idx].attachments.push({
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          dataUrl: event.target?.result as string
        });
        orders[idx].status = resolveOrderStatusFromMaterials(orders[idx]);
      storageService.set("gsi_work_orders", orders);
        loadOrder();
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const PAUSE_REASONS = [
    "Aguardando acesso ao local",
    "Aguardando técnico",
    "Aguardando autorização",
    "Aguardando material externo",
    "Indisponibilidade do ativo",
    "Dependência de outra área",
    "Necessidade de nova vistoria",
    "Outro"
  ];

  useEffect(() => {
    loadOrder();
    setUnits(storageService.get("gsi_units"));
    setLocations(storageService.get("gsi_locations"));
    setCategories(storageService.get("gsi_categories"));
    setUsers(storageService.get("gsi_users"));
    setAssets(storageService.get("gsi_assets"));
    setStockMaterials(storageService.get("gsi_stock_materials"));
    setProviders(storageService.get("gsi_providers").filter(p => p.status === "Ativo" && p.active !== false));
  }, [id]);

  const loadOrder = () => {
    const orders = storageService.get("gsi_work_orders");
    const found = orders.find(o => o.id === id);
    if (found) setOrder(found);
  };

  const updateStatus = (newStatus: WorkOrderStatus, logMsg: string) => {
    if (!order || !currentUser) return;
    const orders = storageService.get("gsi_work_orders");
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      const oldStatus = orders[idx].status;
      orders[idx].status = newStatus;
      orders[idx].updatedAt = new Date().toISOString();
      if (comment) {
        orders[idx].observations += `\n[${new Date().toLocaleDateString()} - ${currentUser.name}]: ${comment}`;
      }
      
      // se foi concluída e tem plano preventivo vinculado, atualizar o plano
      if (newStatus === "Concluída" && orders[idx].preventivePlanId) {
        const plans = storageService.get("gsi_preventive_plans");
        const pIdx = plans.findIndex(p => p.id === orders[idx].preventivePlanId);
        if (pIdx !== -1) {
          const plan = plans[pIdx];
          const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
          const addMonths = (date, months) => {
            const d = new Date(date);
            d.setMonth(d.getMonth() + months);
            return d;
          };
          const addYears = (date, years) => {
            const d = new Date(date);
            d.setFullYear(d.getFullYear() + years);
            return d;
          };
          
          let nextDate = new Date(plan.nextExecution);
          if (plan.periodicity === "diaria") nextDate = addDays(nextDate, 1);
          else if (plan.periodicity === "semanal") nextDate = addDays(nextDate, 7);
          else if (plan.periodicity === "mensal") nextDate = addMonths(nextDate, 1);
          else if (plan.periodicity === "trimestral") nextDate = addMonths(nextDate, 3);
          else if (plan.periodicity === "semestral") nextDate = addMonths(nextDate, 6);
          else if (plan.periodicity === "anual") nextDate = addYears(nextDate, 1);

          plans[pIdx].lastExecution = new Date().toISOString();
          plans[pIdx].nextExecution = nextDate.toISOString();
          plans[pIdx].updatedAt = new Date().toISOString();
          
          storageService.set("gsi_preventive_plans", plans);
        }
      }

      orders[idx].status = resolveOrderStatusFromMaterials(orders[idx]);
      storageService.set("gsi_work_orders", orders);
      storageService.logAudit(currentUser.id, logMsg, order.id, "WorkOrder", oldStatus, newStatus);
      setComment("");
      setPauseReason("");
      setIsPausing(false);
      loadOrder();
    }
  };

  const handlePause = () => {
    if (!pauseReason) {
      alert("Selecione um motivo para a pausa.");
      return;
    }
    const reasonText = pauseReason === "Outro" ? `Outro: ${comment}` : pauseReason;
    const finalComment = comment ? `${reasonText} - ${comment}` : reasonText;
    
    if (!order || !currentUser) return;
    const orders = storageService.get("gsi_work_orders");
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      orders[idx].status = "Pausada";
      orders[idx].updatedAt = new Date().toISOString();
      orders[idx].observations += `\n[${new Date().toLocaleDateString()} - ${currentUser.name}] Pausada motivo: ${finalComment}`;
      orders[idx].status = resolveOrderStatusFromMaterials(orders[idx]);
      storageService.set("gsi_work_orders", orders);
      storageService.logAudit(currentUser.id, "Pausou serviço", order.id, "WorkOrder", "Em execução", "Pausada");
      setComment("");
      setPauseReason("");
      setIsPausing(false);
      loadOrder();
    }
  };

  const updateChecklistItem = (itemId: string, field: "result" | "observations", value: any) => {
    if (!order || !currentUser) return;
    const orders = storageService.get("gsi_work_orders");
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      const cIdx = orders[idx].checklist.findIndex(c => c.id === itemId);
      if (cIdx !== -1) {
        orders[idx].checklist[cIdx] = { ...orders[idx].checklist[cIdx], [field]: value };
        
        // Auto-generate Corretiva if result is "Não conforme" and it doesn't exist yet
        if (field === "result" && value === "Não conforme" && !orders[idx].checklist[cIdx].correctiveRequestId) {
          const itemDescription = orders[idx].checklist[cIdx].description;
          const requests = storageService.get("gsi_requests");
          
          // Generate a simple ID since uuid might not be imported here
          const newId = 'req-' + Math.random().toString(36).substring(2, 15);
          
          const newReq: any = {
            id: newId,
            protocol: `DEM-NC-${Math.floor(1000 + Math.random() * 9000)}`,
            solicitanteId: currentUser.id,
            unitId: order.unitId,
            locationId: order.locationId,
            categoryId: order.categoryId,
            title: `Não Conformidade: ${itemDescription}`,
            description: `Gerado automaticamente via checklist da OS ${order.number}. Item: ${itemDescription}.`,
            suggestedPriority: "Média",
            status: "Aberta",
            attachments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            active: true
          };
          requests.push(newReq);
          storageService.set("gsi_requests", requests);
          
          orders[idx].checklist[cIdx].correctiveRequestId = newId;
          alert(`Manutenção corretiva gerada automaticamente: ${newReq.protocol}`);
        }

        orders[idx].status = resolveOrderStatusFromMaterials(orders[idx]);
      storageService.set("gsi_work_orders", orders);
        loadOrder();
      }
    }
  };

  const handleSaveSchedule = () => {
    setShowScheduleModal(false);
  };

  const handleAssign = () => {
    if (!order || !currentUser) return;
    if (!assignUser && !assignProvider) return;

    const orders = storageService.get("gsi_work_orders");
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      if (assignUser) orders[idx].responsibleId = assignUser;
      if (assignProvider) orders[idx].providerId = assignProvider;
      
      orders[idx].status = "Atribuída";
      orders[idx].updatedAt = new Date().toISOString();
      orders[idx].status = resolveOrderStatusFromMaterials(orders[idx]);
      storageService.set("gsi_work_orders", orders);
      storageService.logAudit(currentUser.id, "Atribuída OS", order.id, "WorkOrder", "", `Técnico: ${assignUser || '-'}, Técnico: ${assignProvider || '-'}`);
      loadOrder();
    }
  };

  if (!order) return <div className="p-6">Ordem de Serviço não encontrada.</div>;

  const getUnitName = (uid: string) => units.find(u => u.id === uid)?.name || "N/A";
  const getLocationName = (lid: string) => locations.find(l => l.id === lid)?.name || "N/A";
  const getCategoryName = (cid: string) => categories.find(c => c.id === cid)?.name || "N/A";
  const getUserName = (uid?: string) => users.find(u => u.id === uid)?.name || "Não atribuído";
  const getProviderName = (pid?: string) => providers.find(p => p.id === pid)?.name || "Não atribuído";
  const getAssetCode = (aid?: string) => assets.find(a => a.id === aid)?.code || "Nenhum";
  const getRequestProtocol = (rid?: string) => {
    if (!rid) return null;
    const requests = storageService.get("gsi_requests");
    return requests.find(r => r.id === rid)?.protocol || null;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">OS: {order.number}</h1>
          <p className="text-sm text-slate-500">Detalhes e execução da ordem.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/ordens")}>Voltar</Button>
          <Button variant="primary" onClick={() => setShowScheduleModal(true)}>Programar</Button>
          <Link to={`/ordens/${order.id}/imprimir`} target="_blank"><Button variant="secondary" className="gap-2"><Printer className="w-4 h-4" /> Imprimir</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Informações Técnicas</CardTitle>
                <Badge variant={order.status === 'Concluída' ? 'success' : order.status === 'Em execução' ? 'info' : 'warning'}>
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Unidade</p>
                  <p className="text-sm">{getUnitName(order.unitId)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Local</p>
                  <p className="text-sm">{getLocationName(order.locationId)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Categoria</p>
                  <p className="text-sm">{getCategoryName(order.categoryId)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Ativo</p>
                  <p className="text-sm">{getAssetCode(order.assetId)}</p>
                </div>
                {order.requestId && (
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Origem (Manutenção Corretiva)</p>
                    <p className="text-sm text-brand-600 underline font-medium cursor-pointer" onClick={() => navigate(`/servicos/${order.requestId}`)}>
                      {getRequestProtocol(order.requestId)}
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Descrição</p>
                <div className="bg-slate-50 p-3 rounded border border-slate-100 text-sm whitespace-pre-wrap">
                  {order.technicalDescription}
                </div>
              </div>
              
              {order.observations && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Histórico de Observações</p>
                  <div className="bg-slate-50 p-3 rounded border border-slate-100 text-sm whitespace-pre-wrap font-mono text-xs">
                    {order.observations}
                  </div>
                </div>
              )}

              {order.checklist && order.checklist.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm font-semibold text-slate-900 mb-3">Checklist de Execução</p>
                  <div className="space-y-4">
                    {order.checklist.map((item, i) => (
                      <div key={item.id} className="border border-slate-200 rounded-md p-4 space-y-3 bg-white">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-800">
                            {i + 1}. {item.description} {item.required && <span className="text-red-500">*</span>}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateChecklistItem(item.id, "result", "Conforme")}
                              disabled={order.status !== "Em execução"}
                              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${item.result === "Conforme" ? "bg-green-100 text-green-800 ring-2 ring-green-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"}`}
                            >
                              Conforme
                            </button>
                            <button
                              type="button"
                              onClick={() => updateChecklistItem(item.id, "result", "Não conforme")}
                              disabled={order.status !== "Em execução"}
                              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${item.result === "Não conforme" ? "bg-red-100 text-red-800 ring-2 ring-red-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"}`}
                            >
                              Não conforme
                            </button>
                            <button
                              type="button"
                              onClick={() => updateChecklistItem(item.id, "result", "Não se aplica")}
                              disabled={order.status !== "Em execução"}
                              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${item.result === "Não se aplica" ? "bg-amber-100 text-amber-800 ring-2 ring-amber-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"}`}
                            >
                              N/A
                            </button>
                          </div>
                        </div>
                        {item.result === "Não conforme" && (
                          <div className="mt-2">
                            <Input
                              placeholder="Observações da não conformidade..."
                              value={item.observations || ""}
                              disabled={order.status !== "Em execução"}
                              onChange={e => updateChecklistItem(item.id, "observations", e.target.value)}
                            />
                            {item.correctiveRequestId ? (
  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
    * Manutenção corretiva gerada.
    <Link to={`/servicos/${item.correctiveRequestId}`} className="underline hover:text-red-800">Ver Manutenção Corretiva</Link>
  </p>
) : (
  <p className="text-xs text-red-600 mt-1">* Uma demanda corretiva será gerada para este item.</p>
)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              
              
              {/* Materials Section */}
              <div className="pt-4 border-t border-slate-200 mt-6">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-semibold text-slate-900">Materiais Necessários</p>
                  {order.status === "Em execução" || order.status === "Planejada" || order.status === "Atribuída" ? (
                    <Button variant="secondary" size="sm" onClick={() => setAddingMaterial(!addingMaterial)}>
                      {addingMaterial ? "Cancelar" : "+ Adicionar Material"}
                    </Button>
                  ) : null}
                </div>
                
                {addingMaterial && (
                  <div className="mb-4 bg-slate-50 p-4 rounded-md border border-slate-200 space-y-4">
                    <div className="flex gap-4 border-b border-slate-200 pb-2">
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="radio" checked={matMode === "base"} onChange={() => setMatMode("base")} className="text-brand-600" />
                        <span className={matMode === "base" ? "font-medium text-slate-900" : "text-slate-500"}>Material Cadastrado</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="radio" checked={matMode === "unregistered"} onChange={() => setMatMode("unregistered")} className="text-brand-600" />
                        <span className={matMode === "unregistered" ? "font-medium text-slate-900" : "text-slate-500"}>Não Cadastrado</span>
                      </label>
                    </div>
                    
                    {matMode === "base" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select label="Buscar Material" value={selectedStockMatId} onChange={e => setSelectedStockMatId(e.target.value)}>
                          <option value="">Selecione um material...</option>
                          {stockMaterials.filter(sm => sm.active !== false).map(sm => (
                            <option key={sm.id} value={sm.id}>{sm.code} - {sm.name} (Disp: {sm.availableBalance} {sm.unit})</option>
                          ))}
                        </Select>
                        <Select label="Classificação" value={matClass} onChange={e => setMatClass(e.target.value)}>
                          <option value="Obrigatório">Obrigatório</option>
                          <option value="Recomendado">Recomendado</option>
                          <option value="Contingencial">Contingencial</option>
                          <option value="Terceiro">Fornecido por terceiro</option>
                          <option value="Eventual">Eventual</option>
                        </Select>
                        <Input type="number" label="Quantidade" value={matQuantity} onChange={e => setMatQuantity(Number(e.target.value))} min={1} />
                        <div className="flex items-end">
                          <Button onClick={handleAddMaterialNew} className="w-full" disabled={!selectedStockMatId || matQuantity < 1}>Adicionar Material</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input label="Descrição Sugerida" value={matDescUnreg} onChange={e => setMatDescUnreg(e.target.value)} placeholder="Descreva o material" required />
                          <Input type="number" label="Quantidade Estimada" value={matQuantity} onChange={e => setMatQuantity(Number(e.target.value))} min={1} required />
                          <div className="sm:col-span-2">
                            <Input label="Justificativa da Necessidade" value={matJustification} onChange={e => setMatJustification(e.target.value)} placeholder="Por que este material é necessário?" required />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button onClick={handleAddMaterialNew} disabled={!matDescUnreg || !matJustification || matQuantity < 1}>Solicitar Material</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {order.materials && order.materials.length > 0 ? (
                  <div className="space-y-2">
                    {order.materials.map(m => (
                      <div key={m.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-white border border-slate-200 rounded-md shadow-sm gap-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 text-sm">{m.description}</span>
                            {m.isUnregistered && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">Não cadastrado</span>}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>Qtd: <strong className="text-slate-700">{m.quantity} {m.type || ""}</strong></span>
                            <span>Classe: {m.classification || "N/A"}</span>
                            <span className={`px-1.5 py-0.5 rounded-sm font-medium ${m.availability === 'Disponível' ? 'bg-green-100 text-green-700' : m.availability === 'Parcialmente disponível' ? 'bg-yellow-100 text-yellow-700' : m.availability === 'Aguardando validação' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'}`}>
                              {m.availability || "Desconhecido"}
                            </span>
                          </div>
                          {m.justification && <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">"{m.justification}"</p>}
                        </div>
                        {(order.status === "Em execução" || order.status === "Planejada") && (
                          <div className="flex justify-end">
                            <button onClick={() => handleRemoveMaterial(m.id)} className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic py-2">Nenhum material adicionado à OS.</p>
                )}
              </div>

              {/* Attachments Section */}
              <div className="pt-4 border-t border-slate-200 mt-6">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-semibold text-slate-900">Anexos / Imagens</p>
                  <div>
                    <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" disabled={uploading} />
                    <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-md">
                      <Paperclip className="w-4 h-4" /> {uploading ? "Enviando..." : "Anexar arquivo"}
                    </label>
                  </div>
                </div>
                {order.attachments && order.attachments.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {order.attachments.map(att => (
                      <div key={att.id} className="border border-slate-200 rounded p-2 flex flex-col items-center justify-center gap-2 bg-slate-50 relative group">
                        {att.type.startsWith("image/") && att.dataUrl ? (
                          <img src={att.dataUrl} alt={att.name} className="w-full h-24 object-cover rounded" />
                        ) : (
                          <div className="w-full h-24 flex items-center justify-center bg-slate-100 rounded text-slate-400">
                            <Paperclip className="w-8 h-8" />
                          </div>
                        )}
                        <p className="text-xs text-slate-600 truncate w-full text-center" title={att.name}>{att.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Nenhum anexo adicionado.</p>
                )}
              </div>

              {/* Adicionar Acompanhamento */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Adicionar Acompanhamento</p>
                <div className="space-y-2">
                  <Textarea 
                    placeholder="Digite uma nova observação ou andamento do serviço..."
                    value={trackingComment} 
                    onChange={e => setTrackingComment(e.target.value)} 
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button 
                      size="sm" 
                      disabled={!trackingComment.trim()} 
                      onClick={() => {
                        if (!order || !currentUser || !trackingComment.trim()) return;
                        const orders = storageService.get("gsi_work_orders");
                        const idx = orders.findIndex(o => o.id === order.id);
                        if (idx !== -1) {
                          const separator = orders[idx].observations ? "\n\n" : "";
                          orders[idx].observations += `${separator}[${new Date().toLocaleString()} - ${currentUser.name}]: ${trackingComment}`;
                          orders[idx].updatedAt = new Date().toISOString();
                          orders[idx].status = resolveOrderStatusFromMaterials(orders[idx]);
      storageService.set("gsi_work_orders", orders);
                          storageService.logAudit(currentUser.id, "Adicionou acompanhamento", order.id, "WorkOrder", "", trackingComment);
                          setTrackingComment("");
                          loadOrder();
                        }
                      }}
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão da OS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Responsável Interno</p>
                <p className="text-sm font-medium">{getUserName(order.responsibleId)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Técnico</p>
                <p className="text-sm font-medium">{getProviderName(order.providerId)}</p>
              </div>

              {/* Atribuição - Gestores/Operadores */}
              {(order.status === "Planejada" || order.status === "Atribuída") && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <Select
                    label="Técnico Interno"
                    options={[{ value: "", label: "Nenhum" }, ...users.filter(u => u.role === "Executor/Técnico").map(u => ({ value: u.id, label: u.name }))]}
                    value={assignUser}
                    onChange={(e) => setAssignUser(e.target.value)}
                  />
                  <Select
                    label="Técnico"
                    options={[{ value: "", label: "Nenhum" }, ...providers.filter(p => p.active && (!p.unitId || p.unitId === order.unitId)).map(p => ({ value: p.id, label: `${p.name} (${p.type || "Externo"})` }))]}
                    value={assignProvider}
                    onChange={(e) => setAssignProvider(e.target.value)}
                  />
                  <Button className="w-full" onClick={handleAssign} disabled={!assignUser && !assignProvider}>Atribuir</Button>
                </div>
              )}

              {/* Execução */}
{true && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  {order.status === "Atribuída" && (
                    <Button className="w-full bg-blue-600" onClick={() => updateStatus("Em execução", "Iniciou execução")}>Iniciar Serviço</Button>
                  )}
                  {order.status === "Em execução" && (
                    <>
                      {isPausing ? (
                        <div className="space-y-3 p-3 bg-amber-50 rounded border border-amber-200">
                          <p className="text-sm font-medium text-amber-900">Motivo da Pausa</p>
                          <Select
                            options={[
                              { value: "", label: "Selecione..." },
                              ...PAUSE_REASONS.map(r => ({ value: r, label: r }))
                            ]}
                            value={pauseReason}
                            onChange={e => setPauseReason(e.target.value)}
                          />
                          <Textarea placeholder="Observações (opcional)..." value={comment} onChange={e => setComment(e.target.value)} />
                          <div className="flex gap-2">
                            <Button className="flex-1" variant="secondary" onClick={() => setIsPausing(false)}>Cancelar</Button>
                            <Button className="flex-1 bg-amber-600" onClick={handlePause}>Confirmar Pausa</Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Button className="w-full bg-amber-600" onClick={() => setIsPausing(true)}>Pausar Serviço</Button>
                          <Button className="w-full bg-green-600" onClick={() => updateStatus("Em validação", "Enviou para validação")}>Concluir Tecnicamente</Button>
                        </>
                      )}
                    </>
                  )}
                  {order.status === "Pausada" && (
                    <>
                      <Textarea placeholder="Observações da retomada..." value={comment} onChange={e => setComment(e.target.value)} />
                      <Button className="w-full bg-blue-600" onClick={() => updateStatus("Em execução", "Retomou serviço")}>Retomar Serviço</Button>
                    </>
                  )}
                </div>
              )}

              {/* Validação - Gestores */}
              {order.status === "Em validação" && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <Textarea placeholder="Comentário de validação..." value={comment} onChange={e => setComment(e.target.value)} />
                  <Button className="w-full bg-green-700" onClick={() => updateStatus("Concluída", "Validou e encerrou")}>Aprovar e Encerrar</Button>
                  <Button className="w-full" variant="destructive" onClick={() => updateStatus("Em execução", "Rejeitou validação")}>Reprovar (Voltar para Execução)</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
              <CardTitle>Programar Atividade</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowScheduleModal(false)}>X</Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Técnico Principal</label>
                <Select value={modalTechId} onChange={e => setModalTechId(e.target.value)}>
                  <option value="">Selecione um técnico...</option>
                  {users.filter(u => u.role === "Executor/Técnico" || u.role === "Administrador").map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data Planejada</label>
                  <Input type="date" value={modalDate} onChange={e => setModalDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora de Início</label>
                  <Input type="time" value={modalStartTime} onChange={e => setModalStartTime(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duração Estimada (minutos)</label>
                <Select value={modalDuration} onChange={e => setModalDuration(e.target.value)}>
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="120">2 horas</option>
                  <option value="240">4 horas</option>
                  <option value="480">8 horas</option>
                  <option value="1440">2 dias</option>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>Cancelar</Button>
                <Button onClick={handleSaveSchedule}>Confirmar Programação</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};


