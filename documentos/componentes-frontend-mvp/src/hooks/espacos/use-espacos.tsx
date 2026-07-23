"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getAllEspacos, deleteEspaco, FiltrosEspacosProps, validarExclusaoEspaco } from "@/services/espacos/espaco.service";
import { Espaco } from "@/services/espacos/tipo-espaco";
import { useSearchParams } from "next/navigation";
import useRoute from "../useRoute";
import { Evento } from "@/app/(private)/eventos/evento";

export default function useEspacos() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const { handleItemClick } = useRoute();

    const initialFiltros: FiltrosEspacosProps = {
        nome: searchParams.get("nome") || "",
        ativo: searchParams.get("ativo") || "",
    };
    const [filtros, setFiltros] = useState<FiltrosEspacosProps>(initialFiltros);
    const searchAll = searchParams.get("searchAll") === "true";
    const [buscaExecutada, setBuscaExecutada] = useState<boolean>(searchAll);
    const { data, isFetching } = useQuery({
        queryKey: ["espacos", filtros],
        queryFn: () => getAllEspacos(filtros),
        enabled: buscaExecutada,
    });
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteEspaco(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["espacos"] });
            toast.success("Espaço excluído com sucesso.");
        },
        onError: (error: any) => {
            console.error("Erro ao excluir espaço:", error);
            toast.error(error.message || "Erro ao excluir o espaço. Tente novamente.");
        },
    });
    function executarBusca(next: FiltrosEspacosProps) {
        setFiltros(next);
        handleItemClick(next, "");
        setBuscaExecutada(true);
    }

    function limparBusca() {
        const emptyFiltros = { nome: "", ativo: "", idLocal: "", idEspaco: "" };
        setFiltros(emptyFiltros);
        handleItemClick(emptyFiltros, "");
        setBuscaExecutada(false); 
        queryClient.removeQueries({ queryKey: ["espacos"] });
    }


    async function validarExclusao(espaco: Espaco): Promise<boolean> {
        const validation = await validarExclusaoEspaco(espaco.Id);
        return validation.canDelete;
    }

    function handleDeleteEspaco(espaco: Espaco) {
        deleteMutation.mutate(espaco.Id);
    }

    return {
        espacos: data,
        isFetching,
        filtros,
        executarBusca,
        limparBusca,
        validarExclusao,
        handleDeleteEspaco,
    };
}
