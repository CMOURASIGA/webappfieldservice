import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Document, Unit } from "../types";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { format, parseISO, differenceInDays } from "date-fns";
import { Search, Plus, FileText, AlertTriangle, CheckCircle, ShieldAlert, Clock } from "lucide-react";

export const Documentos = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const rawDocs = storageService.get("gsi_documents");
    // Auto-update status based on expirationDate and alert config
    const updatedDocs = rawDocs.map(doc => {
      if (!doc.expirationDate) {
        return { ...doc, status: "Sem validade definida" };
      }
      const days = differenceInDays(parseISO(doc.expirationDate), new Date());
      let newStatus = doc.status;
      
      const criticalDays = doc.alertDaysCritical || 15;
      const attentionDays = doc.alertDaysAttention || 30;

      if (days < 0) {
        newStatus = "Vencido";
      } else if (days <= criticalDays) {
        newStatus = "Crítico";
      } else if (days <= attentionDays) {
        newStatus = "Atenção";
      } else {
        newStatus = "Vigente";
      }
      return { ...doc, status: newStatus };
    });
    setDocuments(updatedDocs);
    setUnits(storageService.get("gsi_units"));
  };

  const getUnitName = (id: string) => units.find(u => u.id === id)?.name || "N/A";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Vigente": return <Badge variant="success">{status}</Badge>;
      case "Atenção": return <Badge variant="warning">{status}</Badge>;
      case "Crítico": return <Badge variant="danger">{status}</Badge>;
      case "Vencido": return <Badge className="bg-red-700 hover:bg-red-800 text-white border-transparent">{status}</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  const getDaysRemaining = (doc: Document) => {
    if (!doc.expirationDate) return "-";
    const days = differenceInDays(parseISO(doc.expirationDate), new Date());
    if (days < 0) return <span className="text-red-600 font-medium">{-days} dias em atraso</span>;
    if (days === 0) return <span className="text-red-600 font-medium">Vence hoje</span>;
    if (days <= (doc.alertDaysCritical || 15)) return <span className="text-red-600 font-medium">{days} dias</span>;
    if (days <= (doc.alertDaysAttention || 30)) return <span className="text-amber-600 font-medium">{days} dias</span>;
    return <span className="text-green-600 font-medium">{days} dias</span>;
  };

  const stats = {
    vigente: documents.filter(d => d.status === "Vigente").length,
    atencao: documents.filter(d => d.status === "Atenção").length,
    critico: documents.filter(d => d.status === "Crítico").length,
    vencido: documents.filter(d => d.status === "Vencido").length,
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) || 
                          doc.number.toLowerCase().includes(search.toLowerCase()) ||
                          (doc.regulatoryBody && doc.regulatoryBody.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "Todos" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Documentos Regulatórios</h1>
          <p className="text-sm text-slate-500">Painel de conformidade, licenças e alvarás.</p>
        </div>
        <Link to="/documentos/novo">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Documento
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Vigentes</p>
              <p className="text-2xl font-bold text-slate-900">{stats.vigente}</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 text-green-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Atenção</p>
              <p className="text-2xl font-bold text-slate-900">{stats.atencao}</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-100 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Crítico</p>
              <p className="text-2xl font-bold text-slate-900">{stats.critico}</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-700 bg-red-50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Vencidos</p>
              <p className="text-2xl font-bold text-red-700">{stats.vencido}</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-200 text-red-700">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input 
            placeholder="Buscar por título, número ou órgão..." 
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="Todos">Todos os Status</option>
            <option value="Vigente">Vigentes</option>
            <option value="Atenção">Atenção</option>
            <option value="Crítico">Crítico</option>
            <option value="Vencido">Vencidos</option>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200">Documento</th>
                  <th className="px-6 py-4 border-b border-slate-200">Órgão Regulador</th>
                  <th className="px-6 py-4 border-b border-slate-200">Unidade</th>
                  <th className="px-6 py-4 border-b border-slate-200">Vencimento</th>
                  <th className="px-6 py-4 border-b border-slate-200">Dias Restantes</th>
                  <th className="px-6 py-4 border-b border-slate-200">Recorrência</th>
                  <th className="px-6 py-4 border-b border-slate-200">Status</th>
                  <th className="px-6 py-4 border-b border-slate-200">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{doc.title}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{doc.number}</span>
                          {doc.requiresART && <Badge className="text-[10px] py-0 px-1 bg-blue-100 text-blue-700 border-transparent">ART</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{doc.regulatoryBody || doc.issuer || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{getUnitName(doc.unitId)}</td>
                    <td className="px-6 py-4 text-slate-900">{doc.expirationDate ? format(parseISO(doc.expirationDate), 'dd/MM/yyyy') : '-'}</td>
                    <td className="px-6 py-4">{getDaysRemaining(doc)}</td>
                    <td className="px-6 py-4 text-slate-600">{doc.periodicity || "Único"}</td>
                    <td className="px-6 py-4">{getStatusBadge(doc.status)}</td>
                    <td className="px-6 py-4">
                      <Link to={`/documentos/${doc.id}`}>
                        <Button variant="secondary" size="sm">Gerenciar</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                      Nenhum documento encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
