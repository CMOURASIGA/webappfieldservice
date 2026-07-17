import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { PreventivePlan, Unit, Asset, Provider, WorkOrder } from "../types";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { format, parseISO, isPast, isToday, addDays, addMonths, addYears } from "date-fns";
import { useAuth } from "../contexts/AuthContext";

export const Preventivas = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [plans, setPlans] = useState<PreventivePlan[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("Todos");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPlans(storageService.get("gsi_preventive_plans").filter(p => p.active));
    setUnits(storageService.get("gsi_units"));
    setAssets(storageService.get("gsi_assets"));
    setProviders(storageService.get("gsi_providers"));
  };

  const getUnitName = (id: string) => units.find(u => u.id === id)?.name || "N/A";
  const getAssetCode = (aid?: string) => assets.find(a => a.id === aid)?.code || "N/A";
  const getProviderName = (pid?: string) => providers.find(p => p.id === pid)?.name || "-";

  const getStatus = (nextExecution: string) => {
    if (isPast(parseISO(nextExecution)) && !isToday(parseISO(nextExecution))) {
      return "Atrasada";
    }
    return "Em dia";
  };

  const getStatusBadge = (nextExecution: string) => {
    const status = getStatus(nextExecution);
    if (status === "Atrasada") {
      return <Badge variant="danger">Atrasada</Badge>;
    }
    return <Badge variant="info">Em dia</Badge>;
  };

  const handleGenerateOrders = () => {
    if (!currentUser) return;
    
    let generatedCount = 0;
    const allPlans = storageService.get("gsi_preventive_plans");
    const allOrders = storageService.get("gsi_work_orders");

    const updatedPlans = allPlans.map(plan => {
      // Check if plan is due (nextExecution is today or past)
      if (plan.active && plan.status === "Ativo" && (isPast(parseISO(plan.nextExecution)) || isToday(parseISO(plan.nextExecution)))) {
        // Create new Work Order
        const newOrder: WorkOrder = {
          id: crypto.randomUUID(),
          number: `OS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          unitId: plan.unitId,
          locationId: plan.locationId || "",
          assetId: plan.assetId,
          type: "Preventiva",
          categoryId: plan.categoryId,
          priority: "Média", // Default for preventives
          providerId: plan.providerId,
          technicalDescription: `[Gerada via Plano: ${plan.code}] ${plan.description}`,
          plannedDate: plan.nextExecution,
          deadline: new Date(new Date(plan.nextExecution).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days deadline
          status: "Planejada",
          checklist: plan.checklist.map(c => ({ id: crypto.randomUUID(), description: c.description, required: c.required })),
          observations: "",
          attachments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          active: true,
        };
        
        allOrders.push(newOrder);
        storageService.logAudit(currentUser.id, "Ordem Preventiva Gerada", newOrder.id, "WorkOrder");
        generatedCount++;

        // Calculate next execution date based on periodicity
        let nextDate = parseISO(plan.nextExecution);
        if (plan.periodicity === "diaria") nextDate = addDays(nextDate, 1);
        else if (plan.periodicity === "semanal") nextDate = addDays(nextDate, 7);
        else if (plan.periodicity === "mensal") nextDate = addMonths(nextDate, 1);
        else if (plan.periodicity === "trimestral") nextDate = addMonths(nextDate, 3);
        else if (plan.periodicity === "semestral") nextDate = addMonths(nextDate, 6);
        else if (plan.periodicity === "anual") nextDate = addYears(nextDate, 1);

        plan.lastExecution = new Date().toISOString();
        plan.nextExecution = nextDate.toISOString();
        plan.updatedAt = new Date().toISOString();
      }
      return plan;
    });

    if (generatedCount > 0) {
      storageService.set("gsi_preventive_plans", updatedPlans);
      storageService.set("gsi_work_orders", allOrders);
      alert(`${generatedCount} nova(s) Ordem(ns) de Serviço gerada(s) com sucesso!`);
      loadData();
    } else {
      alert("Não há planos preventivos com data de execução vencida ou para hoje.");
    }
  };

  const stats = {
    total: plans.length,
    emDia: plans.filter(p => getStatus(p.nextExecution) === "Em dia").length,
    atrasadas: plans.filter(p => getStatus(p.nextExecution) === "Atrasada").length,
  };

  const filteredPlans = statusFilter === "Todos"
    ? plans
    : plans.filter(p => getStatus(p.nextExecution) === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Planos Preventivos</h1>
          <p className="text-sm text-slate-500">Gestão de manutenções recorrentes e verificação de ordens.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateOrders}>
            Verificar & Gerar Ordens
          </Button>
          <Button onClick={() => navigate("/preventivas/nova")}>
            + Novo Plano
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => setStatusFilter("Todos")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Todos" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Todos os Planos</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </button>
        <button onClick={() => setStatusFilter("Em dia")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Em dia" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Em dia</p>
          <p className="text-2xl font-bold text-blue-600">{stats.emDia}</p>
        </button>
        <button onClick={() => setStatusFilter("Atrasada")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Atrasada" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Atrasadas</p>
          <p className="text-2xl font-bold text-red-600">{stats.atrasadas}</p>
        </button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200">Código / Descrição</th>
                  <th className="px-6 py-4 border-b border-slate-200">Unidade</th>
                  <th className="px-6 py-4 border-b border-slate-200">Ativo</th>
                  <th className="px-6 py-4 border-b border-slate-200">Periodicidade</th>
                  <th className="px-6 py-4 border-b border-slate-200">Prestador</th>
                  <th className="px-6 py-4 border-b border-slate-200">Próxima Execução</th>
                  <th className="px-6 py-4 border-b border-slate-200">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPlans.map(plan => (
                  <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex flex-col">
                      <span>{plan.code}</span>
                      <span className="text-xs text-slate-500">{plan.description}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{getUnitName(plan.unitId)}</td>
                    <td className="px-6 py-4 text-slate-600">{getAssetCode(plan.assetId)}</td>
                    <td className="px-6 py-4 text-slate-900 capitalize">{plan.periodicity}</td>
                    <td className="px-6 py-4 text-slate-600">{getProviderName(plan.providerId)}</td>
                    <td className="px-6 py-4 text-slate-900">{format(parseISO(plan.nextExecution), 'dd/MM/yyyy')}</td>
                    <td className="px-6 py-4">{getStatusBadge(plan.nextExecution)}</td>
                  </tr>
                ))}
                {filteredPlans.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      Nenhum plano preventivo encontrado para este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
