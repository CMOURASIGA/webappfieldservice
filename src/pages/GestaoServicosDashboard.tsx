import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ClipboardList, Inbox, CalendarClock, ArrowRight, Wrench, PackageCheck, TriangleAlert } from "lucide-react";
import { storageService } from "../services/storageService";
import { WorkOrder, PreventivePlan } from "../types";
import { differenceInDays, isPast, isToday, parseISO } from "date-fns";

type ActionMetric = { label: string; value: number; description: string; href: string; tone: string; icon: React.ElementType };

export const GestaoServicosDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [plans, setPlans] = useState<PreventivePlan[]>([]);

  useEffect(() => {
    setOrders(storageService.get("gsi_work_orders"));
    setPlans(storageService.get("gsi_preventive_plans"));
  }, []);

  const metrics = useMemo<ActionMetric[]>(() => {
    const today = new Date();
    const open = (order: WorkOrder) => !["Concluída", "Cancelada"].includes(order.status);
    const overdue = orders.filter(o => open(o) && !!o.deadline && isPast(parseISO(o.deadline)) && !isToday(parseISO(o.deadline))).length;
    const scheduling = orders.filter(o => open(o) && ["Nova", "Planejada", "Em planejamento", "Atribuída"].includes(o.status) && !o.plannedDate).length;
    const supplyOrValidation = orders.filter(o => open(o) && ["Aguardando estoque", "Aguardando material", "Em validação"].includes(o.status)).length;
    const preventiveDue = plans.filter(p => {
      if (!p.nextExecution || p.status !== "Ativo") return false;
      const days = differenceInDays(parseISO(p.nextExecution), today);
      return days >= 0 && days <= (p.alertDaysAttention ?? 30);
    }).length;
    const preventiveLate = plans.filter(p => p.nextExecution && p.status === "Ativo" && isPast(parseISO(p.nextExecution)) && !isToday(parseISO(p.nextExecution))).length;
    const correctiveOpen = orders.filter(o => open(o) && o.type.toLowerCase().includes("corretiva")).length;
    return [
      { label: "OS atrasadas ou vencidas", value: overdue, description: "Requerem priorização imediata.", href: "/ordens?filter=atrasadas", tone: "border-red-200 bg-red-50 text-red-800", icon: TriangleAlert },
      { label: "OS aguardando programação", value: scheduling, description: "Sem data ou horário definido.", href: "/ordens?filter=programacao", tone: "border-amber-200 bg-amber-50 text-amber-900", icon: CalendarClock },
      { label: "OS aguardando material ou validação", value: supplyOrValidation, description: "Dependem de estoque ou conferência.", href: "/ordens?filter=material-validacao", tone: "border-orange-200 bg-orange-50 text-orange-900", icon: PackageCheck },
      { label: "Preventivas próximas do vencimento", value: preventiveDue, description: "Planeje antes do prazo.", href: "/preventivas?status=Próximas", tone: "border-sky-200 bg-sky-50 text-sky-900", icon: CalendarDays },
      { label: "Preventivas atrasadas", value: preventiveLate, description: "Pendências do plano de manutenção.", href: "/preventivas?status=Atrasadas", tone: "border-red-200 bg-red-50 text-red-800", icon: CalendarClock },
      { label: "Corretivas abertas", value: correctiveOpen, description: "Demandas que exigem tratamento.", href: "/ordens?filter=corretivas-abertas", tone: "border-violet-200 bg-violet-50 text-violet-900", icon: Wrench },
    ];
  }, [orders, plans]);

  const routines = [
    { title: "Agenda de Serviços", description: "Consulte a programação antes de criar ou movimentar atendimentos.", icon: CalendarDays, href: "/agenda", primary: true },
    { title: "Preventivas", description: "Planos, periodicidade e gerações de OS.", icon: CalendarClock, href: "/preventivas" },
    { title: "Corretivas", description: "Solicitações e necessidades pontuais.", icon: Inbox, href: "/servicos/corretivas" },
    { title: "Ordens de Serviço", description: "Programação, execução e validação.", icon: ClipboardList, href: "/ordens" },
  ];

  return <div className="space-y-7">
    <header>
      <h1 className="text-2xl font-bold text-slate-900">Gestão de Serviços</h1>
      <p className="mt-1 text-sm text-slate-500">Acompanhe as pendências operacionais e acesse a rotina necessária.</p>
    </header>
    <section aria-label="Pendências operacionais">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">O que precisa de ação</h2>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map(metric => { const Icon = metric.icon; return <button key={metric.label} onClick={() => navigate(metric.href)} className={`group rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${metric.tone}`}>
          <div className="flex items-start justify-between gap-4"><Icon className="h-5 w-5" /><span className="text-2xl font-bold">{metric.value}</span></div>
          <div className="mt-3 font-semibold">{metric.label}</div><p className="mt-1 text-xs opacity-80">{metric.description}</p>
        </button>})}
      </div>
    </section>
    <section aria-label="Rotinas de serviços">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">Rotinas</h2>
      <div className="grid gap-3 lg:grid-cols-4">
        {routines.map(routine => { const Icon = routine.icon; return <button key={routine.title} onClick={() => navigate(routine.href)} className={`group flex min-h-32 items-start gap-3 rounded-xl border p-4 text-left transition hover:shadow-sm ${routine.primary ? "border-brand-700 bg-brand-700 text-white" : "border-slate-200 bg-white text-slate-900 hover:border-brand-300"}`}>
          <span className={`rounded-lg p-2 ${routine.primary ? "bg-white/15" : "bg-slate-100 text-brand-700"}`}><Icon className="h-5 w-5" /></span><span className="flex-1"><span className="flex items-center justify-between gap-2 font-semibold">{routine.title}<ArrowRight className="h-4 w-4" /></span><span className={`mt-2 block text-xs ${routine.primary ? "text-white/85" : "text-slate-500"}`}>{routine.description}</span></span>
        </button>})}
      </div>
    </section>
  </div>;
};
