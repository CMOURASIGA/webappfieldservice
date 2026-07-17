import React, { useEffect, useState } from "react";
import { storageService } from "../services/storageService";
import { AuditLog, User } from "../types";
import { Card, CardContent } from "../components/ui/Card";

export const Auditoria = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const allLogs = storageService.get("gsi_audit_log");
    setLogs(allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    setUsers(storageService.get("gsi_users"));
  }, []);

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Trilha de Auditoria</h1>
          <p className="text-sm text-slate-500">Registro histórico das ações críticas realizadas no sistema.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200">Data e Hora</th>
                  <th className="px-6 py-4 border-b border-slate-200">Usuário</th>
                  <th className="px-6 py-4 border-b border-slate-200">Ação</th>
                  <th className="px-6 py-4 border-b border-slate-200">Entidade / Registro</th>
                  <th className="px-6 py-4 border-b border-slate-200">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{getUserName(log.userId)}</td>
                    <td className="px-6 py-4 text-slate-900">{log.action}</td>
                    <td className="px-6 py-4 text-slate-600 flex flex-col">
                      <span>{log.entityType || '-'}</span>
                      <span className="text-xs text-slate-400 font-mono">{log.entityId || ''}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {log.oldValue && log.newValue ? `${log.oldValue} -> ${log.newValue}` : (log.newValue || log.oldValue || '-')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
