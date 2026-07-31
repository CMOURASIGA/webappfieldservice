import { useQuery } from "@tanstack/react-query";
import {
  IndicadoresEventos,
  getIndicadoresEventos,
  getDadosPorStatus,
  DadosStatus,
} from "@/services/eventos/indicadores.service";
import { useRouter } from "next/navigation";

export function useIndicadoresEventos() {
  const router = useRouter();
  const {
    data: indicadoresGerais,
    isLoading: isLoadingGerais,
    isError: isErrorGerais,
  } = useQuery<IndicadoresEventos>({
    queryKey: ["eventos", "indicadores"],
    queryFn: () => getIndicadoresEventos(),
    refetchInterval: 15_000,
  });

  const {
    data: dadosPorStatus,
    isLoading: isLoadingStatus,
    isError: isErrorStatus,
  } = useQuery<DadosStatus[]>({
    queryKey: ["eventos", "indicadores", "por-status"],
    queryFn: () => getDadosPorStatus(),
    refetchInterval: 15_000,
  });

  const indicadoresPorStatus = {
    emElaboracao:
      dadosPorStatus?.find((d) => d.status === "Em elaboração")?.quantidade ||
      0,
    validacao:
      dadosPorStatus?.find((d) => d.status === "Aguardando validação")?.quantidade || 0,
    aprovacao:
      dadosPorStatus?.find((d) => d.status === "Aguardando aprovação")?.quantidade || 0,
  };

  function irParaStatus(status: string) {
    router.push(`/eventos/buscar?status=${encodeURIComponent(status)}`);
  }

  return {
    indicadores: indicadoresGerais,
    indicadoresPorStatus,
    isLoading: isLoadingGerais || isLoadingStatus,
    isError: isErrorGerais || isErrorStatus,
    irParaStatus,
  };
}
