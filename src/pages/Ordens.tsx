import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { storageService } from "../services/storageService";
import { WorkOrder, Unit, Location, Category, User, WorkOrderStatus } from "../types";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { format, parseISO } from "date-fns";
import { LayoutList, Kanban as KanbanIcon, Printer } from "lucide-react";
import { Drawer } from "../components/ui/Drawer";
import { Textarea } from "../components/ui/Textarea";

export const Ordens = () => {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [statusFilter, setStatusFilter] = useState<string>("Todas");

  // Drag and drop state
  const [draggedOrder, setDraggedOrder] = useState<WorkOrder | null>(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<WorkOrderStatus | null>(null);
  const [moveJustification, setMoveJustification] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setOrders(storageService.get("gsi_work_orders").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setUnits(storageService.get("gsi_units"));
    setLocations(storageService.get("gsi_locations"));
    setCategories(storageService.get("gsi_categories"));
    setUsers(storageService.get("gsi_users"));
  };

  const getUnitName = (id: string) => units.find(u => u.id === id)?.name || "N/A";
  const getLocationName = (id: string) => locations.find(l => l.id === id)?.name || "N/A";
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "N/A";
  const getUserName = (id?: string) => users.find(u => u.id === id)?.name || "Não atribuído";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Em execução": return <Badge variant="info">{status}</Badge>;
      case "Concluída": return <Badge variant="success">{status}</Badge>;
      case "Aguardando terceiro":
      case "Pausada": return <Badge variant="warning">{status}</Badge>;
      case "Cancelada": return <Badge variant="danger">{status}</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgente": return "text-red-600 bg-red-100";
      case "Alta": return "text-orange-600 bg-orange-100";
      case "Média": return "text-blue-600 bg-blue-100";
      default: return "text-slate-600 bg-slate-100";
    }
  };

  const stats = {
    total: orders.length,
    emExecucao: orders.filter(o => o.status === "Em execução").length,
    planejadas: orders.filter(o => o.status === "Planejada" || o.status === "Atribuída").length,
    pausadas: orders.filter(o => o.status === "Pausada" || o.status === "Aguardando terceiro").length,
    concluidas: orders.filter(o => o.status === "Concluída" || o.status === "Em validação").length,
  };

  const filteredOrders = statusFilter === "Todas" 
    ? orders 
    : statusFilter === "Planejadas" ? orders.filter(o => o.status === "Planejada" || o.status === "Atribuída")
    : statusFilter === "Em Execução" ? orders.filter(o => o.status === "Em execução")
    : statusFilter === "Pausadas" ? orders.filter(o => o.status === "Pausada" || o.status === "Aguardando terceiro")
    : orders.filter(o => o.status === "Concluída" || o.status === "Em validação");

  const KANBAN_COLUMNS: WorkOrderStatus[] = ["Planejada", "Em execução", "Pausada", "Em validação", "Concluída"];

  const handleDragStart = (e: React.DragEvent, order: WorkOrder) => {
    setDraggedOrder(order);
    e.dataTransfer.effectAllowed = "move";
    // For firefox
    e.dataTransfer.setData("text/plain", order.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, status: WorkOrderStatus) => {
    e.preventDefault();
    if (!draggedOrder) return;

    // Map 'Planejada' -> 'Atribuída' logic if needed, but we can just use the column name as the strict status for Kanban
    const actualTargetStatus = status;

    if (draggedOrder.status !== actualTargetStatus) {
      // Check if it's planejad vs atribuída, which are grouped
      if ((draggedOrder.status === "Planejada" || draggedOrder.status === "Atribuída") && actualTargetStatus === "Planejada") {
        setDraggedOrder(null);
        return;
      }
      if ((draggedOrder.status === "Pausada" || draggedOrder.status === "Aguardando terceiro") && actualTargetStatus === "Pausada") {
        setDraggedOrder(null);
        return;
      }

      setTargetStatus(actualTargetStatus);
      setMoveJustification("");
      setMoveModalOpen(true);
    } else {
      setDraggedOrder(null);
    }
  };

  const confirmMove = () => {
    if (!draggedOrder || !targetStatus || !moveJustification) return;

    const allOrders = storageService.get("gsi_work_orders");
    const idx = allOrders.findIndex(o => o.id === draggedOrder.id);
    if (idx !== -1) {
      const oldStatus = allOrders[idx].status;
      allOrders[idx].status = targetStatus;
      
      const observationEntry = `[${format(new Date(), 'dd/MM/yyyy HH:mm')}] Movimentação de "${oldStatus}" para "${targetStatus}". Justificativa: ${moveJustification}\n`;
      allOrders[idx].observations = (allOrders[idx].observations || "") + "\n" + observationEntry;
      allOrders[idx].updatedAt = new Date().toISOString();

      storageService.set("gsi_work_orders", allOrders);
      loadData();
    }

    setMoveModalOpen(false);
    setDraggedOrder(null);
    setTargetStatus(null);
  };

  return (
    <div className="space-y-6">
      <style>{`
        .kanban-scroll::-webkit-scrollbar {
          height: 12px;
        }
        .kanban-scroll::-webkit-scrollbar-track {
          background: #f1f5f9; 
          border-radius: 8px;
        }
        .kanban-scroll::-webkit-scrollbar-thumb {
          background-color: #cbd5e1; 
          border-radius: 8px;
          border: 3px solid #f1f5f9;
        }
        .kanban-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8; 
        }
      `}</style>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Ordens de Serviço</h1>
          <p className="text-sm text-slate-500">Acompanhamento e execução de serviços.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-md border border-slate-200 p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
              title="Visão em Lista"
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
          <Link to="/ordens/nova">
            <Button>Nova OS</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button onClick={() => setStatusFilter("Todas")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Todas" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Todas</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </button>
        <button onClick={() => setStatusFilter("Planejadas")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Planejadas" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Planejadas</p>
          <p className="text-2xl font-bold text-slate-900">{stats.planejadas}</p>
        </button>
        <button onClick={() => setStatusFilter("Em Execução")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Em Execução" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Em Execução</p>
          <p className="text-2xl font-bold text-blue-600">{stats.emExecucao}</p>
        </button>
        <button onClick={() => setStatusFilter("Pausadas")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Pausadas" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Pausadas</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pausadas}</p>
        </button>
        <button onClick={() => setStatusFilter("Concluídas")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Concluídas" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Concluídas</p>
          <p className="text-2xl font-bold text-green-600">{stats.concluidas}</p>
        </button>
      </div>

      {viewMode === "list" ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4 border-b border-slate-200">Número</th>
                    <th className="px-6 py-4 border-b border-slate-200">Prioridade</th>
                    <th className="px-6 py-4 border-b border-slate-200">Unidade/Local</th>
                    <th className="px-6 py-4 border-b border-slate-200">Tipo/Categoria</th>
                    <th className="px-6 py-4 border-b border-slate-200">Responsável</th>
                    <th className="px-6 py-4 border-b border-slate-200">Status</th>
                    <th className="px-6 py-4 border-b border-slate-200 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredOrders.map(os => (
                    <tr key={os.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{os.number}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(os.priority)}`}>
                          {os.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 flex flex-col">
                        <span>{getUnitName(os.unitId)}</span>
                        <span className="text-xs text-slate-400">{getLocationName(os.locationId)}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 flex flex-col">
                        <span>{os.type}</span>
                        <span className="text-xs text-slate-400">{getCategoryName(os.categoryId)}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-900">{getUserName(os.responsibleId)}</td>
                      <td className="px-6 py-4">{getStatusBadge(os.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/ordens/${os.id}/imprimir`} target="_blank">
                            <Button variant="ghost" size="sm" title="Imprimir" className="px-2">
                              <Printer className="w-4 h-4 text-slate-500" />
                            </Button>
                          </Link>
                          <Link to={`/ordens/${os.id}`}>
                            <Button variant="secondary" size="sm">Ver</Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                        Nenhuma ordem de serviço encontrada para este filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6 snap-x kanban-scroll">
          {KANBAN_COLUMNS.map(col => {
            const colOrders = orders.filter(o => o.status === col || (col === "Planejada" && o.status === "Atribuída") || (col === "Pausada" && o.status === "Aguardando terceiro"));
            return (
              <div 
                key={col} 
                className="flex-none w-80 bg-slate-50 rounded-xl p-4 snap-center border border-slate-200 flex flex-col"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col)}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-700">{col}</h3>
                  <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{colOrders.length}</span>
                </div>
                <div className="space-y-3 flex-1">
                  {colOrders.map(os => (
                    <div 
                      key={os.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, os)}
                      className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:border-brand-300 transition-colors cursor-grab active:cursor-grabbing" 
                      onClick={() => window.location.href = `/ordens/${os.id}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500">{os.number}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${getPriorityColor(os.priority)}`}>
                          {os.priority}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 mb-2 line-clamp-2">{os.technicalDescription || `${os.type} em ${getUnitName(os.unitId)}`}</p>
                      <div className="flex justify-between items-end mt-4 text-xs text-slate-500">
                        <div>
                          <p>{getUnitName(os.unitId)}</p>
                          <p>{getUserName(os.responsibleId)}</p>
                        </div>
                        <Link to={`/ordens/${os.id}/imprimir`} target="_blank" onClick={(e) => e.stopPropagation()}>
                          <Printer className="w-4 h-4 hover:text-brand-600 transition-colors" />
                        </Link>
                      </div>
                    </div>
                  ))}
                  {colOrders.length === 0 && (
                    <div className="text-center p-4 text-sm text-slate-400 border border-dashed border-slate-300 rounded-lg">
                      Arraste OS para cá
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Justification Modal for drag and drop */}
      <Drawer
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        title="Justificativa de Movimentação"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Você está movendo a OS <strong>{draggedOrder?.number}</strong> para a etapa <strong>{targetStatus}</strong>.
            Por favor, insira uma justificativa para essa mudança de status que ficará salva no histórico.
          </p>
          <Textarea
            label="Justificativa"
            required
            placeholder="Descreva o motivo da mudança..."
            value={moveJustification}
            onChange={(e) => setMoveJustification(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={() => { setMoveModalOpen(false); setDraggedOrder(null); }}>Cancelar</Button>
            <Button onClick={confirmMove} disabled={!moveJustification.trim()}>Confirmar Movimentação</Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
