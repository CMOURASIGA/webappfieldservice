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
import { Plus, Settings } from "lucide-react";
import { NovoPlanoModal } from "./preventivas/NovoPlanoModal";
import { RegistroExecucaoModal } from "./ordens/RegistroExecucaoModal";
import { MetricButton, OperationalPageHeader } from "../components/ui/OperationalPage";

export const Preventivas = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PreventivePlan[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchParams] = useSearchParams();
  const initialstatusFilter = searchParams.get("status") || "Todos";
  const [statusFilter, setStatusFilter] = useState(initialstatusFilter);

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
    let createdOsCount = 0;
    let newOrders = [...allOrders];
    
    for (const plan of allPlans) {
      if (plan.status !== "Ativo") continue;
      
      const status = getStatus(getComputedNextExecution(plan));
      if (status === "Atrasada" || status === "Próxima") {
        // Check if it already has an open OS for this plan
        const hasOpenOs = allOrders.some((o: any) => o.source === "Preventiva" && o.status !== "Concluída" && o.status !== "Cancelada" && o.unitId === plan.unitId && o.assetId === plan.assetId);
        
        if (!hasOpenOs) {
          const year = new Date().getFullYear();
          const nextNumber = newOrders.filter((o: any) => o.number.includes(year.toString())).length + 1;
          const number = `OS-${year}-${nextNumber.toString().padStart(4, '0')}`;
          
          const newOrder = {
            id: uuidv4(),
            number,
            unitId: plan.unitId,
            locationId: plan.locationId || "",
            categoryId: plan.categoryId,
            assetId: plan.assetId || "",
            priority: "Média",
            description: plan.description,
            technicalDescription: "Manutenção Preventiva gerada automaticamente.\n" + "",
            source: "Preventiva",
            status: "Aguardando atendimento",
            createdAt: new Date().toISOString(),
            createdBy: "Sistema",
            materials: [],
          };
          
          newOrders.push(newOrder as any);
          createdOsCount++;
        }
      }
    }
    
    if (createdOsCount > 0) {
      storageService.set("gsi_work_orders", newOrders);
      alert(`OS criada com sucesso. Foram geradas ${createdOsCount} ordens de serviço.`);
    } else {
      alert("Nenhuma manutenção pendente sem OS foi encontrada.");
    }
  };
  
  const filteredPlans = plans.filter(p => {
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
