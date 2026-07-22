import { isPast, parseISO, differenceInDays } from "date-fns";
import { Document } from "../types";

export const getDocumentStatus = (expirationDate?: string, currentStatus?: string) => {
  if (currentStatus === "Crítico") return "Crítico";
  if (!expirationDate) return "Válido";
  
  const expDate = parseISO(expirationDate);
  const today = new Date();
  
  if (isPast(expDate)) return "Vencido";
  
  const days = differenceInDays(expDate, today);
  if (days <= 30) return "A Vencer"; // ou Vencendo
  
  return "Válido";
};
