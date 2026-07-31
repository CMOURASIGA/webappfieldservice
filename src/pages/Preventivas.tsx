import React, { useEffect, useMemo, useState } from "react";
import { format, parseISO, isPast, isToday, differenceInDays } from "date-fns";
import { useNavigate, useSearchParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { CheckCircle2, Search, SlidersHorizontal, X } from "lucide-react";
import { storageService } from "../services/storageService";
import { PreventivePlan, Unit, Asset, Provider, Location } from "../types";
import { Badge } from "../components/ui/Badge";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { CardFooterActions } from "../components/ui/CardFooterActions";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { calculateNextExecution } from "../utils/preventiveCalc";
import { OperationalPageHeader } from "../components/ui/OperationalPage";

export const Preventivas = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PreventivePlan[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchParams] = useSearchParams();
  const initialStatusFilter = searchParams.get("status") || "Todos";

  const [draftSearch, setDraftSearch] = useState("");
  const [draftStatus, setDraftStatus] = useState(initialStatusFilter);
  const [draftType, setDraftType] = useState("Todos");
  const [draftPeriodicity, setDraftPeriodicity] = useState("Todas");
  const [draftUnit, setDraftUnit] = useState("");
  const [draftProvider, setDraftProvider] = useState("");
  const [draftLocation, setDraftLocation] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [periodicityFilter, setPeriodicityFilter] = useState("Todas");
  const [unitFilter, setUnitFilter] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [generatedOrderNumbers, setGeneratedOrderNumbers] = useState<string[]>([]);
  const [generationMessage, setGenerationMessage] = useState<string | null>(null);

  useEffect(() => {
    setPlans(storageService.get("gsi_preventive_plans") || []);
    setUnits(storageService.get("gsi_units") || []);
    setAssets(storageService.get("gsi_assets") || []);
    setProviders(storageService.get("gsi_providers") || []);
    setLocations(storageService.get("gsi_locations") || []);
  }, []);

  useEffect(() => {
    setDraftStatus(initialStatusFilter);
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  const getUnitName = (id: string) => units.find((item) => item.id === id)?.name || "N/A";
  const getAssetCode = (assetId?: string) => assets.find((item) => item.id === assetId)?.code || "N/A";
  const getProviderName = (id?: string) => providers.find((item) => item.id === id)?.name || "Nao atribuido";
  const getLocationName = (id?: string) => locations.find((item) => item.id === id)?.name || "Geral da unidade";

  const getComputedNextExecution = (plan: PreventivePlan) =>
    calculateNextExecution(plan.periodicity as never, plan.lastExecution, plan.startDate) || plan.nextExecution;

  const getStatus = (nextExecution?: string, plan?: PreventivePlan) => {
    if (!nextExecution) return "Sem data";
    const date = parseISO(nextExecution);
    const days = differenceInDays(date, new Date());

    if (isPast(date) && !isToday(date)) return "Atrasada";
    if (days >= 0 && days <= (plan?.alertDaysAttention ?? 30)) return "Proxima";
    return "Em dia";
  };

  const handleGerarOSPendentes = () => {
    const allPlans = storageService.get("gsi_preventive_plans") || [];
    const allOrders = storageService.get("gsi_work_orders") || [];
    const createdNumbers: string[] = [];
    const newOrders = [...allOrders];

    for (const plan of allPlans) {
      if (plan.status !== "Ativo") continue;

      const status = getStatus(getComputedNextExecution(plan), plan);
      if (!["Atrasada", "Proxima"].includes(status)) continue;

      const planAssetIds = plan.assetIds?.length ? plan.assetIds : plan.assetId ? [plan.assetId] : [undefined];

      for (const assetId of planAssetIds) {
        const hasOpenOs = allOrders.some((order: any) =>
          order.preventivePlanId === plan.id &&
          (order.assetIds?.includes(assetId) || order.assetId === assetId) &&
          order.status !== "Concluída" &&
          order.status !== "Cancelada",
        );

        if (hasOpenOs) continue;

        const year = new Date().getFullYear();
        const nextNumber = newOrders.filter((order: any) => order.number.includes(year.toString())).length + 1;
        const number = `OS-${year}-${nextNumber.toString().padStart(4, "0")}`;
        const asset = assets.find((item) => item.id === assetId);

        const newOrder = {
          id: uuidv4(),
          number,
          preventivePlanId: plan.id,
          unitId: plan.unitId,
          sector: plan.sector,
          locationId: asset?.locationId || plan.locationId || "",
          categoryId: plan.categoryId,
          assetId: assetId || "",
          assetIds: assetId ? [assetId] : [],
          type: "Preventiva",
          priority: "Media",
          responsibleId: plan.responsibleId,
          providerId: plan.providerId,
          estimatedValue: plan.estimatedValue,
          description: plan.description,
          technicalDescription: "Manutenção preventiva gerada automaticamente.",
          plannedDate: getComputedNextExecution(plan),
          deadline: getComputedNextExecution(plan),
          source: "Preventiva",
          status: "Planejada",
          createdAt: new Date().toISOString(),
          createdBy: "Sistema",
          materials: [],
          checklist: plan.checklist.map((item) => ({ ...item, result: null })),
          observations: `OS gerada automaticamente do plano ${plan.code}.`,
          attachments: [],
          updatedAt: new Date().toISOString(),
          active: true,
        };

        newOrders.push(newOrder as never);
        createdNumbers.push(number);
      }
    }

    if (createdNumbers.length > 0) {
      storageService.set("gsi_work_orders", newOrders);
      setGeneratedOrderNumbers(createdNumbers);
      setGenerationMessage(null);
      return;
    }

    setGeneratedOrderNumbers([]);
    setGenerationMessage("Nenhuma manutenção pendente sem OS foi encontrada.");
  };

  const filteredPlans = useMemo(
    () =>
      plans.filter((plan) => {
        const term = searchTerm.trim().toLowerCase();
        if (
          term &&
          ![plan.code, plan.description, plan.type, plan.periodicity, getUnitName(plan.unitId), getLocationName(plan.locationId), getAssetCode(plan.assetId), getProviderName(plan.providerId)].some((value) =>
            value?.toLowerCase().includes(term),
          )
        ) {
          return false;
        }
        if (typeFilter !== "Todos" && plan.type !== typeFilter) return false;
        if (periodicityFilter !== "Todas" && plan.periodicity !== periodicityFilter) return false;
        if (unitFilter && plan.unitId !== unitFilter) return false;
        if (providerFilter && plan.providerId !== providerFilter) return false;
        if (locationFilter && plan.locationId !== locationFilter) return false;
        if (statusFilter === "Todos") return true;
        if (statusFilter === "Em dia") return getStatus(getComputedNextExecution(plan), plan) === "Em dia";
        if (statusFilter === "Proximas") return getStatus(getComputedNextExecution(plan), plan) === "Proxima";
        if (statusFilter === "Atrasadas") return getStatus(getComputedNextExecution(plan), plan) === "Atrasada";
        if (statusFilter === "Sem data") return getStatus(getComputedNextExecution(plan), plan) === "Sem data";
        return true;
      }),
    [locationFilter, periodicityFilter, plans, providerFilter, searchTerm, statusFilter, typeFilter, unitFilter],
  );

  const applyFilters = () => {
    setSearchTerm(draftSearch);
    setStatusFilter(draftStatus);
    setTypeFilter(draftType);
    setPeriodicityFilter(draftPeriodicity);
    setUnitFilter(draftUnit);
    setProviderFilter(draftProvider);
    setLocationFilter(draftLocation);
  };

  const clearFilters = () => {
    setDraftSearch("");
    setDraftStatus("Todos");
    setDraftType("Todos");
    setDraftPeriodicity("Todas");
    setDraftUnit("");
    setDraftProvider("");
    setDraftLocation("");
    setSearchTerm("");
    setStatusFilter("Todos");
    setTypeFilter("Todos");
    setPeriodicityFilter("Todas");
    setUnitFilter("");
    setProviderFilter("");
    setLocationFilter("");
    setShowAdvancedFilters(false);
  };

  const activeFilterCount = [
    searchTerm,
    statusFilter !== "Todos" ? statusFilter : "",
    typeFilter !== "Todos" ? typeFilter : "",
    periodicityFilter !== "Todas" ? periodicityFilter : "",
    unitFilter,
    providerFilter,
    locationFilter,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <OperationalPageHeader
        title="Manutenções Preventivas"
        description="Página de busca e gestão dos planos preventivos."
        backTo="/servicos"
        actions={
          <div className="orders-header-actions">
            <button type="button" className="orders-header-actions__secondary" onClick={handleGerarOSPendentes}>
              Gerar OS Pendentes
            </button>
            <button type="button" className="orders-header-actions__primary" onClick={() => navigate("/preventivas/nova")}>
              Nova Preventiva
            </button>
          </div>
        }
      />

      {generatedOrderNumbers.length > 0 && (
        <section className="mx-auto max-w-4xl rounded-xl border-2 border-green-500 bg-green-50 px-6 py-5 text-center shadow-sm" role="status">
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-700" />
            <div>
              <h2 className="text-lg font-bold text-green-950">Ordens de Serviço criadas</h2>
              <p className="mt-1 text-sm text-green-800">As OS foram geradas com os dados já existentes nos planos preventivos.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {generatedOrderNumbers.map((number) => (
                <span key={number} className="rounded-md border border-green-700 bg-white px-3 py-1.5 font-mono text-sm font-bold text-green-900">
                  {number}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              <Button variant="create" onClick={() => navigate("/ordens")}>
                Ver Ordens de Serviço
              </Button>
              <Button variant="secondary" className="gap-2" onClick={() => setGeneratedOrderNumbers([])}>
                <X className="h-4 w-4" /> Fechar
              </Button>
            </div>
          </div>
        </section>
      )}

      {generationMessage && (
        <div className="mx-auto max-w-3xl rounded-xl border-2 border-amber-400 bg-amber-50 px-5 py-4 text-center text-sm font-medium text-amber-900" role="status">
          {generationMessage}
        </div>
      )}

      <section className="rounded-xl border-2 border-slate-300 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-4 border-b border-slate-200 p-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)_auto]">
          <Input
            label="Titulo / Palavra-chave"
            placeholder="Plano, codigo, periodicidade, unidade, local ou ativo"
            value={draftSearch}
            onChange={(event) => setDraftSearch(event.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-700">Situação</label>
            <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftStatus} onChange={(event) => setDraftStatus(event.target.value)}>
              <option value="Todos">Todos</option>
              <option value="Em dia">Em dia</option>
              <option value="Proximas">Próximas</option>
              <option value="Atrasadas">Atrasadas</option>
              <option value="Sem data">Sem data</option>
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
          <div className="grid grid-cols-1 gap-4 border-b border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Tipo</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftType} onChange={(event) => setDraftType(event.target.value)}>
                <option value="Todos">Todos</option>
                {[...new Set(plans.map((plan) => plan.type).filter(Boolean))].map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Periodicidade</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftPeriodicity} onChange={(event) => setDraftPeriodicity(event.target.value)}>
                <option value="Todas">Todas</option>
                {[...new Set(plans.map((plan) => plan.periodicity).filter(Boolean))].map((periodicity) => (
                  <option key={periodicity}>{periodicity}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Unidade</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftUnit} onChange={(event) => setDraftUnit(event.target.value)}>
                <option value="">Selecione uma opcao</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Prestador</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftProvider} onChange={(event) => setDraftProvider(event.target.value)}>
                <option value="">Selecione uma opcao</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>{provider.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Local</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftLocation} onChange={(event) => setDraftLocation(event.target.value)}>
                <option value="">Selecione uma opcao</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="p-4">
          <p className="text-lg font-semibold text-brand-900">Preventivas encontradas | {filteredPlans.length}</p>
          <p className="text-sm text-slate-500">{activeFilterCount > 0 ? `Filtros aplicados: ${activeFilterCount}.` : "Exibindo todos os planos preventivos."}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredPlans.map((plan) => {
          const nextExecution = getComputedNextExecution(plan);
          const status = getStatus(nextExecution, plan);
          let badgeClass = "bg-green-100 text-green-700";
          if (status === "Atrasada") badgeClass = "bg-red-100 text-red-700";
          else if (status === "Proxima") badgeClass = "bg-orange-100 text-orange-700";
          else if (status === "Sem data") badgeClass = "bg-slate-100 text-slate-700";

          return (
            <Card key={plan.id} className="record-card">
              <CardContent className="record-card-content">
                <div className="record-card-body">
                  <div className="record-card-header">
                    <Badge variant="default">{plan.code}</Badge>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>{status === "Proxima" ? "Próxima" : status}</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="record-card-title" title={plan.description}>{plan.description}</h3>
                    <p className="record-card-subtitle">{plan.periodicity}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-slate-200">
                    <div className="border-b border-r border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Unidade</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{getUnitName(plan.unitId)}</p>
                    </div>
                    <div className="border-b border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Prestador</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{getProviderName(plan.providerId)}</p>
                    </div>
                    <div className="border-r border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Local</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{getLocationName(plan.locationId)}</p>
                    </div>
                    <div className="bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Próx. execução</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{nextExecution ? format(parseISO(nextExecution), "dd/MM/yyyy") : "N/A"}</p>
                    </div>
                  </div>

                  <div className="record-card-note border-blue-300 bg-blue-50 text-blue-950">
                    <strong>Ao gerar a OS:</strong> responsável, local, ativo, checklist e custo estimado são preenchidos a partir deste plano.
                  </div>
                </div>
              </CardContent>
              <CardFooter className="mt-auto border-t border-slate-200 p-0">
                <CardFooterActions onView={() => navigate(`/preventivas/${plan.id}`)} viewLabel="Abrir" />
              </CardFooter>
            </Card>
          );
        })}

        {filteredPlans.length === 0 && (
          <div className="col-span-full rounded-lg border-2 border-dashed border-slate-200 py-12 text-center">
            <p className="text-slate-500">Nenhum plano encontrado para o filtro atual.</p>
          </div>
        )}
      </div>
    </div>
  );
};
