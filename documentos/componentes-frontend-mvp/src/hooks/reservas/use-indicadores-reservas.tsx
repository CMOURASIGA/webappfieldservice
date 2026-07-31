"use client";

import { reservasService } from "@/services/reservas/reservas.service";
import { useQuery } from "@tanstack/react-query";

export function useIndicadoresReservas() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["indicadores-reservas"],
        queryFn: () => reservasService.obterIndicadores(),
        refetchOnWindowFocus: false,
    });

    return {
        dadosStatus: data,
        isLoading,
        isError,
    };
}
