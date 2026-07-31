import React from "react";
import { BellRing, FileWarning, Wrench } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { OperationalPageHeader } from "../components/ui/OperationalPage";
import { storageService } from "../services/storageService";
import { getDocumentStatus } from "../utils/documentStatus";
import { differenceInDays, parseISO } from "date-fns";

export const Alertas = () => {
  const documents = storageService.get("gsi_documents"); const plans = storageService.get("gsi_preventive_plans");
  const documentAlerts = documents.filter((doc: any) => ["Vencido", "Crítico", "Atenção"].includes(getDocumentStatus(doc))).map((doc: any) => ({ id: `doc-${doc.id}`, type: "Documento", title: doc.title, detail: `${getDocumentStatus(doc)} | ${doc.expirationDate ? new Date(doc.expirationDate).toLocaleDateString("pt-BR") : "sem validade"}`, icon: FileWarning }));
  const maintenanceAlerts = plans.filter((plan: any) => { if (!plan.nextExecution) return true; return differenceInDays(parseISO(plan.nextExecution), new Date()) <= (plan.alertDaysAttention ?? 30); }).map((plan: any) => ({ id: `plan-${plan.id}`, type: "Manutenção", title: plan.description, detail: plan.nextExecution ? `Próxima execução: ${new Date(plan.nextExecution).toLocaleDateString("pt-BR")}` : "Plano sem data de próxima execução", icon: Wrench }));
  const alerts = [...documentAlerts, ...maintenanceAlerts];
  return <div className="space-y-6"><OperationalPageHeader title="Central de Alertas" description="Avisos calculados automaticamente a partir dos prazos configurados nos documentos e planos de manutenção." backTo="/" /><section className="rounded-xl border-2 border-brand-300 bg-brand-50 p-4 text-sm text-brand-950"><strong>Regra aplicada:</strong> documentos usam as janelas de atenção e crítico cadastradas; manutenções usam a janela de atenção do plano, com 30 dias como padrão.</section><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{alerts.map((alert: any) => <Card key={alert.id} className="operational-card"><CardContent className="p-4"><div className="flex gap-3"><div className="rounded-lg bg-amber-100 p-2 text-amber-800"><alert.icon className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase text-slate-500">{alert.type}</p><h2 className="font-semibold text-slate-900">{alert.title}</h2><p className="mt-1 text-sm text-slate-600">{alert.detail}</p></div></div></CardContent></Card>)}</div>{alerts.length === 0 && <Card><CardContent className="p-8 text-center"><BellRing className="mx-auto h-8 w-8 text-green-700" /><p className="mt-3 font-semibold text-slate-900">Nenhum alerta ativo</p><p className="text-sm text-slate-600">Os prazos cadastrados estão em situação regular.</p></CardContent></Card>}</div>;
};
