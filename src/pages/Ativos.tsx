import React, { useEffect, useState } from "react";
import { storageService } from "../services/storageService";
import { Asset, Unit, Location } from "../types";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export const Ativos = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    setAssets(storageService.get("gsi_assets"));
    setUnits(storageService.get("gsi_units"));
    setLocations(storageService.get("gsi_locations"));
  }, []);

  const getUnitName = (id: string) => units.find(u => u.id === id)?.name || "N/A";
  const getLocationName = (id: string) => locations.find(l => l.id === id)?.name || "N/A";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ativo": return <Badge variant="success">{status}</Badge>;
      case "Inativo": return <Badge variant="default">{status}</Badge>;
      case "Em manutenção": return <Badge variant="warning">{status}</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Ativos e Locais</h1>
          <p className="text-sm text-slate-500">Gestão do patrimônio predial.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200">Código</th>
                  <th className="px-6 py-4 border-b border-slate-200">Nome / Modelo</th>
                  <th className="px-6 py-4 border-b border-slate-200">Unidade</th>
                  <th className="px-6 py-4 border-b border-slate-200">Local</th>
                  <th className="px-6 py-4 border-b border-slate-200">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {assets.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{asset.code}</td>
                    <td className="px-6 py-4 text-slate-900 flex flex-col">
                      <span>{asset.name}</span>
                      <span className="text-xs text-slate-400">{asset.model || asset.manufacturer || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{getUnitName(asset.unitId)}</td>
                    <td className="px-6 py-4 text-slate-600">{getLocationName(asset.locationId)}</td>
                    <td className="px-6 py-4">{getStatusBadge(asset.status)}</td>
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
