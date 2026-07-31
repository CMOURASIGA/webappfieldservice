import { DataBarProps, DataPieProps } from "./_types";

export const formatDataPanel = (
  data: object,
  keyLabelFormatter?: (key: string) => string
): DataPieProps[] =>
  Object.entries(data as Record<string, number>).map(([key, value]) => ({
    id: key,
    label: keyLabelFormatter ? keyLabelFormatter(key) : key ?? "Sem definição",
    value: value ?? 0,
  }));

export const formatDataPanelPercent = (data: object): DataPieProps[] => {
  const entries = Object.entries(data as Record<string, number>);
  const total = entries.reduce((sum, [, value]) => sum + (value ?? 0), 0);
  return entries.map(([key, value]) => ({
    id: key,
    label: key ?? "Sem definição",
    value: total > 0 ? ((value ?? 0) / total) * 100 : 0,
  }));
};
export const formatDataAnoPanelMedia = (
  data: { tipo: string; ano: number; media: number }[]
): DataBarProps[] => {
  const agrupadoPorAno: Partial<DataBarProps> = {};

  data.forEach(({ tipo, ano, media }) => {
    const anoStr = ano.toString();
    if (!agrupadoPorAno[anoStr]) {
      agrupadoPorAno[anoStr] = { ano: +anoStr };
    }
    agrupadoPorAno[anoStr][tipo] = Number(media.toFixed(2));
  });
  return Object.values(agrupadoPorAno);
};

export function groupPieData(
  data: DataPieProps[],
  maxItems = 8
): DataPieProps[] {
  if (data.length <= maxItems) return data;
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const main = sorted.slice(0, maxItems - 1);
  const others = sorted.slice(maxItems - 1);
  const othersValue = others.reduce((acc, item) => acc + item.value, 0);
  return [
    ...main,
    { id: "Outros", label: "Outros", value: othersValue, color: "#ccc" },
  ];
}

export function getMonthLabel(month: string | number): string {
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  const idx = typeof month === "string" ? parseInt(month, 10) - 1 : month - 1;
  if (isNaN(idx) || idx < 0 || idx > 11) return String(month);
  return months[idx];
}

type ReajusteItem = {
  ano: string;
  media: number;
  tipo: string; // pode ser mais específico: 'mediaReal' | 'mediaNominal'
};

type GraficoData = {
  id: string;
  data: {
    x: string;
    y: number;
  }[];
};
export function formatDataReajuste(reajuste: ReajusteItem[]): GraficoData[] {
  const tiposMap: Record<string, { x: string; y: number }[]> = {};

  for (const item of reajuste) {
    if (!tiposMap[item.tipo]) {
      tiposMap[item.tipo] = [];
    }

    tiposMap[item.tipo].push({
      x: item.ano,
      y: item.media / 100,
    });
  }

  return Object.entries(tiposMap).map(([tipo, data]) => ({
    id: tipo,
    data,
  }));
}
