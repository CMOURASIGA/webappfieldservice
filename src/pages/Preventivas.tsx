import React, { useEffect, useState } from "react";
import { storageService } from "../services/storageService";
import { PreventivePlan, Unit, Asset, Provider, User } from "../types";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { format, isValid, parseISO, isPast, isToday, addDays, addMonths, addYears, differenceInDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Search, AlertTriangle, CheckCircle, Clock, CalendarX, Eye, Edit, Trash2 } from "lucide-react";

export const Preventivas = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState<PreventivePlan[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [statusFilter, setStatusFilter] = useState("Todos");
  
  // Advanced filters
  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [assetFilter, setAssetFilter] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [periodicityFilter, setPeriodicityFilter] = useState("");
  const [responsibleFilter, setResponsibleFilter] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPlans(storageService.get("gsi_preventive_plans"));
    setUnits(storageService.get("gsi_units"));
    setAssets(storageService.get("gsi_assets"));
    setProviders(storageService.get("gsi_providers"));
    setUsers(storageService.get("gsi_users"));
  };

  const getUnitName = (id: string) => units.find(u => u.id === id)?.name || "N/A";
  const getAssetCode = (aid?: string) => assets.find(a => a.id === aid)?.code || "N/A";
  const getProviderName = (pid?: string) => providers.find(p => p.id === pid)?.name || "-";
  const getUserName = (uid?: string) => users.find(u => u.id === uid)?.name || "-";

  const getStatus = (nextExecution?: string) => {
    if (!nextExecution) return "Sem data";
    const date = parseISO(nextExecution);
    const days = differenceInDays(date, new Date());
    
    if (isPast(date) && !isToday(date)) return "Atrasado";
    if (days >= 0 && days <= 30) return "Próximo do vencimento";
    return "Em dia";
  };

  const getStatusBadge = (nextExecution?: string) => {
    const status = getStatus(nextExecution);
    switch (status) {
      case "Atrasado": return <Badge className="bg-red-700 text-white">Atrasado</Badge>;
      case "Próximo do vencimento": return <Badge variant="warning">Próximo</Badge>;
      case "Sem data": return <Badge variant="default">Sem data</Badge>;
      default: return <Badge variant="success">Em dia</Badge>;
    }
  };

  const handleGenerateOrders = () => {
    if (!currentUser) return;
    
    let generatedCount = 0;
    const allPlans = storageService.get("gsi_preventive_plans");
    const allOrders = storageService.get("gsi_work_orders");

    const updatedPlans = allPlans.map(plan => {
      // Check if plan is due (nextExecution is today or past)
      // AND check if there isn't already a pending OS for this plan
      const hasPendingOS = allOrders.some(o => o.preventivePlanId === plan.id && o.status !== "Concluída" && o.status !== "Cancelada");
      
      if (!hasPendingOS && plan.active && plan.status === "Ativo" && plan.nextExecution && (isPast(parseISO(plan.nextExecution)) || isToday(parseISO(plan.nextExecution)))) {
        // Create new Work Order
        const newId = crypto.randomUUID ? crypto.randomUUID() : 'os-' + Math.random().toString(36).substring(2, 15);
        const newOrder: any = {
          id: newId,
          preventivePlanId: plan.id, // VÍNCULO IMPORTANTE
          number: `OS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          unitId: plan.unitId,
          locationId: plan.locationId || "",
          assetId: plan.assetId,
          type: "Preventiva",
          categoryId: plan.categoryId,
          priority: "Média", // Default for preventives
          providerId: plan.providerId,
          responsibleId: plan.responsibleId,
          technicalDescription: `[Gerada via Plano: ${plan.code}] ${plan.description}`,
          plannedDate: plan.nextExecution,
          deadline: new Date(new Date(plan.nextExecution).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days deadline
          status: "Planejada",
          checklist: plan.checklist.map((c: any) => ({ 
            id: crypto.randomUUID ? crypto.randomUUID() : 'c-' + Math.random().toString(36).substring(2, 15), 
            description: c.description, 
            required: c.required 
          })),
          observations: "",
          attachments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          active: true,
        };
        
        allOrders.push(newOrder);
        storageService.logAudit(currentUser.id, "Ordem Preventiva Gerada", newOrder.id, "WorkOrder");
        generatedCount++;
      }
      return plan;
    });

    if (generatedCount > 0) {
      storageService.set("gsi_preventive_plans", updatedPlans);
      storageService.set("gsi_work_orders", allOrders);
      alert(`${generatedCount} ordem(ns) de serviço gerada(s) com sucesso!`);
      loadData();
    } else {
      alert("Nenhum plano pendente de geração no momento ou já possuem OS em aberto.");
    }
  };

  const stats = {
    total: plans.length,
    emDia: plans.filter(p => getStatus(p.nextExecution) === "Em dia").length,
    proximo: plans.filter(p => getStatus(p.nextExecution) === "Próximo do vencimento").length,
    atrasadas: plans.filter(p => getStatus(p.nextExecution) === "Atrasado").length,
    semData: plans.filter(p => getStatus(p.nextExecution) === "Sem data").length,
  };

  const filteredPlans = plans.filter(p => {
    const sStatus = getStatus(p.nextExecution);
    if (statusFilter !== "Todos" && sStatus !== statusFilter) return false;
    
    if (search && !((p.code || "").toString().toLowerCase()).includes(search.toLowerCase()) && !((p.description || "").toString().toLowerCase()).includes(search.toLowerCase())) return false;
    if (unitFilter && p.unitId !== unitFilter) return false;
    if (assetFilter && p.assetId !== assetFilter) return false;
    if (providerFilter && p.providerId !== providerFilter) return false;
    if (periodicityFilter && p.periodicity !== periodicityFilter) return false;
    if (responsibleFilter && p.responsibleId !== responsibleFilter) return false;
    
    return true;
  });

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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className={`cursor-pointer border-l-4 ${statusFilter === "Todos" ? "border-l-slate-800 bg-slate-50" : "border-l-slate-300"}`} onClick={() => setStatusFilter("Todos")}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Todos</p>
              <p className="text-xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer border-l-4 ${statusFilter === "Em dia" ? "border-l-green-500 bg-green-50" : "border-l-slate-200"}`} onClick={() => setStatusFilter("Em dia")}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Em dia</p>
              <p className="text-xl font-bold text-green-600">{stats.emDia}</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500 opacity-50" />
          </CardContent>
        </Card>
        <Card className={`cursor-pointer border-l-4 ${statusFilter === "Próximo do vencimento" ? "border-l-amber-500 bg-amber-50" : "border-l-slate-200"}`} onClick={() => setStatusFilter("Próximo do vencimento")}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Próximo</p>
              <p className="text-xl font-bold text-amber-600">{stats.proximo}</p>
            </div>
            <Clock className="w-5 h-5 text-amber-500 opacity-50" />
          </CardContent>
        </Card>
        <Card className={`cursor-pointer border-l-4 ${statusFilter === "Atrasado" ? "border-l-red-600 bg-red-50" : "border-l-slate-200"}`} onClick={() => setStatusFilter("Atrasado")}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Atrasados</p>
              <p className="text-xl font-bold text-red-600">{stats.atrasadas}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-red-500 opacity-50" />
          </CardContent>
        </Card>
        <Card className={`cursor-pointer border-l-4 ${statusFilter === "Sem data" ? "border-l-slate-400 bg-slate-100" : "border-l-slate-200"}`} onClick={() => setStatusFilter("Sem data")}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Sem data</p>
              <p className="text-xl font-bold text-slate-600">{stats.semData}</p>
            </div>
            <CalendarX className="w-5 h-5 text-slate-400 opacity-50" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Input 
                placeholder="Buscar código ou descrição..." 
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={unitFilter} onChange={e => setUnitFilter(e.target.value)}>
              <option value="">Todas as Unidades</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
            <Select value={periodicityFilter} onChange={e => setPeriodicityFilter(e.target.value)}>
              <option value="">Qualquer periodicidade</option>
              <option value="diaria">Diária</option>
              <option value="semanal">Semanal</option>
              <option value="mensal">Mensal</option>
              <option value="trimestral">Trimestral</option>
              <option value="semestral">Semestral</option>
              <option value="anual">Anual</option>
            </Select>
            <Select value={providerFilter} onChange={e => setProviderFilter(e.target.value)}>
              <option value="">Qualquer prestador</option>
              {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Select value={responsibleFilter} onChange={e => setResponsibleFilter(e.target.value)}>
              <option value="">Qualquer responsável</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
          </div>
        </CardContent>
      </Card>

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
                  <th className="px-6 py-4 border-b border-slate-200">Prestador/Responsável</th>
                  <th className="px-6 py-4 border-b border-slate-200">Próxima Execução</th>
                  <th className="px-6 py-4 border-b border-slate-200">Status</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPlans.map(plan => (
                  <tr key={plan.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/preventivas/${plan.id}`)}>
                    <td className="px-6 py-4 font-medium text-slate-900 flex flex-col">
                      <span>{plan.code}</span>
                      <span className="text-xs text-slate-500 max-w-[200px] truncate">{plan.description}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{getUnitName(plan.unitId)}</td>
                    <td className="px-6 py-4 text-slate-600">{getAssetCode(plan.assetId)}</td>
                    <td className="px-6 py-4 text-slate-900 capitalize">{plan.periodicity}</td>
                    <td className="px-6 py-4 text-slate-600 text-xs flex flex-col gap-0.5">
                      {plan.providerId && <span>🏢 {getProviderName(plan.providerId)}</span>}
                      {plan.responsibleId && <span>👤 {getUserName(plan.responsibleId)}</span>}
                      {!plan.providerId && !plan.responsibleId && "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-900">{plan.nextExecution ? (isValid(parseISO(plan.nextExecution)) ? (isValid(parseISO(plan.nextExecution)) ? format(parseISO(plan.nextExecution), 'dd/MM/yyyy') : 'Data Inválida') : 'Data Inválida') : '-'}</td>
                    <td className="px-6 py-4">{getStatusBadge(plan.nextExecution)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); navigate(`/preventivas/${plan.id}`); }} title="Visualizar">
                          <Eye className="w-4 h-4 text-slate-600" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); navigate(`/preventivas/${plan.id}/editar`); }} title="Editar">
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); if (window.confirm("Deseja realmente excluir este plano?")) { const newPlans = plans.filter(p => p.id !== plan.id); storageService.set("gsi_preventive_plans", newPlans); setPlans(newPlans); } }} title="Excluir">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
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
