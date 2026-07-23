import { api, httpAuthClient } from "@/services/api";
import { Espaco } from "./tipo-espaco";
import { FiltrosDisponibilidade } from "@/hooks/espacos/use-busca-disponibilidade";

export type FiltrosEspacosProps = {
  nome?: string;
  ativo?: string; // "true" | "false" | ""
  idLocal?: string | number;
  idEspaco?: string | number;
};
function toQueryString(filtros: FiltrosEspacosProps) {
  return Object.entries(filtros)
    .filter(([_, value]) => {
      if (value === null || value === undefined) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      return true;
    })
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join("&");
}
export async function listarDisponibilidade(
  filtros: FiltrosDisponibilidade,
): Promise<Espaco[]> {
  const apiParams: Record<string, any> = { ...filtros };

  if (apiParams.dataInicial) {
    apiParams.dataInicial = new Date(apiParams.dataInicial).toISOString();
  }
  if (apiParams.dataFinal) {
    apiParams.dataFinal = new Date(apiParams.dataFinal).toISOString();
  }

  const paramsLimpos = Object.entries(apiParams).reduce(
    (acc, [key, value]) => {
      const isValidString = typeof value === "string" && value.trim() !== "";
      const isValidNumber = typeof value === "number" && value > 0;
      const isValidValue = value !== null && value !== undefined;

      if (isValidValue && (isValidString || isValidNumber)) {
        acc[key] = String(value);
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  if (Object.keys(paramsLimpos).length === 0) {
    console.warn("Busca abortada: Nenhum filtro preenchido.");
    return [];
  }

  const query = new URLSearchParams(paramsLimpos).toString();

  try {
    const response = await api.get(`/espacos/disponibilidade?${query}`);

    if (!response.data) return [];

    const data = response.data as any[];

    return data.map((item: any) => ({
      Id: item.Id,
      nome: item.nome || "Espaço sem nome",
      capacidade: Number(item.capacidade) || 0,
      idLocal: item.idLocal || item.Local?.id,
      Local: {
        id: item.Local?.id || item.idLocal,
        nome: item.Local?.nome || item.localNome || "Local não informado",
      },
      descricao: item.descricao || "",
      ativo: item.ativo ?? true,
    })) as Espaco[];
  } catch (error) {
    console.error("Erro no serviço listarDisponibilidade:", error);
    throw error; // Repassa o erro para o React Query tratar (isError)
  }
}
export async function getAllEspacos(
  params?: FiltrosEspacosProps,
): Promise<Espaco[]> {
  const queryParams = toQueryString(params || {});
  const endpoint = queryParams ? `/espacos?${queryParams}` : `/espacos`;
  const response = await api.get(endpoint);

  if (!response) throw new Error(`GET espacos failed: ${response}`);

  const data = (await response.data) as any[];

  return data.map((item) => ({
    Id: item.Id ?? item.id, // Handle capitalization case from backend if needed
    nome: item.nome,
    codigo: item.codigo,
    capacidade: item.capacidade,
    caracteristicas: item.caracteristicas,
    ativo: item.ativo,
    local: item.Local?.nome,
    idLocal: item.idLocal,
  }));
}
export async function getEspacos(): Promise<Espaco[]> {
  const response = await api.get(`/espacos`);

  if (!response) throw new Error(`GET espacos failed: ${response}`);
  const { data } = response;

  return data?.map((item: any) => ({
    Id: item.Id, // Handle capitalization case from backend if needed
    nome: item.nome,
    codigo: item.codigo,
    capacidade: item.capacidade,
    caracteristicas: item.caracteristicas,
    ativo: item.ativo,
    local: item.Local?.nome,
    idLocal: item.idLocal,
  }));
}
export async function deleteEspaco(id: number): Promise<void> {
  const response = await api.delete(`/espacos/${id}`);

  if (!response.data) {
    // Try to parse error message
    try {
      const errorData = await response.data;
      throw new Error(errorData.message || `DELETE failed: ${response.status}`);
    } catch (e) {
      throw new Error(`DELETE failed: ${response.status}`);
    }
  }
}

export async function validarExclusaoEspaco(
  id: number,
): Promise<{ canDelete: boolean; reason?: string }> {
  try {
    const response = await httpAuthClient(`/espacos/${id}/validate-deletion`);
    if (!response.ok)
      return { canDelete: false, reason: "Erro ao validar exclusão" };
    return await response.json();
  } catch (error) {
    return { canDelete: false, reason: "Erro de conexão" };
  }
}
