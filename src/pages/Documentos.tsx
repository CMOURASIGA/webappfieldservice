import React, { useEffect, useState } from "react";
import { storageService } from "../services/storageService";
import { Document, Unit } from "../types";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { format, parseISO } from "date-fns";

export const Documentos = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    setDocuments(storageService.get("gsi_documents"));
    setUnits(storageService.get("gsi_units"));
  }, []);

  const getUnitName = (id: string) => units.find(u => u.id === id)?.name || "N/A";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Válido": return <Badge variant="success">{status}</Badge>;
      case "A vencer": return <Badge variant="warning">{status}</Badge>;
      case "Vencido": return <Badge variant="danger">{status}</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Documentos Regulatórios</h1>
          <p className="text-sm text-slate-500">Controle de validade de laudos e certificados.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200">Número / Título</th>
                  <th className="px-6 py-4 border-b border-slate-200">Unidade</th>
                  <th className="px-6 py-4 border-b border-slate-200">Emissor</th>
                  <th className="px-6 py-4 border-b border-slate-200">Vencimento</th>
                  <th className="px-6 py-4 border-b border-slate-200">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {documents.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex flex-col">
                      <span>{doc.title}</span>
                      <span className="text-xs text-slate-400">{doc.number}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{getUnitName(doc.unitId)}</td>
                    <td className="px-6 py-4 text-slate-600">{doc.issuer}</td>
                    <td className="px-6 py-4 text-slate-900">{doc.expirationDate ? format(parseISO(doc.expirationDate), 'dd/MM/yyyy') : '-'}</td>
                    <td className="px-6 py-4">{getStatusBadge(doc.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
