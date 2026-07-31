import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, isValid, parseISO } from "date-fns";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { storageService } from "../services/storageService";
import { Provider, Unit, WorkOrder } from "../types";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { CardFooterActions } from "../components/ui/CardFooterActions";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { MetricButton, OperationalPageHeader } from "../components/ui/OperationalPage";
import { useAuth } from "../contexts/AuthContext";

const specialties = [
  "Climatizacao", "Eletrica", "Civil", "Hidraulica", "Elevadores",
  "Combate a incendio", "Geradores", "Controle de acesso", "Limpeza tecnica", "Manutencao geral",
];

export const Tecnicos = () => {
  const { currentUser } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [orders, setOrders] = useState<WorkOrder[]>([]);

  const [draftSearch, setDraftSearch] = useState("");
  const [draftSpecialty, setDraftSpecialty] = useState("");
  const [draftUnit, setDraftUnit] = useState("");
  const [draftStatus, setDraftStatus] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProviders(storageService.get("gsi_providers").sort((a: Provider, b: Provider) => a.name.localeCompare(b.name)));
    setUnits(storageService.get("gsi_units"));
    setOrders(storageService.get("gsi_work_orders"));
  };

  const getUnitName = (id?: string) => {
    if (!id) return "Todas";
    return units.find((unit) => unit.id === id)?.name || "N/A";
  };

  const getProviderStats = (providerId: string) => {
    const providerOrders = orders.filter((order) => order.providerId === providerId);
    const activeOrders = providerOrders.filter((order) => order.status !== "Concluída" && order.status !== "Cancelada").length;
    const completedOrders = providerOrders.filter((order) => order.status === "Concluída").sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const lastService = completedOrders.length > 0 ? (isValid(parseISO(completedOrders[0].updatedAt)) ? format(parseISO(completedOrders[0].updatedAt), "dd/MM/yyyy") : "Data invalida") : "-";
    return { activeOrders, lastService };
  };

  const toggleStatus = (id: string, currentStatus: "Ativo" | "Inativo") => {
    if (!currentUser) return;
    if (currentStatus === "Ativo") {
      const stats = getProviderStats(id);
      if (stats.activeOrders > 0 && !confirm(`Este tecnico possui ${stats.activeOrders} ordens em andamento. Deseja continuar com a inativacao?`)) {
        return;
      }
    }

    const updated = [...providers];
    const index = updated.findIndex((provider) => provider.id === id);
    if (index !== -1) {
      const newStatus = currentStatus === "Ativo" ? "Inativo" : "Ativo";
      updated[index].status = newStatus;
      updated[index].updatedAt = new Date().toISOString();
      storageService.set("gsi_providers", updated);
      storageService.logAudit(currentUser.id, `Tecnico ${newStatus.toLowerCase()}`, id, "Provider", currentStatus, newStatus);
      setProviders(updated);
    }
  };

  const filteredProviders = useMemo(
    () =>
      providers.filter((provider) => {
        const term = searchTerm.trim().toLowerCase();
        if (term && ![provider.name, provider.contactName, provider.document].some((value) => value?.toLowerCase().includes(term))) return false;
        if (specialtyFilter && provider.specialty !== specialtyFilter) return false;
        if (unitFilter && provider.unitId !== unitFilter && !(unitFilter === "todas" && !provider.unitId)) return false;
        if (statusFilter && provider.status !== statusFilter) return false;
        return true;
      }),
    [providers, searchTerm, specialtyFilter, statusFilter, unitFilter],
  );

  const clearFilters = () => {
    setDraftSearch("");
    setDraftSpecialty("");
    setDraftUnit("");
    setDraftStatus("");
    setSearchTerm("");
    setSpecialtyFilter("");
    setUnitFilter("");
    setStatusFilter("");
    setShowAdvancedFilters(false);
  };

  const applyFilters = () => {
    setSearchTerm(draftSearch);
    setSpecialtyFilter(draftSpecialty);
    setUnitFilter(draftUnit);
    setStatusFilter(draftStatus);
  };

  const activeProviders = providers.filter((provider) => provider.status === "Ativo").length;
  const inactiveProviders = providers.filter((provider) => provider.status === "Inativo").length;
  const activeLinkedOrders = orders.filter((order) => order.providerId && order.status !== "Concluída" && order.status !== "Cancelada").length;
  const delayedLinkedOrders = orders.filter((order) => order.providerId && order.status !== "Concluída" && order.status !== "Cancelada" && order.deadline && new Date(order.deadline) < new Date()).length;
  const activeFilterCount = [searchTerm, specialtyFilter, unitFilter, statusFilter].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <OperationalPageHeader
        title="Tecnicos de Servico"
        description="Pagina de busca e gestao de empresas e profissionais externos."
        backTo="/servicos"
        actions={
          <Link to="/prestadores/novo" className="new-register-button new-register-button--green">
            Novo tecnico
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricButton label="Tecnicos Ativos" value={activeProviders} valueClassName="text-brand-700" onClick={() => { clearFilters(); setStatusFilter("Ativo"); setDraftStatus("Ativo"); }} />
        <MetricButton label="Tecnicos Inativos" value={inactiveProviders} onClick={() => { clearFilters(); setStatusFilter("Inativo"); setDraftStatus("Inativo"); }} />
        <MetricButton label="Ordens Vinculadas (Ativas)" value={activeLinkedOrders} valueClassName="text-blue-700" />
        <MetricButton label="Ordens Vinculadas (Atrasadas)" value={delayedLinkedOrders} valueClassName="text-red-700" />
      </div>

      <section className="rounded-xl border-2 border-slate-300 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-4 border-b border-slate-200 p-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)_auto]">
          <Input label="Titulo / Palavra-chave" placeholder="Nome, documento ou contato" value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-700">Status</label>
            <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftStatus} onChange={(event) => setDraftStatus(event.target.value)}>
              <option value="">Selecione uma opcao</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button type="button" variant="secondary" className="h-10 px-3" onClick={() => setShowAdvancedFilters((current) => !current)}><SlidersHorizontal className="h-4 w-4" /></Button>
            <Button type="button" className="search-action-button" onClick={applyFilters}><Search className="h-4 w-4" />Pesquisar</Button>
            <Button type="button" variant="secondary" className="search-clear-button" onClick={clearFilters}><X className="h-4 w-4" />Limpar</Button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 gap-4 border-b border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Especialidade</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftSpecialty} onChange={(event) => setDraftSpecialty(event.target.value)}>
                <option value="">Selecione uma opcao</option>
                {specialties.map((specialty) => <option key={specialty}>{specialty}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Unidade</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftUnit} onChange={(event) => setDraftUnit(event.target.value)}>
                <option value="">Selecione uma opcao</option>
                <option value="todas">Todas as Unidades</option>
                {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="p-4">
          <p className="text-lg font-semibold text-brand-900">Tecnicos encontrados | {filteredProviders.length}</p>
          <p className="text-sm text-slate-500">{activeFilterCount > 0 ? `Filtros aplicados: ${activeFilterCount}.` : "Exibindo todos os tecnicos disponiveis."}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredProviders.map((provider) => {
          const stats = getProviderStats(provider.id);
          return (
            <Card key={provider.id} className="record-card">
              <CardContent className="record-card-content">
                <div className="record-card-body">
                  <div className="record-card-header">
                    <Badge variant="default">{provider.type || "Externo"}</Badge>
                    <Badge variant={provider.status === "Ativo" ? "success" : "default"}>{provider.status}</Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="record-card-title" title={provider.name}>{provider.name}</h3>
                    <p className="record-card-subtitle">{provider.document || "Sem documento"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-slate-200">
                    <div className="border-b border-r border-slate-200 bg-slate-50 p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Especialidade</p><p className="mt-1 text-sm font-medium text-slate-900">{provider.specialty || "-"}</p></div>
                    <div className="border-b border-slate-200 bg-slate-50 p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Unidade</p><p className="mt-1 text-sm font-medium text-slate-900">{getUnitName(provider.unitId)}</p></div>
                    <div className="border-r border-slate-200 bg-slate-50 p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Contato</p><p className="mt-1 text-sm font-medium text-slate-900">{provider.contactName}</p></div>
                    <div className="bg-slate-50 p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Telefone</p><p className="mt-1 text-sm font-medium text-slate-900">{provider.phone || "-"}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                    <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ordens ativas</p><p className="mt-1 font-semibold text-slate-900">{stats.activeOrders}</p></div>
                    <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ultimo atendimento</p><p className="mt-1 font-semibold text-slate-900">{stats.lastService}</p></div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="mt-auto border-t border-slate-200 p-0">
                <CardFooterActions
                  viewLink={`/prestadores/${provider.id}`}
                  viewLabel="Ver detalhes"
                  editLink={`/prestadores/${provider.id}/editar`}
                  editLabel="Editar prestador"
                  onDelete={() => toggleStatus(provider.id, provider.status)}
                  deleteLabel={provider.status === "Ativo" ? "Inativar prestador" : "Reativar prestador"}
                  isDeactivate={true}
                />
              </CardFooter>
            </Card>
          );
        })}

        {filteredProviders.length === 0 && (
          <div className="col-span-full rounded-lg border-2 border-dashed border-slate-200 py-12 text-center">
            <p className="text-slate-500">Nenhum tecnico encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};
