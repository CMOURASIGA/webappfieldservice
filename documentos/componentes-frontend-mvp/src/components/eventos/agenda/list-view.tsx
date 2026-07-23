"use client"

import Link from "next/link"

import { useState } from "react"
import { EventoDTO } from "@/app/(private)/eventos/eventoDTO"
import {
    format,
    isSameMonth,
    parseISO,
    compareAsc
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { markNavigateToEventFromAgenda } from "@/lib/navigation/event-from-agenda"
import { cn } from "@/lib/utils"
import { Clock, MapPin, ArrowRight, Star } from "lucide-react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import {
    agendaCessaoAccentClass,
    CESSAO_DE_ESPACO_BADGE_LABEL,
    getEventBadgeColorClass,
    getEventColorClass,
    getEventLateralSolidClass,
    isCessaoDeEspaco,
} from "@/components/eventos/agenda/agenda-display"

interface ListViewProps {
    currentDate: Date
    events: EventoDTO[]
    selectedEvent: EventoDTO | null
    onSelectEvent: (event: EventoDTO) => void
    onClearSelection: () => void
}

export function ListView({
    currentDate,
    events,
    selectedEvent,
    onSelectEvent,
    onClearSelection,
}: ListViewProps) {
    // Filter events by the selected month
    const filteredEvents = events.filter(event => {
        const eventDate = new Date(event.dataInicio)
        return isSameMonth(eventDate, currentDate)
    }).sort((a, b) => compareAsc(new Date(a.dataInicio), new Date(b.dataInicio)))

    // Group events by date
    const groupedEvents = filteredEvents.reduce((acc, event) => {
        const dateKey = format(new Date(event.dataInicio), "yyyy-MM-dd")
        if (!acc[dateKey]) {
            acc[dateKey] = []
        }
        acc[dateKey].push(event)
        return acc
    }, {} as Record<string, EventoDTO[]>)

    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
    const isMobile = useIsMobile(1024) // lg breakpoint

    if (filteredEvents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <p>Nenhum evento encontrado para este mês.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col lg:flex-row lg:items-start">
            {/* LEFT COLUMN: Event List */}
            <div className="flex-1 min-w-0 p-6">
                <div className="flex flex-col gap-8 pb-8">


                    {Object.keys(groupedEvents).map((dateKey) => {
                        const date = parseISO(dateKey)
                        const dateEvents = groupedEvents[dateKey]

                        return (
                            <div key={dateKey} className="relative">
                                {/* Date Divider */}
                                <div className="flex items-center gap-4 mb-6 w-full">
                                    <div className="h-px bg-gray-100 flex-1"></div>
                                    <h2 className="text-xs font-bold text-[#d2b57e] text-center uppercase tracking-widest whitespace-nowrap">
                                        {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                    </h2>
                                    <div className="h-px bg-gray-100 flex-1"></div>
                                </div>

                                {/* Events for this date */}
                                <div className="flex flex-col gap-4">
                                    {dateEvents.map((event) => {
                                        const isSelected = selectedEvent?.id === event.id
                                        return (
                                            <div
                                                key={event.id}
                                                onClick={() => {
                                                    onSelectEvent(event)
                                                    if (isMobile) setMobileDrawerOpen(true)
                                                }}
                                                className={cn(
                                                    "bg-white border text-left rounded-2xl overflow-hidden transition-all duration-300 relative hover:shadow-md cursor-pointer",
                                                    "before:content-[''] before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1.5 before:rounded-r-full",
                                                    getEventColorClass(event.local, event.tipo),
                                                    isSelected ? "border-brand-blue-500 shadow-md ring-1 ring-brand-blue-200" : "border-gray-100"
                                                )}
                                            >
                                                <div className="p-6 flex items-center gap-6">
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getEventLateralSolidClass(event.local, event.tipo)}`}></div>
                                                    {/* <div className="flex flex-col items-center justify-center min-w-[60px] md:min-w-[80px] text-brand-gray-500 text-[#004a8d]">
                                                        <span className="text-2xl md:text-3xl font-black">{format(new Date(event.dataInicio), "dd")}</span>
                                                        <span className="text-[10px] font-bold uppercase">{format(new Date(event.dataInicio), "MMM", { locale: ptBR }).replace('.', '')}</span>
                                                    </div> */}

                                                    <div className="flex-1 flex flex-col gap-2">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2 text-xs font-extrabold text-[#d2b57e]">
                                                                <Clock size={14} />
                                                                <span>
                                                                    {format(new Date(event.dataInicio), "HH:mm")} - {format(new Date(event.dataFim), "HH:mm")}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="text-lg md:text-xl font-extrabold text-[#004a8d] leading-tight">
                                                                    {event.nome}
                                                                </h3>
                                                                {event.estrategico && (
                                                                    <Star className="w-4 h-4 text-[#00b3f5] fill-[#00b3f5] flex-shrink-0" />
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-xs text-gray-400  mb-1">
                                                            <MapPin size={14} />
                                                            <span className="font-bold">{event.local || "Local não informado"}</span>
                                                        </div>

                                                        {/* Badge */}
                                                        {event.Tematica?.nome && event.Tematica?.nome?.toUpperCase() !== "OUTRO" && event.Tematica?.nome?.toUpperCase() !== "OUTROS" ? (
                                                            <div>
                                                                <span className={cn(
                                                                    "text-[10px] font-bold uppercase rounded-md px-2 py-1 items-center justify-center inline-block",
                                                                    getEventBadgeColorClass(event.categoria || "event")
                                                                )}>
                                                                    {event.Tematica.nome}
                                                                </span>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* RIGHT COLUMN: Details Panel (Persistent) */}
            {selectedEvent ? (
                <div
                    className={cn(
                        "hidden lg:flex w-full lg:w-[400px] flex-shrink-0 border-l border-gray-100 bg-white flex-col animate-in slide-in-from-right duration-300",
                        "lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100dvh-2rem)]"
                    )}
                >
                    <div className="p-6 flex flex-col min-h-0 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="mb-6">
                            <button
                                onClick={() => onClearSelection()}
                                className="text-xs font-bold text-gray-400 hover:text-brand-blue-600 uppercase flex items-center gap-2 transition-colors"
                            >
                                <ArrowRight className="rotate-180" size={14} />
                                Voltar para Lista
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Header Info */}
                            <div>
                                <div className="flex flex-col gap-2 mb-2">
                                    {selectedEvent.estrategico && (
                                        <span className="bg-[#00b3f5] text-white flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded w-fit">
                                            <Star size={10} className="fill-white" />
                                            ESTRATÉGICO
                                        </span>
                                    )}
                                    {isCessaoDeEspaco(selectedEvent.tipo) && (
                                        <span className={cn(agendaCessaoAccentClass, "text-white flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded w-fit")}>
                                            <span
                                                className="h-2.5 w-2.5 shrink-0 rounded-full bg-white"
                                                aria-hidden
                                            />
                                            {CESSAO_DE_ESPACO_BADGE_LABEL}
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-2xl cnc-text-brand-blue-500 font-extrabold text-[#004a8d] leading-tight">
                                    {selectedEvent.nome}
                                </h2>
                            </div>

                            <div className="space-y-4 pt-2">
                                <InfoRow
                                    label="Data"
                                    value={format(new Date(selectedEvent.dataInicio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                />
                                <InfoRow
                                    label="Hora"
                                    value={`${format(new Date(selectedEvent.dataInicio), "HH:mm")} - ${format(new Date(selectedEvent.dataFim), "HH:mm")}`}
                                />
                                <InfoRow label="Local" value={selectedEvent.local?.split(',')[0]} />
                                <InfoRow label="Espaço" value={selectedEvent.local?.split(',')[1] || selectedEvent.local} />
                                <InfoRow label="Setor" value={selectedEvent.areaCliente || "N/A"} />
                            </div>

                            {selectedEvent.descricao && (
                                <div className="bg-gray-50 p-4 rounded-xl mt-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resumo do Evento:</h4>
                                    <p className="text-sm text-gray-500 italic">
                                        &ldquo;{selectedEvent.descricao}&rdquo;
                                    </p>
                                </div>
                            )}

                            <Link
                                href={`/eventos/visualizar/${selectedEvent.id}`}
                                onClick={() =>
                                    markNavigateToEventFromAgenda(
                                        `/eventos/visualizar/${selectedEvent.id}`,
                                    )
                                }
                                className="flex w-full items-center justify-center gap-2 bg-[#004a8d] hover:bg-[#003d75] text-white font-black py-4 px-10 rounded-full text-sm tracking-wider uppercase transition-all shadow-lg cursor-pointer"
                            >
                                Página do evento
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    className={cn(
                        "hidden lg:flex w-full lg:w-[400px] flex-shrink-0 border-l border-gray-100 bg-gray-50/30 items-center justify-center min-h-[280px]",
                        "lg:sticky lg:top-4 lg:self-start lg:min-h-[min(28rem,calc(100dvh-2rem))]"
                    )}
                >
                    <div className="text-center p-8 max-w-xs">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Clock size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-400 mb-2">Nenhum evento selecionado</h3>
                        <p className="text-sm text-gray-400">Selecione um evento da lista para visualizar os detalhes completos.</p>
                    </div>
                </div>
            )}

            <div className="block lg:hidden">
                <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
                    <SheetContent side="right" className="w-[92vw] max-w-sm p-0">
                        <SheetTitle className="sr-only">Detalhes do evento</SheetTitle>
                        {selectedEvent && (
                            <div className="h-full overflow-y-auto custom-scrollbar p-6">
                                <div className="mb-6">
                                    <button
                                        onClick={() => {
                                            onClearSelection()
                                            setMobileDrawerOpen(false)
                                        }}
                                        className="text-xs font-bold text-gray-400 hover:text-brand-blue-600 uppercase flex items-center gap-2 transition-colors"
                                    >
                                        <ArrowRight className="rotate-180" size={14} />
                                        Voltar para Lista
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <div className="flex flex-col gap-2 mb-2">
                                            {selectedEvent.estrategico && (
                                                <span className="bg-[#00b3f5] text-white flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded w-fit">
                                                    <Star size={10} className="fill-white" />
                                                    ESTRATÉGICO
                                                </span>
                                            )}
                                            {isCessaoDeEspaco(selectedEvent.tipo) && (
                                                <span className={cn(agendaCessaoAccentClass, "text-white flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded w-fit")}>
                                                    <span
                                                        className="h-2.5 w-2.5 shrink-0 rounded-full bg-white"
                                                        aria-hidden
                                                    />
                                                    {CESSAO_DE_ESPACO_BADGE_LABEL}
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-2xl cnc-text-brand-blue-500 font-extrabold text-[#004a8d] leading-tight">
                                            {selectedEvent.nome}
                                        </h2>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <InfoRow
                                            label="Data"
                                            value={format(new Date(selectedEvent.dataInicio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                        />
                                        <InfoRow
                                            label="Hora"
                                            value={`${format(new Date(selectedEvent.dataInicio), "HH:mm")} - ${format(new Date(selectedEvent.dataFim), "HH:mm")}`}
                                        />
                                        <InfoRow label="Local" value={selectedEvent.local?.split(',')[0]} />
                                        <InfoRow label="Espaço" value={selectedEvent.local?.split(',')[1] || selectedEvent.local} />
                                        <InfoRow label="Setor" value={selectedEvent.areaCliente || "N/A"} />
                                    </div>

                                    {selectedEvent.descricao && (
                                        <div className="bg-gray-50 p-4 rounded-xl mt-4">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resumo do Evento:</h4>
                                            <p className="text-sm text-gray-500 italic">
                                                &ldquo;{selectedEvent.descricao}&rdquo;
                                            </p>
                                        </div>
                                    )}

                                    <Link
                                        href={`/eventos/visualizar/${selectedEvent.id}`}
                                        onClick={() =>
                                            markNavigateToEventFromAgenda(
                                                `/eventos/visualizar/${selectedEvent.id}`,
                                            )
                                        }
                                        className="flex w-full items-center justify-center gap-2 bg-[#004a8d] hover:bg-[#003d75] text-white font-black py-4 px-10 rounded-full text-sm tracking-wider uppercase transition-all shadow-lg cursor-pointer"
                                    >
                                        Página do evento
                                    </Link>
                                </div>
                            </div>
                        )}
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    )
}

function InfoRow({ label, value }: { label: string, value?: string }) {
    if (!value) return null
    return (
        <div className="grid grid-cols-[120px_1fr] items-baseline border-b border-gray-50 pb-2 last:border-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}:</span>
            <span className="text-sm font-medium text-brand-gray-600 break-words">{value}</span>
        </div>
    )
}
