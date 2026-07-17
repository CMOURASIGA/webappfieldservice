import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { storageService } from "../services/storageService";
import { WorkOrder, Unit, Location, Category, User } from "../types";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { format, parseISO } from "date-fns";

export const Ordens = () => {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setOrders(storageService.get("gsi_work_orders").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setUnits(storageService.get("gsi_units"));
    setLocations(storageService.get("gsi_locations"));
    setCategories(storageService.get("gsi_categories"));
    setUsers(storageService.get("gsi_users"));
  }, []);

  const getUnitName = (id: string) => units.find(u => u.id === id)?.name || "N/A";
  const getLocationName = (id: string) => locations.find(l => l.id === id)?.name || "N/A";
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "N/A";
  const getUserName = (id?: string) => users.find(u => u.id === id)?.name || "Não atribuído";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Em execução": return <Badge variant="info">{status}</Badge>;
      case "Concluída": return <Badge variant="success">{status}</Badge>;
      case "Aguardando terceiro":
      case "Pausada": return <Badge variant="warning">{status}</Badge>;
      case "Cancelada": return <Badge variant="danger">{status}</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Ordens de Serviço</h1>
          <p className="text-sm text-slate-500">Acompanhamento e execução de serviços.</p>
        </div>
        <Link to="/ordens/nova">
          <Button>Nova OS</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200">Número</th>
                  <th className="px-6 py-4 border-b border-slate-200">Unidade/Local</th>
                  <th className="px-6 py-4 border-b border-slate-200">Tipo/Categoria</th>
                  <th className="px-6 py-4 border-b border-slate-200">Responsável</th>
                  <th className="px-6 py-4 border-b border-slate-200">Prazo</th>
                  <th className="px-6 py-4 border-b border-slate-200">Status</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map(os => (
                  <tr key={os.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{os.number}</td>
                    <td className="px-6 py-4 text-slate-600 flex flex-col">
                      <span>{getUnitName(os.unitId)}</span>
                      <span className="text-xs text-slate-400">{getLocationName(os.locationId)}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 flex flex-col">
                      <span>{os.type}</span>
                      <span className="text-xs text-slate-400">{getCategoryName(os.categoryId)}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-900">{getUserName(os.responsibleId)}</td>
                    <td className="px-6 py-4 text-slate-600">{os.deadline ? format(parseISO(os.deadline), 'dd/MM/yyyy') : '-'}</td>
                    <td className="px-6 py-4">{getStatusBadge(os.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/ordens/${os.id}`}>
                        <Button variant="ghost" size="sm">Ver</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      Nenhuma ordem de serviço encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
