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
import { MetricButton, SearchToolbar } from "../components/ui/OperationalPage";

export const Documentos = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchParams] = useSearchParams();
  const initialstatusFilter = searchParams.get("status") || "Todos";
  const [statusFilter, setStatusFilter] = useState(initialstatusFilter);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [responsibleFilter, setResponsibleFilter] = useState("Todos");
  const [scopeFilter, setScopeFilter] = useState("Todos");
  const [regulatoryBodyFilter, setRegulatoryBodyFilter] = useState("Todos");

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

  const getDocStatus = (doc: Document) => getDocumentStatus(doc);

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
      if (!d.title.toLowerCase().includes(term) && !d.number?.toLowerCase().includes(term) && !d.issuer?.toLowerCase().includes(term) && !d.regulatoryBody?.toLowerCase().includes(term) && !d.type.toLowerCase().includes(term)) {
        return false;
      }
    }
    if (typeFilter !== "Todos" && d.type !== typeFilter) return false;
    if (responsibleFilter !== "Todos" && d.responsibleId !== responsibleFilter) return false;
    if (scopeFilter !== "Todos" && (d.scope || (d.periodicity === "Único" ? "Único" : "Periódico")) !== scopeFilter) return false;
    if (regulatoryBodyFilter !== "Todos" && (d.regulatoryBody || d.issuer) !== regulatoryBodyFilter) return false;
    if (statusFilter === "Todos") return true;
    if (statusFilter === "Críticos") return getDocStatus(d) === "Crítico";
    if (statusFilter === "Vencidos") return getDocStatus(d) === "Vencido";
    if (statusFilter === "Atenção") return getDocStatus(d) === "Atenção";
    if (statusFilter === "Falta Anexo") return !(d.attachments && d.attachments.length > 0);
    if (statusFilter === "Vencimentos") return ["Vencido", "Crítico", "Atenção"].includes(getDocStatus(d));
    return true;
  }).sort((a, b) => {
    if (statusFilter !== "Vencimentos") return 0;
    return new Date(a.expirationDate || "2999-12-31").getTime() - new Date(b.expirationDate || "2999-12-31").getTime();
  });

  const types = [...new Set(documents.map((document) => document.type).filter(Boolean))];
  const responsibles = [...new Set(documents.map((document) => document.responsibleId).filter(Boolean))];
  const regulatoryBodies = [...new Set(documents.map((document) => document.regulatoryBody || document.issuer).filter(Boolean))];
  const documentsByType = types.map((type) => ({ type, total: documents.filter((document) => document.type === type).length }));
  const documentsByResponsible = responsibles.map((id) => ({ id, total: documents.filter((document) => document.responsibleId === id).length }));
  const overallCompliance = metrics.vencidos + metrics.criticos > 0 ? "Crítica" : metrics.atencao > 0 ? "Atenção" : "Conforme";

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
          <Button variant="default" className="gap-2" onClick={() => setStatusFilter("Vencimentos")}><Calendar className="w-4 h-4" /> Consultar vencimentos</Button>
          {statusFilter === "Vencimentos" && <span className="text-sm font-medium text-slate-600">Exibindo vencidos, críticos e próximos do vencimento.</span>}
        </div>
      </div>

      <SearchToolbar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por documento, número ou órgão emissor..." resultCount={filteredDocs.length} />

      <div className="grid grid-cols-1 gap-3 rounded-xl border-2 border-slate-300 bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
        <select className="h-10 rounded-md border-2 border-slate-400 bg-white px-3 text-sm" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="Todos">Todos os tipos</option>{types.map((type) => <option key={type}>{type}</option>)}</select>
        <select className="h-10 rounded-md border-2 border-slate-400 bg-white px-3 text-sm" value={responsibleFilter} onChange={(event) => setResponsibleFilter(event.target.value)}><option value="Todos">Todos os responsáveis</option>{responsibles.map((id) => <option key={id} value={id}>{storageService.get("gsi_users").find((user) => user.id === id)?.name || id}</option>)}</select>
        <select className="h-10 rounded-md border-2 border-slate-400 bg-white px-3 text-sm" value={scopeFilter} onChange={(event) => setScopeFilter(event.target.value)}><option value="Todos">Todas as abrangências</option><option value="Único">Vencimento único</option><option value="Periódico">Periódico</option><option value="Recorrente">Recorrente mensal</option></select>
        <select className="h-10 rounded-md border-2 border-slate-400 bg-white px-3 text-sm" value={regulatoryBodyFilter} onChange={(event) => setRegulatoryBodyFilter(event.target.value)}><option value="Todos">Todos os órgãos reguladores</option>{regulatoryBodies.map((body) => <option key={body}>{body}</option>)}</select>
      </div>

      {/* Indicadores Acionáveis */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricButton label="Todos" value={metrics.total} active={statusFilter === "Todos"} onClick={() => setStatusFilter("Todos")} />
        <MetricButton label="Críticos" value={metrics.criticos} active={statusFilter === "Críticos"} valueClassName="text-red-700" onClick={() => setStatusFilter("Críticos")} />
        <MetricButton label="Vencidos" value={metrics.vencidos} active={statusFilter === "Vencidos"} valueClassName="text-orange-700" onClick={() => setStatusFilter("Vencidos")} />
        <MetricButton label="Atenção (30d)" value={metrics.atencao} active={statusFilter === "Atenção"} valueClassName="text-amber-700" onClick={() => setStatusFilter("Atenção")} />
        <MetricButton label="Sem Anexo" value={metrics.semAnexo} active={statusFilter === "Falta Anexo"} onClick={() => setStatusFilter("Falta Anexo")} />
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="operational-card"><CardContent className="p-4"><p className="text-xs font-bold uppercase text-slate-600">Conformidade geral</p><p className={`mt-2 text-2xl font-bold ${overallCompliance === "Crítica" ? "text-red-700" : overallCompliance === "Atenção" ? "text-amber-700" : "text-green-700"}`}>{overallCompliance}</p><p className="mt-1 text-xs text-slate-500">Considera vencidos, críticos e documentos em atenção.</p></CardContent></Card>
        <Card className="operational-card"><CardContent className="p-4"><p className="text-xs font-bold uppercase text-slate-600">Por tipo</p><div className="mt-2 space-y-1 text-sm">{documentsByType.map((item) => <div className="flex justify-between" key={item.type}><span>{item.type}</span><strong>{item.total}</strong></div>)}</div></CardContent></Card>
        <Card className="operational-card"><CardContent className="p-4"><p className="text-xs font-bold uppercase text-slate-600">Por responsável</p><div className="mt-2 space-y-1 text-sm">{documentsByResponsible.map((item) => <div className="flex justify-between" key={item.id}><span className="truncate">{storageService.get("gsi_users").find((user) => user.id === item.id)?.name || item.id}</span><strong>{item.total}</strong></div>)}</div></CardContent></Card>
      </section>

      {/* Cards Operacionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(doc => {
          const status = getDocStatus(doc);
          let badgeClass = "bg-green-100 text-green-700";
          if (status === "Crítico" || status === "Vencido") badgeClass = "bg-red-100 text-red-700";
          else if (status === "Atenção") badgeClass = "bg-amber-100 text-amber-700";
          else if (status === "Sem validade definida") badgeClass = "bg-slate-100 text-slate-700";

          return (
            <Card key={doc.id} className="operational-card flex flex-col">
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
                  <p><span className="font-medium text-slate-500">Abrangência:</span> {doc.scope || (doc.periodicity === "Único" ? "Único" : "Periódico")}</p>
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
