import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, CalendarClock, ClipboardList, ListChecks, MapPinned, PackageCheck, Plus, ScanSearch, TriangleAlert, UsersRound, Wrench } from "lucide-react";
import { differenceInDays, isPast, isToday, parseISO } from "date-fns";
import { storageService } from "../services/storageService";
import { PreventivePlan, WorkOrder } from "../types";

type ActionMetric = {
  label: string;
  value: number;
  description: string;
  href: string;
  variant: "danger" | "warning" | "attention" | "info" | "neutral";
  icon: React.ElementType;
};

type SupportRoutine = {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
};

type QuickAction = {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  featured?: boolean;
};

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
    const overdue = orders.filter((order) => open(order) && !!order.deadline && isPast(parseISO(order.deadline)) && !isToday(parseISO(order.deadline))).length;
    const scheduling = orders.filter((order) => open(order) && ["Nova", "Planejada", "Em planejamento", "Atribuída"].includes(order.status) && !order.plannedDate).length;
    const supplyOrValidation = orders.filter((order) => open(order) && ["Aguardando estoque", "Aguardando material", "Em validação"].includes(order.status)).length;
    const preventiveDue = plans.filter((plan) => {
      if (!plan.nextExecution || plan.status !== "Ativo") return false;
      const days = differenceInDays(parseISO(plan.nextExecution), today);
      return days >= 0 && days <= (plan.alertDaysAttention ?? 30);
    }).length;
    const preventiveLate = plans.filter((plan) => plan.nextExecution && plan.status === "Ativo" && isPast(parseISO(plan.nextExecution)) && !isToday(parseISO(plan.nextExecution))).length;
    const correctiveOpen = orders.filter((order) => open(order) && order.type.toLowerCase().includes("corretiva")).length;

    return [
      { label: "OS atrasadas ou vencidas", value: overdue, description: "Requerem priorização imediata.", href: "/ordens?filter=atrasadas", variant: "danger", icon: TriangleAlert },
      { label: "OS aguardando programação", value: scheduling, description: "Sem data ou horário definido.", href: "/ordens?filter=programacao", variant: "warning", icon: CalendarClock },
      { label: "OS aguardando material ou validação", value: supplyOrValidation, description: "Dependem de estoque ou conferência.", href: "/ordens?filter=material-validacao", variant: "attention", icon: PackageCheck },
      { label: "Preventivas próximas do vencimento", value: preventiveDue, description: "Planeje antes do prazo.", href: "/preventivas?status=Próximas", variant: "info", icon: CalendarDays },
      { label: "Preventivas atrasadas", value: preventiveLate, description: "Pendências do plano de manutenção.", href: "/preventivas?status=Atrasadas", variant: "danger", icon: CalendarClock },
      { label: "Corretivas abertas", value: correctiveOpen, description: "Demandas que exigem tratamento.", href: "/ordens?filter=corretivas-abertas", variant: "neutral", icon: Wrench },
    ];
  }, [orders, plans]);

  const quickActions = useMemo<QuickAction[]>(() => ([
    {
      label: "Nova OS",
      description: "Cadastrar uma nova ordem de serviço.",
      href: "/ordens/nova",
      icon: Plus,
      featured: true,
    },
    {
      label: "Ver OS",
      description: "Consultar todas as ordens de serviço da operação.",
      href: "/ordens",
      icon: ClipboardList,
    },
    {
      label: "Ver corretivas",
      description: "Consultar serviços corretivos e seus atendimentos.",
      href: "/servicos/corretivas",
      icon: Wrench,
    },
    {
      label: "Ver preventivas",
      description: "Acompanhar planos e execuções preventivas.",
      href: "/preventivas",
      icon: ListChecks,
    },
    {
      label: "Ver agenda",
      description: "Abrir compromissos e programação da equipe.",
      href: "/agenda",
      icon: CalendarDays,
    },
  ]), []);

  const supportRoutines = useMemo<SupportRoutine[]>(() => ([
    {
      label: "Técnicos",
      description: "Cadastre e acompanhe os responsáveis pela execução das OS.",
      href: "/prestadores",
      icon: UsersRound,
    },
    {
      label: "Ativos",
      description: "Consulte os equipamentos vinculados às ordens e preventivas.",
      href: "/ativos",
      icon: ScanSearch,
    },
    {
      label: "Locais",
      description: "Gerencie os ambientes e áreas atendidas pela operação.",
      href: "/locais",
      icon: MapPinned,
    },
  ]), []);

  return (
    <div className="service-dashboard">
      <header className="service-dashboard__header">
        <h1>Gestão de Serviços</h1>
        <p>Acompanhe pendências que exigem ação e siga direto para a rotina necessária.</p>
      </header>

      <section aria-label="Pendências operacionais">
        <h2 className="service-dashboard__section-title">O que precisa de ação</h2>
        <div className="service-metrics">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <button type="button" key={metric.label} onClick={() => navigate(metric.href)} className={`service-metric service-metric--${metric.variant}`}>
                <span className="service-metric__top"><span className="service-metric__icon"><Icon size={20} /></span><strong>{metric.value}</strong></span>
                <span className="service-metric__label">{metric.label}</span>
                <span className="service-metric__description">{metric.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-label="Ações rápidas">
        <h2 className="service-dashboard__section-title">Ações rápidas</h2>
        <div className="service-action-grid">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.href)}
                className={action.featured ? "service-action-card service-action-card--primary" : "service-action-card"}
              >
                <div className="service-action-card__content">
                  <span className={action.featured ? "service-action-card__icon service-action-card__icon--primary" : "service-action-card__icon"}>
                    <Icon size={18} />
                  </span>
                  <span className="service-action-card__text">
                    <span className="service-action-card__title">{action.label}</span>
                    <span className="service-action-card__description">{action.description}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-label="Cadastros operacionais de apoio">
        <h2 className="service-dashboard__section-title">Cadastros de apoio</h2>
        <div className="service-support-grid">
          {supportRoutines.map((routine) => {
            const Icon = routine.icon;
            return (
              <button
                key={routine.label}
                type="button"
                onClick={() => navigate(routine.href)}
                className="service-support-card"
              >
                <span className="service-support-card__icon">
                  <Icon size={18} />
                </span>
                <span className="service-support-card__title">{routine.label}</span>
                <span className="service-support-card__description">{routine.description}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
