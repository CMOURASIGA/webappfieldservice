import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { PageHeader, PageHeaderTitle, PageHeaderTitleContent } from "@cnc-ti/layout-basic";
import { storageService } from "../services/storageService";
import { AlertTriangle, Clock, FileText, Package, Wrench, UserX, Inbox, CalendarDays, ShoppingCart } from "lucide-react";
import { isPast, parseISO, startOfDay, endOfDay, addDays } from "date-fns";

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

  const [decisions, setDecisions] = useState<any[]>([]);

  useEffect(() => {
    const requests = (storageService.get("gsi_requests") as any[]) || [];
    const orders = (storageService.get("gsi_work_orders") as any[]) || [];
    const plans = (storageService.get("gsi_preventive_plans") as any[]) || [];
    const docs = (storageService.get("gsi_documents") as any[]) || [];
    const materials = (storageService.get("gsi_stock_materials") as any[]) || [];

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekEnd = addDays(now, 7);

    // Calc Metrics
    const prevAtrasadas = plans.filter((p: any) => p.nextExecution && isPast(parseISO(p.nextExecution))).length;
    
    const osAtrasadas = orders.filter((o: any) => 
      o.status !== "Concluída" && o.status !== "Cancelada" && o.deadline && isPast(parseISO(o.deadline))
    ).length;

    const osAguardandoMaterial = orders.filter((o: any) => 
      o.status === "Aguardando material" || (o.materials && o.materials.some((m: any) => m.availability === "Indisponível"))
    ).length;

    const osSemResponsavel = orders.filter((o: any) => 
      !o.responsibleId && o.status !== "Concluída" && o.status !== "Cancelada"
    ).length;
    
    const reqSemResponsavel = requests.filter((r: any) => r.status === "Em triagem").length;
    
    const repoNecessaria = materials.filter((m: any) => (m.physicalBalance - (m.reservedBalance || 0)) <= m.minStock).length;

    const docVencidos = docs.filter((d: any) => d.status === "Vencido" || (d.expirationDate && isPast(parseISO(d.expirationDate)))).length;
    const docCriticos = docs.filter((d: any) => d.status === "Crítico").length;

    setMetrics({
      manutencoesVencidas: prevAtrasadas,
      osAtrasadas: osAtrasadas,
      osAguardandoMaterial: osAguardandoMaterial,
      servicosSemResponsavel: osSemResponsavel + reqSemResponsavel,
      reposicaoNecessaria: repoNecessaria,
      solicitacoesCompra: 0, // Mock for now
      docVencidos: docVencidos,
      docCriticos: docCriticos,
    });

    // Calc Agenda
    const hoje = orders.filter((o: any) => o.plannedStart && new Date(o.plannedStart) >= todayStart && new Date(o.plannedStart) <= todayEnd).length;
    const semana = orders.filter((o: any) => o.plannedStart && new Date(o.plannedStart) >= todayStart && new Date(o.plannedStart) <= weekEnd).length;

    setAgenda({
      hoje,
      semana,
      semResponsavel: osSemResponsavel
    });

    // Calc Decisions
    const decisionList = [];
    if (osSemResponsavel > 0) {
      decisionList.push({ title: `${osSemResponsavel} OS sem técnico atribuído`, type: "Warning", link: "/ordens" });
    }
    if (osAguardandoMaterial > 0) {
      decisionList.push({ title: `${osAguardandoMaterial} OS travadas por falta de material`, type: "Critical", link: "/ordens" });
    }
    if (docCriticos > 0) {
      decisionList.push({ title: `${docCriticos} Documentos em situação crítica`, type: "Critical", link: "/documentos" });
    }

    setDecisions(decisionList);

  }, []);

  const StatCard = ({ title, value, icon: Icon, colorClass, link }: any) => {
    const isZero = value === 0;
    const finalColorClass = isZero ? "text-slate-400" : colorClass;
    const bgClass = isZero ? "bg-slate-50 text-slate-400" : `bg-slate-100 ${colorClass}`;
    
    return (
    <Card className="cursor-pointer hover:border-brand-300 hover:shadow-sm transition-all" onClick={() => navigate(link)}>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${finalColorClass}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bgClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </CardContent>
    </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Visão Geral</h1>
        <p className="text-sm text-slate-500">Centro de controle operacional e gerencial.</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Alertas Consolidados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Manutenções Preventivas Atrasadas" value={metrics.manutencoesVencidas} icon={AlertTriangle} colorClass="text-red-600" link="/preventivas" />
          <StatCard title="OS Atrasadas" value={metrics.osAtrasadas} icon={Clock} colorClass="text-red-600" link="/ordens" />
          <StatCard title="OS Faltando Material" value={metrics.osAguardandoMaterial} icon={Package} colorClass="text-amber-600" link="/ordens" />
          <StatCard title="Sem Responsável" value={metrics.servicosSemResponsavel} icon={UserX} colorClass="text-brand-600" link="/ordens" />
          
          <StatCard title="Reposição Necessária" value={metrics.reposicaoNecessaria} icon={ShoppingCart} colorClass="text-orange-600" link="/estoque" />
          <StatCard title="Compras Pendentes" value={metrics.solicitacoesCompra} icon={Inbox} colorClass="text-slate-600" link="/estoque/fila" />
          <StatCard title="Documentos Vencidos" value={metrics.docVencidos} icon={FileText} colorClass="text-red-600" link="/documentos" />
          <StatCard title="Documentos Críticos" value={metrics.docCriticos} icon={AlertTriangle} colorClass="text-red-600" link="/documentos" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Precisa da sua decisão</CardTitle>
          </CardHeader>
          <CardContent>
            {decisions.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma decisão pendente no momento.</p>
            ) : (
              <ul className="space-y-3">
                {decisions.map((d, i) => (
                  <li key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-md border border-slate-200">
                    <span className="text-sm font-medium text-slate-800">{d.title}</span>
                    <button onClick={() => navigate(d.link)} className="text-sm font-semibold text-brand-600 hover:underline">Resolver</button>
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
               <div className="flex justify-between items-center border-b pb-2">
                 <span className="text-sm text-slate-600 flex items-center gap-2"><CalendarDays className="w-4 h-4"/> Atividades Hoje</span>
                 <span className="font-bold text-slate-900">{agenda.hoje}</span>
               </div>
               <div className="flex justify-between items-center border-b pb-2">
                 <span className="text-sm text-slate-600 flex items-center gap-2"><CalendarDays className="w-4 h-4"/> Atividades na Semana</span>
                 <span className="font-bold text-slate-900">{agenda.semana}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm text-slate-600 flex items-center gap-2"><UserX className="w-4 h-4"/> Atividades sem Responsável</span>
                 <span className="font-bold text-red-600">{agenda.semResponsavel}</span>
               </div>
               <div className="pt-2">
                 <button onClick={() => navigate("/agenda")} className="text-sm text-brand-600 font-semibold hover:underline w-full text-center">Abrir Agenda Completa</button>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};
