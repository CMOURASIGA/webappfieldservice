import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  ChevronRight,
  Wrench
} from "lucide-react";
import { cn } from "../utils/cn";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Visão Geral", href: "/" },
  { icon: CalendarDays, label: "Agenda", href: "/agenda" },
  { 
    icon: Wrench, 
    label: "Serviços", 
    subItems: [
      { icon: Inbox, label: "Manutenção Corretiva", href: "/servicos" },
      { icon: ClipboardList, label: "Ordens de Serviço", href: "/ordens" },
      { icon: CalendarClock, label: "Manutenções Preventivas", href: "/preventivas" },
      { icon: Building2, label: "Ativos e Locais", href: "/ativos" },
      { icon: Users, label: "Técnicos", href: "/prestadores" },
    ]
  },
  { icon: PackageSearch, label: "Estoque", href: "/estoque" },
  { icon: FileText, label: "Documentos", href: "/documentos" },
  { icon: BarChart3, label: "Relatórios", href: "/relatorios" },
];

const adminItems = [
  { icon: Settings, label: "Administração", href: "/admin" },
  { icon: History, label: "Auditoria", href: "/auditoria" },
];

export const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen?: boolean, setMobileMenuOpen?: (v: boolean) => void }) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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
                ? "bg-white/10 text-white font-medium"
                : "text-white/90 hover:bg-white/10 hover:text-white"
            )}
            style={{ width: 'calc(100% - 16px)' }}
          >
            <div className="flex items-center">
              <item.icon className="w-[18px] h-[18px] mr-2.5 opacity-90" />
              {item.label}
            </div>
            {isExpanded ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
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
            ? "bg-white/15 text-white font-medium border-l-4 border-white" 
            : "text-white/90 hover:bg-white/10 hover:text-white",
          isSubItem ? "pl-11 h-10" : ""
        )}
      >
        {!isSubItem && <item.icon className="w-[18px] h-[18px] mr-2.5 opacity-90" />}
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
        
        <nav className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
          <div className="flex flex-col">
            {navItems.map(item => renderLink(item))}
            
            <div className="mt-6 mb-2 px-6 text-[11px] font-semibold text-white/65 uppercase tracking-wider">
              Configurações
            </div>
            {adminItems.map(item => renderLink(item))}
          </div>
        </nav>
      </aside>
    </>
  );
};
