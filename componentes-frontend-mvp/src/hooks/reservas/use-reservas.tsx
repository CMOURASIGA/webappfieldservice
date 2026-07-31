"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { reservasService } from "@/services/reservas/reservas.service";
import { FiltroReserva, Reserva } from "@/services/reservas/tipo-reserva";
import Swal from "sweetalert2";
import useRoute from "../useRoute";

interface UseReservasProps {
    initialFilters?: FiltroReserva;
    skipUrlUpdate?: boolean;
}

export default function useReservas(props?: UseReservasProps) {
    const queryClient = useQueryClient();
    const [reservasFiltrados, setReservasFiltrados] = useState<Reserva[]>([]);
    const searchParams = useSearchParams();
    const statusParam = searchParams.get("status");
    const { handleItemClick } = useRoute();

    // Check if there are initial filters in URL or Props
    const hasUrlParams = Array.from(searchParams.keys()).some(key =>
        ["idEspaco", "idEvento", "motivo", "solicitante", "dataInicio", "dataFim", "status", "disponiveis"].includes(key) &&
        searchParams.get(key) !== "" && searchParams.get(key) !== null
    );
    const hasPropsFilters = !!(props?.initialFilters && Object.values(props.initialFilters).some(v => v !== undefined && v !== "" && v !== null));

    const [buscaExecutada, setBuscaExecutada] = useState(hasUrlParams || hasPropsFilters);

    const initialFiltros: FiltroReserva = {
        idEspaco: Number(searchParams.get("idEspaco")) || undefined,

        idEvento: Number(searchParams.get("idEvento")) || undefined,

        motivo: searchParams.get("motivo") || undefined,

        disponiveis: searchParams.get("disponiveis") === "true" ? true : searchParams.get("disponiveis") === "false" ? false : undefined,

        solicitante: searchParams.get("solicitante") || undefined,

        status: searchParams.get("status") || undefined,

        dataInicio: searchParams.get("dataInicio") || undefined,

        dataFim: searchParams.get("dataFim") || undefined,
    };
    const [filtros, setFiltros] = useState<FiltroReserva>(() => ({
        ...initialFiltros,
        status: statusParam || undefined,
        ...props?.initialFilters
    }));

    const { data, isFetching } = useQuery({
        queryKey: ["reservas", filtros],
        queryFn: () => reservasService.listar(filtros),
        enabled: !!buscaExecutada,
    });

    // Sincronizar filtros iniciais quando mudarem externamente (props)
    useEffect(() => {
        if (props?.initialFilters) {
            setFiltros(prev => {
                // Evitar loop infinito se os filtros forem idênticos
                if (
                    prev.idEspaco === props.initialFilters?.idEspaco &&
                    prev.dataInicio === props.initialFilters?.dataInicio &&
                    prev.dataFim === props.initialFilters?.dataFim &&
                    prev.idEvento === props.initialFilters?.idEvento
                ) {
                    return prev;
                }

                return {
                    ...prev,
                    ...props.initialFilters
                };
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        props?.initialFilters?.idEspaco,
        props?.initialFilters?.dataInicio,
        props?.initialFilters?.dataFim,
        props?.initialFilters?.idEvento
    ]);

    const [reservas, setReservas] = useState<Reserva[]>([]);

    if (data && data !== reservas) {
        setReservas(data);
    }

    const deleteMutation = useMutation({
        mutationFn: (id: number) => reservasService.excluir(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reservas"] });
            toast.success("Reserva excluída com sucesso.");
        },
        onError: (error) => {
            console.error("Erro ao excluir reserva:", error);
            toast.error("Erro ao excluir a reserva. Tente novamente.");
        },
    });

    function executarBusca(novosFiltros: FiltroReserva) {

        // const filtrosParaUrl = {
        //     ...novosFiltros,

        //     idEspaco: novosFiltros.idEspaco
        //         ? Number(novosFiltros.idEspaco)
        //         : Number(searchParams.get("idEspaco")) || undefined,

        //     idEvento: novosFiltros.idEvento
        //         ? Number(novosFiltros.idEvento)
        //         : Number(searchParams.get("idEvento")) || undefined,

        //     disponiveis: (novosFiltros.disponiveis !== undefined && novosFiltros.disponiveis !== null)
        //         ? Boolean(novosFiltros.disponiveis)
        //         : Boolean(searchParams.get("disponiveis")) || undefined,

        //     solicitante: novosFiltros.solicitante?.trim()
        //         ? novosFiltros.solicitante.trim()
        //         : searchParams.get("solicitante") || undefined,

        //     status: novosFiltros.status?.trim()
        //         ? novosFiltros.status.trim()
        //         : searchParams.get("status") || undefined,

        //     dataInicio: novosFiltros.dataInicio
        //         ? novosFiltros.dataInicio
        //         : searchParams.get("dataInicio") || undefined,

        //     dataFim: novosFiltros.dataFim
        //         ? novosFiltros.dataFim
        //         : searchParams.get("dataFim") || undefined,
        // };

        // Only update URL if skipUrlUpdate is not true
        if (!props?.skipUrlUpdate) {
            handleItemClick(novosFiltros, "");
        }

        setFiltros(novosFiltros);
        setBuscaExecutada(true);
    }

    async function validarExclusao(id: number) {
        try {
            return await reservasService.verificarSePodeExcluir(id);
        } catch (error) {
            console.error("Erro ao validar exclusão:", error);
            return { canDelete: false, reason: "Erro ao validar exclusão." };
        }
    }

    async function handleDeleteReserva(id: number) {
        deleteMutation.mutate(id);
    }

    return {
        reservas: data || [],
        isFetching,
        executarBusca,
        filtros,
        handleDeleteReserva,
        validarExclusao,
        refetch: () => queryClient.invalidateQueries({ queryKey: ["reservas"] })
    };
}
