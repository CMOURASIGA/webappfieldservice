import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { storageService } from "../services/storageService";
import { WorkOrder, Unit, Location, Category, User, WorkOrderStatus, WorkOrderKanbanColumn, Asset } from "../types";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { CardFooterActions } from "../components/ui/CardFooterActions";
import { Badge } from "../components/ui/Badge";
import { format, isValid, parseISO } from "date-fns";
import { LayoutList, Kanban as KanbanIcon, Plus, Calendar } from "lucide-react";
import { MetricButton, OperationalPageHeader, SearchToolbar } from "../components/ui/OperationalPage";

export const Ordens = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [searchParams] = useSearchParams();
  const initialstatusFilter = searchParams.get("status") || "Todas";
  const [statusFilter, setStatusFilter] = useState(initialstatusFilter);
  const [numberFilter, setNumberFilter] = useState("");
  const [assetFilter, setAssetFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [technicianFilter, setTechnicianFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setOrders(storageService.get("gsi_work_orders").sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || []);
    setUnits(storageService.get("gsi_units") || []);
    setLocations(storageService.get("gsi_locations") || []);
    setCategories(storageService.get("gsi_categories") || []);
    setUsers(storageService.get("gsi_users") || []);
    setAssets(storageService.get("gsi_assets") || []);
  };

  const getUnitName = (id: string) => units.find(u => u.id === id)?.name || "N/A";
  const getLocationName = (id: string) => locations.find(l => l.id === id)?.name || "N/A";
  const getUserName = (id?: string) => users.find(u => u.id === id)?.name || "Não atribuído";

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgente": return "text-red-600 bg-red-100";
      case "Alta": return "text-orange-600 bg-orange-100";
      case "Média": return "text-blue-600 bg-blue-100";
      default: return "text-slate-600 bg-slate-100";
    }
  };

  // Kanban setup
  const KANBAN_COLUMNS: WorkOrderKanbanColumn[] = [
    "Nova",
    "Planejamento",
    "Programada",
    "Em execução",
    "Validação",
    "Concluída"
  ];

  // Map internal status to Kanban column
  const getKanbanColumn = (status: string) => {
    switch (status) {
      case "Nova": 
      case "Em planejamento": return "Nova";
      case "Planejada": 
      case "Aguardando material":
      case "Aguardando estoque":
      case "Material liberado": return "Planejamento";
      case "Atribuída":
      case "Programada": return "Programada";
      case "Em execução": 
      case "Pausada": 
      case "Aguardando terceiro": return "Em execução";
      case "Em validação": return "Validação";
      case "Concluída": 
      case "Cancelada": return "Concluída";
      default: return "Nova";
    }
  };

  const getConditionLabels = (order: WorkOrder) => {
    const labels = [];
    if (order.status === "Aguardando material" || order.status === "Aguardando estoque") labels.push({ text: "Falta Material", color: "bg-red-100 text-red-700" });
    if (order.status === "Pausada") labels.push({ text: "Pausada", color: "bg-orange-100 text-orange-700" });
    if (order.status === "Aguardando terceiro") labels.push({ text: "Aguardando 3º", color: "bg-amber-100 text-amber-700" });
    if (!order.responsibleId && getKanbanColumn(order.status) !== "Concluída") labels.push({ text: "Sem Técnico", color: "bg-purple-100 text-purple-700" });
    
    // Check delay
    if (order.deadline && new Date(order.deadline) < new Date() && order.status !== "Concluída" && order.status !== "Cancelada") {
      labels.push({ text: "Atrasada", color: "bg-red-600 text-white" });
    }

    return labels;
  };

  const metrics = {
    total: orders.length,
    emAberto: orders.filter(o => !["Concluída", "Cancelada"].includes(o.status)).length,
    semResponsavel: orders.filter(o => !o.responsibleId && !["Concluída", "Cancelada"].includes(o.status)).length,
    atrasadas: orders.filter(o => o.deadline && new Date(o.deadline) < new Date() && !["Concluída", "Cancelada"].includes(o.status)).length,
    faltaMaterial: orders.filter(o => ["Aguardando material", "Aguardando estoque"].includes(o.status)).length,
  };

  const filteredOrders = orders.filter(o => {
    const relevantDate = o.plannedStart || o.plannedDate || o.createdAt;
    if (numberFilter && !o.number.toLowerCase().includes(numberFilter.toLowerCase())) return false;
    if (assetFilter && o.assetId !== assetFilter) return false;
    if (locationFilter && o.locationId !== locationFilter) return false;
    if (technicianFilter && o.responsibleId !== technicianFilter) return false;
    if (startDateFilter && new Date(relevantDate) < new Date(`${startDateFilter}T00:00:00`)) return false;
    if (endDateFilter && new Date(relevantDate) > new Date(`${endDateFilter}T23:59:59`)) return false;
    if (statusFilter === "Todas") return true;
    if (statusFilter === "Abertas") return !["Concluída", "Cancelada"].includes(o.status);
    if (statusFilter === "Sem Responsavel") return !o.responsibleId && !["Concluída", "Cancelada"].includes(o.status);
    if (statusFilter === "Atrasadas") return o.deadline && new Date(o.deadline) < new Date() && !["Concluída", "Cancelada"].includes(o.status);
    if (statusFilter === "Falta Material") return ["Aguardando material", "Aguardando estoque"].includes(o.status);
    return true;
  });

  const moveOrder = (id: string, column: WorkOrderKanbanColumn) => {
    const status: Record<string, WorkOrderStatus> = { Nova: "Nova", Planejamento: "Planejada", Programada: "Programada", "Em execução": "Em execução", Validação: "Em validação", "Concluída": "Concluída" };
    const updated = orders.map(order => order.id === id ? { ...order, status: status[column], operationalSituation: column, updatedAt: new Date().toISOString() } : order);
    storageService.set("gsi_work_orders", updated); setOrders(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Ações Rápidas no Topo */}
      <OperationalPageHeader
        title="Ordens de Serviço"
        description="Acompanhamento e execução operacional."
        backTo="/servicos"
        actions={
          <>
            <Button variant="secondary" className="gap-2" onClick={() => navigate("/agenda")}><Calendar className="h-4 w-4" /> Ver Agenda</Button>
            <Button variant="create" className="gap-2" onClick={() => navigate("/ordens/nova")}><Plus className="h-4 w-4" /> Nova OS</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 rounded-lg border-2 border-slate-300 bg-white p-4 md:grid-cols-3">
        <input className="rounded-md border-2 border-slate-300 px-3 py-2 text-sm" placeholder="Número da OS" value={numberFilter} onChange={e => setNumberFilter(e.target.value)} />
        <select className="rounded-md border-2 border-slate-300 px-3 py-2 text-sm" value={assetFilter} onChange={e => setAssetFilter(e.target.value)}><option value="">Todos os ativos</option>{assets.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}</select>
        <select className="rounded-md border-2 border-slate-300 px-3 py-2 text-sm" value={locationFilter} onChange={e => setLocationFilter(e.target.value)}><option value="">Todos os locais</option>{locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
        <select className="rounded-md border-2 border-slate-300 px-3 py-2 text-sm" value={technicianFilter} onChange={e => setTechnicianFilter(e.target.value)}><option value="">Todos os técnicos</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
        <input className="rounded-md border-2 border-slate-300 px-3 py-2 text-sm" type="date" aria-label="Data inicial" value={startDateFilter} onChange={e => setStartDateFilter(e.target.value)} />
        <input className="rounded-md border-2 border-slate-300 px-3 py-2 text-sm" type="date" aria-label="Data final" value={endDateFilter} onChange={e => setEndDateFilter(e.target.value)} />
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-4">
        <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-md">
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-sm transition-colors ${viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
            title="Visão Lista"
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`p-1.5 rounded-sm transition-colors ${viewMode === "kanban" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
            title="Visão Kanban"
          >
            <KanbanIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Indicadores Acionáveis */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricButton label="Todas" value={metrics.total} active={statusFilter === "Todas"} onClick={() => setStatusFilter("Todas")} />
        <MetricButton label="Em Aberto" value={metrics.emAberto} active={statusFilter === "Abertas"} onClick={() => setStatusFilter("Abertas")} />
        <MetricButton label="Sem Técnico" value={metrics.semResponsavel} active={statusFilter === "Sem Responsavel"} valueClassName="text-brand-700" onClick={() => setStatusFilter("Sem Responsavel")} />
        <MetricButton label="Falta Material" value={metrics.faltaMaterial} active={statusFilter === "Falta Material"} valueClassName="text-orange-700" onClick={() => setStatusFilter("Falta Material")} />
        <MetricButton label="Atrasadas" value={metrics.atrasadas} active={statusFilter === "Atrasadas"} valueClassName="text-red-700" onClick={() => setStatusFilter("Atrasadas")} />
      </div>

      {viewMode === "list" ? (
        <div className="operational-grid">
          {filteredOrders.map(order => {
            const conditions = getConditionLabels(order);
            return (
              <Card key={order.id} className="operational-card flex h-full flex-col">
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2"><Badge variant="default">{order.operationalSituation || order.status}</Badge>
                    <div>
                      <h3 className="font-semibold text-slate-900 line-clamp-2" title={order.technicalDescription}>{order.technicalDescription}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{order.number}</p>
                    </div>
                  </div>
                  
                  {/* Condition Tags */}
                  {conditions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {conditions.map((c, i) => (
                        <span key={i} className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm ${c.color}`}>
                          {c.text}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="operational-card-fields mb-4 flex-1 text-xs text-slate-700">
                    <p className="operational-card-field"><span className="block font-semibold">Unidade</span> {getUnitName(order.unitId)}</p>
                    <p className="operational-card-field border-r-0"><span className="block font-semibold">Local</span> {getLocationName(order.locationId)}</p>
                    <p className="operational-card-field border-b-0"><span className="block font-semibold">Técnico</span> {getUserName(order.responsibleId)}</p>
                    <p className="operational-card-field border-b-0 border-r-0"><span className="block font-semibold">Prazo</span> {order.deadline ? format(parseISO(order.deadline), 'dd/MM/yyyy HH:mm') : 'N/A'}</p>
                  </div>

                  </CardContent>
                <CardFooter className="mt-auto border-t border-slate-200 px-4 py-4">
                    <div className="flex w-full items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                      <CardFooterActions
                        viewLink={`/ordens/${order.id}`}
                        viewLabel="Abrir OS"
                      />
                    </div>
                  </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="flex overflow-x-auto rounded-xl border-2 border-slate-400 bg-white pb-6">
          {KANBAN_COLUMNS.map(col => {
            const colOrders = filteredOrders.filter(o => getKanbanColumn(o.status) === col);
            return (
              <div key={col} onDragOver={(e) => e.preventDefault()} onDrop={(e) => moveOrder(e.dataTransfer.getData("orderId"), col)} className="flex w-80 flex-none flex-col border-r-2 border-slate-400 bg-slate-50 last:border-r-0">
                <div className="mb-4 flex items-center justify-between border-b-2 border-slate-400 bg-slate-100 p-4">
                  <h3 className="font-semibold text-slate-700">{col}</h3>
                  <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{colOrders.length}</span>
                </div>
                
                <div className="min-h-[300px] max-h-[600px] flex-1 space-y-3 overflow-y-auto px-4 pb-4">
                  {colOrders.map(order => {
                    const conditions = getConditionLabels(order);
                    return (
                      <div key={order.id} draggable onDragStart={(e) => e.dataTransfer.setData("orderId", order.id)} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-grab hover:border-brand-300" onClick={() => navigate(`/ordens/${order.id}`)}>
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-mono text-slate-500">{order.number}</p>
                          <span
                            className={`h-3 w-3 rounded-full ring-2 ring-white ${order.priority === 'Urgente' ? 'bg-red-500' : order.priority === 'Alta' ? 'bg-orange-500' : 'bg-blue-500'}`}
                            title={`Prioridade: ${order.priority}`}
                            aria-label={`Prioridade: ${order.priority}`}
                          />
                        </div>
                        <h4 className="font-medium text-slate-900 text-sm mb-2 line-clamp-2">{order.technicalDescription}</h4>
                        
                        {conditions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {conditions.map((c, i) => (
                              <span key={i} className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm ${c.color}`}>
                                {c.text}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-50 pt-2">
                           <span className="truncate max-w-[120px]" title={getUserName(order.responsibleId)}>{getUserName(order.responsibleId)}</span>
                           <span>{order.deadline ? format(parseISO(order.deadline), 'dd/MM') : '--/--'}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
};
