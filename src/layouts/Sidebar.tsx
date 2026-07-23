import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Inbox, 
  ClipboardList, 
  CalendarClock, 
  Building2, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  History, 
  CalendarDays, 
  PackageSearch, 
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Wrench
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
import { useAuth } from "../contexts/AuthContext";
import { storageService } from "../services/storageService";
import { TechnicianUnavailability, WorkOrder } from "../types";

const navItems: { icon: any, label: string, href: string, subItems?: { label: string, href: string }[] }[] = [
  { icon: LayoutDashboard, label: "Visão Geral", href: "/" },
  { icon: Wrench, label: "Gestão de Serviços", href: "/servicos" },
  { icon: PackageSearch, label: "Gestão de Estoque", href: "/estoque" },
  { icon: FileText, label: "Documentação Regulatória", href: "/documentos" },
];

const adminItems: { icon: any, label: string, href: string, subItems?: { label: string, href: string }[] }[] = [
  { icon: Settings, label: "Configurações", href: "/admin" },
];

export const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen?: boolean, setMobileMenuOpen?: (v: boolean) => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
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

  // Close mobile menu when route changes
  useEffect(() => {
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  }, [location.pathname]);

  // Auto expand parent if child is active
  useEffect(() => {
    navItems.forEach(item => {
      if (item.subItems) {
        const hasActiveChild = item.subItems.some(sub => location.pathname === sub.href || (sub.href !== "/" && location.pathname.startsWith(sub.href + "/")));
        if (hasActiveChild) {
          setExpanded(prev => ({ ...prev, [item.label]: true }));
        }
      }
    });
  }, [location.pathname]);

  const toggleExpand = (label: string) => {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(calendarMonth),
    end: endOfMonth(calendarMonth),
  });
  const leadingBlankDays = getDay(startOfMonth(calendarMonth));
  const hasSchedule = (day: Date) => scheduledDates.some((scheduledDate) => isSameDay(scheduledDate, day));
  const openDay = (day: Date) => navigate(`/agenda?periodo=dia&data=${format(day, "yyyy-MM-dd")}`);

  const renderLink = (item: any, isSubItem = false) => {
    if (item.subItems) {
      const isExpanded = expanded[item.label];
      const hasActiveChild = item.subItems.some((sub: any) => location.pathname === sub.href || (sub.href !== "/" && location.pathname.startsWith(sub.href + "/")));
      
      return (
        <div key={item.label} className="mb-1">
          <button
            onClick={() => toggleExpand(item.label)}
            className={cn(
              "flex items-center justify-between w-full h-11 px-4 mx-2 rounded-md transition-colors text-sm pr-6",
              hasActiveChild && !isExpanded
                ? "bg-white/10 text-slate-50 font-medium"
                : "text-slate-50 hover:bg-white/10 hover:text-slate-50"
            )}
            style={{ width: 'calc(100% - 16px)' }}
          >
            <div className="flex items-center">
              <item.icon className="w-[18px] h-[18px] mr-2.5 " />
              {item.label}
            </div>
            {isExpanded ? <ChevronDown className="w-4 h-4 " /> : <ChevronRight className="w-4 h-4 " />}
          </button>
          
          {isExpanded && (
            <div className="flex flex-col mt-1 space-y-1">
              {item.subItems.map((sub: any) => renderLink(sub, true))}
            </div>
          )}
        </div>
      );
    }

    const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href + "/"));
    
    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          "flex items-center h-11 px-4 mx-2 rounded-md mb-1 transition-colors text-sm",
          isActive 
            ? "bg-white/15 text-slate-50 font-medium" 
            : "text-slate-50 hover:bg-white/10 hover:text-slate-50",
          isSubItem ? "pl-11 h-10" : ""
        )}
      >
        {!isSubItem && <item.icon className="w-[18px] h-[18px] mr-2.5 " />}
        {isSubItem && <div className="w-1.5 h-1.5 rounded-full bg-white/40 mr-3" />}
        {item.label}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-[60] md:hidden" 
          onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn("sidebar-text",
        "fixed top-0 left-0 h-screen w-[240px] bg-brand-900 flex flex-col z-[70] transition-transform duration-300 md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 mb-4 mt-2">
          <div className="text-slate-50 font-bold text-xl tracking-tight">GSI / CNC</div>
          <button 
            className="md:hidden text-slate-50 hover:text-slate-50 p-1"
            onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
          <div className="flex flex-col">
            {navItems.map(item => renderLink(item))}
            
            <div className="mt-6 mb-2 px-6 text-[11px] font-semibold text-slate-50 uppercase tracking-wider">
              Configurações
            </div>
            {adminItems.map(item => renderLink(item))}

            <section className="mx-3 mt-6 border-t border-white/25 px-1 pb-5 pt-5 text-white" aria-label="Agenda mensal">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-wider">Agenda</h2>
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  className="rounded p-1.5 hover:bg-white/15"
                  onClick={() => setCalendarMonth((month) => subMonths(month, 1))}
                  title="Mês anterior"
                  aria-label="Mês anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <strong className="text-sm capitalize">{format(calendarMonth, "MMMM yyyy", { locale: ptBR })}</strong>
                <button
                  type="button"
                  className="rounded p-1.5 hover:bg-white/15"
                  onClick={() => setCalendarMonth((month) => addMonths(month, 1))}
                  title="Próximo mês"
                  aria-label="Próximo mês"
                >
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
