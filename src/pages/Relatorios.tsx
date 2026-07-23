import React, { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@cnc-ti/layout-basic";
import { ClipboardList, FileText, Package, ShieldAlert } from "lucide-react";
import { storageService } from "../services/storageService";
import { getDocumentStatus } from "../utils/documentStatus";
import { getPendingStockRequests, reconcileMaterial, resolveOrderStatusFromMaterials } from "../utils/stock";
import { OperationalPageHeader } from "../components/ui/OperationalPage";

export const Relatorios = () => {
  const summary = useMemo(() => {
    const orders = storageService.get("gsi_work_orders");
    const materials = storageService.get("gsi_stock_materials").map(reconcileMaterial);
    const requests = storageService.get("gsi_stock_requests");
    const documents = storageService.get("gsi_documents");

    return {
      openOrders: orders.filter((order) => {
        const status = resolveOrderStatusFromMaterials(order);
        return status !== "Concluída" && status !== "Cancelada";
      }).length,
      criticalMaterials: materials.filter((material) => (material.physicalBalance - material.reservedBalance) <= material.minStock).length,
      pendingRequests: getPendingStockRequests(requests).length,
      criticalDocuments: documents.filter((document) => {
        const status = getDocumentStatus(document.expirationDate, document.status);
        return status === "Crítico" || status === "Vencido";
      }).length,
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
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Escopo atual</h2>
        </CardHeader>
        <CardContent className="space-y-2 p-5 pt-0 text-sm text-slate-600">
          <p>Esta tela apresenta números reais para acompanhamento rápido.</p>
          <p>Exportações, PDFs e relatórios analíticos continuam no backlog porque dependem de uma segunda etapa funcional.</p>
        </CardContent>
      </Card>
    </div>
  );
};
