import React, { useState, useEffect } from "react";
import { storageService } from "../services/storageService";
import { StockMaterial, Unit } from "../types";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import { Search, Package, AlertTriangle, XOctagon, Plus, PackageOpen } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

export const Estoque = () => {
  const { currentUser } = useAuth();
  const [materials, setMaterials] = useState<StockMaterial[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [unitFilter, setUnitFilter] = useState(currentUser?.unitId || "");

  const loadData = () => {
    setMaterials(storageService.get("gsi_stock_materials"));
    setUnits(storageService.get("gsi_units"));
  };

  useEffect(() => {
    loadData();
  }, []);

  const getUnitName = (id: string) => units.find(u => u.id === id)?.name || id;

  const filteredMaterials = materials.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        m.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "Todos" || m.status === statusFilter;
    const matchUnit = !unitFilter || m.unitId === unitFilter;
    return matchSearch && matchStatus && matchUnit;
  });

  const stats = {
    total: materials.length,
    normal: materials.filter(m => m.status === "Normal").length,
    atencao: materials.filter(m => m.status === "Atenção").length,
    critico: materials.filter(m => m.status === "Crítico").length,
    semSaldo: materials.filter(m => m.status === "Sem saldo").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Normal": return <Badge variant="success">Normal</Badge>;
      case "Atenção": return <Badge variant="warning">Atenção</Badge>;
      case "Crítico": return <Badge variant="default" className="bg-orange-500 text-white border-orange-500">Crítico</Badge>;
      case "Sem saldo": return <Badge variant="default">Sem saldo</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Estoque e Materiais</h1>
          <p className="text-sm text-slate-500">Gestão de materiais para manutenção.</p>
        </div>
        <div className="flex gap-2">
          {/* We will implement FilaEstoque later */}
          <Link to="/estoque/fila">
            <Button variant="secondary" className="flex items-center gap-2">
              <PackageOpen className="w-4 h-4" />
              Fila de Solicitações
            </Button>
          </Link>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Material
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-brand-500">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm font-medium text-slate-600 mb-1">Total Cadastrados</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <Package className="w-5 h-5 text-slate-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm font-medium text-slate-600 mb-1">Estoque Normal</p>
            <p className="text-2xl font-bold text-slate-900">{stats.normal}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm font-medium text-slate-600 mb-1">Atenção</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-slate-900">{stats.atencao}</p>
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm font-medium text-slate-600 mb-1">Crítico</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-slate-900">{stats.critico}</p>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm font-medium text-slate-600 mb-1">Sem Saldo</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-red-600">{stats.semSaldo}</p>
              <XOctagon className="w-5 h-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Input 
                placeholder="Buscar por nome ou código..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={unitFilter} onChange={e => setUnitFilter(e.target.value)}>
                <option value="">Todas as Unidades</option>
                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="Todos">Todos os Status</option>
                <option value="Normal">Normal</option>
                <option value="Atenção">Atenção</option>
                <option value="Crítico">Crítico</option>
                <option value="Sem saldo">Sem saldo</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200">Código</th>
                  <th className="px-6 py-4 border-b border-slate-200">Material</th>
                  <th className="px-6 py-4 border-b border-slate-200">Unidade/Local</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-right">Saldo Físico</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-right">Reservado</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-right">Disponível</th>
                  <th className="px-6 py-4 border-b border-slate-200">Status</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredMaterials.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{m.code}</td>
                    <td className="px-6 py-4 flex flex-col">
                      <span className="font-medium text-slate-900">{m.name}</span>
                      <span className="text-xs text-slate-500">{m.category}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{getUnitName(m.unitId)}</td>
                    <td className="px-6 py-4 text-right">{m.physicalBalance} {m.unit}</td>
                    <td className="px-6 py-4 text-right text-orange-600">{m.reservedBalance} {m.unit}</td>
                    <td className="px-6 py-4 text-right font-medium text-brand-600">{m.availableBalance} {m.unit}</td>
                    <td className="px-6 py-4">{getStatusBadge(m.status)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" size="sm" className="text-brand-600 h-8 px-2">Ver</Button>
                      <Button variant="ghost" size="sm" className="text-brand-600 h-8 px-2">Movimentar</Button>
                    </td>
                  </tr>
                ))}
                {filteredMaterials.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                      Nenhum material encontrado.
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
