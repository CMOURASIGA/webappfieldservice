"use client";

import { useState } from "react";
import IconTrash from "@/icons/trash";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Espaco } from "@/services/espacos/tipo-espaco";
import CamposBuscaEspacos from "./campos-busca-espacos";
import { CabecalhoBuscaEspacos } from "./cabecalho-busca-espacos";
import { GradeEspacos } from "./grade-espacos";
import { SearchBarContainer } from "@/components/layouts/search-bar-container";
import useEspacos from "@/hooks/espacos/use-espacos";
import { FolderOpenIcon } from "lucide-react";

export function BuscaEspacos() {
    const { espacos, isFetching, filtros, executarBusca, limparBusca, validarExclusao, handleDeleteEspaco } = useEspacos();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogEspaco, setDialogEspaco] = useState<Espaco | null>(null);
    const [dialogMode, setDialogMode] = useState<"info" | "confirm">("confirm");
    const [deleteInfoMessage, setDeleteInfoMessage] = useState("");


    async function handleDeleteClick(ev: Espaco) {
        setDialogEspaco(ev);
        const podeExcluir = await validarExclusao(ev);

        if (!podeExcluir) {
            setDialogMode("info");
            setDeleteInfoMessage("Este espaço não pode ser excluído pois possui reservas ou pendências.");
            setDialogOpen(true);
            return;
        }

        setDialogMode("confirm");
        setDialogOpen(true);
    }

    function confirmDelete() {
        if (!dialogEspaco) return;
        handleDeleteEspaco(dialogEspaco);
        setDialogOpen(false);
    }

    return (
        <div className="w-full">
            <div className="mb-6">
                <CabecalhoBuscaEspacos />
                <SearchBarContainer>
                    <div className="flex items-end gap-4">
                        <CamposBuscaEspacos
                            filtros={filtros}
                            loading={isFetching}
                            enviarFiltros={executarBusca}
                            limparFiltros={limparBusca}
                        />
                    </div>
                </SearchBarContainer>
            </div>

            <section className="px-6 min-h-[600px]">
                <div style={{ fontSize: "medium", marginBottom: "15px", fontWeight: "bold", color: "#004A8D" }}>
                    {isFetching ? (
                        <span className="animate-pulse">Buscando espaços...</span>
                    ) : (espacos?.length || isFetching) ? (
                        <div className="flex flex-col gap-1">
                            <span>Espaços encontrados | {espacos?.length}</span>
                            {espacos && espacos.length >= 30 && (
                                <span className="text-xs font-medium text-amber-600">
                                    Exibindo os primeiros 30 registros. Refine sua busca para encontrar mais resultados.
                                </span>
                            )}
                        </div>
                    ) : (<div className="flex flex-col items-center justify-center min-h-96 text-gray-500 bg-gray-50 rounded"> <FolderOpenIcon className="mb-4 size-12" />
                        <span className="text-lg font-medium">
                            Nenhum espaço encontrado para os critérios informados.
                        </span></div>
                    )}
                </div>

                <div className={isFetching ? "opacity-50 transition-opacity" : "opacity-100"}>
                    <GradeEspacos itens={espacos} onDeleteClick={handleDeleteClick} loading={isFetching} />
                </div>

                <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <div className="flex justify-center mb-2">
                                <IconTrash className="w-9 h-9 cnc-text-brand-gray-600" />
                            </div>
                            <AlertDialogTitle>
                                {dialogMode === "info" ? "Não é possível excluir" : "Confirmar exclusão"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {dialogMode === "info" ? (
                                    deleteInfoMessage
                                ) : (
                                    <span>
                                        Tem certeza que deseja excluir o espaço <strong>{dialogEspaco?.nome}</strong>?
                                        <br />
                                        Esta ação não poderá ser desfeita.
                                    </span>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDialogOpen(false)}>
                                Não, cancelar.
                            </AlertDialogCancel>
                            {dialogMode === "confirm" && (
                                <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={confirmDelete}
                                >
                                    Sim, tenho certeza
                                </AlertDialogAction>
                            )}
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </section>
        </div>
    );
}