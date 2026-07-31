import React, { useEffect, useMemo, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { storageService } from "../services/storageService";
import { Request, Unit, Location, Category } from "../types";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { CardFooterActions } from "../components/ui/CardFooterActions";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { OperationalPageHeader } from "../components/ui/OperationalPage";

export const Servicos = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [draftSearch, setDraftSearch] = useState("");
  const [draftStatus, setDraftStatus] = useState("Todas");
  const [draftUnit, setDraftUnit] = useState("");
  const [draftCategory, setDraftCategory] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Todas");
  const [unitFilter, setUnitFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    setRequests(storageService.get("gsi_requests").sort((a: Request, b: Request) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setUnits(storageService.get("gsi_units"));
    setLocations(storageService.get("gsi_locations"));
    setCategories(storageService.get("gsi_categories"));
  }, []);

  const getUnitName = (id: string) => units.find((item) => item.id === id)?.name || "N/A";
  const getLocationName = (id: string) => locations.find((item) => item.id === id)?.name || "N/A";
  const getCategoryName = (id: string) => categories.find((item) => item.id === id)?.name || "N/A";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aberta":
        return <Badge variant="info">Aberta</Badge>;
      case "Em triagem":
        return <Badge variant="warning">Em triagem</Badge>;
      case "Convertida em ordem":
        return <Badge variant="success">Convertida em OS</Badge>;
      case "Rejeitada":
        return <Badge variant="danger">Rejeitada</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgente":
        return "text-red-600 bg-red-100";
      case "Alta":
        return "text-orange-600 bg-orange-100";
      case "Média":
      case "Media":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-slate-600 bg-slate-100";
    }
  };

  const statusFilteredRequests =
    statusFilter === "Todas"
      ? requests
      : statusFilter === "Abertas"
        ? requests.filter((item) => item.status === "Aberta" || item.status === "Rascunho")
        : statusFilter === "Em Triagem"
          ? requests.filter((item) => item.status === "Em triagem" || item.status === "Aguardando informação")
          : statusFilter === "Convertidas"
            ? requests.filter((item) => item.status === "Convertida em ordem")
            : requests.filter((item) => item.status === "Rejeitada");

  const filteredRequests = useMemo(
    () =>
      statusFilteredRequests.filter((request) => {
        const term = searchTerm.trim().toLowerCase();
        if (
          term &&
          ![request.title, request.protocol, request.description, getUnitName(request.unitId), getLocationName(request.locationId), getCategoryName(request.categoryId)].some((value) =>
            value?.toLowerCase().includes(term),
          )
        ) {
          return false;
        }
        if (unitFilter && request.unitId !== unitFilter) return false;
        if (categoryFilter && request.categoryId !== categoryFilter) return false;
        return true;
      }),
    [categoryFilter, searchTerm, statusFilteredRequests, unitFilter],
  );

  const applyFilters = () => {
    setSearchTerm(draftSearch);
    setStatusFilter(draftStatus);
    setUnitFilter(draftUnit);
    setCategoryFilter(draftCategory);
  };

  const clearFilters = () => {
    setDraftSearch("");
    setDraftStatus("Todas");
    setDraftUnit("");
    setDraftCategory("");
    setSearchTerm("");
    setStatusFilter("Todas");
    setUnitFilter("");
    setCategoryFilter("");
    setShowAdvancedFilters(false);
  };

  const activeFilterCount = [searchTerm, statusFilter !== "Todas" ? statusFilter : "", unitFilter, categoryFilter].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <OperationalPageHeader
        title="Manutenção Corretiva"
        description="Página de busca e acompanhamento das solicitações corretivas."
        backTo="/servicos"
        actions={
          <div className="orders-header-actions">
            <button type="button" className="orders-header-actions__secondary" onClick={() => navigate("/agenda")}>
              Ver Agenda
            </button>
            <button type="button" className="orders-header-actions__primary" onClick={() => navigate("/servicos/nova")}>
              Nova Corretiva
            </button>
          </div>
        }
      />

      <section className="rounded-xl border-2 border-slate-300 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Acoes rapidas</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" className="gap-2" onClick={() => navigate("/agenda")}>
              Ver Agenda
            </Button>
            <Button type="button" className="gap-2" onClick={() => navigate("/servicos/nova")}>
              Nova Corretiva
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border-2 border-slate-300 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-4 border-b border-slate-200 p-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)_auto]">
          <Input
            label="Titulo / Palavra-chave"
            placeholder="Titulo, protocolo, descricao, unidade, local ou categoria"
            value={draftSearch}
            onChange={(event) => setDraftSearch(event.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-700">Status</label>
            <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftStatus} onChange={(event) => setDraftStatus(event.target.value)}>
              <option value="Todas">Todas</option>
              <option value="Abertas">Abertas</option>
              <option value="Em Triagem">Em Triagem</option>
              <option value="Convertidas">Convertidas</option>
              <option value="Rejeitadas">Rejeitadas</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button type="button" variant="secondary" className="h-10 px-3" onClick={() => setShowAdvancedFilters((current) => !current)}>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <Button type="button" className="search-action-button" onClick={applyFilters}>
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
          <div className="grid grid-cols-1 gap-4 border-b border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Unidade</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftUnit} onChange={(event) => setDraftUnit(event.target.value)}>
                <option value="">Selecione uma opcao</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Categoria</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftCategory} onChange={(event) => setDraftCategory(event.target.value)}>
                <option value="">Selecione uma opcao</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="p-4">
          <p className="text-lg font-semibold text-brand-900">Corretivas encontradas | {filteredRequests.length}</p>
          <p className="text-sm text-slate-500">
            {activeFilterCount > 0 ? `Filtros aplicados: ${activeFilterCount}.` : "Exibindo todas as solicitações."}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="record-card">
            <CardContent className="record-card-content">
              <div className="record-card-body">
                <div className="record-card-header">
                  <Badge variant="default">{isValid(parseISO(request.createdAt)) ? format(parseISO(request.createdAt), "yyyy") : "Sem data"}</Badge>
                  {getStatusBadge(request.status)}
                </div>

                <div className="space-y-2">
                  <h3 className="record-card-title" title={request.title}>
                    {request.title}
                  </h3>
                  <p className="record-card-subtitle">{request.protocol}</p>
                </div>

                <div className="record-card-meta text-sm text-slate-600">
                  <p className="line-clamp-2">{request.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-slate-200">
                  <div className="border-b border-r border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Unidade</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{getUnitName(request.unitId)}</p>
                  </div>
                  <div className="border-b border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Local</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{getLocationName(request.locationId)}</p>
                  </div>
                  <div className="border-r border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Data</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{isValid(parseISO(request.createdAt)) ? format(parseISO(request.createdAt), "dd/MM/yyyy") : "Invalida"}</p>
                  </div>
                  <div className="bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Prioridade</p>
                    <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(request.suggestedPriority)}`}>
                      {request.suggestedPriority}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="mt-auto border-t border-slate-200 p-0">
              <CardFooterActions viewLink={`/servicos/${request.id}`} viewLabel="Abrir">
                {request.status !== "Convertida em ordem" && (
                  <button type="button" className="card-action-button gap-2" title="Gerar OS" aria-label="Gerar OS" onClick={() => navigate("/ordens/nova", { state: { sourceRequest: request } })}>
                    Gerar OS
                  </button>
                )}
              </CardFooterActions>
            </CardFooter>
          </Card>
        ))}

        {filteredRequests.length === 0 && (
          <div className="col-span-full rounded-lg border-2 border-dashed border-slate-200 py-12 text-center">
            <p className="text-slate-500">Nenhuma manutenção encontrada para o filtro atual.</p>
          </div>
        )}
      </div>
    </div>
  );
};
