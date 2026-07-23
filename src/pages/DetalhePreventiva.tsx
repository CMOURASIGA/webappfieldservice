import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { PreventivePlan, Unit, Asset, Location, User, Provider, Category, ChecklistItem } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@cnc-ti/layout-basic";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ArrowLeft, Edit, Clock, Settings, FileText, CheckSquare, Wrench, Trash2, PowerOff } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const DetalhePreventiva = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<PreventivePlan | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [responsible, setResponsible] = useState<User | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const planObj = storageService.get("gsi_preventive_plans").find(p => p.id === id);
    if (!planObj) return;

    setPlan(planObj);
    setUnit(storageService.get("gsi_units").find(u => u.id === planObj.unitId) || null);
    
    if (planObj.assetId) {
      setAsset(storageService.get("gsi_assets").find(a => a.id === planObj.assetId) || null);
    }
    if (planObj.locationId) {
      setLocation(storageService.get("gsi_locations").find(l => l.id === planObj.locationId) || null);
    }
    
    setCategory(storageService.get("gsi_categories").find(c => c.id === planObj.categoryId) || null);
    
    if (planObj.responsibleId) {
      setResponsible(storageService.get("gsi_users").find(u => u.id === planObj.responsibleId) || null);
    }
    if (planObj.providerId) {
      setProvider(storageService.get("gsi_providers").find(p => p.id === planObj.providerId) || null);
    }

  }, [id]);

  if (!plan) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700">
            <ArrowLeft  className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Manutenção não encontrada</h1>
        </div>
      </div>
    );
  }

  const getStatusBadge = (nextExecution: string | undefined, status: string | undefined) => {
    if (status === "Inativo") return <Badge variant="default">Inativo</Badge>;
    if (!nextExecution) return <Badge variant="default">Sem data</Badge>;
    
    const nextDate = parseISO(nextExecution);
    if (!isValid(nextDate)) return <Badge variant="default">Data Inválida</Badge>;

    const today = new Date();
    today.setHours(0,0,0,0);
    const dateToCheck = new Date(nextDate);
    dateToCheck.setHours(0,0,0,0);

    const diffTime = dateToCheck.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <Badge className="bg-red-500 hover:bg-red-600">Atrasado ({Math.abs(diffDays)} dias)</Badge>;
    } else if (diffDays <= 7) {
      return <Badge className="bg-amber-500 hover:bg-amber-600">Próximo ({diffDays} dias)</Badge>;
    }
    return <Badge className="bg-green-500 hover:bg-green-600">Em dia</Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = parseISO(dateString);
    if (!isValid(date)) return "-";
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  const handleDelete = () => {
    const plans = storageService.get("gsi_preventive_plans");
    storageService.set("gsi_preventive_plans", plans.map(p => p.id === id ? { ...p, status: 'Inativo' as 'Ativo' | 'Inativo' } : p));
    navigate("/preventivas");
  };

  return (
    <div className="space-y-6">
      <div className="page-title-panel flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button  variant="secondary" size="sm" className="p-2" onClick={() => navigate(-1)}>
              <ArrowLeft  className="w-4 h-4" />
            </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">{plan.code}</h1>
              {getStatusBadge(plan.nextExecution, plan.status)}
            </div>
            <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/preventivas/${id}/editar`}><Button variant="secondary"><Edit className="w-4 h-4 mr-2" /> Editar</Button></Link>
          <Button variant="secondary" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setIsDeleteDialogOpen(true)}>
            <PowerOff className="w-4 h-4 mr-2" /> Inativar
          </Button>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar inativação</DialogTitle>
                <DialogDescription>
                  Deseja realmente inativar este plano preventivo? O registro será mantido no histórico e deixará de ficar disponível para novos vínculos.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancelar</Button>
                </DialogClose>
                <Button 
                  variant="primary" 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    handleDelete();
                    setIsDeleteDialogOpen(false);
                  }}
                >
                  Confirmar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-brand-600" />
                Informações Principais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-500">Unidade</p>
                  <p className="font-medium">{unit?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Categoria</p>
                  <p className="font-medium">{category?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Local</p>
                  <p className="font-medium">{location?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Ativo</p>
                  <p className="font-medium">{asset ? `${asset.code} - ${asset.name}` : "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Periodicidade</p>
                  <p className="font-medium capitalize">{plan.periodicity}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Tipo</p>
                  <p className="font-medium">{plan.type || "Preventiva"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-brand-600" />
                Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plan.checklist && plan.checklist.length > 0 ? (
                <div className="space-y-3">
                  {plan.checklist.map((item: ChecklistItem, index: number) => (
                    <div key={item.id || index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="mt-0.5">
                        <div className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center bg-white">
                          <CheckSquare className="w-3 h-3 text-slate-300" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.description}</p>
                        {item.required && <Badge variant="default" className="mt-1 text-[10px]">Obrigatório</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500">
                  <p>Nenhum item de checklist configurado neste plano.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-600" />
                Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Próxima Execução</p>
                <p className="font-semibold text-lg text-slate-800">{formatDate(plan.nextExecution)}</p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm font-medium text-slate-500">Última Execução</p>
                <p className="font-medium text-slate-700">{formatDate(plan.lastExecution)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-brand-600" />
                Responsáveis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {provider && (
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Prestador de Serviço</p>
                  <div className="bg-slate-50 p-3 rounded border border-slate-100">
                    <p className="font-medium text-slate-800">{provider.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{provider.contactName} • {provider.phone}</p>
                  </div>
                </div>
              )}
              {responsible && (
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Técnico Responsável (GSI)</p>
                  <div className="bg-slate-50 p-3 rounded border border-slate-100">
                    <p className="font-medium text-slate-800">{responsible.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{responsible.email}</p>
                  </div>
                </div>
              )}
              {!provider && !responsible && (
                <p className="text-sm text-slate-500 text-center py-2">
                  Nenhum responsável atribuído a este plano.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
