import { temFiltroNaUrl } from "@/components/eventos/busca/busca-eventos";
import { httpAuthClient } from "@/services/api";
import { Evento } from "@/services/eventos/tipo-evento";
import axios from "axios";

export type FiltrosEventosProps = {
  q?: string;
  status?: string;
  nivelAssessoria?: string;
  dataInicio?: string;
  dataFim?: string;
  idLocal?: string;
  idTematica?: string;
  idTicket?: string;
  idDemandante?: string;
  estrategico?: string;
  isCessao?: string;
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  return config;
});

export async function getAllEventos(
  params?: FiltrosEventosProps,
): Promise<{ total: number; data: Evento[] }> {


  // Processar parâmetros
  const apiParams: Record<string, any> = { ...params };
  if (apiParams.q) {
    apiParams.nome = apiParams.q;
    delete apiParams.q;
  }

  // Validar e limpar parâmetros
  const paramsLimpos: Record<string, string> = {};
  Object.entries(apiParams).forEach(([key, value]) => {
    const isValidString = typeof value === "string" && value.trim() !== "";
    const isValidNumber = typeof value === "number" && value > 0;

    if (isValidString || isValidNumber) {
      paramsLimpos[key] = String(value);
    }
  });



  // Criar query string
  const query = new URLSearchParams(paramsLimpos).toString();
  const url = `/eventos${query ? `?${query}` : ""}`;


  const response = await httpAuthClient(url, {
    next: { tags: ["eventos", query] },
  });

  if (!response.ok) throw new Error(`GET failed: ${response.status}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (await response.json()) as any;
  const eventosData = result.data || [];
  const total = result.total || eventosData.length;
  const eventos = eventosData.map((item: any) => ({
    id: String(item.id),
    titulo: item.nome || "Sem título",
    local: !!item.localExterno
      ? item.localExterno
      : item.Espaco?.Local?.nome && item.Espaco?.nome
        ? `${item.Espaco.Local.nome} - ${item.Espaco.nome}`
        : item.Espaco?.nome || "A definir",
    uf: item.uf || "",
    data: item.dataInicio || "",
    dataFim: item.dataFim || "",
    solicitante: item.Solicitante?.nome || item.solicitante || "N/A",
    descricao: item.descricao || "",
    status: item.status || item.Situacao?.nome || "Planejado",
    prioridade: item.Complexidade?.nome || "Média",
    Reserva: item.Reserva,
    idTicket: item.Solicitacao?.idTicket,
    necessitaAjuste: item.necessitaAjuste ?? false,
    Periodos: item.Periodos,
    classificacaoEsforco: item.classificacaoEsforco || null,
    NivelAssessoria: item.NivelAssessoria || null,
  })) as Evento[];
  return { total, data: eventos };
}
export async function getEventos(): Promise<Evento[]> {
  const response = await api.get(`/eventos`);

  const eventosData = response.data.data || [];

  return eventosData.map((item: any) => ({
    id: String(item.id),
    titulo: item.nome || "Sem título",
    local: item.Espaco?.nome || item.local || "A definir",
    uf: item.uf || "",
    data: item.dataInicio || "",
    dataFim: item.dataFim || "",
    solicitante: item.Solicitante?.nome || item.solicitante || "N/A",
    descricao: item.descricao || "",
    status: item.status || item.Situacao?.nome || "Planejado",
    prioridade: item.Complexidade?.nome || "Média",
    Reserva: item.Reserva,
    Periodos: item.Periodos,
    classificacaoEsforco: item.classificacaoEsforco || null,
    NivelAssessoria: item.NivelAssessoria || null,
  })) as Evento[];
}
export async function deleteEvento(id: string): Promise<void> {

  const response = await httpAuthClient(`/eventos/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `[deleteEvento] Falha na exclusão (Status ${response.status}):`,
      errorText,
    );
    throw new Error(`DELETE failed: ${response.status} - ${errorText}`);
  }


}

export async function deleteAnexo(id: number): Promise<void> {
  const response = await httpAuthClient(`/eventos/anexo/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Falha ao excluir anexo: ${response.statusText}`);
  }
}

export async function calcularComplexidade(dados: Record<string, any>) {
  const response = await httpAuthClient(`/eventos/calcular-complexidade`, {
    method: "POST",
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    throw new Error(`Falha ao calcular complexidade: ${response.statusText}`);
  }

  return response.json();
}

export async function validateDeletion(
  id: string,
): Promise<{
  allowed: boolean;
  message?: string;
  dependencies?: Record<string, number>;
}> {
  try {
    const response = await httpAuthClient(`/eventos/${id}/validate-deletion`);
    if (!response.ok)
      return { allowed: false, message: "Erro ao validar exclusão" };
    return await response.json();
  } catch (error) {
    return { allowed: false, message: "Erro de conexão" };
  }
}
