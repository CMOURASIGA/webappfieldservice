import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  PackageSearch,
  Settings,
  X,
  Wrench,
} from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "../utils/cn";
import { storageService } from "../services/storageService";
import { Location, PreventivePlan, Provider, TechnicianUnavailability, Unit, User, WorkOrder } from "../types";

const navItems: { icon: any; label: string; href: string; subItems?: { label: string; href: string }[] }[] = [
  { icon: Wrench, label: "Gestao de Servicos", href: "/servicos" },
  { icon: PackageSearch, label: "Gestao de Estoque", href: "/estoque" },
  { icon: FileText, label: "Documentacao Regulatoria", href: "/documentos" },
];

const adminItems: { icon: any; label: string; href: string; subItems?: { label: string; href: string }[] }[] = [
  { icon: Settings, label: "Configuracoes", href: "/admin" },
];

type SidebarOccurrence = {
  id: string;
  date: Date;
  endDate?: Date;
  badge: string;
  title: string;
  subtitle: string;
  helper?: string;
  note?: string;
  href?: string;
};

export const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen?: boolean; setMobileMenuOpen?: (v: boolean) => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [calendarMonth, setCalendarMonth] = useState(startOfMonth(new Date()));
  const [selectedAgendaDate, setSelectedAgendaDate] = useState<Date | null>(null);
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [commitments, setCommitments] = useState<TechnicianUnavailability[]>([]);
  const [plans, setPlans] = useState<PreventivePlan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const refreshAgendaData = () => {
    setOrders((storageService.get("gsi_work_orders") || []) as WorkOrder[]);
    setCommitments((storageService.get("gsi_technician_unavailabilities") || []) as TechnicianUnavailability[]);
    setPlans((storageService.get("gsi_preventive_plans") || []) as PreventivePlan[]);
    setUsers((storageService.get("gsi_users") || []) as User[]);
    setProviders((storageService.get("gsi_providers") || []) as Provider[]);
    setUnits((storageService.get("gsi_units") || []) as Unit[]);
    setLocations((storageService.get("gsi_locations") || []) as Location[]);
  };

  useEffect(() => {
    refreshAgendaData();
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleStorageUpdate = () => {
      refreshAgendaData();
    };

    window.addEventListener("gsi-storage-updated", handleStorageUpdate);
    return () => window.removeEventListener("gsi-storage-updated", handleStorageUpdate);
  }, []);

  useEffect(() => {
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  }, [location.pathname, setMobileMenuOpen]);

  useEffect(() => {
    navItems.forEach((item) => {
      if (!item.subItems) return;
      const hasActiveChild = item.subItems.some((sub) => location.pathname === sub.href || (sub.href !== "/" && location.pathname.startsWith(`${sub.href}/`)));
      if (hasActiveChild) {
        setExpanded((prev) => ({ ...prev, [item.label]: true }));
      }
    });
  }, [location.pathname]);

  const toggleExpand = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const getExecutorName = (id?: string) =>
    users.find((user) => user.id === id)?.name || providers.find((provider) => provider.id === id)?.name || "Sem responsavel";

  const getUnitName = (id?: string) =>
    units.find((unit) => unit.id === id)?.sigla || units.find((unit) => unit.id === id)?.name || "Unidade nao informada";

  const getLocationName = (id?: string) => locations.find((item) => item.id === id)?.name || "Local nao especificado";

  const agendaOccurrences = useMemo<SidebarOccurrence[]>(() => {
    const items: SidebarOccurrence[] = [
      ...orders
        .filter((order) => order.plannedStart && order.plannedEnd)
        .map((order) => ({
          id: `order-${order.id}`,
          date: parseISO(order.plannedStart!),
          endDate: parseISO(order.plannedEnd!),
          badge: (order.type || "OS").toUpperCase(),
          title: order.technicalDescription,
          subtitle: order.number,
          helper: `${getLocationName(order.locationId)}${order.unitId ? ` • ${getUnitName(order.unitId)}` : ""}`,
          href: `/ordens/${order.id}`,
        })),
      ...plans
        .filter((plan) => plan.active && plan.status === "Ativo" && plan.nextExecution)
        .map((plan) => ({
          id: `plan-${plan.id}`,
          date: parseISO(plan.nextExecution),
          endDate: parseISO(plan.nextExecution),
          badge: (plan.type || "Preventiva").toUpperCase(),
          title: plan.description,
          subtitle: plan.code,
          helper: `${getLocationName(plan.locationId)}${plan.unitId ? ` • ${getUnitName(plan.unitId)}` : ""}`,
          href: `/preventivas/${plan.id}`,
        })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    return items;
  }, [locations, orders, plans, providers, units, users]);

  const monthDays = eachDayOfInterval({
    start: startOfMonth(calendarMonth),
    end: endOfMonth(calendarMonth),
  });
  const leadingBlankDays = getDay(startOfMonth(calendarMonth));
  const hasSchedule = (day: Date) => agendaOccurrences.some((occurrence) => isSameDay(occurrence.date, day));

  const dayOccurrences = useMemo(() => {
    if (!selectedAgendaDate) return [];

    return agendaOccurrences
      .filter((occurrence) => isSameDay(occurrence.date, selectedAgendaDate))
      .map((occurrence, _, all) => {
        const hasConflict = all.some(
          (candidate) =>
            candidate.id !== occurrence.id &&
            candidate.endDate &&
            occurrence.endDate &&
            occurrence.date < candidate.endDate &&
            occurrence.endDate > candidate.date,
        );

        return {
          ...occurrence,
          note: hasConflict ? "Conflito" : undefined,
        };
      });
  }, [agendaOccurrences, selectedAgendaDate]);

  const goToModule = (href: string) => {
    if (location.pathname !== href) navigate(href);
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  };

  const goToAgendaPage = () => {
    if (selectedAgendaDate) {
      navigate(`/agenda?periodo=dia&data=${format(selectedAgendaDate, "yyyy-MM-dd")}`);
    } else {
      navigate("/agenda");
    }
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  };

  const renderLink = (item: any, isSubItem = false) => {
    if (item.subItems) {
      const isExpanded = expanded[item.label];
      const hasActiveChild = item.subItems.some((sub: any) => location.pathname === sub.href || (sub.href !== "/" && location.pathname.startsWith(`${sub.href}/`)));

      return (
        <div key={item.label} className="mb-1">
          <button
            onClick={() => toggleExpand(item.label)}
            className={cn(
              "mx-2 flex h-11 w-full items-center justify-between rounded-md px-4 pr-6 text-sm transition-colors",
              hasActiveChild && !isExpanded ? "bg-white/10 font-medium text-slate-50" : "text-slate-50 hover:bg-white/10 hover:text-slate-50",
            )}
            style={{ width: "calc(100% - 16px)" }}
          >
            <div className="flex items-center">
              <item.icon className="mr-2.5 h-[18px] w-[18px]" />
              {item.label}
            </div>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          {isExpanded && <div className="mt-1 flex flex-col space-y-1">{item.subItems.map((sub: any) => renderLink(sub, true))}</div>}
        </div>
      );
    }

    const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(`${item.href}/`));

    return (
      <button
        type="button"
        key={item.href}
        onClick={() => goToModule(item.href)}
        className={cn(
          "sidebar-nav-link mx-2 mb-1 h-11 rounded-md px-4 text-sm transition-colors",
          isActive ? "bg-white/15 font-medium text-slate-50" : "text-slate-50 hover:bg-white/10 hover:text-slate-50",
          isSubItem ? "h-10 pl-11" : "",
        )}
      >
        {!isSubItem && <item.icon className="sidebar-nav-link__icon h-[18px] w-[18px]" />}
        {isSubItem && <div className="sidebar-nav-link__dot h-1.5 w-1.5 rounded-full bg-white/40" />}
        <span className="sidebar-nav-link__label">{item.label}</span>
      </button>
    );
  };

  const renderAgendaMonth = () => (
    <>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" className="rounded p-1.5 hover:bg-white/15" onClick={() => setCalendarMonth((month) => subMonths(month, 1))} title="Mes anterior" aria-label="Mes anterior">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <strong className="text-sm capitalize">{format(calendarMonth, "MMMM yyyy", { locale: ptBR })}</strong>
        <button type="button" className="rounded p-1.5 hover:bg-white/15" onClick={() => setCalendarMonth((month) => addMonths(month, 1))} title="Proximo mes" aria-label="Proximo mes">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] font-bold uppercase">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((label) => (
          <span key={label} className="py-1">
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 text-center text-xs">
        {Array.from({ length: leadingBlankDays }).map((_, index) => (
          <span key={`empty-${index}`} />
        ))}
        {monthDays.map((day) => {
          const scheduled = hasSchedule(day);
          return (
            <button
              type="button"
              key={day.toISOString()}
              onClick={() => setSelectedAgendaDate(day)}
              className={cn(
                "relative mx-auto flex h-8 w-8 items-center justify-center rounded-md font-semibold hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                isSameDay(day, new Date()) && "bg-white/15",
                !isSameMonth(day, calendarMonth) && "opacity-40",
              )}
              aria-label={scheduled ? `${format(day, "dd/MM/yyyy")}, possui programacao` : `Ver ocorrencias em ${format(day, "dd/MM/yyyy")}`}
            >
              {format(day, "d")}
              {scheduled && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-white" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </>
  );

  const renderAgendaDay = () => (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between text-[11px] font-semibold">
        <button type="button" className="inline-flex items-center gap-1 text-white hover:text-white/80" onClick={() => setSelectedAgendaDate(null)}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar
        </button>
        <span className="text-white/90">{selectedAgendaDate ? format(selectedAgendaDate, "EEEE, dd 'de' MMM", { locale: ptBR }) : ""}</span>
      </div>

      <div className="custom-scrollbar mt-3 flex min-h-0 flex-1 flex-col gap-4 overflow-y-scroll pr-1">
        {dayOccurrences.length > 0 ? (
          dayOccurrences.map((occurrence) => {
            const content = (
              <div className="rounded-xl border border-[#d35757] bg-[#0b2466] p-3 shadow-sm transition-colors hover:bg-[#123182]">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="text-sm font-bold leading-tight text-white">
                    {format(occurrence.date, "HH:mm")}
                    {occurrence.endDate ? ` - ${format(occurrence.endDate, "HH:mm")}` : ""}
                  </div>
                  <span className="rounded-full bg-[#1e52c3] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                    {occurrence.badge}
                  </span>
                </div>
                <div className="text-sm font-semibold leading-tight text-white">{occurrence.title}</div>
                <div className="mt-1 text-[11px] text-white/85">{occurrence.subtitle}</div>
                {occurrence.helper && <div className="mt-2 text-[10px] leading-4 text-white/70">{occurrence.helper}</div>}
                {occurrence.note && <div className="mt-2 text-[10px] font-semibold text-[#ff9d9d]">{occurrence.note}</div>}
              </div>
            );

            if (occurrence.href) {
              return (
                <button key={occurrence.id} type="button" className="block w-full text-left" onClick={() => goToModule(occurrence.href!)}>
                  {content}
                </button>
              );
            }

            return <div key={occurrence.id}>{content}</div>;
          })
        ) : (
          <div className="rounded-xl border border-dashed border-white/30 px-3 py-5 text-center text-xs text-white/80">
            Nenhuma ocorrencia para esta data.
          </div>
        )}
      </div>

      <div className="mt-3 shrink-0">
        <button
          type="button"
          className="w-full text-left text-sm font-semibold text-white transition-colors hover:text-white/80"
          onClick={goToAgendaPage}
        >
          Abrir agenda completa
        </button>
      </div>
    </div>
  );

  return (
    <>
      {mobileMenuOpen && <div className="fixed inset-0 z-[60] bg-slate-900/50 md:hidden" onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)} />}

      <aside
        className={cn(
          "sidebar-text fixed top-0 left-0 z-[70] flex h-screen w-[240px] flex-col bg-brand-900 transition-transform duration-300 md:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mt-1 mb-2 flex h-12 items-center justify-between px-5">
          <div className="text-xl font-bold tracking-tight text-slate-50">GSI / CNC</div>
          <button className="p-1 text-slate-50 hover:text-slate-50 md:hidden" onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col overflow-hidden pb-3">
          <div className="flex h-full flex-col">
            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
              <div className="flex flex-col">
              {navItems.map((item) => renderLink(item))}
                <div className="mt-3 mb-1 px-6 text-[11px] font-semibold uppercase tracking-wider text-slate-50">Configuracoes</div>
                {adminItems.map((item) => renderLink(item))}
              </div>
            </div>

            <section className="mx-3 mt-3 flex min-h-0 flex-1 flex-col border-t border-white/25 px-1 pt-3 pb-4 text-white" aria-label="Agenda mensal">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider">Agenda</h2>
              {selectedAgendaDate ? renderAgendaDay() : renderAgendaMonth()}
            </section>
          </div>
        </nav>
      </aside>
    </>
  );
};
