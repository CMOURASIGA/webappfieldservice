import React, { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@cnc-ti/layout-basic";
import { ClipboardList, FileText, Package, ShieldAlert } from "lucide-react";
import { storageService } from "../services/storageService";
import { getDocumentStatus } from "../utils/documentStatus";
import { getPendingStockRequests, reconcileMaterial, resolveOrderStatusFromMaterials } from "../utils/stock";

export const Relatorios = () => {
  const summary = useMemo(() => {
    const orders = storageService.get("gsi_work_orders");
    const materials = storageService.get("gsi_stock_materials").map(reconcileMaterial);
    const requests = storageService.get("gsi_stock_requests");
    const documents = storageService.get("gsi_documents");

    return {
      openOrders: orders.filter((order) => {
        const status = resolveOrderStatusFromMaterials(order);
        return status !== "ConcluÃ­da" && status !== "Cancelada";
      }).length,
      criticalMaterials: materials.filter((material) => (material.physicalBalance - material.reservedBalance) <= material.minStock).length,
      pendingRequests: getPendingStockRequests(requests).length,
      criticalDocuments: documents.filter((document) => {
        const status = getDocumentStatus(document.expirationDate, document.status);
        return status === "CrÃ­tico" || status === "Vencido";
      }).length,
    };
  }, []);

  const cards = [
    {
      title: "Ordens em andamento",
      value: summary.openOrders,
      icon: ClipboardList,
      description: "Ordens que ainda exigem acao operacional.",
      colorClass: "text-blue-700 bg-blue-50",
    },
    {
      title: "Materiais criticos",
      value: summary.criticalMaterials,
      icon: Package,
      description: "Itens abaixo do minimo ou em reposicao necessaria.",
      colorClass: "text-orange-700 bg-orange-50",
    },
    {
      title: "Solicitacoes pendentes",
      value: summary.pendingRequests,
      icon: FileText,
      description: "Solicitacoes de estoque ainda nao concluidas.",
      colorClass: "text-slate-700 bg-slate-100",
    },
    {
      title: "Documentos criticos",
      value: summary.criticalDocuments,
      icon: ShieldAlert,
      description: "Documentos vencidos ou em janela critica.",
      colorClass: "text-red-700 bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-[22px] font-semibold text-slate-900">Relatorios</h1>
        <p className="text-sm text-slate-500">Leitura gerencial do estado atual do sistema com dados reais do localStorage.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-5">
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
          <p>Esta tela substitui o placeholder antigo e expoe numeros reais do localStorage para acompanhamento rapido.</p>
          <p>Exportacoes, PDFs e relatorios analiticos continuam no backlog porque dependem de uma segunda etapa funcional.</p>
        </CardContent>
      </Card>
    </div>
  );
};

