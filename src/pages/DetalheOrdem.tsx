import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { storageService } from "../services/storageService";
import { WorkOrder, Unit, Location, Category, User, Asset, WorkOrderStatus, Provider } from "../types";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../contexts/AuthContext";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Input } from "../components/ui/Input";
import { Paperclip, Plus, Trash2, Printer } from "lucide-react";

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
  const [providers, setProviders] = useState<Provider[]>([]);

  // Action states
  const [assignUser, setAssignUser] = useState("");
  const [assignProvider, setAssignProvider] = useState("");
  const [comment, setComment] = useState("");
  const [trackingComment, setTrackingComment] = useState("");

  const [pauseReason, setPauseReason] = useState("");
  const [isPausing, setIsPausing] = useState(false);

  
  const [newMaterial, setNewMaterial] = useState({ description: "", type: "", quantity: 1, unitPrice: 0 });
  const [uploading, setUploading] = useState(false);

  const handleAddMaterial = () => {
    if (!order || !currentUser) return;
    if (!newMaterial.description) return;
    
    const orders = storageService.get("gsi_work_orders");
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      if (!orders[idx].materials) orders[idx].materials = [];
      orders[idx].materials.push({
        id: crypto.randomUUID(),
        ...newMaterial,
        total: newMaterial.quantity * newMaterial.unitPrice
      });
      storageService.set("gsi_work_orders", orders);
      setNewMaterial({ description: "", type: "", quantity: 1, unitPrice: 0 });
      loadOrder();
    }
  };

  const handleRemoveMaterial = (mId: string) => {
    if (!order || !currentUser) return;
    const orders = storageService.get("gsi_work_orders");
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      orders[idx].materials = orders[idx].materials?.filter(m => m.id !== mId) || [];
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
        storageService.set("gsi_work_orders", orders);
        loadOrder();
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const PAUSE_REASONS = [
    "Aguardando acesso ao local",
    "Aguardando prestador",
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
          alert(`Demanda corretiva gerada automaticamente: ${newReq.protocol}`);
        }

        storageService.set("gsi_work_orders", orders);
        loadOrder();
      }
    }
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
      storageService.set("gsi_work_orders", orders);
      storageService.logAudit(currentUser.id, "Atribuída OS", order.id, "WorkOrder", "", `Técnico: ${assignUser || '-'}, Prestador: ${assignProvider || '-'}`);
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
          <Link to={`/ordens/${order.id}/imprimir`} target="_blank"><Button variant="outline" className="gap-2"><Printer className="w-4 h-4" /> Imprimir</Button></Link>
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
                    <p className="text-xs font-semibold text-slate-500 uppercase">Origem (Demanda)</p>
                    <p className="text-sm text-brand-600 underline font-medium cursor-pointer" onClick={() => navigate(`/demandas/${order.requestId}`)}>
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
    * Demanda corretiva gerada. 
    <Link to={`/demandas/${item.correctiveRequestId}`} className="underline hover:text-red-800">Ver Demanda</Link>
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
                <p className="text-sm font-semibold text-slate-900 mb-3">Materiais Necessários</p>
                {order.materials && order.materials.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {order.materials.map(m => (
                      <div key={m.id} className="flex justify-between items-center p-2 bg-slate-50 border border-slate-200 rounded text-sm">
                        <div>
                          <span className="font-medium text-slate-800">{m.description}</span>
                          <span className="text-slate-500 ml-2">({m.quantity}x - {m.type || "N/A"})</span>
                        </div>
                        {order.status === "Em execução" && (
                          <button onClick={() => handleRemoveMaterial(m.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {order.status === "Em execução" && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end bg-slate-50 p-3 rounded border border-slate-200">
                    <div className="sm:col-span-2">
                      <Input label="Descrição do material" value={newMaterial.description} onChange={e => setNewMaterial({...newMaterial, description: e.target.value})} placeholder="Ex: Parafusos M8" />
                    </div>
                    <div>
                      <Input type="number" label="Quantidade" value={newMaterial.quantity} onChange={e => setNewMaterial({...newMaterial, quantity: Number(e.target.value)})} />
                    </div>
                    <div>
                      <Button onClick={handleAddMaterial} className="w-full" disabled={!newMaterial.description}>Adicionar</Button>
                    </div>
                  </div>
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
                <p className="text-xs font-semibold text-slate-500 uppercase">Prestador Externo</p>
                <p className="text-sm font-medium">{getProviderName(order.providerId)}</p>
              </div>

              {/* Atribuição - Gestores/Operadores */}
              {(currentUser?.role === "Gestor GSI" || currentUser?.role === "Operador GSI" || currentUser?.role === "Administrador") && (order.status === "Planejada" || order.status === "Atribuída") && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <Select
                    label="Técnico Interno"
                    options={[{ value: "", label: "Nenhum" }, ...users.filter(u => u.role === "Executor/Técnico").map(u => ({ value: u.id, label: u.name }))]}
                    value={assignUser}
                    onChange={(e) => setAssignUser(e.target.value)}
                  />
                  <Select
                    label="Prestador Externo"
                    options={[{ value: "", label: "Nenhum" }, ...providers.filter(p => p.active && (!p.unitId || p.unitId === order.unitId)).map(p => ({ value: p.id, label: p.name }))]}
                    value={assignProvider}
                    onChange={(e) => setAssignProvider(e.target.value)}
                  />
                  <Button className="w-full" onClick={handleAssign} disabled={!assignUser && !assignProvider}>Atribuir</Button>
                </div>
              )}

              {/* Execução */}
              {((currentUser?.role === "Executor/Técnico" && order.responsibleId === currentUser.id) || 
                currentUser?.role === "Gestor GSI" || currentUser?.role === "Operador GSI" || currentUser?.role === "Administrador") && (
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
              {(currentUser?.role === "Gestor GSI" || currentUser?.role === "Administrador") && order.status === "Em validação" && (
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
    </div>
  );
};
