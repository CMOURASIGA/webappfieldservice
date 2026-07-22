import { isPast, parseISO, differenceInDays } from "date-fns";
import { Document, DocumentStatus } from "../types";

export interface DocumentStatusResult {
  status: DocumentStatus;
  diasRestantes: number | null;
  diasEmAtraso: number | null;
  nivel: string;
}

export const calcularStatusDocumento = (documento: Partial<Document>, dataAtual: Date = new Date()): DocumentStatusResult => {
  if (documento.status === "Crítico") {
    return {
      status: "Crítico",
      diasRestantes: null,
      diasEmAtraso: null,
      nivel: "high"
    };
  }

  if (!documento.expirationDate) {
    return {
      status: "Sem validade definida",
      diasRestantes: null,
      diasEmAtraso: null,
      nivel: "neutral"
    };
  }
  
  const expDate = parseISO(documento.expirationDate);
  
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
  if (dias <= 15) {
    return {
      status: "Crítico",
      diasRestantes: dias,
      diasEmAtraso: null,
      nivel: "high"
    };
  }
  if (dias <= 30) {
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

export const getDocumentStatus = (expirationDate?: string, currentStatus?: string): DocumentStatus => {
  return calcularStatusDocumento({ expirationDate, status: currentStatus as DocumentStatus }).status;
};
