"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import useRoute from "@/hooks/useRoute";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllEventos, deleteEvento, FiltrosEventosProps, validateDeletion } from "@/services/eventos/evento.service";
import { Evento } from "@/services/eventos/tipo-evento";
import { toast } from "react-toastify";

export default function useEventos() {
  const params = useSearchParams();

  const { handleItemClick } = useRoute();
  const queryClient = useQueryClient();
  const initialFiltros: FiltrosEventosProps = {
    q: params.get("q") || "",
    status: params.get("status") || "",
    nivelAssessoria: params.get("nivelAssessoria") || "",
    idTicket: params.get("idTicket") || "",
    idTematica: params.get("idTematica") || "",
    dataInicio: params.get("dataInicio") || "",
    dataFim: params.get("dataFim") || "",
    idLocal: params.get("idLocal") || "",
    idDemandante: params.get("idDemandante") || "",
    estrategico: params.get("estrategico") || "",
    isCessao: params.get("isCessao") || "",
  };

  const temFiltrosNaUrl = Object.values(initialFiltros).some((v) => v !== "");
  const [buscaExecutada, setBuscaExecutada] = useState(temFiltrosNaUrl);
  const [filtros, setFiltros] = useState<FiltrosEventosProps>(initialFiltros);

  useEffect(() => {
    const statusParam = params.get("status");
    if (statusParam && statusParam !== filtros.status) {
      setFiltros(prev => ({ ...prev, status: statusParam }));
    }
  }, [params]);

  const { data, isFetching } = useQuery({
    queryKey: ["eventos", filtros],
    queryFn: () => getAllEventos(filtros),
    enabled: buscaExecutada,
  });

  const eventos: Evento[] = buscaExecutada ? (data?.data ?? []) : [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEvento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventos"] });
      toast.success("Evento excluído com sucesso.");
    },
    onError: (error) => {
      console.error("Erro ao excluir evento:", error);
      toast.error("Erro ao excluir o evento. Tente novamente.");
    },
  });

  function executarBusca(next: FiltrosEventosProps) {
    setFiltros(next);
    handleItemClick(next, "");
    setBuscaExecutada(true);
  }

  function limparBusca() {
    const filtrosVazios: FiltrosEventosProps = {
      q: "", status: "", nivelAssessoria: "", idTicket: "",
      idTematica: "", dataInicio: "", dataFim: "", idLocal: "", idDemandante: "", estrategico: "",
      isCessao: "",
    };
    setFiltros(filtrosVazios);
    handleItemClick(filtrosVazios, "");
    setBuscaExecutada(false);
  }


  const total = useMemo(() => (data?.total ?? 0), [data]);



  function validarExclusao(ev: Evento) {
    return ev.status !== "Planejado";
  }

  function handleDeleteEvento(ev: Evento) {
    deleteMutation.mutate(ev.id);
  }

  return {
    eventos,
    total,
    isFetching,
    executarBusca,
    limparBusca,
    buscaExecutada,
    filtros,
    validarExclusao,
    validarExclusaoApi: validateDeletion,
    handleDeleteEvento,
  };
}
