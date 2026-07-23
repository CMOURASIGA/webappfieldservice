export const AGENDA_CESSAO_PURPLE_HEX = "#9333ea";
export const agendaCessaoAccentClass = "bg-[#9333ea]";
const CESSAO_NORMALIZED = "cessao de espaco";

function normalizeTipoNome(value: string | undefined): string {
  if (!value) return "";
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isCessaoDeEspaco(tipo: string | undefined): boolean {
  return normalizeTipoNome(tipo) === CESSAO_NORMALIZED;
}

export const CESSAO_DE_ESPACO_BADGE_LABEL = "CESSÃO DE ESPAÇO";

export function getEventColorClass(local?: string, tipo?: string): string {
  if (isCessaoDeEspaco(tipo)) return "before:bg-[#9333ea]";
  const l = local?.toLowerCase() || "";
  if (l.includes("cnc-rj") || l.includes("rio de janeiro"))
    return "before:bg-[#00247d]";
  if (l.includes("cnc-df") || l.includes("distrito federal"))
    return "before:bg-[#0076cd]";
  return "before:bg-[#b1b4b7]";
}

export function getEventLateralSolidClass(local?: string, tipo?: string): string {
  if (isCessaoDeEspaco(tipo)) return agendaCessaoAccentClass;
  const l = local?.toLowerCase() || "";
  if (l.includes("cnc-rj") || l.includes("rio de janeiro")) return "bg-[#00247d]";
  if (l.includes("cnc-df") || l.includes("distrito federal")) return "bg-[#0076cd]";
  return "bg-[#b1b4b7]";
}

export function getEventBadgeColorClass(categoria: string): string {
  const cat = categoria?.toLowerCase() || "";
  if (cat.includes("workshop")) return "bg-brand-gray-500 text-black";
  if (cat.includes("webinar")) return "bg-brand-gold-100 text-black";
  return "bg-[#b1b4b7] text-black";
}
