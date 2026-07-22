import React, { useEffect, useState } from "react";
import { storageService } from "../services/storageService";
import { PreventivePlan, Unit, Asset, Provider, User } from "../types";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button, PageHeader, PageHeaderTitle, PageHeaderTitleContent, PageHeaderActionsContainer } from "@cnc-ti/layout-basic";
import { format, isValid, parseISO, isPast, isToday, differenceInDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Plus, Settings } from "lucide-react";

export const Preventivas = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PreventivePlan[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [statusFilter, setStatusFilter] = useState("Todos");

  useEffect(() => {
    setPlans(storageService.get("gsi_preventive_plans") || []);
    setUnits(storageService.get("gsi_units") || []);
    setAssets(storageService.get("gsi_assets") || []);
    setProviders(storageService.get("gsi_providers") || []);
  }, []);

  const getUnitName = (id: string) => units.find(u => u.id === id)?.name || "N/A";
  const getAssetCode = (aid?: string) => assets.find(a => a.id === aid)?.code || "N/A";
  
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
    emDia: plans.filter(p => getStatus(p.nextExecution) === "Em dia").length,
    proximas: plans.filter(p => getStatus(p.nextExecution) === "Próxima").length,
    atrasadas: plans.filter(p => getStatus(p.nextExecution) === "Atrasada").length,
  };

  const filteredPlans = plans.filter(p => {
    if (statusFilter === "Todas") return true;
    if (statusFilter === "Em dia") return getStatus(p.nextExecution) === "Em dia";
    if (statusFilter === "Próximas") return getStatus(p.nextExecution) === "Próxima";
    if (statusFilter === "Atrasadas") return getStatus(p.nextExecution) === "Atrasada";
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Ações Rápidas */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => navigate("/preventivas/nova")} className="gap-2">
          <Plus className="w-4 h-4" /> Nova Manutenção Preventiva
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => alert('Rotina manual executada')}>
          <Settings className="w-4 h-4" /> Gerar OS Pendentes
        </Button>
      </div>

      <div>
        <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Manutenções Preventivas</h1>
        <p className="text-sm text-slate-500">Gestão de rotinas e calendários de manutenção.</p>
      </div>

      {/* Indicadores Acionáveis */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => setStatusFilter("Todas")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Todas" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Total de Manutenções</p>
          <p className="text-2xl font-bold text-slate-900">{metrics.total}</p>
        </button>
        <button onClick={() => setStatusFilter("Em dia")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Em dia" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Em Dia</p>
          <p className="text-2xl font-bold text-green-600">{metrics.emDia}</p>
        </button>
        <button onClick={() => setStatusFilter("Próximas")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Próximas" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">A Vencer (30d)</p>
          <p className="text-2xl font-bold text-orange-500">{metrics.proximas}</p>
        </button>
        <button onClick={() => setStatusFilter("Atrasadas")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Atrasadas" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Atrasadas</p>
          <p className="text-2xl font-bold text-red-600">{metrics.atrasadas}</p>
        </button>
      </div>

      {/* Cards Operacionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlans.map(plan => {
          const status = getStatus(plan.nextExecution);
          let badgeClass = "bg-green-100 text-green-700";
          if (status === "Atrasada") badgeClass = "bg-red-100 text-red-700";
          else if (status === "Próxima") badgeClass = "bg-orange-100 text-orange-700";
          else if (status === "Sem data") badgeClass = "bg-slate-100 text-slate-700";

          return (
            <Card key={plan.id} className="hover:border-brand-300 transition-colors flex flex-col">
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="pr-2">
                    <h3 className="font-semibold text-slate-900 line-clamp-1" title={plan.title}>{plan.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 uppercase font-bold">{plan.periodicity}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-sm ${badgeClass}`}>
                    {status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4 flex-1 mt-2">
                  <p><span className="font-medium text-slate-500">Unidade:</span> {getUnitName(plan.unitId)}</p>
                  <p><span className="font-medium text-slate-500">Ativo:</span> {getAssetCode(plan.assetId)}</p>
                  <p><span className="font-medium text-slate-500">Próx. Execução:</span> {plan.nextExecution ? format(parseISO(plan.nextExecution), 'dd/MM/yyyy') : 'N/A'}</p>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/preventivas/${plan.id}`)}>Abrir</Button>
                </div>
              </CardContent>
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
