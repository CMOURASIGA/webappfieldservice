"use client";

import useReservas from "@/hooks/reservas/use-reservas";
import { CabecalhoBuscaReservas } from "./cabecalho-busca-reservas";
import CamposBuscaReservas from "./campos-busca-reservas";
import { GradeReservas } from "./grade-reservas";
import { SearchBarContainer } from "@/components/layouts/search-bar-container";
import { useState } from "react";
import { Reserva } from "@/services/reservas/tipo-reserva";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import IconTrash from "@/icons/trash";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { FolderOpenIcon } from "lucide-react";
function temFiltroNaUrl(params: ReadonlyURLSearchParams | URLSearchParams): boolean {
    const chavesRelevantes = ["idEspaco",
        "idEvento",
        "solicitante",
        "dataInicio",
        "dataFim",
        "status",
        "disponiveis"]
    return chavesRelevantes.some((chave) => {
        const valor = params.get(chave);
        return valor !== null && valor.trim() !== "";
    });
}
export function BuscaReservas() {
    const { reservas, isFetching, executarBusca, filtros, handleDeleteReserva, validarExclusao } = useReservas();
    const params = useSearchParams();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogReserva, setDialogReserva] = useState<Reserva | null>(null);
    const [validationMessage, setValidationMessage] = useState<string | null>(null);

    async function handleDeleteClick(reserva: Reserva) {
        setDialogReserva(reserva);
        setValidationMessage(null); // Reset anterior

        const validation = await validarExclusao(reserva.id);
        if (validation.message) {
            setValidationMessage(validation.message);
        }

        // Se houver algum erro impeditivo (canDelete=false), poderíamos tratar aqui, 
        // mas o requisito é focar na mensagem de aviso do evento.

        setDialogOpen(true);
    }

    function confirmDelete() {
        if (dialogReserva) {
            handleDeleteReserva(dialogReserva.id);
            setDialogOpen(false);
        }
    }


    return (
        <div className="w-full">
            <div className="mb-6">
                <CabecalhoBuscaReservas />
                <SearchBarContainer>
                    <div className="flex items-end gap-4">
                        <CamposBuscaReservas filtros={filtros} loading={isFetching} enviarFiltros={executarBusca} />
                    </div>
                </SearchBarContainer>
            </div>

            <section className="px-6">
                <div style={{ fontSize: "medium", fontWeight: "bold", marginBottom: "15px", color: "#004A8D" }}>
                    {(reservas.length || isFetching) ? (
                        <div className="flex flex-col gap-1">
                            <span>Reservas encontradas | {reservas.length}</span>
                            {reservas.length >= 30 && (
                                <span className="text-xs font-medium text-amber-600">
                                    Exibindo os primeiros 30 registros. Refine sua busca para encontrar mais resultados.
                                </span>
                            )}
                        </div>
                    ) : (<div className="flex flex-col items-center justify-center min-h-96 text-gray-500 bg-gray-50 rounded"> <FolderOpenIcon className="mb-4 size-12" />
                        <span>Nenhuma reserva encontrada.</span></div>
                    )}
                </div>

                <GradeReservas itens={reservas} loading={isFetching} onDeleteClick={handleDeleteClick} />

                <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <div className="flex justify-center mb-2">
                                <IconTrash className="w-9 h-9 cnc-text-brand-gray-600" />
                            </div>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription className="text-center">
                                {validationMessage ? (
                                    <span className="block mb-2 font-medium text-amber-600">
                                        {validationMessage}
                                    </span>
                                ) : null}
                                Tem certeza que deseja excluir esta reserva?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDialogOpen(false)}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete}>Sim, excluir</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </section>
        </div>
    );
}
