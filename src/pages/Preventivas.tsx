import React, { useEffect, useState } from "react";
import { storageService } from "../services/storageService";
import { PreventivePlan, Unit, Asset, Provider } from "../types";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { format, parseISO, isPast } from "date-fns";

export const Preventivas = () => {
  const [plans, setPlans] = useState<PreventivePlan[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    setPlans(storageService.get("gsi_preventive_plans"));
    setUnits(storageService.get("gsi_units"));
    setAssets(storageService.get("gsi_assets"));
    setProviders(storageService.get("gsi_providers"));
  }, []);

  const getUnitName = (id: string) => units.find(u => u.id === id)?.name || "N/A";
  const getAssetCode = (aid?: string) => assets.find(a => a.id === aid)?.code || "N/A";
  const getProviderName = (pid?: string) => providers.find(p => p.id === pid)?.name || "-";

  const getStatusBadge = (nextExecution: string) => {
    if (isPast(parseISO(nextExecution))) return <Badge variant="danger">Atrasada</Badge>;
    return <Badge variant="info">Em dia</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Planos Preventivos</h1>
          <p className="text-sm text-slate-500">Gestão de manutenções recorrentes.</p>
        </div>
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
                {plans.map(plan => (
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
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
