import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format, isValid, parseISO } from "date-fns";
import { CalendarDays, Kanban as KanbanIcon, LayoutList, Search, SlidersHorizontal, X } from "lucide-react";
import { storageService } from "../services/storageService";
import { Asset, Category, Location, Unit, User, WorkOrder, WorkOrderKanbanColumn, WorkOrderStatus } from "../types";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { CardFooterActions } from "../components/ui/CardFooterActions";
import { Input } from "../components/ui/Input";
import { OperationalPageHeader } from "../components/ui/OperationalPage";

type OrderFilters = {
  query: string;
  assetId: string;
  locationId: string;
  technicianId: string;
  startDate: string;
  endDate: string;
  status: string;
  priority: string;
};

const EMPTY_FILTERS: OrderFilters = {
  query: "",
  assetId: "",
  locationId: "",
  technicianId: "",
  startDate: "",
  endDate: "",
  status: "",
  priority: "",
};

export const Ordens = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dashboardFilter = searchParams.get("filter") || "";

  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [draftFilters, setDraftFilters] = useState<OrderFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<OrderFilters>(EMPTY_FILTERS);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setOrders(storageService.get("gsi_work_orders").sort((a: WorkOrder, b: WorkOrder) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || []);
    setUnits(storageService.get("gsi_units") || []);
    setLocations(storageService.get("gsi_locations") || []);
    setCategories(storageService.get("gsi_categories") || []);
    setUsers(storageService.get("gsi_users") || []);
    setAssets(storageService.get("gsi_assets") || []);
  };

  const setDraftValue = (field: keyof OrderFilters, value: string) => {
    setDraftFilters((current) => ({ ...current, [field]: value }));
  };

  const clearFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setShowAdvancedFilters(false);
  };

  const handleSearch = () => {
    setAppliedFilters(draftFilters);
  };

  const getUnitName = (id: string) => units.find((unit) => unit.id === id)?.name || "N/A";
  const getLocationName = (id: string) => locations.find((location) => location.id === id)?.name || "N/A";
  const getUserName = (id?: string) => users.find((user) => user.id === id)?.name || "Nao atribuido";
  const getCategoryName = (id?: string) => categories.find((category) => category.id === id)?.name || "Sem categoria";

  const getAssetNames = (order: WorkOrder) => {
    const ids = (order.assetIds?.length ? order.assetIds : [order.assetId]).filter(Boolean);
    if (!ids.length) return "Sem ativo vinculado";
    return ids.map((id) => assets.find((asset) => asset.id === id)?.code || "Ativo nao encontrado").join(", ");
  };

  const getPriorityTone = (priority: string) => {
    switch (priority) {
      case "Urgente":
        return "bg-red-50 text-red-700";
      case "Alta":
        return "bg-orange-50 text-orange-700";
      case "Media":
      case "Média":
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getPriorityLabel = (priority: string) => (priority === "Media" ? "Média" : priority);

  const formatDate = (value?: string, mask = "dd/MM/yyyy") => {
    if (!value) return "Nao informado";
    const parsed = parseISO(value);
    return isValid(parsed) ? format(parsed, mask) : "Nao informado";
  };

  const KANBAN_COLUMNS: WorkOrderKanbanColumn[] = ["Nova", "Planejamento", "Programada", "Em execução", "Validação", "Concluída"];

  const getKanbanColumn = (status: string) => {
    switch (status) {
      case "Nova":
      case "Em planejamento":
        return "Nova";
      case "Planejada":
      case "Aguardando material":
      case "Aguardando estoque":
      case "Material liberado":
        return "Planejamento";
      case "Atribuída":
      case "Programada":
        return "Programada";
      case "Em execução":
      case "Pausada":
      case "Aguardando terceiro":
        return "Em execução";
      case "Em validação":
        return "Validação";
      case "Concluída":
      case "Cancelada":
        return "Concluída";
      default:
        return "Nova";
    }
  };

  const getConditionLabels = (order: WorkOrder) => {
    const labels = [];
    if (order.status === "Aguardando material" || order.status === "Aguardando estoque") labels.push({ text: "Falta material", color: "bg-red-100 text-red-700" });
    if (order.status === "Pausada") labels.push({ text: "Pausada", color: "bg-orange-100 text-orange-700" });
    if (order.status === "Aguardando terceiro") labels.push({ text: "Aguardando 3º", color: "bg-amber-100 text-amber-700" });
    if (!order.responsibleId && getKanbanColumn(order.status) !== "Concluída") labels.push({ text: "Sem tecnico", color: "bg-purple-100 text-purple-700" });
    if (order.deadline && new Date(order.deadline) < new Date() && order.status !== "Concluída" && order.status !== "Cancelada") {
      labels.push({ text: "Atrasada", color: "bg-red-600 text-white" });
    }
    return labels;
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const relevantDate = order.plannedStart || order.plannedDate || order.createdAt;
      const query = appliedFilters.query.trim().toLowerCase();
      const targetText = [
        order.number,
        order.technicalDescription,
        getUnitName(order.unitId),
        getLocationName(order.locationId),
        getUserName(order.responsibleId),
        getCategoryName(order.categoryId),
        getAssetNames(order),
      ]
        .join(" ")
        .toLowerCase();

      if (query && !targetText.includes(query)) return false;
      if (appliedFilters.assetId && !(order.assetIds?.includes(appliedFilters.assetId) || order.assetId === appliedFilters.assetId)) return false;
      if (appliedFilters.locationId && order.locationId !== appliedFilters.locationId) return false;
      if (appliedFilters.technicianId && order.responsibleId !== appliedFilters.technicianId) return false;
      if (appliedFilters.startDate && new Date(relevantDate) < new Date(`${appliedFilters.startDate}T00:00:00`)) return false;
      if (appliedFilters.endDate && new Date(relevantDate) > new Date(`${appliedFilters.endDate}T23:59:59`)) return false;
      if (appliedFilters.status && order.status !== appliedFilters.status) return false;
      if (appliedFilters.priority && order.priority !== appliedFilters.priority) return false;

      if (dashboardFilter === "atrasadas") return !!order.deadline && new Date(order.deadline) < new Date() && !["Concluída", "Cancelada"].includes(order.status);
      if (dashboardFilter === "programacao") return !order.plannedDate && !["Concluída", "Cancelada"].includes(order.status) && ["Nova", "Planejada", "Em planejamento", "Atribuída"].includes(order.status);
      if (dashboardFilter === "material-validacao") return ["Aguardando material", "Aguardando estoque", "Em validação"].includes(order.status);
      if (dashboardFilter === "corretivas-abertas") return order.type.toLowerCase().includes("corretiva") && !["Concluída", "Cancelada"].includes(order.status);

      return true;
    });
  }, [appliedFilters, assets, categories, dashboardFilter, locations, orders, units, users]);

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  const moveOrder = (id: string, column: WorkOrderKanbanColumn) => {
    const statusMap: Record<WorkOrderKanbanColumn, WorkOrderStatus> = {
      Nova: "Nova",
      Planejamento: "Planejada",
      Programada: "Programada",
      "Em execução": "Em execução",
      Validação: "Em validação",
      Concluída: "Concluída",
    };

    const updated = orders.map((order) =>
      order.id === id ? { ...order, status: statusMap[column], operationalSituation: column, updatedAt: new Date().toISOString() } : order,
    );

    storageService.set("gsi_work_orders", updated);
    setOrders(updated);
  };

  return (
    <div className="space-y-6">
      <OperationalPageHeader
        title="Ordens de Serviço"
        description="Página de busca e acompanhamento das ordens em execução operacional."
        backTo="/servicos"
        actions={
          <div className="orders-header-actions">
            <button type="button" className="orders-header-actions__secondary" onClick={() => navigate("/agenda")}>
              Ver Agenda
            </button>
            <button type="button" className="orders-header-actions__primary" onClick={() => navigate("/ordens/nova")}>
              Nova OS
            </button>
          </div>
        }
      />

      <section className="rounded-xl border-2 border-slate-300 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-4 border-b border-slate-200 p-4 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_180px_180px_auto]">
          <Input
            label="Titulo / Palavra-chave"
            placeholder="Numero da OS, descricao, unidade, local ou ativo"
            value={draftFilters.query}
            onChange={(event) => setDraftValue("query", event.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-700">Tecnico</label>
            <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" value={draftFilters.technicianId} onChange={(event) => setDraftValue("technicianId", event.target.value)}>
              <option value="">Selecione uma opcao</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <Input label="De:" type="date" value={draftFilters.startDate} onChange={(event) => setDraftValue("startDate", event.target.value)} />
          <Input label="Até:" type="date" value={draftFilters.endDate} onChange={(event) => setDraftValue("endDate", event.target.value)} />
          <div className="flex items-end gap-2">
            <Button type="button" variant="secondary" className="h-10 px-3" title="Mais filtros" onClick={() => setShowAdvancedFilters((current) => !current)}>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <Button type="button" className="search-action-button" onClick={handleSearch}>
              <Search className="h-4 w-4" />
              Pesquisar
            </Button>
            <Button type="button" variant="secondary" className="search-clear-button" onClick={clearFilters}>
              <X className="h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 gap-4 border-b border-slate-200 bg-slate-50/70 p-4 lg:grid-cols-2 xl:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Status</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" value={draftFilters.status} onChange={(event) => setDraftValue("status", event.target.value)}>
                <option value="">Selecione uma opcao</option>
                {Array.from(new Set(orders.map((order) => order.status))).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Prioridade</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" value={draftFilters.priority} onChange={(event) => setDraftValue("priority", event.target.value)}>
                <option value="">Selecione uma opcao</option>
                <option value="Baixa">Baixa</option>
                <option value="Media">Média</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Local</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" value={draftFilters.locationId} onChange={(event) => setDraftValue("locationId", event.target.value)}>
                <option value="">Selecione uma opcao</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Ativo</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" value={draftFilters.assetId} onChange={(event) => setDraftValue("assetId", event.target.value)}>
                <option value="">Selecione uma opcao</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.code} - {asset.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-brand-900">Ordens encontradas | {filteredOrders.length}</p>
            <p className="text-sm text-slate-500">
              {activeFilterCount > 0 ? `Filtros aplicados: ${activeFilterCount}.` : "Exibindo todas as ordens disponíveis."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              {viewMode === "list" ? "Lista" : "Kanban"}
            </span>
            <div className="flex items-center gap-1 rounded-md border border-slate-300 bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`rounded-sm p-1.5 transition-colors ${viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                title="Visão lista"
              >
                <LayoutList className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`rounded-sm p-1.5 transition-colors ${viewMode === "kanban" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                title="Visão kanban"
              >
                <KanbanIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {viewMode === "list" ? (
        filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 md:grid-cols-2">
            {filteredOrders.map((order) => {
              const conditions = getConditionLabels(order);
              return (
                <Card key={order.id} className="overflow-hidden border-2 border-slate-300 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-700 hover:shadow-md">
                  <CardContent className="space-y-4 p-0">
                    <div className="space-y-4 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <Badge variant="default">{formatDate(order.createdAt, "yyyy")}</Badge>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityTone(order.priority)}`}>{getPriorityLabel(order.priority)}</span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="line-clamp-2 text-lg font-semibold text-slate-900" title={order.technicalDescription}>
                          {order.technicalDescription}
                        </h3>
                        <p className="line-clamp-2 text-sm text-slate-500">{getCategoryName(order.categoryId)}</p>
                      </div>

                      <div className="border-t border-slate-200 pt-3 text-xs text-slate-600">
                        <p className="font-semibold uppercase tracking-wide text-slate-500">{order.type}</p>
                        <div className="mt-2 space-y-1.5">
                          <p className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {order.deadline ? `${formatDate(order.deadline, "dd/MM/yyyy")} às ${formatDate(order.deadline, "HH:mm")}` : "Prazo nao informado"}
                          </p>
                          <p>{getUnitName(order.unitId)} • {getLocationName(order.locationId)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-slate-200">
                        <div className="border-b border-r border-slate-200 bg-slate-50 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">{order.operationalSituation || order.status}</p>
                        </div>
                        <div className="border-b border-slate-200 bg-slate-50 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Número</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">{order.number}</p>
                        </div>
                        <div className="border-r border-slate-200 bg-slate-50 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Técnico</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">{getUserName(order.responsibleId)}</p>
                        </div>
                        <div className="bg-slate-50 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ativos</p>
                          <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-900">{getAssetNames(order)}</p>
                        </div>
                      </div>

                      {conditions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {conditions.map((condition) => (
                            <span key={condition.text} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${condition.color}`}>
                              {condition.text}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-slate-200 p-0">
                    <CardFooterActions
                      viewLink={`/ordens/${order.id}`}
                      viewLabel="Ver OS"
                      editLink={`/ordens/${order.id}`}
                      editLabel="Editar OS"
                    />
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">Nenhuma ordem encontrada.</p>
            <p className="mt-2 text-sm text-slate-500">Revise os filtros aplicados ou limpe a pesquisa para voltar a lista completa.</p>
          </div>
        )
      ) : (
        <div className="flex overflow-x-auto rounded-xl border-2 border-slate-400 bg-white pb-6">
          {KANBAN_COLUMNS.map((column) => {
            const columnOrders = filteredOrders.filter((order) => getKanbanColumn(order.status) === column);
            return (
              <div
                key={column}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => moveOrder(event.dataTransfer.getData("orderId"), column)}
                className="flex w-80 flex-none flex-col border-r-2 border-slate-400 bg-slate-50 last:border-r-0"
              >
                <div className="mb-4 flex items-center justify-between border-b-2 border-slate-400 bg-slate-100 p-4">
                  <h3 className="font-semibold text-slate-700">{column}</h3>
                  <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-bold text-slate-600">{columnOrders.length}</span>
                </div>

                <div className="min-h-[300px] max-h-[600px] flex-1 space-y-3 overflow-y-auto px-4 pb-4">
                  {columnOrders.map((order) => {
                    const conditions = getConditionLabels(order);
                    return (
                      <div
                        key={order.id}
                        draggable
                        onDragStart={(event) => event.dataTransfer.setData("orderId", order.id)}
                        className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:border-brand-300"
                        onClick={() => navigate(`/ordens/${order.id}`)}
                      >
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <p className="text-xs font-mono text-slate-500">{order.number}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getPriorityTone(order.priority)}`}>{getPriorityLabel(order.priority)}</span>
                        </div>
                        <h4 className="mb-2 line-clamp-2 text-sm font-medium text-slate-900">{order.technicalDescription}</h4>

                        {conditions.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-1">
                            {conditions.map((condition) => (
                              <span key={condition.text} className={`rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase ${condition.color}`}>
                                {condition.text}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="border-t border-slate-100 pt-2 text-xs text-slate-500">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate" title={getUserName(order.responsibleId)}>
                              {getUserName(order.responsibleId)}
                            </span>
                            <span>{order.deadline ? formatDate(order.deadline, "dd/MM") : "--/--"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
