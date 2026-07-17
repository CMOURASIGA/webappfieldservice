import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Provider, Unit, WorkOrder, PreventivePlan, AuditLog } from "../types";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../contexts/AuthContext";
import { format, parseISO } from "date-fns";

export const DetalhePrestador = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [provider, setProvider] = useState<Provider | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [plans, setPlans] = useState<PreventivePlan[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const providers = storageService.get("gsi_providers");
    const found = providers.find(p => p.id === id);
    if (found) setProvider(found);
    
    setUnits(storageService.get("gsi_units"));
    setOrders(storageService.get("gsi_work_orders").filter(o => o.providerId === id));
    setPlans(storageService.get("gsi_preventive_plans").filter(p => p.providerId === id));
    setLogs(storageService.get("gsi_audit_log").filter(l => l.entityId === id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, [id]);

  if (!provider) return <div className="p-6">Prestador não encontrado.</div>;

  const getUnitName = (uid?: string) => {
    if (!uid) return "Todas as Unidades";
    return units.find(u => u.id === uid)?.name || "N/A";
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "Em execução": return <Badge variant="info">{status}</Badge>;
      case "Concluída": return <Badge variant="success">{status}</Badge>;
      case "Aguardando terceiro":
      case "Pausada": return <Badge variant="warning">{status}</Badge>;
      case "Cancelada": return <Badge variant="danger">{status}</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  // Indicators
  const activeOrders = orders.filter(o => o.status !== "Concluída" && o.status !== "Cancelada").length;
  const completedOrders = orders.filter(o => o.status === "Concluída").length;
  const delayedOrders = orders.filter(o => o.status !== "Concluída" && o.status !== "Cancelada" && o.deadline && new Date(o.deadline) < new Date()).length;
  const completedOrdersList = orders.filter(o => o.status === "Concluída").sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const lastService = completedOrdersList.length > 0 ? format(parseISO(completedOrdersList[0].updatedAt), "dd/MM/yyyy") : "-";

  const StatCard = ({ title, value, colorClass }: any) => (
    <Card>
      <CardContent className="p-4">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Prestador: {provider.name}</h1>
          <p className="text-sm text-slate-500">Detalhes e histórico de atendimentos.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/prestadores")}>Voltar</Button>
          {(currentUser?.role === "Operador GSI" || currentUser?.role === "Gestor GSI" || currentUser?.role === "Administrador") && (
            <Link to={`/prestadores/${provider.id}/editar`}>
              <Button>Editar Prestador</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Ordens Ativas" value={activeOrders} colorClass="text-blue-600" />
        <StatCard title="Concluídas" value={completedOrders} colorClass="text-green-600" />
        <StatCard title="Atrasadas" value={delayedOrders} colorClass="text-red-600" />
        <StatCard title="Planos Vinculados" value={plans.length} colorClass="text-slate-700" />
        <StatCard title="Último Serviço" value={lastService} colorClass="text-slate-700" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>Dados Gerais</CardTitle>
            <Badge variant={provider.status === "Ativo" ? "success" : "default"}>{provider.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nome / Razão Social</p>
            <p className="text-sm text-slate-900">{provider.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Documento</p>
            <p className="text-sm text-slate-900">{provider.document || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Especialidade</p>
            <p className="text-sm text-slate-900">{provider.specialty}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Unidade Atendida</p>
            <p className="text-sm text-slate-900">{getUnitName(provider.unitId)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Contato</p>
            <p className="text-sm text-slate-900">{provider.contactName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Telefone</p>
            <p className="text-sm text-slate-900">{provider.phone}</p>
          </div>
          <div className="lg:col-span-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">E-mail</p>
            <p className="text-sm text-slate-900">{provider.email}</p>
          </div>
          {provider.observations && (
            <div className="lg:col-span-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Observações</p>
              <div className="text-sm text-slate-700 whitespace-pre-wrap">{provider.observations}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ordens de Serviço Vinculadas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200">Número</th>
                  <th className="px-6 py-4 border-b border-slate-200">Unidade</th>
                  <th className="px-6 py-4 border-b border-slate-200">Prioridade</th>
                  <th className="px-6 py-4 border-b border-slate-200">Prazo</th>
                  <th className="px-6 py-4 border-b border-slate-200">Status</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map(os => (
                  <tr key={os.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{os.number}</td>
                    <td className="px-6 py-4 text-slate-600">{getUnitName(os.unitId)}</td>
                    <td className="px-6 py-4 text-slate-600">{os.priority}</td>
                    <td className="px-6 py-4 text-slate-600">{os.deadline ? format(parseISO(os.deadline), 'dd/MM/yyyy') : '-'}</td>
                    <td className="px-6 py-4">{getOrderStatusBadge(os.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/ordens/${os.id}`}>
                        <Button variant="ghost" size="sm">Ver OS</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      Nenhuma OS vinculada a este prestador.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Planos Preventivos Vinculados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200">Código</th>
                  <th className="px-6 py-4 border-b border-slate-200">Unidade</th>
                  <th className="px-6 py-4 border-b border-slate-200">Periodicidade</th>
                  <th className="px-6 py-4 border-b border-slate-200">Próxima Execução</th>
                  <th className="px-6 py-4 border-b border-slate-200">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {plans.map(plan => (
                  <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{plan.code}</td>
                    <td className="px-6 py-4 text-slate-600">{getUnitName(plan.unitId)}</td>
                    <td className="px-6 py-4 text-slate-600 capitalize">{plan.periodicity}</td>
                    <td className="px-6 py-4 text-slate-600">{format(parseISO(plan.nextExecution), 'dd/MM/yyyy')}</td>
                    <td className="px-6 py-4">
                      <Badge variant={plan.status === "Ativo" ? "success" : "default"}>{plan.status}</Badge>
                    </td>
                  </tr>
                ))}
                {plans.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Nenhum plano preventivo vinculado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico Recente</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4 border-b border-slate-200">Data</th>
                    <th className="px-6 py-4 border-b border-slate-200">Ação</th>
                    <th className="px-6 py-4 border-b border-slate-200">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {logs.slice(0, 5).map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-900 font-medium">{log.action}</td>
                      <td className="px-6 py-4 text-slate-600 text-xs font-mono">
                        {log.oldValue && log.newValue ? `${log.oldValue} -> ${log.newValue}` : (log.newValue || log.oldValue || '-')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
