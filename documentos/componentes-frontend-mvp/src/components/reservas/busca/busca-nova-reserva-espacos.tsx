"use client";

import { useState } from "react";
import { SearchBarContainer } from "@/components/layouts/search-bar-container";
import { Espaco } from "@/services/espacos/tipo-espaco";
import { CabecalhoBuscaDisponibilidade } from "./cabecalho-nova-reserva";
import { GradeDisponibilidade } from "./grade-nova-reserva";
import { CamposFiltroNovaReserva } from "./campos-filtro-nova-reserva";
import useNovaBuscaReserva from "@/hooks/reservas/use-nova-busca-reserva";
import { useRouter } from "next/navigation";
import { FolderOpenIcon } from "lucide-react";

export function BuscaNovaReservaEspacos() {
    const router = useRouter();
    const {
        espacos,
        isFetching,
        executarBusca,
        filtros,
    } = useNovaBuscaReserva();
    return (
        <div className="w-full">
            <div className="mb-6">
                <CabecalhoBuscaDisponibilidade />

                <SearchBarContainer>
                    {/* Componente que contém Local, Nome, Data, Hora e Qtd Pessoas */}
                    <CamposFiltroNovaReserva
                        filtros={filtros}
                        enviarFiltros={executarBusca}
                        loading={isFetching}
                    />
                </SearchBarContainer>
            </div>

            <section className="px-6">
                <div style={{ fontSize: "medium", fontWeight: "bold", color: "#004A8D" }}>
                    {isFetching ? (
                        <span className="animate-pulse">Buscando espaços...</span>
                    ) : (espacos?.length > 0) ? (
                        <span>Espaços disponiveis encontrados | {espacos.length}</span>
                    ) : (<div className="flex flex-col items-center justify-center min-h-96 text-gray-500 bg-gray-50 rounded"> <FolderOpenIcon className="mb-4 size-12" />
                        <span>Nenhum espaço encontrado para os critérios informados.</span></div>
                    )}
                </div>

                <GradeDisponibilidade
                    itens={espacos}
                    filtros={filtros}
                    loading={isFetching}
                />
            </section >
        </div >
    );
}