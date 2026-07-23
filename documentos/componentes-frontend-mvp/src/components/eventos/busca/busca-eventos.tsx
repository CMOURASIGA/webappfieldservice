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
import { Evento } from "@/services/eventos/tipo-evento";
import CamposBuscaEventos from "./campos-busca-eventos";
import { CabecalhoBuscaEventos } from "./cabecalho-busca-eventos";
import { GradeEventos } from "./grade-eventos";
import { SearchBarContainer } from "@/components/layouts/search-bar-container";
import useEventos from "@/hooks/eventos/use-eventos";

import { ReadonlyURLSearchParams } from "next/navigation";
import { FolderOpenIcon } from "lucide-react";

export function temFiltroNaUrl(params: ReadonlyURLSearchParams | URLSearchParams): boolean {
  const chavesRelevantes = ["q", "status", "prioridade", "dataInicio", "dataFim", "estrategico"];

  return chavesRelevantes.some((chave) => {
    const valor = params.get(chave);
    return valor !== null && valor.trim() !== "";
  });
}
export function BuscaEventos() {
  const { eventos, total, isFetching, executarBusca, limparBusca, buscaExecutada, filtros, handleDeleteEvento, validarExclusaoApi } = useEventos();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogEvento, setDialogEvento] = useState<Evento | null>(null);
  const [dependencyData, setDependencyData] = useState<Record<string, unknown> | undefined>(undefined);
  const [validatingEventId, setValidatingEventId] = useState<string | null>(null);

  async function handleDeleteClick(ev: Evento) {
    setDialogEvento(ev);
    setDependencyData(undefined); // Reset previous state
    setValidatingEventId(ev.id);

    try {
      const validation = await validarExclusaoApi(ev.id);

      if (!validation.allowed) {
        // If not allowed (e.g. status not Planejado), show error and don't open confirmation
        // Using alert for now, or could iterate to a better UI
        alert(validation.message || "Não é possível excluir este evento.");
        return;
      }

      // If allowed but has dependencies, set them to show in dialog
      if (validation.dependencies) {
        setDependencyData(validation.dependencies);
      }

      setDialogOpen(true);
    } catch (error) {
      console.error("Erro ao validar exclusão", error);
      alert("Erro ao verificar permissão de exclusão.");
    } finally {
      setValidatingEventId(null);
    }
  }

  function confirmDelete() {
    if (!dialogEvento) return;
    handleDeleteEvento(dialogEvento);
    setDialogOpen(false);
    setDependencyData(undefined);
  }


  return (
    <div className="w-full">
      <div className="mb-6">
        <CabecalhoBuscaEventos />
        <SearchBarContainer>
          <div className="flex items-end gap-4">
            <CamposBuscaEventos filtros={filtros} loading={isFetching} enviarFiltros={executarBusca} onLimpar={limparBusca} />
          </div>
        </SearchBarContainer>
      </div>

      <section className="px-6">
        <div className="mt-4 mb-4" role="status" aria-live="polite">
          {!buscaExecutada ? (
            <div className="flex flex-col items-center justify-center min-h-96 text-gray-500 bg-gray-50 rounded">
              <FolderOpenIcon className="mb-4 size-12" />
              <span>Use os filtros acima e clique em <strong>Pesquisar</strong> para buscar eventos.</span>
            </div>
          ) : (eventos?.length || isFetching) ? (
            <>
              <div style={{ fontSize: "medium", fontWeight: "bold", color: "#004A8D" }}>
                {`Eventos encontrados | ${isFetching ? "carregando ..." : total?.toLocaleString("pt-BR")}`}
              </div>
              {!isFetching && (eventos?.length || 0) >= 30 && (
                <div className="text-amber-600 text-sm">
                  Exibindo os <span className="font-bold">{eventos?.length}</span> primeiros
                  registros. Utilize os filtros para refinar sua busca.
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-96 text-gray-500 bg-gray-50 rounded">
              <FolderOpenIcon className="mb-4 size-12" />
              <span>Nenhum evento encontrado para os critérios informados.</span>
            </div>
          )}
        </div>

        <GradeEventos
          itens={eventos}
          onDeleteClick={handleDeleteClick}
          loading={isFetching}
          validatingEventId={validatingEventId}
        />

        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex justify-center mb-2">
                <IconTrash className="w-9 h-9 cnc-text-brand-gray-600" />
              </div>
              <AlertDialogTitle>
                Confirmar exclusão
              </AlertDialogTitle>
              <AlertDialogDescription>
                {dependencyData ? (
                  <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-amber-800 text-sm mb-2">
                    <p className="font-bold mb-1">Atenção! Este evento possui vínculos:</p>
                    <ul className="list-disc pl-5 space-y-0.5 mb-2">
                      {Object.entries(dependencyData).map(([key, value]) => {
                        if (key === 'Reservas' && typeof value === 'object' && value !== null && 'details' in value) {
                          const typedValue = value as { count: number; details: any[] };
                          return (
                            <li key={key}>
                              {typedValue.count} {key}
                              <ul className="list-circle pl-5 mt-1 text-xs text-amber-700">
                                {typedValue.details.map((res: { id: string; local: string; espaco: string }) => (
                                  <li key={res.id}>
                                    {res.local} - {res.espaco}
                                  </li>
                                ))}
                              </ul>
                            </li>
                          );
                        }
                        return <li key={key}>{String(value)} {key}</li>;
                      })}
                    </ul>
                    <p>Ao excluir o evento, todos esses vínculos serão removidos automaticamente.</p>
                    <p className="font-bold mt-2">Deseja realmente excluir?</p>
                  </div>
                ) : (
                  <span>
                    Tem certeza que deseja excluir o evento <strong>{dialogEvento?.titulo}</strong>?
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
              <AlertDialogAction onClick={confirmDelete} className={dependencyData ? "bg-red-600 hover:bg-red-700" : ""}>
                {dependencyData ? "Sim, excluir tudo" : "Sim, tenho certeza"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}

