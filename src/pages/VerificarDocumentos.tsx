import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { CardFooterActions } from "../components/ui/CardFooterActions";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { OperationalPageHeader } from "../components/ui/OperationalPage";
import { storageService } from "../services/storageService";
import { Document, Unit } from "../types";
import { getDocumentStatus } from "../utils/documentStatus";
import { useAuth } from "../contexts/AuthContext";

export const VerificarDocumentos = () => {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchParams] = useSearchParams();
  const initialStatusFilter = searchParams.get("status") || "Todos";

  const [draftSearch, setDraftSearch] = useState("");
  const [draftStatus, setDraftStatus] = useState(initialStatusFilter);
  const [draftType, setDraftType] = useState("Todos");
  const [draftResponsible, setDraftResponsible] = useState("Todos");
  const [draftScope, setDraftScope] = useState("Todos");
  const [draftRegulatoryBody, setDraftRegulatoryBody] = useState("Todos");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [responsibleFilter, setResponsibleFilter] = useState("Todos");
  const [scopeFilter, setScopeFilter] = useState("Todos");
  const [regulatoryBodyFilter, setRegulatoryBodyFilter] = useState("Todos");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const loadData = () => {
    setDocuments((storageService.get("gsi_documents") || []).filter((document: Document) => document.active !== false));
    setUnits(storageService.get("gsi_units") || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setDraftStatus(initialStatusFilter);
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  const getUnitName = (id?: string) => {
    if (!id) return "Geral";
    return units.find((unit) => unit.id === id)?.name || id;
  };

  const getDocStatus = (document: Document) => getDocumentStatus(document);

  const filteredDocs = useMemo(
    () =>
      documents
        .filter((document) => {
          const term = searchTerm.trim().toLowerCase();
          if (
            term &&
            ![document.title, document.number, document.issuer, document.regulatoryBody, document.type].some((value) =>
              value?.toLowerCase().includes(term),
            )
          ) {
            return false;
          }
          if (typeFilter !== "Todos" && document.type !== typeFilter) return false;
          if (responsibleFilter !== "Todos" && document.responsibleId !== responsibleFilter) return false;
          if (scopeFilter !== "Todos" && (document.scope || (document.periodicity === "Unico" ? "Unico" : "Periodico")) !== scopeFilter) return false;
          if (regulatoryBodyFilter !== "Todos" && (document.regulatoryBody || document.issuer) !== regulatoryBodyFilter) return false;
          if (statusFilter === "Todos") return true;
          if (statusFilter === "Criticos") return getDocStatus(document) === "Crítico";
          if (statusFilter === "Vencidos") return getDocStatus(document) === "Vencido";
          if (statusFilter === "Atencao") return getDocStatus(document) === "Atenção";
          if (statusFilter === "Falta Anexo") return !(document.attachments && document.attachments.length > 0);
          if (statusFilter === "Vencimentos") return ["Vencido", "Crítico", "Atenção"].includes(getDocStatus(document));
          return true;
        })
        .sort((a, b) => {
          if (statusFilter !== "Vencimentos") return 0;
          return new Date(a.expirationDate || "2999-12-31").getTime() - new Date(b.expirationDate || "2999-12-31").getTime();
        }),
    [documents, regulatoryBodyFilter, responsibleFilter, scopeFilter, searchTerm, statusFilter, typeFilter],
  );

  const types = [...new Set(documents.map((document) => document.type).filter(Boolean))];
  const responsibles = [...new Set(documents.map((document) => document.responsibleId).filter(Boolean))];
  const regulatoryBodies = [...new Set(documents.map((document) => document.regulatoryBody || document.issuer).filter(Boolean))];

  const handleDeactivate = (id: string) => {
    const docs = storageService.get("gsi_documents");
    const index = docs.findIndex((document: Document) => document.id === id);
    if (index === -1) return;

    docs[index].active = false;
    docs[index].updatedAt = new Date().toISOString();
    storageService.set("gsi_documents", docs);

    if (currentUser) {
      storageService.logAudit(currentUser.id, "Inativou Documento", id, "Document");
    }

    loadData();
  };

  const applyFilters = () => {
    setSearchTerm(draftSearch);
    setStatusFilter(draftStatus);
    setTypeFilter(draftType);
    setResponsibleFilter(draftResponsible);
    setScopeFilter(draftScope);
    setRegulatoryBodyFilter(draftRegulatoryBody);
  };

  const clearFilters = () => {
    setDraftSearch("");
    setDraftStatus("Todos");
    setDraftType("Todos");
    setDraftResponsible("Todos");
    setDraftScope("Todos");
    setDraftRegulatoryBody("Todos");
    setSearchTerm("");
    setStatusFilter("Todos");
    setTypeFilter("Todos");
    setResponsibleFilter("Todos");
    setScopeFilter("Todos");
    setRegulatoryBodyFilter("Todos");
    setShowAdvancedFilters(false);
  };

  const activeFilterCount = [
    searchTerm,
    statusFilter !== "Todos" ? statusFilter : "",
    typeFilter !== "Todos" ? typeFilter : "",
    responsibleFilter !== "Todos" ? responsibleFilter : "",
    scopeFilter !== "Todos" ? scopeFilter : "",
    regulatoryBodyFilter !== "Todos" ? regulatoryBodyFilter : "",
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <OperationalPageHeader
        title="Verificar Documentos"
        description="Pagina de busca da documentacao regulatoria."
        backTo="/documentos"
        actions={
          <Link to="/documentos/novo" className="new-register-button new-register-button--green">
            Novo documento
          </Link>
        }
      />

      <section className="rounded-xl border-2 border-slate-300 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-4 border-b border-slate-200 p-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)_auto]">
          <Input label="Titulo / Palavra-chave" placeholder="Documento, numero ou orgao emissor" value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-700">Situacao</label>
            <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftStatus} onChange={(event) => setDraftStatus(event.target.value)}>
              <option value="Todos">Todos</option>
              <option value="Criticos">Criticos</option>
              <option value="Vencidos">Vencidos</option>
              <option value="Atencao">Atencao</option>
              <option value="Falta Anexo">Falta Anexo</option>
              <option value="Vencimentos">Vencimentos</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button type="button" variant="secondary" className="h-10 px-3" onClick={() => setShowAdvancedFilters((current) => !current)}>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <Button type="button" className="search-action-button" onClick={applyFilters}>
              <Search className="h-4 w-4" />
              Pesquisar
            </Button>
            <Button type="button" variant="secondary" className="search-clear-button" onClick={clearFilters}>
              <X className="h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 gap-4 border-b border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Tipo</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftType} onChange={(event) => setDraftType(event.target.value)}>
                <option value="Todos">Todos</option>
                {types.map((type) => <option key={type}>{type}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Responsavel</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftResponsible} onChange={(event) => setDraftResponsible(event.target.value)}>
                <option value="Todos">Todos</option>
                {responsibles.map((id) => (
                  <option key={id} value={id}>{storageService.get("gsi_users").find((user: any) => user.id === id)?.name || id}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Abrangencia</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftScope} onChange={(event) => setDraftScope(event.target.value)}>
                <option value="Todos">Todos</option>
                <option value="Unico">Vencimento unico</option>
                <option value="Periodico">Periodico</option>
                <option value="Recorrente">Recorrente mensal</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Orgao regulador</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftRegulatoryBody} onChange={(event) => setDraftRegulatoryBody(event.target.value)}>
                <option value="Todos">Todos</option>
                {regulatoryBodies.map((body) => <option key={body}>{body}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="p-4">
          <p className="text-lg font-semibold text-brand-900">Documentos encontrados | {filteredDocs.length}</p>
          <p className="text-sm text-slate-500">{activeFilterCount > 0 ? `Filtros aplicados: ${activeFilterCount}.` : "Exibindo todos os documentos disponiveis."}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredDocs.map((doc) => {
          const status = getDocStatus(doc);
          let badgeClass = "bg-green-100 text-green-700";
          if (status === "Crítico" || status === "Vencido") badgeClass = "bg-red-100 text-red-700";
          else if (status === "Atenção") badgeClass = "bg-amber-100 text-amber-700";
          else if (status === "Sem validade definida") badgeClass = "bg-slate-100 text-slate-700";

          return (
            <Card key={doc.id} className="overflow-hidden border-2 border-slate-300 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-700 hover:shadow-md">
              <CardContent className="space-y-4 p-0">
                <div className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Badge variant="default">{doc.type}</Badge>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>{status}</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="line-clamp-2 text-lg font-semibold text-slate-900" title={doc.title}>{doc.title}</h3>
                    <p className="text-sm text-slate-500">{doc.number || "Sem numero"}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-slate-200">
                    <div className="border-b border-r border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Unidade</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{getUnitName(doc.unitId)}</p>
                    </div>
                    <div className="border-b border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Emissao</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{doc.issueDate ? format(parseISO(doc.issueDate), "dd/MM/yyyy") : "N/A"}</p>
                    </div>
                    <div className="border-r border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Vencimento</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{doc.expirationDate ? format(parseISO(doc.expirationDate), "dd/MM/yyyy") : "Nao possui"}</p>
                    </div>
                    <div className="bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Abrangencia</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{doc.scope || (doc.periodicity === "Unico" ? "Unico" : "Periodico")}</p>
                    </div>
                  </div>

                  {!(doc.attachments && doc.attachments.length > 0) && (
                    <div className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      Documento sem anexo.
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="mt-auto border-t border-slate-200 px-4 py-4">
                <CardFooterActions
                  viewLink={`/documentos/${doc.id}`}
                  viewLabel="Abrir"
                  onDelete={() => handleDeactivate(doc.id)}
                  deleteLabel="Inativar documento"
                  isDeactivate={true}
                />
              </CardFooter>
            </Card>
          );
        })}

        {filteredDocs.length === 0 && (
          <div className="col-span-full rounded-lg border-2 border-dashed border-slate-200 py-12 text-center">
            <p className="text-slate-500">Nenhum documento encontrado para o filtro atual.</p>
          </div>
        )}
      </div>
    </div>
  );
};
