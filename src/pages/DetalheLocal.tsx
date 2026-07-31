import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Location, Asset, Request, WorkOrder, PreventivePlan, Document, Unit } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ArrowLeft, MapPin, Box, Activity, AlertTriangle, FileText, CheckCircle } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";

export const DetalheLocal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [location, setLocation] = useState<Location | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [plans, setPlans] = useState<PreventivePlan[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);

  useEffect(() => {
    if (!id) return;
    
    const locObj = storageService.get("gsi_locations").find(l => l.id === id);
    if (!locObj) return;
    
    setLocation(locObj);
    setUnit(storageService.get("gsi_units").find(u => u.id === locObj.unitId) || null);
    
    setAssets(storageService.get("gsi_assets").filter(a => a.locationId === id));
    
    // Some logic for linked demands/orders: either directly by locationId, or through assets in this location
    const assetIds = storageService.get("gsi_assets").filter(a => a.locationId === id).map(a => a.id);
    
    setRequests(storageService.get("gsi_requests").filter(r => r.unitId === locObj.unitId && (assetIds.includes(r.assetId || "") || r.title.includes(locObj.name)))); 
    setOrders(storageService.get("gsi_work_orders").filter(o => o.locationId === id || assetIds.includes(o.assetId || "")));
    setPlans(storageService.get("gsi_preventive_plans").filter(p => p.locationId === id || assetIds.includes(p.assetId || "")));
    setDocs(storageService.get("gsi_documents").filter(d => d.locationId === id || assetIds.includes(d.assetId || "")));
    
  }, [id]);

  if (!location) return <div>Carregando...</div>;

  const openOrders = orders.filter(o => o.status !== "Concluída" && o.status !== "Cancelada");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="page-title-panel mb-8 flex items-center gap-4">
        <Button  variant="ghost" className="p-2" onClick={() => navigate(-1)}>
              <ArrowLeft  className="w-5 h-5" />
            </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-semibold text-slate-900">{location.name}</h1>
            <Badge variant={location.active ? 'success' : 'default'}>{location.active ? 'Ativo' : 'Inativo'}</Badge>
            <Badge className="bg-slate-100 text-slate-700">{location.code}</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-4">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {unit?.name}</span>
            <span className="flex items-center gap-1"><Box className="w-3.5 h-3.5"/> {location.type}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-2 h-full">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
              <Box className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 font-medium">Ativos Vinculados</p>
            <p className="font-semibold text-lg">{assets.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-2 h-full">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
              <Activity className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 font-medium">Ordens em Aberto</p>
            <p className="font-semibold text-lg">{openOrders.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-2 h-full">
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-1">
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 font-medium">Planos Preventivos</p>
            <p className="font-semibold text-lg">{plans.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-2 h-full">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-1">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 font-medium">Documentos</p>
            <p className="font-semibold text-lg">{docs.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ativos no Local</CardTitle>
            </CardHeader>
            <CardContent>
              {assets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {assets.map(a => (
                    <div key={a.id} className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <Link to={`/ativos/${a.id}`} className="font-medium text-brand-600 hover:text-brand-800 text-sm">{a.name}</Link>
                        <Badge variant="default" className="text-[10px]">{a.status}</Badge>
                      </div>
                      <p className="text-xs text-slate-500">{a.code} • {a.category}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 py-4">Nenhum ativo vinculado a este local.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Últimas Ordens de Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <ul className="space-y-3">
                  {orders.slice(0, 5).map(o => (
                    <li key={o.id} className="border border-slate-200 rounded p-3 flex justify-between items-center">
                      <div>
                        <Link to={`/ordens/${o.id}`} className="font-medium text-slate-800 hover:text-brand-600 text-sm">{o.number} - {o.type}</Link>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{o.technicalDescription}</p>
                      </div>
                      <Badge variant={o.status === 'Concluída' ? 'success' : o.status === 'Cancelada' ? 'default' : 'warning'} className="text-[10px]">
                        {o.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 py-4">Nenhuma ordem registrada neste local.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estrutura Física</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Área</p>
                <p className="text-sm font-medium">{location.area || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Pavimento / Andar</p>
                <p className="text-sm font-medium">{location.floor || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Ambiente</p>
                <p className="text-sm font-medium">{location.environment || '-'}</p>
              </div>
              {location.description && (
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Descrição</p>
                  <p className="text-sm">{location.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              {docs.length > 0 ? (
                <ul className="space-y-3">
                  {docs.map(d => (
                    <li key={d.id} className="text-sm border border-slate-200 rounded p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-800 line-clamp-1">{d.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{d.status}</p>
                      </div>
                      <Link to={`/documentos/${d.id}`}><Button variant="ghost" size="sm" className="p-1"><FileText className="w-4 h-4 text-brand-600"/></Button></Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Nenhum documento vinculado.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
