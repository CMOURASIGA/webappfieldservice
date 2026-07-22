import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Provider, Unit, WorkOrder } from "../types";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { CardFooterActions } from "../components/ui/CardFooterActions";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useAuth } from "../contexts/AuthContext";
import { format, isValid, parseISO } from "date-fns";

const specialties = [
  "Climatização", "Elétrica", "Civil", "Hidráulica", "Elevadores",
  "Combate a incêndio", "Geradores", "Controle de acesso", "Limpeza técnica", "Manutenção geral"
];

export const Técnicos = () => {
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
    const lastService = completedOrders.length > 0 ? (isValid(parseISO(completedOrders[0].updatedAt)) ? format(parseISO(completedOrders[0].updatedAt), "dd/MM/yyyy") : 'Data Inválida') : "-";
    return { activeOrders, lastService };
  };

  const toggleStatus = (id: string, currentStatus: "Ativo" | "Inativo") => {
    if (!currentUser) return;
    
    // Se for inativar, verifica se há ordens ativas
    if (currentStatus === "Ativo") {
      const stats = getProviderStats(id);
      if (stats.activeOrders > 0) {
        if (!confirm(`Este técnico possui ${stats.activeOrders} ordens em andamento. Deseja continuar com a inativação?`)) {
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
      storageService.logAudit(currentUser.id, `Técnico ${newStatus.toLowerCase()}`, id, "Provider", currentStatus, newStatus);
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

  const StatCard = ({ title, value, colorClass, onClick }: any) => (
    <Card className={onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""} onClick={onClick}>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
      </CardContent>
    </Card>
  );

  const canEdit = true;
  const canToggle = true;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Técnicos de Serviço</h1>
          <p className="text-sm text-slate-500">Consulte e gerencie empresas e profissionais externos vinculados às manutenções da GSI.</p>
        </div>
        {canEdit && (
          <Link to="/prestadores/novo">
            <Button>Novo técnico</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Técnicos Ativos" value={activeProviders} colorClass="text-brand-700" onClick={() => { clearFilters(); setStatusFilter("Ativo"); }} />
        <StatCard title="Técnicos Inativos" value={inactiveProviders} colorClass="text-slate-500" onClick={() => { clearFilters(); setStatusFilter("Inativo"); }} />
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
            
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProviders.map(provider => {
              const stats = getProviderStats(provider.id);
              return (
                <Card key={provider.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900 line-clamp-1" title={provider.name}>{provider.name}</h3>
                          <Badge variant={provider.status === "Ativo" ? "success" : "default"}>{provider.status}</Badge>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex gap-2 items-center">
                          <Badge variant="default" className="text-[10px] py-0">{provider.type || "Externo"}</Badge>
                          {provider.document && <span>{provider.document}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm mt-2 flex-1">
                      <div>
                        <p className="text-xs text-slate-400">Especialidade</p>
                        <p className="font-medium text-slate-700">{provider.specialty || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Unidade</p>
                        <p className="font-medium text-slate-700">{getUnitName(provider.unitId)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-slate-400">Contato</p>
                        <p className="font-medium text-slate-700">{provider.contactName} {provider.phone && <span className="text-slate-500 font-normal">({provider.phone})</span>}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Ordens Ativas</p>
                        <p className="font-medium text-slate-700">
                          {stats.activeOrders > 0 ? (
                            <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 font-semibold px-2 rounded-full h-5 text-xs">
                              {stats.activeOrders}
                            </span>
                          ) : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Último Atendimento</p>
                        <p className="font-medium text-slate-700">{stats.lastService || "-"}</p>
                      </div>
                    </div>

                    </CardContent>
                <CardFooter className="pt-0 pb-5 px-5">
                      <CardFooterActions
                        viewLink={`/prestadores/${provider.id}`}
                        viewLabel="Ver detalhes"
                        editLink={canEdit ? `/prestadores/${provider.id}/editar` : undefined}
                        editLabel="Editar prestador"
                        onDelete={canToggle ? () => toggleStatus(provider.id, provider.status) : undefined}
                        deleteLabel={provider.status === "Ativo" ? "Inativar prestador" : "Reativar prestador"}
                        isDeactivate={true}
                      />
                    </CardFooter>
                </Card>
              );
            })}
          </div>
          {filteredProviders.length === 0 && (
            <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
              Nenhum técnico encontrado.
            </div>
          )}

          </div>
        </CardContent>
      </Card>
    </div>
  );
};
