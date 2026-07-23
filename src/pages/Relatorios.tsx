import React, { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@cnc-ti/layout-basic";
import { ClipboardList, FileText, Package, Printer, ShieldAlert } from "lucide-react";
import { storageService } from "../services/storageService";
import { getDocumentStatus } from "../utils/documentStatus";
import { getPendingStockRequests, reconcileMaterial, resolveOrderStatusFromMaterials } from "../utils/stock";
import { OperationalPageHeader } from "../components/ui/OperationalPage";
import { printReport } from "../utils/reportExport";

export const Relatorios = () => {
  const summary = useMemo(() => {
    const orders = storageService.get("gsi_work_orders");
    const materials = storageService.get("gsi_stock_materials").map(reconcileMaterial);
    const requests = storageService.get("gsi_stock_requests");
    const documents = storageService.get("gsi_documents");
    const plans = storageService.get("gsi_preventive_plans");
    const movements = storageService.get("gsi_stock_movements");
    const thirtyDaysAgo = new Date(Date.now() - 86400000 * 30);

    return {
      openOrders: orders.filter((order) => {
        const status = resolveOrderStatusFromMaterials(order);
        return status !== "Concluída" && status !== "Cancelada";
      }).length,
      criticalMaterials: materials.filter((material) => (material.physicalBalance - material.reservedBalance) <= material.minStock).length,
      pendingRequests: getPendingStockRequests(requests).length,
      criticalDocuments: documents.filter((document) => {
        const status = getDocumentStatus(document);
        return status === "Crítico" || status === "Vencido";
      }).length,
      stockValue: materials.reduce((total, material) => total + Number(material.physicalBalance || 0) * Number(material.unitPrice || 0), 0),
      monthlyConsumption: movements.filter((movement) => movement.type === "Saída" && new Date(movement.date) >= thirtyDaysAgo).reduce((total, movement) => total + Number(movement.quantity || 0), 0),
      plansOverdue: plans.filter((plan) => new Date(plan.nextExecution) < new Date()).length,
      plansByType: [...new Set(plans.map((plan) => plan.type))].map((type) => `${type}: ${plans.filter((plan) => plan.type === type).length}`),
      plansByPeriodicity: [...new Set(plans.map((plan) => plan.periodicity))].map((periodicity) => `${periodicity}: ${plans.filter((plan) => plan.periodicity === periodicity).length}`),
      preventiveEstimatedCost: plans.reduce((total, plan) => total + Number(plan.estimatedValue || 0), 0),
      documentsValid: documents.filter((document) => getDocumentStatus(document) === "Vigente").length,
      totalDocuments: documents.length,
      documentsByType: [...new Set(documents.map((document) => document.type))].map((type) => `${type}: ${documents.filter((document) => document.type === type).length}`),
      documentsByResponsible: [...new Set(documents.map((document) => document.responsibleId).filter(Boolean))].map((responsibleId) => `${storageService.get("gsi_users").find((user) => user.id === responsibleId)?.name || responsibleId}: ${documents.filter((document) => document.responsibleId === responsibleId).length}`),
    };
  }, []);

  const cards = [
    {
      title: "Ordens em andamento",
      value: summary.openOrders,
      icon: ClipboardList,
      description: "Ordens que ainda exigem ação operacional.",
      colorClass: "text-blue-700 bg-blue-50",
    },
    {
      title: "Materiais críticos",
      value: summary.criticalMaterials,
      icon: Package,
      description: "Itens abaixo do mínimo ou em reposição necessária.",
      colorClass: "text-orange-700 bg-orange-50",
    },
    {
      title: "Solicitações pendentes",
      value: summary.pendingRequests,
      icon: FileText,
      description: "Solicitações de estoque ainda não concluídas.",
      colorClass: "text-slate-700 bg-slate-100",
    },
    {
      title: "Documentos críticos",
      value: summary.criticalDocuments,
      icon: ShieldAlert,
      description: "Documentos vencidos ou em janela crítica.",
      colorClass: "text-red-700 bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      <OperationalPageHeader
        title="Relatórios"
        description="Leitura gerencial do estado atual do sistema com dados reais."
        backTo="/"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title} className="border-slate-300 shadow-sm">
            <CardContent className="min-h-40 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${card.colorClass}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <span className="text-3xl font-bold text-slate-900">{card.value}</span>
              </div>
              <h2 className="font-semibold text-slate-900">{card.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold text-slate-900">Relatórios para apresentação</h2></CardHeader>
        <CardContent className="grid gap-3 p-5 pt-0 md:grid-cols-3">
          <button className="flex items-center justify-center gap-2 rounded-lg border-2 border-slate-400 bg-white px-4 py-3 text-sm font-semibold text-brand-900 hover:bg-brand-050" onClick={() => printReport("Relatório de Estoque", "Posição, consumo e reposição dos últimos 30 dias.", [{ label: "Valor estimado em estoque", value: summary.stockValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) }, { label: "Itens críticos", value: summary.criticalMaterials }, { label: "Saídas nos últimos 30 dias", value: summary.monthlyConsumption }, { label: "Solicitações pendentes", value: summary.pendingRequests }])}><Printer className="h-4 w-4" /> Estoque em PDF</button>
          <button className="flex items-center justify-center gap-2 rounded-lg border-2 border-slate-400 bg-white px-4 py-3 text-sm font-semibold text-brand-900 hover:bg-brand-050" onClick={() => printReport("Relatório de Manutenções", "Situação dos planos preventivos e ordens operacionais.", [{ label: "OS em andamento", value: summary.openOrders }, { label: "Planos atrasados", value: summary.plansOverdue }, { label: "Custo preventivo estimado", value: summary.preventiveEstimatedCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) }, { label: "Distribuição por tipo", value: summary.plansByType.join(" | ") || "Sem dados" }, { label: "Distribuição por periodicidade", value: summary.plansByPeriodicity.join(" | ") || "Sem dados" }])}><Printer className="h-4 w-4" /> Manutenções em PDF</button>
          <button className="flex items-center justify-center gap-2 rounded-lg border-2 border-slate-400 bg-white px-4 py-3 text-sm font-semibold text-brand-900 hover:bg-brand-050" onClick={() => printReport("Relatório de Conformidade", "Visão dos documentos regulatórios e prazos de validade.", [{ label: "Documentos vigentes", value: summary.documentsValid }, { label: "Documentos críticos", value: summary.criticalDocuments }, { label: "Total de documentos", value: summary.totalDocuments }, { label: "Por tipo", value: summary.documentsByType.join(" | ") || "Sem dados" }, { label: "Por responsável", value: summary.documentsByResponsible.join(" | ") || "Sem dados" }, { label: "Situação geral", value: summary.criticalDocuments ? "Atenção necessária" : "Conforme" }])}><Printer className="h-4 w-4" /> Conformidade em PDF</button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Escopo atual</h2>
        </CardHeader>
        <CardContent className="space-y-2 p-5 pt-0 text-sm text-slate-600">
          <p>Esta tela apresenta números reais para acompanhamento rápido.</p>
          <p>Os botões acima abrem uma versão pronta para impressão. No navegador, selecione “Salvar como PDF” para gerar o arquivo.</p>
        </CardContent>
      </Card>
    </div>
  );
};
