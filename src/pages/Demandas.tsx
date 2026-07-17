import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Request, Unit, Location, Category } from "../types";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { format, parseISO } from "date-fns";

export const Demandas = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setRequests(storageService.get("gsi_requests").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setUnits(storageService.get("gsi_units"));
    setLocations(storageService.get("gsi_locations"));
    setCategories(storageService.get("gsi_categories"));
  }, []);

  const getUnitName = (id: string) => units.find(u => u.id === id)?.name || "N/A";
  const getLocationName = (id: string) => locations.find(l => l.id === id)?.name || "N/A";
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "N/A";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aberta": return <Badge variant="info">Aberta</Badge>;
      case "Em triagem": return <Badge variant="warning">Em triagem</Badge>;
      case "Convertida em ordem": return <Badge variant="success">Convertida em OS</Badge>;
      case "Rejeitada": return <Badge variant="danger">Rejeitada</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Demandas</h1>
          <p className="text-sm text-slate-500">Acompanhamento e triagem de solicitações.</p>
        </div>
        <Link to="/demandas/nova">
          <Button>Nova Demanda</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200">Protocolo</th>
                  <th className="px-6 py-4 border-b border-slate-200">Unidade</th>
                  <th className="px-6 py-4 border-b border-slate-200">Local</th>
                  <th className="px-6 py-4 border-b border-slate-200">Categoria</th>
                  <th className="px-6 py-4 border-b border-slate-200">Título</th>
                  <th className="px-6 py-4 border-b border-slate-200">Data</th>
                  <th className="px-6 py-4 border-b border-slate-200">Status</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{req.protocol}</td>
                    <td className="px-6 py-4 text-slate-600">{getUnitName(req.unitId)}</td>
                    <td className="px-6 py-4 text-slate-600">{getLocationName(req.locationId)}</td>
                    <td className="px-6 py-4 text-slate-600">{getCategoryName(req.categoryId)}</td>
                    <td className="px-6 py-4 text-slate-900 truncate max-w-[200px]">{req.title}</td>
                    <td className="px-6 py-4 text-slate-600">{format(parseISO(req.createdAt), 'dd/MM/yyyy')}</td>
                    <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/demandas/${req.id}`}>
                        <Button variant="ghost" size="sm">Ver</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                      Nenhuma demanda encontrada.
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
