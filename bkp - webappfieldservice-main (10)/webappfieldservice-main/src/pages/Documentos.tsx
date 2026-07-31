import React, { useState, useEffect } from "react";
import { storageService } from "../services/storageService";
import { Document, Unit } from "../types";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { CardFooterActions } from "../components/ui/CardFooterActions";
import { Button, PageHeader, PageHeaderTitle, PageHeaderTitleContent, PageHeaderActionsContainer } from "@cnc-ti/layout-basic";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { FileText, AlertTriangle, Plus, Search, Calendar } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { getDocumentStatus } from "../utils/documentStatus";
import { useAuth } from "../contexts/AuthContext";

export const Documentos = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchParams] = useSearchParams();
  const initialstatusFilter = searchParams.get("status") || "Todos";
  const [statusFilter, setStatusFilter] = useState(initialstatusFilter);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = () => {
    setDocuments((storageService.get("gsi_documents") || []).filter((document: Document) => document.active !== false));
    setUnits(storageService.get("gsi_units") || []);
  };

  useEffect(() => {
    loadData();
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
    atencao: documents.filter(d => getDocStatus(d) === "Atenção").length,
    semAnexo: documents.filter(d => !(d.attachments && d.attachments.length > 0)).length,
  };

  const filteredDocs = documents.filter(d => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!d.title.toLowerCase().includes(term) && !d.number?.toLowerCase().includes(term) && !d.issuer?.toLowerCase().includes(term)) {
        return false;
      }
    }
    if (statusFilter === "Todos") return true;
    if (statusFilter === "Críticos") return getDocStatus(d) === "Crítico";
    if (statusFilter === "Vencidos") return getDocStatus(d) === "Vencido";
    if (statusFilter === "Atenção") return getDocStatus(d) === "Atenção";
    if (statusFilter === "Falta Anexo") return !(d.attachments && d.attachments.length > 0);
    return true;
  });

  const handleDeactivate = (id: string) => {
    const docs = storageService.get("gsi_documents");
    const index = docs.findIndex((document) => document.id === id);
    if (index === -1) return;

    docs[index].active = false;
    docs[index].updatedAt = new Date().toISOString();
    storageService.set("gsi_documents", docs);

    if (currentUser) {
      storageService.logAudit(currentUser.id, "Inativou Documento", id, "Document");
    }

    loadData();
  };

  return (
    <div className="space-y-6">
      
      {/* Ações Rápidas */}
      <PageHeader>
        <PageHeaderTitleContent>
          <PageHeaderTitle title="Documentação Regulatória" />
          <p className="text-sm text-slate-500">Gestão de licenças, laudos, ARTs e certificados.</p>
        </PageHeaderTitleContent>
        <PageHeaderActionsContainer>
          <Button variant="create" className="gap-2" onClick={() => navigate("/documentos/novo")}><Plus className="w-4 h-4" /> Novo Documento</Button>
        </PageHeaderActionsContainer>
      </PageHeader>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="default" className="gap-2" onClick={() => setStatusFilter("Vencidos")}><Calendar className="w-4 h-4" /> Consultar vencimentos</Button>
        </div>
        <div className="w-full md:w-72">
          <Input 
            placeholder="Buscar por nome, código ou órgão..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
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
        <button onClick={() => setStatusFilter("Atenção")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Atenção" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Atenção (30d)</p>
          <p className="text-2xl font-bold text-amber-500">{metrics.atencao}</p>
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
          else if (status === "Atenção") badgeClass = "bg-amber-100 text-amber-700";
          else if (status === "Sem validade definida") badgeClass = "bg-slate-100 text-slate-700";

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
                  {!(doc.attachments && doc.attachments.length > 0) && <div className="mt-2"><Badge variant="default" className="text-[10px] uppercase bg-slate-100 text-slate-600 border-slate-200">Sem anexo</Badge></div>}
                </div>

                </CardContent>
                <CardFooter className="pt-0 pb-4 px-4 border-t border-slate-100 mt-3 pt-3">
                  <CardFooterActions
                    viewLink={`/documentos/${doc.id}`}
                    viewLabel="Abrir"
                    onDelete={() => handleDeactivate(doc.id)}
                    deleteLabel="Inativar documento"
                    isDeactivate={true}
                  />
                </CardFooter>
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
