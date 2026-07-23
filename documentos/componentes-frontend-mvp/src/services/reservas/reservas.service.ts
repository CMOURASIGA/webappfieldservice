import { ReservaFormData } from "@/app/(private)/reservas/schema";
import { api } from "../api";
import { FiltroReserva, Reserva, UpdateReservaData } from "./tipo-reserva";
function toQueryString(filtros: FiltroReserva) {
  return Object.entries(filtros)
    .filter(([_, value]) => {
      if (value === null || value === undefined) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      return true;
    })
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join("&");
}
export const reservasService = {
  listar: async (filtros?: FiltroReserva): Promise<Reserva[]> => {
    ;
    const queryParams = toQueryString(filtros || {});

    // if (filtros) {
    //     if (filtros.idEspaco) ("idEspaco", filtros.idEspaco.toString());
    //     if (filtros.idEvento) queryParams.append("idEvento", filtros.idEvento.toString());
    //     if (filtros.solicitante) queryParams.append("solicitante", filtros.solicitante);
    //     if (filtros.dataInicio) queryParams.append("dataInicio", filtros.dataInicio);
    //     if (filtros.dataFim) queryParams.append("dataFim", filtros.dataFim);
    //     if (filtros.status) queryParams.append("status", filtros.status);
    //     if (filtros.disponiveis) queryParams.append("disponiveis", filtros.disponiveis.toString());
    // }

    const { data } = await api.get<Reserva[]>(
      `/reservas?${queryParams.toString()}`,
    );
    return data;
  },

  obterPorId: async (id: number): Promise<Reserva> => {
    const { data } = await api.get<Reserva>(`/reservas/${id}`);
    return data;
  },

  criar: async (dados: UpdateReservaData): Promise<Reserva> => {
    const { data } = await api.post<Reserva>(`/reservas`, dados);
    return data;
  },

  atualizar: async (id: number, dados: ReservaFormData): Promise<Reserva> => {
    const { data } = await api.put<Reserva>(`/reservas/${id}`, dados);
    return data;
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/reservas/${id}`);
  },

  verificarSePodeExcluir: async (
    id: number,
  ): Promise<{ canDelete: boolean; reason?: string; message?: string }> => {
    const { data } = await api.get<{
      canDelete: boolean;
      reason?: string;
      message?: string;
    }>(`/reservas/${id}/validate-deletion`);
    return data;
  },

  obterIndicadores: async (): Promise<
    { titulo: string; quantidade: number }[]
  > => {
    const { data } = await api.get<{ titulo: string; quantidade: number }[]>(
      `/reservas/indicadores`,
    );
    return data;
  },
  obterProximasReservas: async (): Promise<Reserva[]> => {
    const { data } = await api.get(`/reservas/proximas`);
    return data;
  },
};
