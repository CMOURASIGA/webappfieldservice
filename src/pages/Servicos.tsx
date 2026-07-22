import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Request, Unit, Location, Category } from "../types";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { format, isValid, parseISO } from "date-fns";
import { Plus, Calendar, Wrench, Search, Clock, AlertCircle } from "lucide-react";

export const Servicos = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("Todas");

  useEffect(() => {
    setRequests(storageService.get("gsi_requests").sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgente": return "text-red-600 bg-red-100";
      case "Alta": return "text-orange-600 bg-orange-100";
      case "Média": return "text-blue-600 bg-blue-100";
      default: return "text-slate-600 bg-slate-100";
    }
  };

  const stats = {
    total: requests.length,
    abertas: requests.filter(r => r.status === "Aberta" || r.status === "Rascunho").length,
    emTriagem: requests.filter(r => r.status === "Em triagem" || r.status === "Aguardando informação").length,
    convertidas: requests.filter(r => r.status === "Convertida em ordem").length,
    rejeitadas: requests.filter(r => r.status === "Rejeitada").length,
  };

  const filteredRequests = statusFilter === "Todas"
    ? requests
    : statusFilter === "Abertas" ? requests.filter(r => r.status === "Aberta" || r.status === "Rascunho")
    : statusFilter === "Em Triagem" ? requests.filter(r => r.status === "Em triagem" || r.status === "Aguardando informação")
    : statusFilter === "Convertidas" ? requests.filter(r => r.status === "Convertida em ordem")
    : requests.filter(r => r.status === "Rejeitada");

  return (
    <div className="space-y-6">
      
      {/* Ações Rápidas no Topo */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => navigate("/servicos/nova")} className="gap-2">
          <Plus className="w-4 h-4" /> Nova Manutenção
        </Button>
        <Button variant="outline" onClick={() => navigate("/preventivas/nova")} className="gap-2">
          <Calendar className="w-4 h-4" /> Nova Preventiva
        </Button>
        <Button variant="outline" onClick={() => navigate("/ordens/nova")} className="gap-2">
          <Wrench className="w-4 h-4" /> Nova OS
        </Button>
        <Button variant="outline" onClick={() => navigate("/agenda")} className="gap-2">
          <Calendar className="w-4 h-4" /> Ver Agenda
        </Button>
      </div>

      <div>
        <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Manutenção Corretiva</h1>
        <p className="text-sm text-slate-500">Gestão e acompanhamento de solicitações e necessidades.</p>
      </div>

      {/* Indicadores Acionáveis */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button onClick={() => setStatusFilter("Todas")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Todas" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Todos</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </button>
        <button onClick={() => setStatusFilter("Abertas")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Abertas" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Abertos</p>
          <p className="text-2xl font-bold text-slate-900">{stats.abertas}</p>
        </button>
        <button onClick={() => setStatusFilter("Em Triagem")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Em Triagem" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Sem Planejamento</p>
          <p className="text-2xl font-bold text-blue-600">{stats.emTriagem}</p>
        </button>
        <button onClick={() => setStatusFilter("Convertidas")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Convertidas" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Convertidos em OS</p>
          <p className="text-2xl font-bold text-green-600">{stats.convertidas}</p>
        </button>
      </div>
      
      {/* Cards Operacionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredRequests.map(req => (
          <Card key={req.id} className="hover:border-brand-300 transition-colors">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-900 truncate" title={req.title}>{req.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{req.protocol}</p>
                </div>
                {getStatusBadge(req.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Unidade</p>
                  <p className="font-medium text-slate-700 truncate">{getUnitName(req.unitId)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Local</p>
                  <p className="font-medium text-slate-700 truncate">{getLocationName(req.locationId)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Data</p>
                  <p className="font-medium text-slate-700">{(isValid(parseISO(req.createdAt)) ? format(parseISO(req.createdAt), 'dd/MM/yyyy') : 'Inválida')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Prioridade</p>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(req.suggestedPriority)}`}>
                    {req.suggestedPriority}
                  </span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => navigate(`/servicos/${req.id}`)}>
                  Abrir
                </Button>
                {req.status !== "Convertida em ordem" && (
                  <Button variant="default" className="flex-1" onClick={() => navigate("/ordens/nova")}>
                    Gerar OS
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredRequests.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-lg">
             <p className="text-slate-500">Nenhuma manutenção encontrado para o filtro atual.</p>
          </div>
        )}
      </div>

    </div>
  );
};
