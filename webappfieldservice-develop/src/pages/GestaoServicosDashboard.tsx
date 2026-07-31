import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ClipboardList, Inbox, CalendarClock, ArrowRight, Wrench, PackageCheck, TriangleAlert } from "lucide-react";
import { storageService } from "../services/storageService";
import { WorkOrder, PreventivePlan } from "../types";
import { differenceInDays, isPast, isToday, parseISO } from "date-fns";

type ActionMetric = { label: string; value: number; description: string; href: string; variant: "danger" | "warning" | "attention" | "info" | "neutral"; icon: React.ElementType };

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
      { label: "OS atrasadas ou vencidas", value: overdue, description: "Requerem priorização imediata.", href: "/ordens?filter=atrasadas", variant: "danger", icon: TriangleAlert },
      { label: "OS aguardando programação", value: scheduling, description: "Sem data ou horário definido.", href: "/ordens?filter=programacao", variant: "warning", icon: CalendarClock },
      { label: "OS aguardando material ou validação", value: supplyOrValidation, description: "Dependem de estoque ou conferência.", href: "/ordens?filter=material-validacao", variant: "attention", icon: PackageCheck },
      { label: "Preventivas próximas do vencimento", value: preventiveDue, description: "Planeje antes do prazo.", href: "/preventivas?status=Próximas", variant: "info", icon: CalendarDays },
      { label: "Preventivas atrasadas", value: preventiveLate, description: "Pendências do plano de manutenção.", href: "/preventivas?status=Atrasadas", variant: "danger", icon: CalendarClock },
      { label: "Corretivas abertas", value: correctiveOpen, description: "Demandas que exigem tratamento.", href: "/ordens?filter=corretivas-abertas", variant: "neutral", icon: Wrench },
    ];
  }, [orders, plans]);

  const routines = [
    { title: "Agenda de Serviços", description: "Consulte a programação antes de criar ou movimentar atendimentos.", icon: CalendarDays, href: "/agenda", primary: true },
    { title: "Preventivas", description: "Planos, periodicidade e gerações de OS.", icon: CalendarClock, href: "/preventivas" },
    { title: "Corretivas", description: "Solicitações e necessidades pontuais.", icon: Inbox, href: "/servicos/corretivas" },
    { title: "Ordens de Serviço", description: "Programação, execução e validação.", icon: ClipboardList, href: "/ordens" },
  ];

  return <div className="service-dashboard">
    <header className="service-dashboard__header">
      <h1>Gestão de Serviços</h1>
      <p>Acompanhe as pendências operacionais e acesse a rotina necessária.</p>
    </header>
    <section aria-label="Pendências operacionais">
      <h2 className="service-dashboard__section-title">O que precisa de ação</h2>
      <div className="service-metrics">
        {metrics.map(metric => { const Icon = metric.icon; return <button type="button" key={metric.label} onClick={() => navigate(metric.href)} className={`service-metric service-metric--${metric.variant}`}>
          <span className="service-metric__top"><span className="service-metric__icon"><Icon size={20} /></span><strong>{metric.value}</strong></span>
          <span className="service-metric__label">{metric.label}</span><span className="service-metric__description">{metric.description}</span>
        </button>})}
      </div>
    </section>
    <section aria-label="Rotinas de serviços">
      <h2 className="service-dashboard__section-title">Rotinas</h2>
      <div className="service-routines">
        {routines.map(routine => { const Icon = routine.icon; return <button type="button" key={routine.title} onClick={() => navigate(routine.href)} className={`service-routine ${routine.primary ? "service-routine--primary" : ""}`}>
          <span className="service-routine__icon"><Icon size={22} /></span><span className="service-routine__content"><span className="service-routine__title">{routine.title}</span><span className="service-routine__description">{routine.description}</span></span><ArrowRight className="service-routine__arrow" size={20} />
        </button>})}
      </div>
    </section>
  </div>;
};
