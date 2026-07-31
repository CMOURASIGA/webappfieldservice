import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { storageService } from "../services/storageService";
import { AlertTriangle, Clock, FileText, Inbox, CalendarDays, ShoppingCart, UserX, Package } from "lucide-react";
import { addDays, endOfDay, isPast, parseISO, startOfDay } from "date-fns";
import { getDocumentStatus } from "../utils/documentStatus";
import { getPendingStockRequests, reconcileMaterial, resolveOrderStatusFromMaterials } from "../utils/stock";
import { Button } from "../components/ui/Button";
import { OperationalPageHeader } from "../components/ui/OperationalPage";
import { ArrowRight } from "lucide-react";

export const VisaoGeral = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    manutencoesVencidas: 0,
    osAtrasadas: 0,
    osAguardandoMaterial: 0,
    servicosSemResponsavel: 0,
    reposicaoNecessaria: 0,
    solicitacoesCompra: 0,
    docVencidos: 0,
    docCriticos: 0,
  });

  const [agenda, setAgenda] = useState({
    hoje: 0,
    semana: 0,
    semResponsavel: 0,
  });

  const [decisions, setDecisions] = useState<Array<{ title: string; type: string; link: string }>>([]);

  useEffect(() => {
    const requests = (storageService.get("gsi_requests") as any[]) || [];
    const orders = (storageService.get("gsi_work_orders") as any[]) || [];
    const plans = (storageService.get("gsi_preventive_plans") as any[]) || [];
    const docs = (storageService.get("gsi_documents") as any[]) || [];
    const materials = ((storageService.get("gsi_stock_materials") as any[]) || []).map(reconcileMaterial);
    const stockRequests = (storageService.get("gsi_stock_requests") as any[]) || [];

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekEnd = addDays(now, 7);

    const ordersWithResolvedStatus = orders.map((order) => ({
      ...order,
      status: resolveOrderStatusFromMaterials(order),
    }));

    const prevAtrasadas = plans.filter((plan: any) => plan.nextExecution && isPast(parseISO(plan.nextExecution))).length;

    const osAtrasadas = ordersWithResolvedStatus.filter((order: any) =>
      order.status !== "Concluída" && order.status !== "Cancelada" && order.deadline && isPast(parseISO(order.deadline)),
    ).length;

    const osAguardandoMaterial = ordersWithResolvedStatus.filter((order: any) =>
      order.status === "Aguardando material" || order.status === "Aguardando estoque",
    ).length;

    const osSemResponsavel = ordersWithResolvedStatus.filter((order: any) =>
      !order.responsibleId && order.status !== "Concluída" && order.status !== "Cancelada",
    ).length;

    const reqSemResponsavel = requests.filter((request: any) => request.status === "Em triagem").length;

    const repoNecessaria = materials.filter((material: any) => (material.physicalBalance - (material.reservedBalance || 0)) <= material.minStock).length;

    const docVencidos = docs.filter((document: any) => getDocumentStatus(document) === "Vencido").length;
    const docCriticos = docs.filter((document: any) => getDocumentStatus(document) === "Crítico").length;

    setMetrics({
      manutencoesVencidas: prevAtrasadas,
      osAtrasadas,
      osAguardandoMaterial,
      servicosSemResponsavel: osSemResponsavel + reqSemResponsavel,
      reposicaoNecessaria: repoNecessaria,
      solicitacoesCompra: getPendingStockRequests(stockRequests).length,
      docVencidos,
      docCriticos,
    });

    const hoje = ordersWithResolvedStatus.filter((order: any) => order.plannedStart && new Date(order.plannedStart) >= todayStart && new Date(order.plannedStart) <= todayEnd).length;
    const semana = ordersWithResolvedStatus.filter((order: any) => order.plannedStart && new Date(order.plannedStart) >= todayStart && new Date(order.plannedStart) <= weekEnd).length;

    setAgenda({
      hoje,
      semana,
      semResponsavel: osSemResponsavel,
    });

    const decisionList: Array<{ title: string; type: string; link: string }> = [];
    if (osSemResponsavel > 0) {
      decisionList.push({ title: `${osSemResponsavel} OS sem técnico atribuído`, type: "Warning", link: "/ordens?status=Sem+Responsavel" });
    }
    if (osAguardandoMaterial > 0) {
      decisionList.push({ title: `${osAguardandoMaterial} OS travadas por falta de material`, type: "Critical", link: "/ordens?status=Falta+Material" });
    }
    if (docCriticos > 0) {
      decisionList.push({ title: `${docCriticos} documentos em situação crítica`, type: "Critical", link: "/documentos?status=Críticos" });
    }
    if (docVencidos > 0) {
      decisionList.push({ title: `${docVencidos} documentos vencidos exigem regularização`, type: "Critical", link: "/documentos?status=Vencidos" });
    }
    if (prevAtrasadas > 0) {
      decisionList.push({ title: `${prevAtrasadas} planos preventivos estão atrasados`, type: "Critical", link: "/preventivas?status=Atrasadas" });
    }

    setDecisions(decisionList);
  }, []);

  const StatCard = ({ title, value, icon: Icon, colorClass, link }: any) => {
    const isZero = value === 0;
    const finalColorClass = isZero ? "text-slate-400" : colorClass;
    const bgClass = isZero ? "bg-slate-50 text-slate-400" : `bg-slate-100 ${colorClass}`;

    return (
      <Card className="cursor-pointer transition-all hover:-translate-y-0.5 hover:border-brand-700 hover:shadow-2" onClick={() => navigate(link)}>
        <CardContent className="flex min-h-32 items-start justify-between p-5">
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-wide text-slate-600">{title}</p>
            <p className={`text-3xl font-bold ${finalColorClass}`}>{String(value).padStart(2, "0")}</p>
          </div>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bgClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <OperationalPageHeader title="Visão Geral" description="Centro de controle operacional e gerencial." />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Alertas Consolidados</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Manutenções Preventivas Atrasadas" value={metrics.manutencoesVencidas} icon={AlertTriangle} colorClass="text-red-600" link="/preventivas?status=Atrasadas" />
          <StatCard title="OS Atrasadas" value={metrics.osAtrasadas} icon={Clock} colorClass="text-red-600" link="/ordens?status=Atrasadas" />
          <StatCard title="OS Faltando Material" value={metrics.osAguardandoMaterial} icon={Package} colorClass="text-amber-600" link="/ordens?status=Falta+Material" />
          <StatCard title="Sem Responsável" value={metrics.servicosSemResponsavel} icon={UserX} colorClass="text-brand-600" link="/ordens?status=Sem+Responsavel" />
          <StatCard title="Reposição Necessária" value={metrics.reposicaoNecessaria} icon={ShoppingCart} colorClass="text-orange-600" link="/estoque?status=Reposição" />
          <StatCard title="Compras Pendentes" value={metrics.solicitacoesCompra} icon={Inbox} colorClass="text-slate-600" link="/estoque/fila" />
          <StatCard title="Documentos Vencidos" value={metrics.docVencidos} icon={FileText} colorClass="text-red-600" link="/documentos?status=Vencidos" />
          <StatCard title="Documentos Críticos" value={metrics.docCriticos} icon={AlertTriangle} colorClass="text-red-600" link="/documentos?status=Críticos" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Precisa da sua decisão</CardTitle>
          </CardHeader>
          <CardContent>
            {decisions.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma decisão pendente no momento.</p>
            ) : (
              <ul className="space-y-3">
                {decisions.map((decision, index) => (
                  <li key={index} className="flex flex-col gap-3 rounded-md border border-slate-300 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-medium text-slate-800">{decision.title}</span>
                    <Button variant="create" size="sm" className="gap-2" onClick={() => navigate(decision.link)}>
                      Resolver <ArrowRight className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Agenda Resumida</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <button onClick={() => navigate("/agenda?periodo=hoje")} className="flex w-full items-center justify-between rounded-md border border-slate-300 bg-white p-3 text-left hover:border-brand-700 hover:bg-brand-050">
                <span className="flex items-center gap-2 text-sm text-slate-600"><CalendarDays className="h-4 w-4" /> Atividades Hoje</span>
                <span className="font-bold text-slate-900">{agenda.hoje}</span>
              </button>
              <button onClick={() => navigate("/agenda?periodo=semana")} className="flex w-full items-center justify-between rounded-md border border-slate-300 bg-white p-3 text-left hover:border-brand-700 hover:bg-brand-050">
                <span className="flex items-center gap-2 text-sm text-slate-600"><CalendarDays className="h-4 w-4" /> Atividades na Semana</span>
                <span className="font-bold text-slate-900">{agenda.semana}</span>
              </button>
              <button onClick={() => navigate("/ordens?status=Sem+Responsavel")} className="flex w-full items-center justify-between rounded-md border border-slate-300 bg-white p-3 text-left hover:border-brand-700 hover:bg-brand-050">
                <span className="flex items-center gap-2 text-sm text-slate-600"><UserX className="h-4 w-4" /> Atividades sem Responsável</span>
                <span className="font-bold text-red-600">{agenda.semResponsavel}</span>
              </button>
              <div className="pt-2">
                <Button variant="create" onClick={() => navigate("/agenda")} className="w-full gap-2">
                  Abrir Agenda Completa <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
