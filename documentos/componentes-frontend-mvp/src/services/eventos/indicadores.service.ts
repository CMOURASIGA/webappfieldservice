import { httpAuthClient } from "@/services/api";
import { Evento } from "@/services/eventos/tipo-evento";

export type IndicadoresEventos = {
  solicitacoes: number;
  emExecucao: number;
  ativos: number;
  concluidos: number;
};

export async function getIndicadoresEventos(): Promise<IndicadoresEventos> {
  const baseSet = !!process.env.NEXT_PUBLIC_API_URL;
  if (baseSet) {
    const res = await httpAuthClient("/eventos/indicadores");
    if (!res.ok) throw new Error("failed");
    return (await res.json()) as IndicadoresEventos;
  }

  const res = await fetch("/api/mocks/eventos");
  if (!res.ok) throw new Error("failed");
  const events = (await res.json()) as Evento[];
  const solicitacoes = events.length;
  const emExecucao = events.filter((e) => e.status === "Em andamento").length;
  const concluidos = events.filter((e) => e.status === "Concluído").length;
  const ativos = events.filter(
    (e) => e.status !== "Concluído" && e.status !== "Cancelado",
  ).length;
  return { solicitacoes, emExecucao, ativos, concluidos };
}

export type DadosStatus = {
  status: string;
  quantidade: number;
};

export async function getDadosPorStatus(): Promise<DadosStatus[]> {
  const baseSet = !!process.env.NEXT_PUBLIC_API_URL;
  if (baseSet) {
    const res = await httpAuthClient("/eventos/dashboard/por-status");
    if (!res.ok) throw new Error("failed");
    return (await res.json()) as DadosStatus[];
  }

  // Mock
  return [
    { status: "Em elaboração", quantidade: 5 },
    { status: "Aguardando validação", quantidade: 3 },
    { status: "Aguardando aprovação", quantidade: 8 },
    { status: "Confirmado", quantidade: 2 },
  ];
}
