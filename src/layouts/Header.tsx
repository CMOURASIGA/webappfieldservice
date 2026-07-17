import React from "react";
import { useAuth } from "../contexts/AuthContext";

export const Header = () => {
  const { currentUser, users, switchUser } = useAuth();

  return (
    <header className="sticky top-0 z-10 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div className="flex items-center">
        <span className="text-sm font-medium text-slate-500">Gestão de Manutenção Predial</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-slate-100 rounded-full h-9 p-1">
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => switchUser(u.id)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                currentUser?.id === u.id ? "bg-brand-900 text-white font-medium" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {u.role}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-900 font-bold text-sm">
            {currentUser?.name.charAt(0)}
          </div>
          <div className="flex flex-col hidden sm:flex">
            <span className="text-sm font-semibold text-slate-900 leading-tight">{currentUser?.name}</span>
            <span className="text-[11px] text-slate-500">{currentUser?.unitId === 'u-df' ? 'Brasília' : currentUser?.unitId === 'u-rj' ? 'Rio de Janeiro' : 'Todas as Unidades'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
