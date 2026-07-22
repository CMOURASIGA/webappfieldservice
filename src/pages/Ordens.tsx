import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { WorkOrder, Unit, Location, Category, User, WorkOrderStatus } from "../types";
import { Button, PageHeader, PageHeaderTitle, PageHeaderTitleContent, PageHeaderActionsContainer } from "@cnc-ti/layout-basic";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { CardFooterActions } from "../components/ui/CardFooterActions";
import { Badge } from "../components/ui/Badge";
import { format, isValid, parseISO } from "date-fns";
import { LayoutList, Kanban as KanbanIcon, Plus, Calendar, Clock, AlertCircle } from "lucide-react";

export const Ordens = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [statusFilter, setStatusFilter] = useState<string>("Todas");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setOrders(storageService.get("gsi_work_orders").sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || []);
    setUnits(storageService.get("gsi_units") || []);
    setLocations(storageService.get("gsi_locations") || []);
    setCategories(storageService.get("gsi_categories") || []);
    setUsers(storageService.get("gsi_users") || []);
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
  const KANBAN_COLUMNS = [
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
    if (statusFilter === "Todas") return true;
    if (statusFilter === "Abertas") return !["Concluída", "Cancelada"].includes(o.status);
    if (statusFilter === "Sem Responsavel") return !o.responsibleId && !["Concluída", "Cancelada"].includes(o.status);
    if (statusFilter === "Atrasadas") return o.deadline && new Date(o.deadline) < new Date() && !["Concluída", "Cancelada"].includes(o.status);
    if (statusFilter === "Falta Material") return ["Aguardando material", "Aguardando estoque"].includes(o.status);
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Ações Rápidas no Topo */}
      <PageHeader>
        <PageHeaderTitleContent>
          <PageHeaderTitle>Ordens de Serviço</PageHeaderTitle>
          <p className="text-sm text-slate-500">Acompanhamento e execução operacional.</p>
        </PageHeaderTitleContent>
        <PageHeaderActionsContainer>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/agenda")}><Calendar className="w-4 h-4" /> Ver Agenda</Button>
          <Button variant="create" className="gap-2" onClick={() => navigate("/ordens/nova")}><Plus className="w-4 h-4" /> Nova OS</Button>
        </PageHeaderActionsContainer>
      </PageHeader>
      
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
        <button onClick={() => setStatusFilter("Todas")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Todas" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Todas</p>
          <p className="text-2xl font-bold text-slate-900">{metrics.total}</p>
        </button>
        <button onClick={() => setStatusFilter("Abertas")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Abertas" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Em Aberto</p>
          <p className="text-2xl font-bold text-slate-900">{metrics.emAberto}</p>
        </button>
        <button onClick={() => setStatusFilter("Sem Responsavel")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Sem Responsavel" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Sem Técnico</p>
          <p className="text-2xl font-bold text-brand-600">{metrics.semResponsavel}</p>
        </button>
        <button onClick={() => setStatusFilter("Falta Material")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Falta Material" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Falta Material</p>
          <p className="text-2xl font-bold text-orange-600">{metrics.faltaMaterial}</p>
        </button>
        <button onClick={() => setStatusFilter("Atrasadas")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Atrasadas" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Atrasadas</p>
          <p className="text-2xl font-bold text-red-600">{metrics.atrasadas}</p>
        </button>
      </div>

      {viewMode === "list" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map(order => {
            const conditions = getConditionLabels(order);
            return (
              <Card key={order.id} className="hover:border-brand-300 transition-colors">
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 line-clamp-2" title={order.title}>{order.title}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{order.code}</p>
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

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4 flex-1">
                    <p><span className="font-medium">Unidade:</span> {getUnitName(order.unitId)}</p>
                    <p><span className="font-medium">Local:</span> {getLocationName(order.locationId)}</p>
                    <p><span className="font-medium">Técnico:</span> {getUserName(order.responsibleId)}</p>
                    <p><span className="font-medium">Prazo:</span> {order.deadline ? format(parseISO(order.deadline), 'dd/MM/yyyy HH:mm') : 'N/A'}</p>
                  </div>

                  </CardContent>
                <CardFooter className="pt-0 pb-4 px-4 border-t border-slate-100 mt-3 pt-3">
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
        <div className="flex gap-4 overflow-x-auto pb-6">
          {KANBAN_COLUMNS.map(col => {
            const colOrders = filteredOrders.filter(o => getKanbanColumn(o.status) === col);
            return (
              <div key={col} className="flex-none w-80 bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-700">{col}</h3>
                  <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{colOrders.length}</span>
                </div>
                
                <div className="space-y-3 overflow-y-auto flex-1 pr-1 min-h-[300px] max-h-[600px]">
                  {colOrders.map(order => {
                    const conditions = getConditionLabels(order);
                    return (
                      <div key={order.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-brand-300" onClick={() => navigate(`/ordens/${order.id}`)}>
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-mono text-slate-500">{order.code}</p>
                          <span className={`w-2 h-2 rounded-full ${order.priority === 'Urgente' ? 'bg-red-500' : order.priority === 'Alta' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                        </div>
                        <h4 className="font-medium text-slate-900 text-sm mb-2 line-clamp-2">{order.title}</h4>
                        
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
