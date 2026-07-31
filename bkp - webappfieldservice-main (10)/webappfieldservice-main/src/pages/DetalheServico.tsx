import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Request, Unit, Location, Category, User, WorkOrder } from "../types";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../contexts/AuthContext";

export const DetalheServico = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [request, setRequest] = useState<Request | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const reqs = storageService.get("gsi_requests");
    const found = reqs.find(r => r.id === id);
    if (found) setRequest(found);
    
    setUnits(storageService.get("gsi_units"));
    setLocations(storageService.get("gsi_locations"));
    setCategories(storageService.get("gsi_categories"));
    setUsers(storageService.get("gsi_users"));
  }, [id]);

  if (!request) return <div className="p-6">Manutenção não encontrada.</div>;

  const getUnitName = (uid: string) => units.find(u => u.id === uid)?.name || "N/A";
  const getLocationName = (lid: string) => locations.find(l => l.id === lid)?.name || "N/A";
  const getCategoryName = (cid: string) => categories.find(c => c.id === cid)?.name || "N/A";
  const getUserName = (uid: string) => users.find(u => u.id === uid)?.name || "N/A";

  const handleConvert = () => {
    if (!currentUser) return;

    const newOs: WorkOrder = {
      id: crypto.randomUUID(),
      number: `OS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      requestId: request.id,
      unitId: request.unitId,
      locationId: request.locationId,
      type: "Corretiva",
      categoryId: request.categoryId,
      priority: request.suggestedPriority,
      technicalDescription: request.description,
      status: "Planejada",
      checklist: [],
      observations: "",
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
    };

    const orders = storageService.get("gsi_work_orders");
    orders.push(newOs);
    storageService.set("gsi_work_orders", orders);

    const reqs = storageService.get("gsi_requests");
    const idx = reqs.findIndex(r => r.id === request.id);
    if (idx !== -1) {
      reqs[idx].status = "Convertida em ordem";
      reqs[idx].updatedAt = new Date().toISOString();
      storageService.set("gsi_requests", reqs);
    }

    storageService.logAudit(currentUser.id, "Manutenção convertida em OS", request.id, "Request", request.status, "Convertida em ordem");
    storageService.logAudit(currentUser.id, "OS Criada a partir de Manutenção Corretiva", newOs.id, "WorkOrder");

    navigate(`/ordens/${newOs.id}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Manutenção: {request.protocol}</h1>
          <p className="text-sm text-slate-500">Detalhes da solicitação.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/servicos")}>Voltar</Button>
          {request.status !== "Convertida em ordem" && (
            <Button onClick={handleConvert}>Converter em OS</Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>{request.title}</CardTitle>
            <Badge variant={request.status === 'Convertida em ordem' ? 'success' : 'info'}>{request.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Solicitante</p>
              <p className="text-sm text-slate-900">{getUserName(request.solicitanteId)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Data</p>
              <p className="text-sm text-slate-900">{new Date(request.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Unidade</p>
              <p className="text-sm text-slate-900">{getUnitName(request.unitId)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Local / Ambiente</p>
              <p className="text-sm text-slate-900">{getLocationName(request.locationId)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Categoria</p>
              <p className="text-sm text-slate-900">{getCategoryName(request.categoryId)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Prioridade Sugerida</p>
              <p className="text-sm text-slate-900">{request.suggestedPriority}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Descrição</p>
            <div className="bg-slate-50 p-4 rounded-md border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap">
              {request.description}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
