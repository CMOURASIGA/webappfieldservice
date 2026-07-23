"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listarDisponibilidade } from "@/services/espacos/espaco.service";// Ajuste o caminho do seu serviço
import { Espaco } from "@/services/espacos/tipo-espaco";
import useRoute from "../useRoute"; // Ajuste o caminho do seu hook de rota
import { FiltrosNovaReserva } from "@/components/reservas/busca/campos-filtro-nova-reserva";

interface UseNovaBuscaReservaProps {
    initialFilters?: FiltrosNovaReserva;
}

export default function useNovaBuscaReserva(props?: UseNovaBuscaReservaProps) {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const { handleItemClick } = useRoute();

    const [espacosFiltrados, setEspacosFiltrados] = useState<Espaco[]>([]);
    const [buscaExecutada, setBuscaExecutada] = useState(false);
    const [espacos, setEspacos] = useState<Espaco[]>([]);

    // Inicialização dos filtros pegando da URL (Search Params)
    const [filtros, setFiltros] = useState<FiltrosNovaReserva>(() => ({
        idLocal: searchParams.get("idLocal") || "",
        Id: searchParams.get("Id") || "",
        nome: searchParams.get("nome") || "",
        dataInicial: searchParams.get("dataInicial") || "",
        dataFinal: searchParams.get("dataFinal") || "",
        horaInicial: searchParams.get("horaInicial") || "",
        horaFinal: searchParams.get("horaFinal") || "",
        capacidade: searchParams.get("capacidade") ? Number(searchParams.get("capacidade")) : 0,
        ...props?.initialFilters
    }));

    const { data, isFetching } = useQuery({
        queryKey: ["espacosDisponibilidade", filtros.idLocal, filtros.Id, filtros.nome, filtros.dataInicial, filtros.dataFinal, filtros.capacidade],
        queryFn: () => listarDisponibilidade(filtros),
    });

    if (data && data !== espacos) {
        setEspacos(data);
    }

    function executarBusca(novosFiltros: FiltrosNovaReserva) {

        const filtrosParaUrl = {
            ...novosFiltros,

            idLocal: novosFiltros.idLocal
                ? String(novosFiltros.idLocal)
                : searchParams.get("idLocal") || undefined,

            Id: novosFiltros.Id
                ? String(novosFiltros.Id)
                : searchParams.get("Id") || undefined,

            nome: novosFiltros.nome?.trim()
                ? novosFiltros.nome.trim()
                : searchParams.get("nome") || undefined,

            capacidade: (novosFiltros.capacidade !== undefined && novosFiltros.capacidade !== 0)
                ? String(novosFiltros.capacidade)
                : searchParams.get("capacidade") || undefined,

            dataInicial: novosFiltros.dataInicial
                ? novosFiltros.dataInicial
                : searchParams.get("dataInicial") || undefined,

            dataFinal: novosFiltros.dataFinal
                ? novosFiltros.dataFinal
                : searchParams.get("dataFinal") || undefined,

            horaInicial: novosFiltros.horaInicial
                ? novosFiltros.horaInicial
                : searchParams.get("horaInicial") || undefined,

            horaFinal: novosFiltros.horaFinal
                ? novosFiltros.horaFinal
                : searchParams.get("horaFinal") || undefined,
        };
        // 2. Atualiza a URL
        handleItemClick(filtrosParaUrl, "");

        // 4. Atualiza estados finais
        setFiltros(novosFiltros);
        setBuscaExecutada(true);
    }

    const limparFiltros = () => {
        const filtrosVazios: FiltrosNovaReserva = {
            idLocal: "",
            nome: "",
            dataInicial: "",
            dataFinal: "",
            horaInicial: "",
            horaFinal: "",
            capacidade: 0,
        };
        handleItemClick(filtrosVazios, "");
        setFiltros(filtrosVazios);
        setEspacosFiltrados([]);
        setBuscaExecutada(false);
    };

    return {
        // Se a busca já foi feita, mostra o filtrado, senão o bruto da query
        espacos: espacos,
        total: (buscaExecutada ? espacosFiltrados.length : espacos.length),
        isFetching,
        executarBusca,
        filtros,
        setFiltros,
        limparFiltros,
        refetch: () => queryClient.invalidateQueries({ queryKey: ["espacosDisponibilidade"] })
    };
}