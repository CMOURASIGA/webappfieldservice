import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Inbox, ClipboardList, CalendarClock, Building2, FileText, Users, BarChart3, Settings, History } from "lucide-react";
import { cn } from "../utils/cn";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Visão Geral", href: "/" },
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

export const Sidebar = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

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
    <aside className="fixed top-0 left-0 h-screen w-[240px] bg-brand-900 flex flex-col z-20">
      <div className="h-16 flex items-center px-6 mb-4 mt-2">
        <div className="text-white font-bold text-xl tracking-tight">GSI / CNC</div>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
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
  );
};
