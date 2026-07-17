import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/Card";
import { storageService } from "../services/storageService";
import { Request, WorkOrder, PreventivePlan, Document } from "../types";
import { Inbox, ClipboardList, Clock, FileText, AlertTriangle, CheckCircle, Activity, UserCog } from "lucide-react";
import { isPast, parseISO, differenceInDays } from "date-fns";
import { useAuth } from "../contexts/AuthContext";

export const VisaoGeral = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState({
    demandasAbertas: 0,
    demandasTriagem: 0,
    demandasAguardando: 0,
    demandasConcluidasRecentes: 0,
    minhasDemandas: 0,
    
    osEmExecucao: 0,
    osSemResponsavel: 0,
    osAtrasadas: 0,
    minhasOs: 0,
    minhasOsAtrasadas: 0,
    
    prevAtrasadas: 0,
    docVencidos: 0,
    docAVencer: 0,
  });

  useEffect(() => {
    const requests = storageService.get("gsi_requests");
    const orders = storageService.get("gsi_work_orders");
    const plans = storageService.get("gsi_preventive_plans");
    const docs = storageService.get("gsi_documents");

    const userId = currentUser?.id;

    setMetrics({
      demandasAbertas: requests.filter(r => r.status === "Aberta").length,
      demandasTriagem: requests.filter(r => r.status === "Em triagem").length,
      demandasAguardando: requests.filter(r => r.status === "Aguardando informações").length,
      demandasConcluidasRecentes: requests.filter(r => r.status === "Atendida" || r.status === "Cancelada").length, // Simplification
      minhasDemandas: requests.filter(r => r.solicitanteId === userId && r.status !== "Atendida" && r.status !== "Cancelada").length,
      
      osEmExecucao: orders.filter(o => o.status === "Em execução").length,
      osSemResponsavel: orders.filter(o => o.status === "Aberta" && !o.providerId && !o.responsibleId).length,
      osAtrasadas: orders.filter(o => {
        if (o.status === "Concluída" || o.status === "Cancelada") return false;
        if (!o.deadline) return false;
        return isPast(parseISO(o.deadline));
      }).length,
      
      minhasOs: orders.filter(o => (o.responsibleId === userId) && o.status !== "Concluída" && o.status !== "Cancelada").length,
      minhasOsAtrasadas: orders.filter(o => {
        if (o.responsibleId !== userId) return false;
        if (o.status === "Concluída" || o.status === "Cancelada") return false;
        if (!o.deadline) return false;
        return isPast(parseISO(o.deadline));
      }).length,

      prevAtrasadas: plans.filter(p => isPast(parseISO(p.nextExecution))).length,
      docVencidos: docs.filter(d => d.status === "Vencido" || (d.expirationDate && isPast(parseISO(d.expirationDate)))).length,
      docAVencer: docs.filter(d => {
        if (d.status === "Vencido" || !d.expirationDate) return false;
        const days = differenceInDays(parseISO(d.expirationDate), new Date());
        return days >= 0 && days <= 30;
      }).length,
    });
  }, [currentUser]);

  const StatCard = ({ title, value, icon: Icon, colorClass, link }: any) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(link)}>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </CardContent>
    </Card>
  );

  const renderDashboardByRole = () => {
    switch (currentUser?.role) {
      case "Solicitante":
        return (
          <>
            <StatCard title="Minhas Demandas Abertas" value={metrics.minhasDemandas} icon={Inbox} colorClass="text-brand-700" link="/demandas" />
            <StatCard title="Aguardando Informações" value={metrics.demandasAguardando} icon={AlertTriangle} colorClass="text-amber-600" link="/demandas" />
            <StatCard title="Concluídas Recentemente" value={metrics.demandasConcluidasRecentes} icon={CheckCircle} colorClass="text-green-600" link="/demandas" />
          </>
        );
      case "Operador GSI":
        return (
          <>
            <StatCard title="Demandas em Triagem" value={metrics.demandasTriagem} icon={Inbox} colorClass="text-amber-600" link="/demandas" />
            <StatCard title="OS sem Responsável" value={metrics.osSemResponsavel} icon={UserCog} colorClass="text-brand-700" link="/ordens" />
            <StatCard title="OS Atrasadas" value={metrics.osAtrasadas} icon={Clock} colorClass="text-red-600" link="/ordens" />
            <StatCard title="Documentos Vencidos" value={metrics.docVencidos} icon={FileText} colorClass="text-red-600" link="/documentos" />
            <StatCard title="Preventivas Atrasadas" value={metrics.prevAtrasadas} icon={AlertTriangle} colorClass="text-red-600" link="/preventivas" />
          </>
        );
      case "Executor/Técnico":
        return (
          <>
            <StatCard title="Minhas Ordens (Dia)" value={metrics.minhasOs} icon={ClipboardList} colorClass="text-brand-700" link="/ordens" />
            <StatCard title="Minhas Atrasadas" value={metrics.minhasOsAtrasadas} icon={Clock} colorClass="text-red-600" link="/ordens" />
          </>
        );
      case "Gestor GSI":
        return (
          <>
            <StatCard title="Demandas Abertas" value={metrics.demandasAbertas} icon={Inbox} colorClass="text-brand-700" link="/demandas" />
            <StatCard title="OS em Execução" value={metrics.osEmExecucao} icon={Activity} colorClass="text-blue-600" link="/ordens" />
            <StatCard title="OS Atrasadas" value={metrics.osAtrasadas} icon={Clock} colorClass="text-red-600" link="/ordens" />
            <StatCard title="Preventivas Atrasadas" value={metrics.prevAtrasadas} icon={AlertTriangle} colorClass="text-red-600" link="/preventivas" />
            <StatCard title="Documentos Vencidos" value={metrics.docVencidos} icon={FileText} colorClass="text-red-600" link="/documentos" />
            <StatCard title="Documentos a Vencer (30d)" value={metrics.docAVencer} icon={FileText} colorClass="text-amber-600" link="/documentos" />
          </>
        );
      case "Administrador":
        return (
          <>
            <StatCard title="Demandas Abertas" value={metrics.demandasAbertas} icon={Inbox} colorClass="text-brand-700" link="/demandas" />
            <StatCard title="Demandas em Triagem" value={metrics.demandasTriagem} icon={Inbox} colorClass="text-amber-600" link="/demandas" />
            <StatCard title="OS em Execução" value={metrics.osEmExecucao} icon={ClipboardList} colorClass="text-blue-600" link="/ordens" />
            <StatCard title="OS Atrasadas" value={metrics.osAtrasadas} icon={Clock} colorClass="text-red-600" link="/ordens" />
            <StatCard title="Preventivas Atrasadas" value={metrics.prevAtrasadas} icon={AlertTriangle} colorClass="text-red-600" link="/preventivas" />
            <StatCard title="Documentos Vencidos" value={metrics.docVencidos} icon={FileText} colorClass="text-red-600" link="/documentos" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Visão Geral - {currentUser?.role}</h1>
        <p className="text-sm text-slate-500">Indicadores e pendências da manutenção predial.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderDashboardByRole()}
      </div>
    </div>
  );
};
