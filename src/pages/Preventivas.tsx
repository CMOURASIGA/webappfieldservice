import React, { useEffect, useState } from "react";
import { storageService } from "../services/storageService";
import { PreventivePlan, Unit, Asset, Provider, User } from "../types";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { CardFooterActions } from "../components/ui/CardFooterActions";
import { Badge } from "../components/ui/Badge";
import { Button } from "@cnc-ti/layout-basic";
import { format, isValid, parseISO, isPast, isToday, differenceInDays } from "date-fns";
import { calculateNextExecution } from "../utils/preventiveCalc";
import { useNavigate, useSearchParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { CheckCircle2, Plus, Settings, X } from "lucide-react";
import { NovoPlanoModal } from "./preventivas/NovoPlanoModal";
import { RegistroExecucaoModal } from "./ordens/RegistroExecucaoModal";
import { MetricButton, OperationalPageHeader, SearchToolbar } from "../components/ui/OperationalPage";

export const Preventivas = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PreventivePlan[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchParams] = useSearchParams();
  const initialstatusFilter = searchParams.get("status") || "Todos";
  const [statusFilter, setStatusFilter] = useState(initialstatusFilter);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [periodicityFilter, setPeriodicityFilter] = useState("Todas");
  const [unitFilter, setUnitFilter] = useState("Todas");
  const [providerFilter, setProviderFilter] = useState("Todos");
  const [generatedOrderNumbers, setGeneratedOrderNumbers] = useState<string[]>([]);
  const [generationMessage, setGenerationMessage] = useState<string | null>(null);

  useEffect(() => {
    setPlans(storageService.get("gsi_preventive_plans") || []);
    setUnits(storageService.get("gsi_units") || []);
    setAssets(storageService.get("gsi_assets") || []);
    setProviders(storageService.get("gsi_providers") || []);
  }, []);

  const [showNovoPlano, setShowNovoPlano] = useState(false);
  const [showExecucao, setShowExecucao] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PreventivePlan | undefined>(undefined);
  const loadData = () => {
    setPlans(storageService.get("gsi_preventive_plans") || []);
  };
  const getUnitName = (id: string) => units.find(u => u.id === id)?.name || "N/A";
  const getAssetCode = (aid?: string) => assets.find(a => a.id === aid)?.code || "N/A";
  const getProviderName = (id?: string) => providers.find((provider) => provider.id === id)?.name || "Não atribuído";
  
  const getComputedNextExecution = (plan: PreventivePlan) => {
    return calculateNextExecution(plan.periodicity as any, plan.lastExecution, plan.startDate) || plan.nextExecution;
  };

  const getStatus = (nextExecution?: string) => {
    if (!nextExecution) return "Sem data";
    const date = parseISO(nextExecution);
    const days = differenceInDays(date, new Date());
    
    if (isPast(date) && !isToday(date)) return "Atrasada";
    if (days >= 0 && days <= 30) return "Próxima";
    return "Em dia";
  };

  const metrics = {
    total: plans.length,
    emDia: plans.filter(p => getStatus(getComputedNextExecution(p)) === "Em dia").length,
    proximas: plans.filter(p => getStatus(getComputedNextExecution(p)) === "Próxima").length,
    atrasadas: plans.filter(p => getStatus(getComputedNextExecution(p)) === "Atrasada").length,
  };

  
  const handleGerarOSPendentes = () => {
    const allPlans = storageService.get("gsi_preventive_plans") || [];
    const allOrders = storageService.get("gsi_work_orders") || [];
    
    // Find a plan that needs an OS and doesn't have an active one
    const createdNumbers: string[] = [];
    let newOrders = [...allOrders];
    
    for (const plan of allPlans) {
      if (plan.status !== "Ativo") continue;
      
      const status = getStatus(getComputedNextExecution(plan));
      if (status === "Atrasada" || status === "Próxima") {
        // Check if it already has an open OS for this plan
        const hasOpenOs = allOrders.some((o: any) => o.preventivePlanId === plan.id && o.status !== "Concluída" && o.status !== "Cancelada");
        
        if (!hasOpenOs) {
          const year = new Date().getFullYear();
          const nextNumber = newOrders.filter((o: any) => o.number.includes(year.toString())).length + 1;
          const number = `OS-${year}-${nextNumber.toString().padStart(4, '0')}`;
          
          const newOrder = {
            id: uuidv4(),
            number,
            preventivePlanId: plan.id,
            unitId: plan.unitId,
            locationId: plan.locationId || "",
            categoryId: plan.categoryId,
            assetId: plan.assetId || "",
            priority: "Média",
            description: plan.description,
            technicalDescription: "Manutenção Preventiva gerada automaticamente.\n" + "",
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
          
          newOrders.push(newOrder as any);
          createdNumbers.push(number);
        }
      }
    }
    
    if (createdNumbers.length > 0) {
      storageService.set("gsi_work_orders", newOrders);
      setGeneratedOrderNumbers(createdNumbers);
      setGenerationMessage(null);
    } else {
      setGeneratedOrderNumbers([]);
      setGenerationMessage("Nenhuma manutenção pendente sem OS foi encontrada.");
    }
  };
  
  const filteredPlans = plans.filter(p => {
    const term = searchTerm.trim().toLowerCase();
    if (term && ![p.code, p.description, p.periodicity, getUnitName(p.unitId), getAssetCode(p.assetId)]
      .some((value) => value?.toLowerCase().includes(term))) return false;
    if (typeFilter !== "Todos" && p.type !== typeFilter) return false;
    if (periodicityFilter !== "Todas" && p.periodicity !== periodicityFilter) return false;
    if (unitFilter !== "Todas" && p.unitId !== unitFilter) return false;
    if (providerFilter !== "Todos" && p.providerId !== providerFilter) return false;
    if (statusFilter === "Todas") return true;
    if (statusFilter === "Em dia") return getStatus(getComputedNextExecution(p)) === "Em dia";
    if (statusFilter === "Próximas") return getStatus(getComputedNextExecution(p)) === "Próxima";
    if (statusFilter === "Atrasadas") return getStatus(getComputedNextExecution(p)) === "Atrasada";
    return true;
  });

  return (
    <div className="space-y-6">
      
      <OperationalPageHeader
        title="Manutenções Preventivas"
        description="Gestão de rotinas e calendários de manutenção."
        backTo="/servicos"
        actions={
          <>
            <Button onClick={() => navigate("/preventivas/nova")} className="gap-2">
              <Plus className="w-4 h-4" /> Nova Manutenção Preventiva
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleGerarOSPendentes}>
              <Settings className="w-4 h-4" /> Gerar OS Pendentes
            </Button>
          </>
        }
      />

      {generatedOrderNumbers.length > 0 && (
        <section className="mx-auto max-w-3xl rounded-xl border-2 border-green-500 bg-green-50 px-6 py-5 text-center shadow-2" role="status">
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-700" />
            <div>
              <h2 className="text-lg font-bold text-green-950">Ordens de Serviço criadas</h2>
              <p className="mt-1 text-sm text-green-800">As manutenções pendentes foram convertidas em OS e já estão disponíveis para programação.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {generatedOrderNumbers.map((number) => <span key={number} className="rounded-md border border-green-700 bg-white px-3 py-1.5 font-mono text-sm font-bold text-green-900">{number}</span>)}
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              <Button variant="create" onClick={() => navigate("/ordens")}>Ver Ordens de Serviço</Button>
              <Button variant="outline" className="gap-2" onClick={() => setGeneratedOrderNumbers([])}><X className="h-4 w-4" /> Fechar</Button>
            </div>
          </div>
        </section>
      )}

      {generationMessage && (
        <div className="mx-auto max-w-3xl rounded-xl border-2 border-amber-400 bg-amber-50 px-5 py-4 text-center text-sm font-medium text-amber-900" role="status">
          {generationMessage}
        </div>
      )}

      <SearchToolbar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por manutenção, código, periodicidade, unidade ou ativo..." resultCount={filteredPlans.length} />

      <div className="grid grid-cols-1 gap-3 rounded-xl border-2 border-slate-300 bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
        <select className="h-10 rounded-md border-2 border-slate-400 bg-white px-3 text-sm" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option>Todos</option>{[...new Set(plans.map((plan) => plan.type).filter(Boolean))].map((type) => <option key={type}>{type}</option>)}</select>
        <select className="h-10 rounded-md border-2 border-slate-400 bg-white px-3 text-sm" value={periodicityFilter} onChange={(event) => setPeriodicityFilter(event.target.value)}><option>Todas</option>{[...new Set(plans.map((plan) => plan.periodicity).filter(Boolean))].map((periodicity) => <option key={periodicity}>{periodicity}</option>)}</select>
        <select className="h-10 rounded-md border-2 border-slate-400 bg-white px-3 text-sm" value={unitFilter} onChange={(event) => setUnitFilter(event.target.value)}><option value="Todas">Todas as unidades</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select>
        <select className="h-10 rounded-md border-2 border-slate-400 bg-white px-3 text-sm" value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)}><option value="Todos">Todos os prestadores</option>{providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}</select>
      </div>

      {/* Indicadores Acionáveis */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricButton label="Total de Manutenções" value={metrics.total} active={statusFilter === "Todas"} onClick={() => setStatusFilter("Todas")} />
        <MetricButton label="Em Dia" value={metrics.emDia} active={statusFilter === "Em dia"} valueClassName="text-green-700" onClick={() => setStatusFilter("Em dia")} />
        <MetricButton label="Atenção (30d)" value={metrics.proximas} active={statusFilter === "Próximas"} valueClassName="text-orange-700" onClick={() => setStatusFilter("Próximas")} />
        <MetricButton label="Atrasadas" value={metrics.atrasadas} active={statusFilter === "Atrasadas"} valueClassName="text-red-700" onClick={() => setStatusFilter("Atrasadas")} />
      </div>

      {/* Cards Operacionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlans.map(plan => {
          const nextExec = getComputedNextExecution(plan);
          const status = getStatus(nextExec);
          let badgeClass = "bg-green-100 text-green-700";
          if (status === "Atrasada") badgeClass = "bg-red-100 text-red-700";
          else if (status === "Próxima") badgeClass = "bg-orange-100 text-orange-700";
          else if (status === "Sem data") badgeClass = "bg-slate-100 text-slate-700";

          return (
            <Card key={plan.id} className="operational-card flex flex-col">
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="pr-2">
                    <h3 className="font-semibold text-slate-900 line-clamp-1" title={plan.description}>{plan.description}</h3>
                    <p className="text-xs text-slate-500 mt-1 uppercase font-bold">{plan.periodicity}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-sm ${badgeClass}`}>
                    {status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4 flex-1 mt-2">
                  <p><span className="font-medium text-slate-500">Unidade:</span> {getUnitName(plan.unitId)}</p>
                  <p><span className="font-medium text-slate-500">Ativo:</span> {getAssetCode(plan.assetId)}</p>
                  <p><span className="font-medium text-slate-500">Prestador:</span> {getProviderName(plan.providerId)}</p>
                  <p><span className="font-medium text-slate-500">Próx. Execução:</span> {nextExec ? format(parseISO(nextExec), "dd/MM/yyyy") : "N/A"}</p>
                </div>

                </CardContent>
                <CardFooter className="pt-0 pb-4 px-4 border-t border-slate-100 mt-3 pt-3">
                  <CardFooterActions
                    onView={() => navigate(`/preventivas/${plan.id}`)}
                    viewLabel="Abrir"
                  />
                </CardFooter>
            </Card>
          )
        })}
        {filteredPlans.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-lg">
             <p className="text-slate-500">Nenhum plano encontrado para o filtro atual.</p>
          </div>
        )}
      </div>

    </div>
  );
};
