import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Provider, Unit, WorkOrder } from "../types";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useAuth } from "../contexts/AuthContext";
import { format, parseISO } from "date-fns";

const specialties = [
  "Climatização", "Elétrica", "Civil", "Hidráulica", "Elevadores",
  "Combate a incêndio", "Geradores", "Controle de acesso", "Limpeza técnica", "Manutenção geral"
];

export const Prestadores = () => {
  const { currentUser } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [orders, setOrders] = useState<WorkOrder[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProviders(storageService.get("gsi_providers").sort((a, b) => a.name.localeCompare(b.name)));
    setUnits(storageService.get("gsi_units"));
    setOrders(storageService.get("gsi_work_orders"));
  };

  const getUnitName = (id?: string) => {
    if (!id) return "Todas";
    return units.find(u => u.id === id)?.name || "N/A";
  };

  const getProviderStats = (providerId: string) => {
    const providerOrders = orders.filter(o => o.providerId === providerId);
    const activeOrders = providerOrders.filter(o => o.status !== "Concluída" && o.status !== "Cancelada").length;
    const completedOrders = providerOrders.filter(o => o.status === "Concluída").sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const lastService = completedOrders.length > 0 ? format(parseISO(completedOrders[0].updatedAt), "dd/MM/yyyy") : "-";
    return { activeOrders, lastService };
  };

  const toggleStatus = (id: string, currentStatus: "Ativo" | "Inativo") => {
    if (!currentUser) return;
    
    // Se for inativar, verifica se há ordens ativas
    if (currentStatus === "Ativo") {
      const stats = getProviderStats(id);
      if (stats.activeOrders > 0) {
        if (!confirm(`Este prestador possui ${stats.activeOrders} ordens em andamento. Deseja continuar com a inativação?`)) {
          return;
        }
      }
    }

    const updated = [...providers];
    const idx = updated.findIndex(p => p.id === id);
    if (idx !== -1) {
      const newStatus = currentStatus === "Ativo" ? "Inativo" : "Ativo";
      updated[idx].status = newStatus;
      updated[idx].updatedAt = new Date().toISOString();
      storageService.set("gsi_providers", updated);
      storageService.logAudit(currentUser.id, `Prestador ${newStatus.toLowerCase()}`, id, "Provider", currentStatus, newStatus);
      setProviders(updated);
    }
  };

  const filteredProviders = providers.filter(p => {
    const matchesSearch = (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.contactName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.document && p.document.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesSpecialty = !specialtyFilter || p.specialty === specialtyFilter;
    const matchesUnit = !unitFilter || p.unitId === unitFilter || (!p.unitId && unitFilter === "todas");
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesSpecialty && matchesUnit && matchesStatus;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSpecialtyFilter("");
    setUnitFilter("");
    setStatusFilter("");
  };

  // Metrics
  const activeProviders = providers.filter(p => p.status === "Ativo").length;
  const inactiveProviders = providers.filter(p => p.status === "Inativo").length;
  const activeLinkedOrders = orders.filter(o => o.providerId && o.status !== "Concluída" && o.status !== "Cancelada").length;
  const delayedLinkedOrders = orders.filter(o => o.providerId && o.status !== "Concluída" && o.status !== "Cancelada" && o.deadline && new Date(o.deadline) < new Date()).length;

  const StatCard = ({ title, value, colorClass }: any) => (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
      </CardContent>
    </Card>
  );

  const canEdit = currentUser?.role === "Operador GSI" || currentUser?.role === "Gestor GSI" || currentUser?.role === "Administrador";
  const canToggle = currentUser?.role === "Gestor GSI" || currentUser?.role === "Administrador";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Prestadores de Serviço</h1>
          <p className="text-sm text-slate-500">Consulte e gerencie empresas e profissionais vinculados às manutenções da GSI.</p>
        </div>
        {canEdit && (
          <Link to="/prestadores/novo">
            <Button>Novo prestador</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Prestadores Ativos" value={activeProviders} colorClass="text-brand-700" />
        <StatCard title="Prestadores Inativos" value={inactiveProviders} colorClass="text-slate-500" />
        <StatCard title="Ordens Vinculadas (Ativas)" value={activeLinkedOrders} colorClass="text-blue-600" />
        <StatCard title="Ordens Vinculadas (Atrasadas)" value={delayedLinkedOrders} colorClass="text-red-600" />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Buscar por nome, documento ou contato"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              options={specialties.map(s => ({ value: s, label: s }))}
              value={specialtyFilter}
              onChange={e => setSpecialtyFilter(e.target.value)}
            />
            <Select
              options={[{ value: "todas", label: "Todas as Unidades" }, ...units.map(u => ({ value: u.id, label: u.name }))]}
              value={unitFilter}
              onChange={e => setUnitFilter(e.target.value)}
            />
            <div className="flex gap-2">
              <Select
                className="flex-1"
                options={[{ value: "Ativo", label: "Ativo" }, { value: "Inativo", label: "Inativo" }]}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              />
              <Button variant="secondary" onClick={clearFilters} className="px-3" title="Limpar filtros">
                Limpar
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap border-t border-slate-200">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200">Prestador</th>
                  <th className="px-6 py-4 border-b border-slate-200">Especialidade</th>
                  <th className="px-6 py-4 border-b border-slate-200">Contato</th>
                  <th className="px-6 py-4 border-b border-slate-200">Unidade</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-center">Ordens Ativas</th>
                  <th className="px-6 py-4 border-b border-slate-200">Último Atendimento</th>
                  <th className="px-6 py-4 border-b border-slate-200">Status</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProviders.map(provider => {
                  const stats = getProviderStats(provider.id);
                  return (
                    <tr key={provider.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 flex flex-col">
                        <span>{provider.name}</span>
                        {provider.document && <span className="text-xs text-slate-400">{provider.document}</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{provider.specialty}</td>
                      <td className="px-6 py-4 text-slate-600 flex flex-col">
                        <span>{provider.contactName}</span>
                        <span className="text-xs text-slate-400">{provider.phone}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{getUnitName(provider.unitId)}</td>
                      <td className="px-6 py-4 text-center">
                        {stats.activeOrders > 0 ? (
                          <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 font-semibold px-2 rounded-full h-6 min-w-6">
                            {stats.activeOrders}
                          </span>
                        ) : "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{stats.lastService}</td>
                      <td className="px-6 py-4">
                        <Badge variant={provider.status === "Ativo" ? "success" : "default"}>{provider.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link to={`/prestadores/${provider.id}`}>
                          <Button variant="ghost" size="sm">Ver</Button>
                        </Link>
                        {canEdit && (
                          <Link to={`/prestadores/${provider.id}/editar`}>
                            <Button variant="ghost" size="sm">Editar</Button>
                          </Link>
                        )}
                        {canToggle && (
                          <Button variant="ghost" size="sm" onClick={() => toggleStatus(provider.id, provider.status)} className={provider.status === "Ativo" ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}>
                            {provider.status === "Ativo" ? "Inativar" : "Reativar"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredProviders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                      Nenhum prestador encontrado.
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
