import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Menu } from "lucide-react";

export const Header = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { currentUser, users, switchUser } = useAuth();

  return (
    <header className="sticky top-0 z-10 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button 
          className="md:hidden p-1.5 -ml-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-slate-500 hidden sm:inline-block">Gestão de Manutenção Predial</span>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Only show first two letters of roles on mobile to save space, or hide it if very small */}
        <div className="flex items-center bg-slate-100 rounded-full h-8 sm:h-9 p-1 overflow-x-auto max-w-[150px] sm:max-w-full no-scrollbar">
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => switchUser(u.id)}
              className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full transition-colors whitespace-nowrap ${
                currentUser?.id === u.id ? "bg-brand-900 text-white font-medium" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {u.role.split(' ')[0]} {/* Abbreviate for mobile */}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-4">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-900 font-bold text-xs sm:text-sm">
            {currentUser?.name.charAt(0)}
          </div>
          <div className="flex flex-col hidden lg:flex">
            <span className="text-sm font-semibold text-slate-900 leading-tight">{currentUser?.name}</span>
            <span className="text-[11px] text-slate-500">{currentUser?.unitId === 'u-df' ? 'Brasília' : currentUser?.unitId === 'u-rj' ? 'Rio de Janeiro' : 'Todas as Unidades'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
