import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Inbox, ClipboardList, CalendarClock, Building2, FileText, Users, BarChart3, Settings, History, CalendarDays, X } from "lucide-react";
import { cn } from "../utils/cn";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Visão Geral", href: "/" },
  { icon: CalendarDays, label: "Agenda", href: "/agenda" },
  { icon: Inbox, label: "Demandas", href: "/demandas" },
  { icon: ClipboardList, label: "Ordens de Serviço", href: "/ordens" },
  { icon: CalendarClock, label: "Preventivas", href: "/preventivas" },
  { icon: Building2, label: "Ativos e Locais", href: "/ativos" },
  { icon: FileText, label: "Documentos", href: "/documentos" },
  { icon: Users, label: "Prestadores", href: "/prestadores" },
  { icon: BarChart3, label: "Relatórios", href: "/relatorios" },
];

const adminItems = [
  { icon: Settings, label: "Administração", href: "/admin" },
  { icon: History, label: "Auditoria", href: "/auditoria" },
];

export const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen?: boolean, setMobileMenuOpen?: (v: boolean) => void }) => {
  const location = useLocation();
  const { currentUser } = useAuth();

  // Close mobile menu when route changes
  useEffect(() => {
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  }, [location.pathname]);

  const renderLink = (item: any) => {
    const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href));
    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          "flex items-center h-11 px-4 mx-2 rounded-md mb-1 transition-colors text-sm",
          isActive 
            ? "bg-white/15 text-white font-medium border-l-4 border-white" 
            : "text-white/90 hover:bg-white/10 hover:text-white"
        )}
      >
        <item.icon className="w-[18px] h-[18px] mr-2.5 opacity-90" />
        {item.label}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden" 
          onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-screen w-[240px] bg-brand-900 flex flex-col z-30 transition-transform duration-300 md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 mb-4 mt-2">
          <div className="text-white font-bold text-xl tracking-tight">GSI / CNC</div>
          <button 
            className="md:hidden text-white/80 hover:text-white p-1"
            onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto pb-4">
          <div className="flex flex-col">
            {navItems.map(item => {
              if (item.href === "/prestadores" && currentUser?.role === "Solicitante") {
                return null;
              }
              return renderLink(item);
            })}
            
            {(currentUser?.role === "Administrador" || currentUser?.role === "Gestor GSI") && (
              <>
                <div className="mt-6 mb-2 px-6 text-[11px] font-semibold text-white/65 uppercase tracking-wider">
                  Configurações
                </div>
                {adminItems.map(renderLink)}
              </>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
};
