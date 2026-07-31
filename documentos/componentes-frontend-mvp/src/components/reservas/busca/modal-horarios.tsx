"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@cnc-ti/layout-basic";
import { Espaco } from "@/services/espacos/tipo-espaco";
import { FiltrosNovaReserva } from "./campos-filtro-nova-reserva";
import { getReservas, create } from "@/services/reservas/reserva.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, addMinutes, parse, isBefore, isAfter, startOfDay, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2, Copy, Check } from "lucide-react";

interface Props {
    espaco: Espaco | null;
    filtros: FiltrosNovaReserva;
    isOpen: boolean;
    onClose: () => void;
}

interface DadosSucesso {
    reservaId: number;
    codigo: string | undefined;
}

export function ModalHorariosNovaReserva({ espaco, filtros, isOpen, onClose }: Props) {
    const queryClient = useQueryClient();

    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [selectedStart, setSelectedStart] = useState<Date | null>(null);
    const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dadosSucesso, setDadosSucesso] = useState<DadosSucesso | null>(null);
    const [copiado, setCopiado] = useState(false);

    const inicioFiltro = filtros.dataInicial ? parse(filtros.dataInicial, 'yyyy-MM-dd', new Date()) : startOfDay(new Date());
    const fimFiltro = filtros.dataFinal ? parse(filtros.dataFinal, 'yyyy-MM-dd', new Date()) : startOfDay(new Date());

    const podeNavegar = !isSameDay(inicioFiltro, fimFiltro);

    useEffect(() => {
        if (isOpen && filtros.dataInicial) {
            setCurrentDate(parse(filtros.dataInicial, 'yyyy-MM-dd', new Date()));
            setSelectedStart(null);
            setSelectedEnd(null);
            setDadosSucesso(null);
            setCopiado(false);
        }
    }, [isOpen, filtros.dataInicial]);

    const currentDateStr = format(currentDate, 'yyyy-MM-dd');

    const { data: reservas = [], isLoading } = useQuery({
        queryKey: ["reservasEspaco", espaco?.Id, currentDateStr],
        queryFn: async () => {
            if (!espaco?.Id) return [];
            return getReservas({
                idEspaco: String(espaco.Id),
                dataInicio: currentDateStr,
                dataFim: currentDateStr,
            });
        },
        enabled: !!espaco && isOpen,
        staleTime: 0,
    });

    const slots: { start: Date; end: Date; isOccupied: boolean; isPast: boolean; isBoundary: boolean }[] = [];

    if (espaco) {
        let startTime = parse(filtros.horaInicial || "08:00", 'HH:mm', currentDate);
        const endTime = parse(filtros.horaFinal || "21:00", 'HH:mm', currentDate);

        while (!isAfter(startTime, endTime)) {
            debugger
            const nextTime = addMinutes(startTime, 30);
            const isBoundary = false;

            const isOccupied = !isBoundary && reservas.some((r: any) => {
                const toLocalDate = (iso: string) => {
                    const d = new Date(iso);
                    const local = new Date(d.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
                    return local;
                };
                const rStart = toLocalDate(r.dataInicio);
                const rEnd = toLocalDate(r.dataFim);

                return !isAfter(startTime, rEnd) && isAfter(nextTime, rStart);
            });

            slots.push({
                start: startTime,
                end: nextTime,
                isOccupied,
                isPast: !isBoundary && isBefore(startTime, new Date()),
                isBoundary,
            });

            startTime = nextTime;
        }
    }

    const availableSlotsCount = slots.filter(s => !s.isOccupied && !s.isPast).length;

    // Lógica principal de seleção de horários (clique no grid)
    const handleSlotClick = (slot: typeof slots[0]) => {
        if (slot.isOccupied || slot.isPast) return;
        if (!selectedStart && !selectedEnd && slot.start.getHours() === 21) {
            setSelectedStart(slot.start);
            setSelectedEnd(null);
            return;
        }
        if (slot.isBoundary) {
            if (selectedStart && !selectedEnd) {
                setSelectedEnd(slot.start);
            }
            return;
        }

        if (!selectedStart || selectedEnd !== null) {
            setSelectedStart(slot.start);
            setSelectedEnd(null);
            return;
        }

        if (isBefore(slot.start, selectedStart)) {
            setSelectedStart(slot.start);
            setSelectedEnd(null);
            return;
        }

        if (slot.start.getTime() === selectedStart.getTime()) {
            setSelectedStart(null);
            setSelectedEnd(null);
            return;
        }

        const hasOccupied = slots.some(s =>
            !isBefore(s.start, selectedStart) &&
            isBefore(s.start, slot.start) &&
            (s.isOccupied || s.isPast)
        );

        if (hasOccupied) {
            setSelectedStart(slot.start);
            setSelectedEnd(null);
        } else {
            setSelectedEnd(slot.start);
        }
    };

    const isInRange = (slot: typeof slots[0]) => {
        if (!selectedStart) return false;
        const rangeEnd = selectedEnd ?? null;
        if (rangeEnd) {
            return !isBefore(slot.start, selectedStart) && !isAfter(slot.start, rangeEnd);
        }
        return slot.start.getTime() === selectedStart.getTime();
    };

    const handlePrevDay = () => {
        const prev = addDays(currentDate, -1);
        if (!isBefore(prev, inicioFiltro)) {
            setCurrentDate(prev);
            setSelectedStart(null);
            setSelectedEnd(null);
        }
    };

    const handleNextDay = () => {
        const next = addDays(currentDate, 1);
        if (!isAfter(next, fimFiltro)) {
            setCurrentDate(next);
            setSelectedStart(null);
            setSelectedEnd(null);
        }
    };

    const handleConfirmar = async () => {
        debugger
        if (!selectedStart || !selectedEnd || !espaco) return;

        setIsSubmitting(true);
        try {
            const response = await create({
                idEspaco: espaco.Id,
                dataInicio: format(selectedStart, "yyyy-MM-dd'T'HH:mm:ss"),
                dataFim: format(selectedEnd, "yyyy-MM-dd'T'HH:mm:ss"),
                motivo: "Pré-reserva via busca rápida",
                flagExterno: true,
                preReserva: true,
            });

            const reservaId = response?.id;
            const codigoPreReserva = response?.codigo || response?.codigoPreReserva;

            setDadosSucesso({ reservaId, codigo: codigoPreReserva });

            // Invalida o cache para mostrar o novo horário como ocupado
            queryClient.invalidateQueries({ queryKey: ["reservasEspaco", espaco.Id, currentDateStr] });
        } catch (error) {
            console.error(error);
            alert("Erro ao realizar a pré-reserva. O horário pode ter sido ocupado.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopiarCodigo = async () => {
        if (!dadosSucesso?.codigo) return;
        try {
            await navigator.clipboard.writeText(dadosSucesso.codigo);
        } catch {
            const input = document.createElement('input');
            input.value = dadosSucesso.codigo;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
        }
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    const descricaoSelecao = !selectedStart
        ? "Clique num horário para definir o início."
        : !selectedEnd
            ? `Início: ${format(selectedStart, "HH:mm")} — clique em outro para definir o fim.`
            : `Selecionado: ${format(selectedStart, "HH:mm")} até ${format(selectedEnd, "HH:mm")}`;

    if (dadosSucesso) {
        return (
            <Dialog open={isOpen} onOpenChange={() => { onClose(); setDadosSucesso(null); setSelectedStart(null); setSelectedEnd(null); }}>
                <DialogContent className="sm:max-w-[400px]">
                    <div className="flex flex-col items-center gap-4 py-4">
                        <CheckCircle2 className="w-14 h-14 text-green-500" />
                        <DialogTitle className="text-center text-base">Pré-reserva realizada com sucesso!</DialogTitle>

                        {dadosSucesso.codigo && (
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border w-full">
                                <span className="font-mono font-bold text-gray-800 text-xl tracking-widest flex-1 text-center">
                                    {dadosSucesso.codigo}
                                </span>
                            </div>
                        )}

                        <p className="text-sm text-gray-500 text-center leading-relaxed">
                            Guarde este código para acessar sua pré-reserva.<br />
                            O horário ficará reservado por <strong>30 minutos</strong>.
                        </p>

                        <button
                            onClick={handleCopiarCodigo}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${copiado
                                ? "bg-green-500 text-white"
                                : "bg-[#004A8D] hover:bg-[#003566] text-white"
                                }`}
                        >
                            {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copiado ? "Código copiado!" : "Copiar código"}
                        </button>

                        <button
                            onClick={() => { onClose(); setDadosSucesso(null); setSelectedStart(null); setSelectedEnd(null); }}
                            className="text-sm text-gray-400 hover:text-gray-600 underline"
                        >
                            Fechar
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => { onClose(); setSelectedStart(null); setSelectedEnd(null); }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Verificar Horários - {espaco?.nome}</DialogTitle>
                    {selectedStart?.getHours() !== 21 && <DialogDescription style={{ fontSize: "1em" }}>{descricaoSelecao}</DialogDescription>}
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    {/* Cabeçalho de navegação entre dias */}
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrevDay}
                            disabled={!podeNavegar || isSameDay(currentDate, inicioFiltro)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex flex-col items-center">
                            <span className="font-bold text-brand-blue-600">
                                {format(currentDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                            </span>
                            {podeNavegar && (
                                <span className="text-xs text-gray-400 mt-0.5">
                                    {format(inicioFiltro, "dd/MM", { locale: ptBR })} até {format(fimFiltro, "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNextDay}
                            disabled={!podeNavegar || isSameDay(currentDate, fimFiltro)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span>Disponíveis neste dia: <strong>{availableSlotsCount}</strong></span>
                        {selectedStart && (
                            <button
                                type="button"
                                onClick={() => { setSelectedStart(null); setSelectedEnd(null); }}
                                className="text-xs text-gray-400 hover:text-gray-600 underline"
                            >
                                Limpar seleção
                            </button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" /></div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                            {/* Mapeamento dos slots para botões no grid */}
                            {slots.map((slot, idx) => {
                                const disabled = slot.isOccupied || slot.isPast;
                                const inRange = isInRange(slot);
                                // Define se o slot de "fim" (limite) está clicável agora
                                const isBoundaryClickable = selectedStart && !selectedEnd;
                                const canSelected = selectedStart?.getHours() !== 21 && isBoundaryClickable
                                return (
                                    <button
                                        key={idx}
                                        disabled={disabled || (slot.isBoundary && (!selectedStart || !!selectedEnd))}
                                        onClick={() => handleSlotClick(slot)}
                                        title={slot.isBoundary ? "Clique para definir este como horário de fim" : undefined}
                                        className={`p-2 text-sm border rounded-md transition-all font-medium flex flex-col items-center justify-center ${disabled || (!selectedStart && format(slot.start, "HH:mm") === "21:00")
                                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                                            : slot.isBoundary && !isBoundaryClickable
                                                ? "bg-gray-50 text-gray-400 border-dashed border-gray-300 cursor-not-allowed opacity-50"
                                                : (inRange && selectedStart?.getHours() !== 21)
                                                    ? "bg-[#004A8D] text-white border-[#004A8D] shadow-md ring-2 ring-blue-200"
                                                    : isBoundaryClickable && selectedStart && selectedStart?.getHours() !== 21 && format(slot.start, "HH:mm") === "21:00"
                                                        ? "bg-white text-[#004A8D] border-[#004A8D] border-dashed hover:bg-blue-50 cursor-pointer"
                                                        : "bg-white text-gray-700 hover:border-brand-blue-300 hover:bg-blue-50 cursor-pointer"
                                            }`}
                                    >
                                        <span>{format(slot.start, "HH:mm")}</span>
                                    </button>
                                );
                            })}
                            {slots.length === 0 && (
                                <div className="col-span-full text-center p-4 text-gray-500 text-sm">Nenhum horário gerado. Verifique os filtros de horário (Início/Fim).</div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => { onClose(); setSelectedStart(null); setSelectedEnd(null); }} disabled={isSubmitting}>Cancelar</Button>
                    <Button
                        onClick={handleConfirmar}
                        disabled={!selectedStart || !selectedEnd || isSubmitting}
                        className="bg-[#004A8D]"
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Realizar Pré-reserva
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
