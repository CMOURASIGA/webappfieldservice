import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Request, Unit, Location, Category } from "../types";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { CardFooterActions } from "../components/ui/CardFooterActions";
import { Badge } from "../components/ui/Badge";
import { format, isValid, parseISO } from "date-fns";
import { Plus, Calendar, Wrench } from "lucide-react";
import { MetricButton, OperationalPageHeader } from "../components/ui/OperationalPage";

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
      
      <OperationalPageHeader
        title="Manutenção Corretiva"
        description="Gestão e acompanhamento de solicitações e necessidades."
        backTo="/servicos"
        actions={
          <>
            <Button onClick={() => navigate("/servicos/nova")} className="gap-2"><Plus className="h-4 w-4" /> Nova Manutenção</Button>
            <Button variant="secondary" onClick={() => navigate("/ordens/nova")} className="gap-2"><Wrench className="h-4 w-4" /> Nova OS</Button>
            <Button variant="secondary" onClick={() => navigate("/agenda")} className="gap-2"><Calendar className="h-4 w-4" /> Ver Agenda</Button>
          </>
        }
      />

      {/* Indicadores Acionáveis */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricButton label="Todos" value={stats.total} active={statusFilter === "Todas"} onClick={() => setStatusFilter("Todas")} />
        <MetricButton label="Abertos" value={stats.abertas} active={statusFilter === "Abertas"} onClick={() => setStatusFilter("Abertas")} />
        <MetricButton label="Sem Planejamento" value={stats.emTriagem} active={statusFilter === "Em Triagem"} valueClassName="text-blue-700" onClick={() => setStatusFilter("Em Triagem")} />
        <MetricButton label="Convertidos em OS" value={stats.convertidas} active={statusFilter === "Convertidas"} valueClassName="text-green-700" onClick={() => setStatusFilter("Convertidas")} />
      </div>
      
      {/* Cards Operacionais */}
      <div className="operational-grid">
        {filteredRequests.map(req => (
          <Card key={req.id} className="operational-card flex h-full flex-col">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-900 truncate" title={req.title}>{req.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{req.protocol}</p>
                </div>
                {getStatusBadge(req.status)}
              </div>
              
              <div className="operational-card-fields">
                <div className="operational-card-field">
                  <p className="text-xs text-slate-500">Unidade</p>
                  <p className="font-medium text-slate-700 truncate">{getUnitName(req.unitId)}</p>
                </div>
                <div className="operational-card-field border-r-0">
                  <p className="text-xs text-slate-500">Local</p>
                  <p className="font-medium text-slate-700 truncate">{getLocationName(req.locationId)}</p>
                </div>
                <div className="operational-card-field border-b-0">
                  <p className="text-xs text-slate-500">Data</p>
                  <p className="font-medium text-slate-700">{(isValid(parseISO(req.createdAt)) ? format(parseISO(req.createdAt), 'dd/MM/yyyy') : 'Inválida')}</p>
                </div>
                <div className="operational-card-field border-b-0 border-r-0">
                  <p className="text-xs text-slate-500">Prioridade</p>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(req.suggestedPriority)}`}>
                    {req.suggestedPriority}
                  </span>
                </div>
              </div>
              
              </CardContent>
                <CardFooter className="mt-auto border-t border-slate-200 px-4 py-4">
                <CardFooterActions
                  viewLink={`/servicos/${req.id}`}
                  viewLabel="Abrir"
                >
                  {req.status !== "Convertida em ordem" && (
                    <Button size="sm" className="gap-2" onClick={() => navigate("/ordens/nova", { state: { sourceRequest: req } })}>
                      <Wrench className="h-4 w-4" />
                      Gerar OS
                    </Button>
                  )}
                </CardFooterActions>
              </CardFooter>
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
