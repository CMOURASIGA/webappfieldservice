import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  Settings,
  PackageSearch,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
import { TechnicianUnavailability, WorkOrder } from "../types";

const navItems: { icon: any; label: string; href: string; subItems?: { label: string; href: string }[] }[] = [
  { icon: Wrench, label: "Gestão de Serviços", href: "/servicos" },
  { icon: PackageSearch, label: "Gestão de Estoque", href: "/estoque" },
  { icon: FileText, label: "Documentação Regulatória", href: "/documentos" },
];

const adminItems: { icon: any; label: string; href: string; subItems?: { label: string; href: string }[] }[] = [
  { icon: Settings, label: "Configurações", href: "/admin" },
];

export const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen?: boolean; setMobileMenuOpen?: (v: boolean) => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [calendarMonth, setCalendarMonth] = useState(startOfMonth(new Date()));
  const [scheduledDates, setScheduledDates] = useState<Date[]>([]);

  useEffect(() => {
    const orders = (storageService.get("gsi_work_orders") || []) as WorkOrder[];
    const commitments = (storageService.get("gsi_technician_unavailabilities") || []) as TechnicianUnavailability[];
    setScheduledDates([
      ...orders.filter((order) => order.plannedStart).map((order) => parseISO(order.plannedStart!)),
      ...commitments.filter((commitment) => commitment.startAt).map((commitment) => parseISO(commitment.startAt)),
    ]);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  }, [location.pathname, setMobileMenuOpen]);

  useEffect(() => {
    navItems.forEach((item) => {
      if (item.subItems) {
        const hasActiveChild = item.subItems.some((sub) => location.pathname === sub.href || (sub.href !== "/" && location.pathname.startsWith(sub.href + "/")));
        if (hasActiveChild) {
          setExpanded((prev) => ({ ...prev, [item.label]: true }));
        }
      }
    });
  }, [location.pathname]);

  const toggleExpand = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(calendarMonth),
    end: endOfMonth(calendarMonth),
  });
  const leadingBlankDays = getDay(startOfMonth(calendarMonth));
  const hasSchedule = (day: Date) => scheduledDates.some((scheduledDate) => isSameDay(scheduledDate, day));
  const openDay = (day: Date) => navigate(`/agenda?periodo=dia&data=${format(day, "yyyy-MM-dd")}`);

  const goToModule = (href: string) => {
    if (location.pathname !== href) navigate(href);
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  };

  const renderLink = (item: any, isSubItem = false) => {
    if (item.subItems) {
      const isExpanded = expanded[item.label];
      const hasActiveChild = item.subItems.some((sub: any) => location.pathname === sub.href || (sub.href !== "/" && location.pathname.startsWith(sub.href + "/")));

      return (
        <div key={item.label} className="mb-1">
          <button
            onClick={() => toggleExpand(item.label)}
            className={cn(
              "flex h-11 w-full items-center justify-between rounded-md px-4 pr-6 text-sm transition-colors mx-2",
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

          {isExpanded && (
            <div className="mt-1 flex flex-col space-y-1">
              {item.subItems.map((sub: any) => renderLink(sub, true))}
            </div>
          )}
        </div>
      );
    }

    const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href + "/"));

    return (
      <button
        type="button"
        key={item.href}
        onClick={() => goToModule(item.href)}
        className={cn(
          "sidebar-nav-link h-11 rounded-md px-4 mx-2 mb-1 text-sm transition-colors",
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

  return (
    <>
      {mobileMenuOpen && <div className="fixed inset-0 z-[60] bg-slate-900/50 md:hidden" onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)} />}

      <aside className={cn("sidebar-text", "fixed top-0 left-0 z-[70] flex h-screen w-[240px] flex-col bg-brand-900 transition-transform duration-300 md:translate-x-0", mobileMenuOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="mt-2 mb-4 flex h-16 items-center justify-between px-6">
          <div className="text-xl font-bold tracking-tight text-slate-50">GSI / CNC</div>
          <button className="p-1 text-slate-50 hover:text-slate-50 md:hidden" onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="custom-scrollbar flex-1 overflow-y-auto pb-4">
          <div className="flex flex-col">
            {navItems.map((item) => renderLink(item))}

            <div className="mt-6 mb-2 px-6 text-[11px] font-semibold uppercase tracking-wider text-slate-50">
              Configurações
            </div>
            {adminItems.map((item) => renderLink(item))}

            <section className="mx-3 mt-6 border-t border-white/25 px-1 pt-5 pb-5 text-white" aria-label="Agenda mensal">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-wider">Agenda</h2>
              <div className="mb-4 flex items-center justify-between">
                <button type="button" className="rounded p-1.5 hover:bg-white/15" onClick={() => setCalendarMonth((month) => subMonths(month, 1))} title="Mês anterior" aria-label="Mês anterior">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <strong className="text-sm capitalize">{format(calendarMonth, "MMMM yyyy", { locale: ptBR })}</strong>
                <button type="button" className="rounded p-1.5 hover:bg-white/15" onClick={() => setCalendarMonth((month) => addMonths(month, 1))} title="Próximo mês" aria-label="Próximo mês">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 text-center text-[10px] font-bold uppercase">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((label) => <span key={label} className="py-1">{label}</span>)}
              </div>
              <div className="grid grid-cols-7 text-center text-xs">
                {Array.from({ length: leadingBlankDays }).map((_, index) => <span key={`empty-${index}`} />)}
                {monthDays.map((day) => {
                  const scheduled = hasSchedule(day);
                  return (
                    <button
                      type="button"
                      key={day.toISOString()}
                      onClick={() => openDay(day)}
                      className={cn(
                        "relative mx-auto flex h-8 w-8 items-center justify-center rounded-md font-semibold hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                        isSameDay(day, new Date()) && "bg-white/15",
                        !isSameMonth(day, calendarMonth) && "opacity-40",
                      )}
                      title={scheduled ? `${format(day, "dd/MM/yyyy")}, possui programação` : `Abrir ${format(day, "dd/MM/yyyy")}`}
                      aria-label={scheduled ? `${format(day, "dd/MM/yyyy")}, possui programação` : `Abrir ${format(day, "dd/MM/yyyy")}`}
                    >
                      {format(day, "d")}
                      {scheduled && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-white" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[10px] leading-4 text-white/80">
                Clique em uma data para abrir a visão do dia. Pontos brancos indicam dias com programação.
              </p>
            </section>
          </div>
        </nav>
      </aside>
    </>
  );
};
