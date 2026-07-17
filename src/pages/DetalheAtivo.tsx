import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Asset, Request, WorkOrder, PreventivePlan, Document, Unit, Location } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ArrowLeft, Wrench, Activity, FileText, AlertTriangle, Clock, MapPin, Tag } from "lucide-react";
import { format, parseISO } from "date-fns";

export const DetalheAtivo = () => {
  const { id } = useParams();
  
  const [asset, setAsset] = useState<Asset | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  
  const [requests, setRequests] = useState<Request[]>([]);
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [plans, setPlans] = useState<PreventivePlan[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);

  useEffect(() => {
    if (!id) return;
    
    const assetObj = storageService.get("gsi_assets").find(a => a.id === id);
    if (!assetObj) return;
    
    setAsset(assetObj);
    setUnit(storageService.get("gsi_units").find(u => u.id === assetObj.unitId) || null);
    setLocation(storageService.get("gsi_locations").find(l => l.id === assetObj.locationId) || null);
    
    setRequests(storageService.get("gsi_requests").filter(r => r.assetId === id || r.title.includes(assetObj.name))); // Title include is a fallback since some demands might not link asset ID correctly
    setOrders(storageService.get("gsi_work_orders").filter(o => o.assetId === id || o.technicalDescription.includes(assetObj.code)));
    setPlans(storageService.get("gsi_preventive_plans").filter(p => p.assetId === id));
    setDocs(storageService.get("gsi_documents").filter(d => d.assetId === id));
    
  }, [id]);

  if (!asset) return <div>Carregando...</div>;

  const lastOrder = [...orders].sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
  const nextPlan = [...plans].sort((a,b) => new Date(a.nextExecution).getTime() - new Date(b.nextExecution).getTime())[0];

  // Timeline events
  const timeline = [
    ...requests.map(r => ({ date: r.createdAt, type: 'Demanda', title: r.title, link: `/demandas/${r.id}`, status: r.status })),
    ...orders.map(o => ({ date: o.createdAt, type: 'Ordem', title: o.technicalDescription, link: `/ordens/${o.id}`, status: o.status }))
  ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/ativos">
          <Button variant="ghost" className="p-2"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-semibold text-slate-900">{asset.name}</h1>
            <Badge variant={asset.status === 'Ativo' ? 'success' : asset.status === 'Em manutenção' ? 'warning' : 'default'}>{asset.status}</Badge>
            <Badge className="bg-slate-100 text-slate-700">{asset.code}</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-4">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {unit?.name} {location ? `• ${location.name}` : ''}</span>
            <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5"/> {asset.category}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-2 h-full">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
              <Wrench className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 font-medium">Última Intervenção</p>
            <p className="font-semibold text-sm">{lastOrder ? format(parseISO(lastOrder.updatedAt), 'dd/MM/yyyy') : 'Nenhuma'}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-2 h-full">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 font-medium">Próxima Preventiva</p>
            <p className="font-semibold text-sm">{nextPlan ? format(parseISO(nextPlan.nextExecution), 'dd/MM/yyyy') : 'Não programada'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-2 h-full">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-1">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 font-medium">Total de Demandas</p>
            <p className="font-semibold text-lg">{requests.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-2 h-full">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-1">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 font-medium">Documentos Vinculados</p>
            <p className="font-semibold text-lg">{docs.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              {timeline.length > 0 ? (
                <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pb-4 mt-2">
                  {timeline.map((evt, i) => (
                    <div key={i} className="relative pl-6">
                      <div className={`absolute w-3 h-3 rounded-full -left-[7px] top-1.5 border-2 border-white ${evt.type === 'Ordem' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm text-slate-900">{evt.type}</span>
                          <span className="text-xs text-slate-500">{format(parseISO(evt.date), 'dd/MM/yyyy HH:mm')}</span>
                        </div>
                        <p className="text-sm text-slate-700 line-clamp-2">{evt.title}</p>
                        <div className="flex justify-between items-end mt-3">
                          <Badge variant="default" className="text-[10px]">{evt.status}</Badge>
                          <Link to={evt.link} className="text-xs font-medium text-brand-600 hover:text-brand-800">Ver detalhes →</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 py-4">Nenhum evento registrado para este ativo.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes Técnicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Fabricante / Modelo</p>
                <p className="text-sm font-medium">{asset.manufacturer || '-'} {asset.model ? ` / ${asset.model}` : ''}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Nº Patrimônio</p>
                <p className="text-sm font-medium">{asset.patrimonyNumber || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Criticidade</p>
                <p className="text-sm font-medium">{asset.criticality}</p>
              </div>
              {asset.observations && (
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Observações</p>
                  <p className="text-sm">{asset.observations}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Planos Preventivos</CardTitle>
            </CardHeader>
            <CardContent>
              {plans.length > 0 ? (
                <ul className="space-y-3">
                  {plans.map(p => (
                    <li key={p.id} className="text-sm border border-slate-200 rounded p-3">
                      <p className="font-medium text-slate-800">{p.code}</p>
                      <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                        <span className="text-[10px] uppercase text-slate-500 font-semibold">{p.periodicity}</span>
                        <span className="text-xs text-slate-700">Prox: {format(parseISO(p.nextExecution), 'dd/MM/yyyy')}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Nenhum plano vinculado.</p>
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
                        <p className="font-medium text-slate-800">{d.title}</p>
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
