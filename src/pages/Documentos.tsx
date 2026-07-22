import React, { useState, useEffect } from "react";
import { storageService } from "../services/storageService";
import { Document, Unit } from "../types";
import { Card, CardContent } from "../components/ui/Card";
import { Button, PageHeader, PageHeaderTitle, PageHeaderTitleContent, PageHeaderActionsContainer } from "@cnc-ti/layout-basic";
import { Badge } from "../components/ui/Badge";
import { FileText, AlertTriangle, Plus, Search, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { getDocumentStatus } from "../utils/documentStatus";

export const Documentos = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [statusFilter, setStatusFilter] = useState("Todos");

  useEffect(() => {
    setDocuments(storageService.get("gsi_documents") || []);
    setUnits(storageService.get("gsi_units") || []);
  }, []);

  const getUnitName = (id?: string) => {
    if (!id) return "Geral";
    return units.find(u => u.id === id)?.name || id;
  };

  const getDocStatus = (doc: Document) => getDocumentStatus(doc.expirationDate, doc.status);

  const metrics = {
    total: documents.length,
    criticos: documents.filter(d => getDocStatus(d) === "Crítico").length,
    vencidos: documents.filter(d => getDocStatus(d) === "Vencido").length,
    aVencer: documents.filter(d => getDocStatus(d) === "A Vencer").length,
    semAnexo: documents.filter(d => !d.fileUrl).length,
  };

  const filteredDocs = documents.filter(d => {
    if (statusFilter === "Todos") return true;
    if (statusFilter === "Críticos") return getDocStatus(d) === "Crítico";
    if (statusFilter === "Vencidos") return getDocStatus(d) === "Vencido";
    if (statusFilter === "A Vencer") return getDocStatus(d) === "A Vencer";
    if (statusFilter === "Falta Anexo") return !d.fileUrl;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Ações Rápidas */}
      <PageHeader>
        <PageHeaderTitleContent>
          <PageHeaderTitle>Documentação Regulatória</PageHeaderTitle>
          <p className="text-sm text-slate-500">Gestão de licenças, laudos, ARTs e certificados.</p>
        </PageHeaderTitleContent>
        <PageHeaderActionsContainer>
          <Button variant="create" className="gap-2" onClick={() => navigate("/documentos/novo")}><Plus className="w-4 h-4" /> Novo Documento</Button>
        </PageHeaderActionsContainer>
      </PageHeader>
      
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Button variant="outline" className="gap-2"><Calendar className="w-4 h-4" /> Registrar renovação</Button>
        <Button variant="outline" className="gap-2"><FileText className="w-4 h-4" /> Anexar arquivo</Button>
        <Button variant="outline" className="gap-2"><Calendar className="w-4 h-4" /> Consultar vencimentos</Button>
        <Button variant="outline" className="gap-2"><Search className="w-4 h-4" /> Buscar documento</Button>
      </div>

      {/* Indicadores Acionáveis */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button onClick={() => setStatusFilter("Todos")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Todos" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Todos</p>
          <p className="text-2xl font-bold text-slate-900">{metrics.total}</p>
        </button>
        <button onClick={() => setStatusFilter("Críticos")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Críticos" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Críticos</p>
          <p className="text-2xl font-bold text-red-600">{metrics.criticos}</p>
        </button>
        <button onClick={() => setStatusFilter("Vencidos")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Vencidos" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Vencidos</p>
          <p className="text-2xl font-bold text-orange-600">{metrics.vencidos}</p>
        </button>
        <button onClick={() => setStatusFilter("A Vencer")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "A Vencer" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">A Vencer (30d)</p>
          <p className="text-2xl font-bold text-amber-500">{metrics.aVencer}</p>
        </button>
        <button onClick={() => setStatusFilter("Falta Anexo")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Falta Anexo" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Sem Anexo</p>
          <p className="text-2xl font-bold text-slate-600">{metrics.semAnexo}</p>
        </button>
      </div>

      {/* Cards Operacionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(doc => {
          const status = getDocStatus(doc);
          let badgeClass = "bg-green-100 text-green-700";
          if (status === "Crítico" || status === "Vencido") badgeClass = "bg-red-100 text-red-700";
          else if (status === "A Vencer") badgeClass = "bg-amber-100 text-amber-700";

          return (
            <Card key={doc.id} className="hover:border-brand-300 transition-colors flex flex-col">
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="pr-2">
                    <h3 className="font-semibold text-slate-900 line-clamp-1" title={doc.title}>{doc.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 uppercase font-bold">{doc.type}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-sm ${badgeClass}`}>
                    {status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4 flex-1 mt-2">
                  <p><span className="font-medium text-slate-500">Unidade:</span> {getUnitName(doc.unitId)}</p>
                  <p><span className="font-medium text-slate-500">Emissão:</span> {doc.issueDate ? format(parseISO(doc.issueDate), 'dd/MM/yyyy') : 'N/A'}</p>
                  <p><span className="font-medium text-slate-500">Vencimento:</span> {doc.expirationDate ? format(parseISO(doc.expirationDate), 'dd/MM/yyyy') : 'Não possui'}</p>
                  {!doc.fileUrl && <p className="text-orange-600 font-semibold mt-1">Falta arquivo anexado</p>}
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/documentos/${doc.id}`)}>Abrir</Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {filteredDocs.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-lg">
             <p className="text-slate-500">Nenhum documento encontrado para o filtro atual.</p>
          </div>
        )}
      </div>

    </div>
  );
};
