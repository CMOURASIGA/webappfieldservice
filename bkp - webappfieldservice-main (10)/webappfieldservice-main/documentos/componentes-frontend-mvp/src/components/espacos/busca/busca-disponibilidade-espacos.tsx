"use client";

import { useState } from "react";
import { SearchBarContainer } from "@/components/layouts/search-bar-container";
import { Espaco } from "@/services/espacos/tipo-espaco";
import { CabecalhoBuscaDisponibilidade } from "./cabecalho-busca-disponibilidade";
import { GradeDisponibilidade } from "./grade-disponibilidade";
import { CamposFiltroDisponibilidade } from "./campos-filtro-disponibilidade";
import useBuscaDisponibilidade from "@/hooks/espacos/use-busca-disponibilidade";
import { useRouter } from "next/navigation";
import { FolderOpenIcon } from "lucide-react";

export function BuscaDisponibilidadeEspacos() {
    const router = useRouter();
    const {
        espacos,
        isFetching,
        executarBusca,
        filtros,
    } = useBuscaDisponibilidade();
    const handleReservar = (espaco: Espaco) => {
        let url = `/reservas/novo?idLocal=${espaco.idLocal}&idEspaco=${espaco.Id}`;
        const dataInicio = filtros.dataInicial ? filtros.dataInicial : new Date().toISOString();
        url += `&dataInicio=${dataInicio}`;
        if (filtros.dataFinal) {
            url += `&dataFim=${filtros.dataFinal}`;
        }
        router.push(url);
    };

    return (
        <div className="w-full">
            <div className="mb-6">
                <CabecalhoBuscaDisponibilidade />

                <SearchBarContainer>
                    {/* Componente que contém Local, Nome, Data e Qtd Pessoas */}
                    <CamposFiltroDisponibilidade
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
                    loading={isFetching}
                    onReservar={handleReservar}
                />
            </section >
        </div >
    );
}