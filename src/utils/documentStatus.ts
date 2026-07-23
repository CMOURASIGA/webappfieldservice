import { isPast, parseISO, differenceInDays } from "date-fns";
import { Document, DocumentStatus } from "../types";

export interface DocumentStatusResult {
  status: DocumentStatus;
  diasRestantes: number | null;
  diasEmAtraso: number | null;
  nivel: string;
}

export const calcularStatusDocumento = (documento: Partial<Document>, dataAtual: Date = new Date()): DocumentStatusResult => {
  if (!documento.expirationDate && documento.scope !== "Recorrente") {
    return {
      status: "Sem validade definida",
      diasRestantes: null,
      diasEmAtraso: null,
      nivel: "neutral"
    };
  }
  
  const competence = `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, "0")}`;
  if (documento.scope === "Recorrente" && documento.recurrenceHistory?.some((entry) => entry.competence === competence)) {
    return { status: "Vigente", diasRestantes: null, diasEmAtraso: null, nivel: "normal" };
  }
  const expDate = documento.scope === "Recorrente"
    ? new Date(dataAtual.getFullYear(), dataAtual.getMonth(), documento.recurrenceDay || 5)
    : parseISO(documento.expirationDate!);
  
  if (isPast(expDate) && expDate.getTime() < dataAtual.getTime() && expDate.toDateString() !== dataAtual.toDateString()) {
    const dias = differenceInDays(dataAtual, expDate);
    return {
      status: "Vencido",
      diasRestantes: null,
      diasEmAtraso: Math.abs(dias),
      nivel: "critical"
    };
  }
  
  const dias = differenceInDays(expDate, dataAtual);
  const criticalDays = documento.alertDaysCritical ?? 15;
  const attentionDays = documento.alertDaysAttention ?? 30;
  if (dias <= criticalDays) {
    return {
      status: "Crítico",
      diasRestantes: dias,
      diasEmAtraso: null,
      nivel: "high"
    };
  }
  if (dias <= attentionDays) {
    return {
      status: "Atenção",
      diasRestantes: dias,
      diasEmAtraso: null,
      nivel: "warning"
    };
  }
  
  return {
    status: "Vigente",
    diasRestantes: dias,
    diasEmAtraso: null,
    nivel: "normal"
  };
};

export const getDocumentStatus = (documentOrExpiration?: Partial<Document> | string, currentStatus?: string): DocumentStatus => {
  const document: Partial<Document> = typeof documentOrExpiration === "string" || !documentOrExpiration
    ? { expirationDate: typeof documentOrExpiration === "string" ? documentOrExpiration : undefined, status: currentStatus as DocumentStatus }
    : documentOrExpiration;
  return calcularStatusDocumento(document).status;
};
