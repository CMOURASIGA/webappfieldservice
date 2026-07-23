"use client"

import { EventoDTO } from "@/app/(private)/eventos/eventoDTO"
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    format
} from "date-fns"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"
import { Feriado } from "@/services/feriados.service"
import {
    agendaCessaoAccentClass,
    isCessaoDeEspaco,
} from "@/components/eventos/agenda/agenda-display"

interface CalendarViewProps {
    currentDate: Date
    events: EventoDTO[]
    filter: string
    feriados?: Feriado[]
    onDateChange?: (date: Date) => void
}

export function CalendarView({ currentDate, events, feriados = [], onDateChange }: CalendarViewProps) {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    })

    const weekDays = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"]

    // Map yyyy-MM-dd -> Feriado[] for O(1) lookup
    const feriadoMap = feriados.reduce((acc, f) => {
        const key = f.dataFeriado.substring(0, 10) // evita conversão UTC→local que desloca o dia
        if (!acc[key]) acc[key] = []
        acc[key].push(f)
        return acc
    }, {} as Record<string, Feriado[]>)

    // Function to check if a day has events
    const getEventsForDay = (day: Date) => {
        return events.filter(event => isSameDay(new Date(event.dataInicio), day))
    }

    return (
        <div className="flex flex-col p-0 md:p-6 bg-white border-0 md:border md:border-brand-blue-200 rounded-none md:rounded-3xl transition-all duration-300 h-fit">
            {/* Filters specific to Calendar if needed, placed absolutely or handled in Toolbar. For now keeping structural div but compact. */}

            <div className="grid grid-cols-7 gap-0.5 md:gap-4 mb-2">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-[10px] md:text-xs font-black text-brand-gray-600 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5 md:gap-4">
                {calendarDays.map((day) => {
                    const dayEvents = getEventsForDay(day)
                    const isCurrentMonth = isSameMonth(day, monthStart)
                    const isDayToday = isToday(day)
                    const isSelected = isSameDay(day, currentDate)
                    const dayKey = format(day, 'yyyy-MM-dd')
                    const feriadosData = feriadoMap[dayKey] ?? []
                    const feriadosNames = feriadosData.map(f => f.uf ? `${f.nomeFeriado} - ${f.uf}` : f.nomeFeriado)
                    const isFeriado = feriadosData.length > 0
                    const hasNacional = feriadosData.some(f => !f.uf || f.tipoFeriado === 'Nacional')

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => onDateChange?.(day)}
                            title={isFeriado ? feriadosNames.join(' | ') : undefined}
                            style={dayEvents.length > 0 && !isSelected && !isFeriado ? {
                                border: "2px solid #dbeafe",
                                background: "#fafcff"
                            } : {}}
                            className={cn(
                                "relative text-center w-full aspect-square flex flex-col items-center justify-center rounded-lg md:rounded-2xl transition-all border cursor-pointer overflow-hidden",
                                isSelected
                                    ? "cnc-bg-primary-800 text-white shadow-md border-transparent"
                                    : isFeriado && isCurrentMonth
                                        ? "text-orange-700 bg-orange-50 border-orange-200 hover:bg-orange-100"
                                        : isCurrentMonth
                                            ? dayEvents.length > 0
                                                ? "text-brand-gray-600 hover:bg-brand-blue-50 border-brand-blue-200 bg-brand-blue-50/30"
                                                : "text-brand-gray-600 hover:bg-brand-blue-50 border-gray-50"
                                            : "text-gray-300 bg-gray-50/50 border-transparent",
                                !isCurrentMonth && "invisible md:visible"
                            )}
                        >
                            {dayEvents.some(e => e.estrategico) && (
                                <Star className="absolute top-1 right-1 md:top-2 md:right-2 w-2 h-2 md:w-4 md:h-4 text-[#00b3f5] fill-[#00b3f5]" />
                            )}
                            <span className={cn(
                                "text-xs md:text-lg font-bold",
                                isSelected ? "text-white" : ""
                            )}>
                                {format(day, "d")}
                            </span>

                            {isDayToday && (
                                <span className={cn(
                                    "hidden md:block text-[10px] uppercase font-bold mt-1",
                                    isSelected ? "text-white" : "text-brand-gray-500"
                                )}>
                                    HOJE
                                </span>
                            )}

                            {/* Icons Area (Events and Holidays) */}
                            <div className="flex items-center justify-center gap-1.5 md:gap-2 mt-0.5 md:mt-2 min-h-[10px] md:min-h-[16px] w-full px-1 flex-wrap">
                                
                                {/* Feriados */}
                                {isFeriado && !hasNacional && (
                                    <div className="flex items-center gap-0.5" title={feriadosNames.join(' | ')}>
                                        <span className={cn("w-1 h-1 md:w-1.5 md:h-1.5 rounded-full", isSelected ? "bg-white" : "bg-orange-400")} />
                                        <span className={cn("text-[9px] md:text-[10px] font-bold leading-none uppercase", isSelected ? "text-white" : "text-orange-500")}>
                                            {Array.from(new Set(feriadosData.filter(f => f.uf).map(f => f.uf))).join(', ')}
                                        </span>
                                    </div>
                                )}

                                {/* Eventos */}
                                {dayEvents.length > 0 && (
                                    <div className="flex items-center gap-0.5">
                                        <div className="flex gap-0.5 md:gap-1 items-center">
                                            {(() => {
                                                const hasCessao = dayEvents.some((evt) =>
                                                    isCessaoDeEspaco(evt.tipo),
                                                );
                                                const hasRJ = dayEvents.some(evt => {
                                                    const local = (evt.local || "").toLowerCase();
                                                    return local.includes('cnc-rj') || local.includes('rio de janeiro');
                                                });
                                                const hasDF = dayEvents.some(evt => {
                                                    const local = (evt.local || "").toLowerCase();
                                                    return local.includes('cnc-df') || local.includes('distrito federal');
                                                });
                                                const hasOther = dayEvents.some(evt => {
                                                    const local = (evt.local || "").toLowerCase();
                                                    return !(local.includes('cnc-rj') || local.includes('rio de janeiro') || local.includes('cnc-df') || local.includes('distrito federal'));
                                                });

                                                const dots = [];
                                                if (hasCessao) dots.push({ key: 'cessao', color: agendaCessaoAccentClass });
                                                if (hasRJ) dots.push({ key: 'rj', color: "cnc-bg-primary-800" });
                                                if (hasDF) dots.push({ key: 'df', color: "bg-[#0076cd]" });
                                                if (hasOther) dots.push({ key: 'other', color: "bg-[#b1b4b7]" });

                                                return dots.map(dot => (
                                                    <span
                                                        key={dot.key}
                                                        className={cn(
                                                            "w-1 h-1 md:w-1.5 md:h-1.5 rounded-full",
                                                            isSelected ? "bg-white" : dot.color
                                                        )}
                                                    />
                                                ));
                                            })()}
                                        </div>
                                        <span className={cn(
                                            "text-[9px] md:text-[10px] font-bold leading-none",
                                            isSelected ? "text-white" : "text-brand-gray-500"
                                        )}>
                                            {dayEvents.length}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div >
    )
}
