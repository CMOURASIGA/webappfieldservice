"use client";

import React, { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge, Button } from "@cnc-ti/layout-basic";
import { ShieldCheck, Link2, AlertCircle, ArrowRight, History, Clock } from "lucide-react";
import { Evento } from "@/services/eventos/tipo-evento";
import { useForm, FormProvider } from "react-hook-form";
import { updateEventoAction } from "@/app/(private)/eventos/action";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { FormTextarea } from "@/components/layouts/ui/form-components";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evento: Evento | null;
};

export function ModalFluxoStatus({ open, onOpenChange, evento }: Props) {
  const methods = useForm({
    defaultValues: {
      destinoFluxo: "",
      justificativa: "",
    },
  });

  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitType, setSubmitType] = useState<"success" | "reject" | "adjustment" | "cancel">("success");
  const [showConfirm, setShowConfirm] = useState(false);


  const { handleSubmit, register, setValue } = methods;


  React.useEffect(() => {
    setErrorMsg("");
  }, [open, evento]);

  if (!evento) return null;

  const handlePrefinalSubmit = () => {
    if (isFinalizado) return;
    setShowConfirm(true);
  };

  const onSubmit = async (data: { destinoFluxo: string; justificativa: string }) => {
    setErrorMsg("");

    const nextEtapa = todasEtapas.find(e => e.id > currentEtapaId && !e.hidden);
    let finalDestino = nextEtapa?.dbLabel || "";
    let finalJustificativa = data.justificativa;

    // Lógica para tipos de submissão diferentes
    if (submitType === "reject") {
      finalDestino = "REJEITADO";
      finalJustificativa = data.justificativa?.trim() || "";
    } else if (submitType === "adjustment") {
      finalDestino = "Em elaboração";
      finalJustificativa = data.justificativa?.trim() || "";
    } else if (submitType === "cancel") {
      finalDestino = "CANCELADO";
      finalJustificativa = data.justificativa?.trim() || "";
    } else if (currentEtapaId === 5) {
      // Quando está em "Confirmado" (ID 5) e clica em "Concluir", vai para "Concluído" (ID 6)
      finalDestino = "Concluído";
      finalJustificativa = data.justificativa?.trim() || "";
    } else if (currentEtapaId === 2) {
      // Regra específica para a fase "Aguardando validação" (Aprovação/Confirmação)
      finalJustificativa = data.justificativa?.trim() || "";
    }

    const camposFaltando: string[] = [];

    if (!finalDestino && currentEtapaId < 6) camposFaltando.push("Destino do Fluxo");

    // Validação de campos obrigatórios do EVENTO antes de avançar para "Aguardando Validação" (ID 2) ou mais
    const e = evento as any;
    if (submitType === "success" && currentEtapaId === 1) {
      const titulo = e.titulo || e.nome;
      const demandantes = e.demandantesArea || e.DemandanteEvento;
      const isExternal = e.isExternal !== undefined ? e.isExternal : !!e.localExterno;
      const espacoId = e.idEspaco || e.Espaco?.id || e.Espaco?.Id;

      if (!titulo?.trim()) camposFaltando.push("Título");
      if (!e.idCategoria) camposFaltando.push("Categoria");
      if (!e.idNumeroParticipantes) camposFaltando.push("Público Alvo");
      if (!demandantes || demandantes.length === 0) camposFaltando.push("Área Demandante");
      if (!isExternal && !espacoId) camposFaltando.push("Espaço");
    }

    if (submitType === "reject" && !data.justificativa?.trim()) camposFaltando.push("Justificativa");

    if (camposFaltando.length > 0) {
      setErrorMsg(camposFaltando.join('|'));
      if (camposFaltando.includes("Destino do Fluxo")) {
        setShowConfirm(false); // Volta para edição se houver erro
      }
      return;
    }

    try {
      setIsLoading(true);
      const result = await updateEventoAction(Number(evento.id), {
        status: finalDestino,
        justificativa: finalJustificativa,
      });

      if (result.success) {
        // Invalida tanto a lista quanto o evento individual
        await queryClient.invalidateQueries({ queryKey: ["eventos"] });
        await queryClient.invalidateQueries({ queryKey: ["evento", Number(evento.id)] });
        router.refresh();
        setShowConfirm(false);
        setValue("justificativa", ""); // Limpar justificativa após o sucesso
        // onOpenChange(false); // Mantém o drawer aberto a pedido do usuário
      } else {
        setErrorMsg(result.error || "Erro ao atualizar status do evento.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro inesperado ao atualizar status.");
    } finally {
      setIsLoading(false);
    }
  };

  const statusAtual =
    evento.Status_Relation?.status ||
    evento.status ||
    evento.Situacao?.nome ||
    "EM ELABORAÇÃO";
  const idEventoFormatado = evento.id.toString().padStart(3, "0");

  const isEstrategico = (evento as any)?.estrategico;

  // Calculado antes de todasEtapas para poder ser usado em hidden
  const statusIdMap: Record<string, number> = {
    "em elaboração": 1,
    "aguardando validação": 2,
    "aguardando aprovação": 3,
    "aguardando confirmação": 4,
    "confirmado": 5,
    "concluído": 6,
    "rejeitado": 7,
    "cancelado": 8,
  };
  const currentEtapaId = statusIdMap[statusAtual.toLowerCase()] || 1;

  const todasEtapas = [
    { id: 1, label: "Em elaboração", shortLabel: "Elaboração", dbLabel: "Em elaboração" },
    { id: 2, label: "Aguardando validação", shortLabel: "Validação", dbLabel: "Aguardando validação" },
    { id: 3, label: "Aguardando aprovação", shortLabel: "Aprovação", dbLabel: "Aguardando aprovação", hidden: !isEstrategico },
    { id: 4, label: "Aguardando confirmação", shortLabel: "Confirmação", dbLabel: "Aguardando confirmação" },
    { id: 5, label: "Confirmado", shortLabel: "Confirmado", dbLabel: "Confirmado" },
    { id: 6, label: "Concluído", shortLabel: "Concluído", dbLabel: "Concluído", hidden: currentEtapaId < 6 },
    { id: 7, label: "Rejeitado", shortLabel: "Rejeitado", dbLabel: "REJEITADO", hidden: true },
    { id: 8, label: "Cancelado", shortLabel: "Cancelado", dbLabel: "CANCELADO", hidden: true },
  ];

  const etapas = todasEtapas.filter(e => !e.hidden);
  const isFinalizado = currentEtapaId === 6 || currentEtapaId === 7 || currentEtapaId === 8;

  const tipoOperacional = (evento as any)?.estrategico ? "ESTRATÉGICO" : "OPERACIONAL";

  const sugerido = !isFinalizado ? tipoOperacional : "FLUXO FINALIZADO";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={`w-full ${isEstrategico ? 'sm:max-w-2xl' : 'sm:max-w-xl'} p-0 overflow-hidden border-none shadow-2xl text-brand-blue-900 flex flex-col h-full rounded-l-2xl`}>
        {/* HEADER */}
        <div className="flex flex-col items-start gap-4 p-6 pb-2 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 leading-none">Fluxo de Status</h2>
          </div>

          <div className="flex flex-col items-start w-full">
            <p className="text-sm font-mono text-gray-400 tracking-wider"># EVT-{idEventoFormatado}</p>
            <h3 className="text-xl font-bold text-gray-800 mt-2 mb-3 leading-tight w-full">{evento.titulo}</h3>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="border-gray-200 bg-transparent border text-gray-600 font-semibold px-4 py-1.5 rounded-full uppercase text-xs">
                {statusAtual}
              </Badge>
              {currentEtapaId < 6 && (
                <Badge variant="default" className="border-indigo-100 border bg-indigo-50 text-indigo-700 font-semibold px-4 py-1.5 rounded-full uppercase text-xs flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" />
                  {sugerido}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handlePrefinalSubmit)} className="flex flex-col flex-1 h-full min-h-0">
            {/* BODY */}
            <div className="px-8 py-6 bg-white border-t border-gray-100 flex-1 overflow-y-auto">

              <div className="mb-10">
                <h4 className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-6">Fluxo Evolutivo</h4>

                <div className="flex items-center justify-between w-full px-1 overflow-x-auto no-scrollbar gap-1 sm:gap-2 pb-2">
                  {etapas.map((etapa, i) => {
                    const isActive = etapa.id === currentEtapaId;
                    const isCompleted = etapa.id < currentEtapaId && currentEtapaId < 7; // Não marca como completado se for erro/cancelamento

                    return (
                      <React.Fragment key={etapa.id}>
                        <div className="flex flex-col items-center justify-start gap-1 bg-white px-0.5 relative z-10 shrink-0 w-[65px] sm:w-[75px]">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full border-[2px] flex items-center justify-center font-bold text-xs sm:text-sm transition-all
                            ${isActive ? 'border-brand-blue-500 text-brand-blue-500 bg-white shadow-[0_0_0_2px_rgba(30,58,138,0.1)]' :
                              isCompleted ? 'border-brand-blue-200 text-brand-blue-200 bg-brand-blue-50/30' : 'border-gray-100 bg-white text-gray-200'}`}>
                            {isCompleted ? <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-brand-blue-400" /> : <span className="mt-0.5">{i + 1}</span>}
                          </div>
                          <span className={`text-[8px] sm:text-[9px] text-center uppercase font-bold tracking-wider leading-tight ${isActive ? 'text-brand-blue-900' : isCompleted ? 'text-brand-blue-400' : 'text-gray-300'}`}>
                            {etapa.shortLabel}
                          </span>
                        </div>
                        {i < etapas.length - 1 && (
                          <div className="flex items-center justify-center mb-4 shrink-0">
                            <ArrowRight className={`w-3 h-3 ${isCompleted ? 'text-brand-blue-100' : 'text-gray-100'}`} />
                          </div>
                        )}
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-6">

                {!isFinalizado && !showConfirm && currentEtapaId === 1 && evento.FluxoStatusEvento?.some(f => f.justificativa) && (
                  <div className="bg-orange-50/80 p-4 rounded-xl border border-orange-200/60 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 mt-0.5">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-orange-900 mb-1 flex justify-between items-center">
                          <span>Atenção: Justificativa Anterior</span>
                          <span className="text-[10px] font-mono text-orange-500 font-medium">#{evento.FluxoStatusEvento.find(f => f.justificativa)?.id}</span>
                        </h4>
                        <div className="text-sm text-orange-800 leading-relaxed italic border-l-2 border-orange-300 pl-3 my-2 whitespace-pre-wrap break-words">
                          &quot;{evento.FluxoStatusEvento.find(f => f.justificativa)?.justificativa}&quot;
                        </div>
                        <div className="text-[10px] font-medium text-orange-600/80 text-right w-full flex justify-end gap-1">
                          <span>Registrado por:</span>
                          <span className="font-bold text-orange-700">{evento.FluxoStatusEvento.find(f => f.justificativa)?.usuario}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!isFinalizado && !showConfirm && (
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between w-full gap-3">
                    {(currentEtapaId === 2 || currentEtapaId === 3 || currentEtapaId === 4 || currentEtapaId === 5) && (
                      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                        {(currentEtapaId === 2 || currentEtapaId === 3) && (
                          <>
                            <Button
                              type="submit"
                              disabled={isLoading}
                              onClick={() => setSubmitType("reject")}
                              className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-3 px-6 rounded-md transition-all active:scale-95 whitespace-nowrap shadow-none min-w-[100px] flex justify-center items-center gap-2"
                            >
                              {isLoading && submitType === "reject" ? (
                                <>
                                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  ...
                                </>
                              ) : "Rejeitar"}
                            </Button>

                            {currentEtapaId === 2 && (
                              <Button
                                type="submit"
                                disabled={isLoading}
                                onClick={() => setSubmitType("adjustment")}
                                className="w-full bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 font-bold py-3 px-6 rounded-md transition-all active:scale-95 whitespace-nowrap shadow-none min-w-[130px] flex justify-center items-center gap-2"
                              >
                                {isLoading && submitType === "adjustment" ? (
                                  <>
                                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ...
                                  </>
                                ) : "Pedir Ajuste"}
                              </Button>
                            )}
                          </>
                        )}

                        {(currentEtapaId === 4 || currentEtapaId === 5) && (
                          <Button
                            type="submit"
                            disabled={isLoading}
                            onClick={() => setSubmitType("cancel")}
                            className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-3 px-6 rounded-md transition-all active:scale-95 whitespace-nowrap shadow-none min-w-[110px] flex justify-center items-center gap-2"
                          >
                            {isLoading && submitType === "cancel" ? (
                              <>
                                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ...
                              </>
                            ) : "Cancelar"}
                          </Button>
                        )}
                      </div>
                    )}

                    {currentEtapaId !== 5 && (
                      <Button
                        type="submit"
                        disabled={isLoading || isFinalizado}
                        onClick={() => setSubmitType("success")}
                        className="w-full flex items-center justify-center gap-2 min-w-[140px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-md shadow-lg shadow-emerald-100 transition-all active:scale-95 whitespace-nowrap"
                      >
                        {isLoading && submitType === "success" ? (
                          <>
                            <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            {currentEtapaId === 1 && "Enviar para Validação"}
                            {currentEtapaId === 2 && "Validar"}
                            {currentEtapaId === 3 && "Aprovar"}
                            {currentEtapaId === 4 && "Confirmar"}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}

                {showConfirm && (
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-900">Revisar Alteração</h4>
                        <p className="text-xs text-emerald-700">Verifique os dados antes de confirmar</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white/60 p-3 rounded-lg border border-emerald-100/50">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-1">Novo Status</span>
                        <p className="font-bold text-emerald-900">
                          {submitType === "success"
                            ? (todasEtapas.find(e => e.id > currentEtapaId && !e.hidden)?.label || sugerido)
                            : submitType === "reject"
                              ? "REJEITADO"
                              : submitType === "adjustment"
                                ? "EM ELABORAÇÃO (Ajuste)"
                                : "CANCELADO"
                          }
                        </p>
                      </div>

                      {(submitType === "reject" || submitType === "adjustment" || submitType === "cancel") ? (
                        <div className="bg-white/60 p-3 rounded-lg border border-emerald-100/50">
                          <FormTextarea
                            {...register("justificativa")}
                            label={`Justificativa ${submitType === 'reject' ? '*(Obrigatória)' : '(Opcional)'}`}
                            placeholder="Descreva o motivo..."
                            required={submitType === "reject"}
                          />
                        </div>
                      ) : methods.getValues("justificativa") ? (
                        <div className="bg-white/60 p-3 rounded-lg border border-emerald-100/50">
                          <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-1">Justificativa</span>
                          <p className="text-sm text-emerald-800 italic leading-relaxed">
                            &quot;{methods.getValues("justificativa")}&quot;
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowConfirm(false)}
                        className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold"
                      >
                        Voltar
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200"
                      >
                        {isLoading ? (
                          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : "Confirmar"}
                      </Button>
                    </div>
                  </div>
                )}

                {isFinalizado && (
                  <div className={`flex flex-col items-center justify-center py-12 px-6 rounded-3xl border text-center transition-all duration-500 shadow-sm ${currentEtapaId === 7 || currentEtapaId === 8
                    ? 'bg-red-50 border-red-100 text-red-900 shadow-red-50'
                    : 'bg-emerald-50 border-emerald-100 text-emerald-900 shadow-emerald-50'
                    }`}>
                    <div className={`w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md mb-6 animate-in zoom-in duration-500 ${currentEtapaId === 7 || currentEtapaId === 8 ? 'text-red-500' : 'text-emerald-500'
                      }`}>
                      {currentEtapaId === 7 || currentEtapaId === 8
                        ? <AlertCircle className="w-10 h-10" />
                        : <ShieldCheck className="w-10 h-10" />
                      }
                    </div>
                    <h3 className="text-xl font-bold mb-3 tracking-tight">
                      {currentEtapaId === 7 ? 'Evento Rejeitado' : currentEtapaId === 8 ? 'Evento Cancelado' : 'Fluxo Finalizado'}
                    </h3>
                    <p className={`text-sm max-w-[320px] leading-relaxed mb-8 ${currentEtapaId === 7 || currentEtapaId === 8 ? 'text-red-700/80' : 'text-emerald-700/80'
                      }`}>
                      {currentEtapaId === 7
                        ? 'Este evento foi rejeitado no estágio de validação e o fluxo foi encerrado definitivamente.'
                        : currentEtapaId === 8
                          ? 'Este evento foi cancelado e o fluxo foi encerrado definitivamente.'
                          : 'Este evento já atingiu o estágio de Concluído. Todas as etapas do fluxo operacional foram processadas com sucesso.'
                      }
                    </p>

                    {(currentEtapaId === 7 || currentEtapaId === 8) && evento.FluxoStatusEvento && evento.FluxoStatusEvento.length > 0 && evento.FluxoStatusEvento[0].justificativa && (
                      <div className="bg-red-100/50 p-4 rounded-lg border border-red-200/50 text-left w-full mb-8 max-w-sm overflow-hidden">
                        <span className="text-[10px] uppercase font-bold text-red-600 block mb-1.5 flex items-center justify-between">
                          <span>Justificativa de {currentEtapaId === 7 ? 'Rejeição' : 'Cancelamento'}</span>
                          <span className="text-[9px] font-mono text-red-400 font-medium">#{evento.FluxoStatusEvento[0].id}</span>
                        </span>
                        <div className="text-sm text-red-900 border-l-2 border-red-300 pl-3 italic whitespace-pre-wrap break-words">
                          &quot;{evento.FluxoStatusEvento[0].justificativa}&quot;
                        </div>
                        <div className="mt-2 text-[10px] text-red-500 font-medium text-right w-full">
                          Registrado por: {evento.FluxoStatusEvento[0].usuario}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => onOpenChange(false)}
                      variant="outline"
                      className={`rounded-full px-8 font-bold uppercase tracking-widest text-xs transition-all ${currentEtapaId === 7 || currentEtapaId === 8
                        ? 'border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300'
                        : 'border-emerald-200 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300'
                        }`}
                    >
                      Fechar
                    </Button>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="mt-6 bg-red-50 text-red-700 p-4 rounded-xl text-sm flex items-start gap-3 border border-red-100">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                  <div>
                    {errorMsg.includes('|') || ["Título", "Categoria", "Nº Convidados", "Área Demandante", "Espaço", "Justificativa", "Destino do Fluxo"].includes(errorMsg) ? (
                      <>
                        <p className="font-medium mb-1">
                          {errorMsg.includes('|') ? "Os seguintes campos não foram preenchidos:" : "O seguinte campo não foi preenchido:"}
                        </p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {errorMsg.split('|').map((campo, i) => (
                            <li key={i}>O campo <strong>{campo}</strong> é obrigatório.</li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <div className="font-medium whitespace-pre-wrap">{errorMsg}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Histórico do Fluxo */}
              {evento.FluxoStatusEvento && evento.FluxoStatusEvento.length > 0 && (
                <div className="mt-8 border-t border-gray-100 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h4 className="text-[11px] uppercase font-bold text-gray-400 mb-5 flex items-center gap-2 tracking-widest">
                    <History className="w-4 h-4 text-brand-blue-400" />
                    Histórico de Movimentações
                  </h4>
                  <div className="grid grid-cols-1 gap-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    {evento.FluxoStatusEvento.map((h, idx) => (
                      <div key={h.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-100 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border shadow-sm transition-all flex flex-col gap-2 ${idx === 0 ? 'bg-white border-brand-blue-100 shadow-brand-blue-50' : 'bg-gray-50/50 border-gray-100'}`}>
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex flex-col">
                              <span className="text-[9px] uppercase font-bold text-gray-400 mb-0.5 tracking-wider">Status Alcançado</span>
                              <span className={`text-sm font-bold ${idx === 0 ? 'text-brand-blue-600' : 'text-gray-700'}`}>
                                {h.StatusAtual.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-right flex flex-col items-end shrink-0">
                              <span className="text-[10px] font-medium text-gray-500">{new Date(h.dataMovimentacao).toLocaleDateString('pt-BR')}</span>
                              <span className="text-[9px] text-gray-400">{new Date(h.dataMovimentacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2 pt-3 border-t border-gray-100/80">
                            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-500 shrink-0">
                              {h.usuario.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-xs font-medium text-gray-700 truncate" title={h.usuario}>
                              {h.usuario}
                            </span>
                          </div>

                          {h.justificativa && (
                            <div className="mt-3 bg-red-50/80 p-3 rounded-lg border border-red-100/50">
                              <span className="text-[9px] uppercase font-bold text-red-500 block mb-1">Justificativa</span>
                              <div className="text-xs text-red-900 border-l-2 border-red-300 pl-2 py-0.5 italic whitespace-pre-wrap break-words">
                                &quot;{h.justificativa}&quot;
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* FOOTER */}
            {!isFinalizado && !showConfirm && (
              <div className="flex flex-col gap-4 p-6 border-t border-gray-100 bg-white shrink-0 mt-auto">
                {/* Close Button Row */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="w-full rounded-md px-6 py-3 h-auto font-bold text-gray-400 border-gray-200 hover:bg-gray-50 hover:text-gray-600 transition-all"
                >
                  Fechar
                </Button>
              </div>
            )}
          </form>
        </FormProvider>
      </SheetContent>

    </Sheet>
  );
}
