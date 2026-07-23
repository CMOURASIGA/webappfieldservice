"use client";

import Link from "next/link";

import { EventoDTO } from "@/app/(private)/eventos/eventoDTO";
import { cn } from "@/lib/utils";
import { markNavigateToEventFromAgenda } from "@/lib/navigation/event-from-agenda";
import { Feriado } from "@/services/feriados.service";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRight, Clock, MapPin, Star } from "lucide-react";
import {
  agendaCessaoAccentClass,
  CESSAO_DE_ESPACO_BADGE_LABEL,
  getEventBadgeColorClass,
  getEventColorClass,
  getEventLateralSolidClass,
  isCessaoDeEspaco,
} from "@/components/eventos/agenda/agenda-display";

interface DayEventsPanelProps {
  date: Date;
  events: EventoDTO[];
  feriados?: Feriado[];
  selectedEvent: EventoDTO | null;
  onSelectEvent: (event: EventoDTO) => void;
  onClearSelection: () => void;
}

export function DayEventsPanel({
  date,
  events,
  feriados = [],
  selectedEvent,
  onSelectEvent,
  onClearSelection,
}: DayEventsPanelProps) {
  const dayKey = format(date, "yyyy-MM-dd");
  const feriadosNoDia = feriados.filter(
    (f) => f.dataFeriado.substring(0, 10) === dayKey,
  );
  const dayEvents = events.filter((event) => {
    const eventDate = new Date(event.dataInicio);
    return (
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    );
  });

  if (selectedEvent) {
    return (
      <div className="w-full border-l border-gray-100 bg-white p-6 flex flex-col h-full animate-in slide-in-from-right duration-300">
        <div className="mb-6">
          <button
            onClick={onClearSelection}
            className="text-xs font-bold text-gray-400 hover:text-brand-blue-600 uppercase flex items-center gap-2 transition-colors"
          >
            <ArrowRight className="rotate-180" size={14} />
            Voltar para Lista
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
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
            {/* <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-brand-blue-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                {selectedEvent.tipo || "EVENTO"}
              </span>
              {selectedEvent.estrategico && (
                <span className="bg-[#00b3f5] text-white flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                  <Star size={10} className="fill-white" />
                  ESTRATÉGICO
                </span>
              )}
              {selectedEvent.areaCliente && (
                <span className="bg-[#EAD4A8] text-brand-blue-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                  {selectedEvent.areaCliente}
                </span>
              )}
            </div> */}
            <h2 className="text-2xl cnc-text-brand-blue-500 font-extrabold text-[#004a8d] leading-tight">
              {selectedEvent.nome}
            </h2>
          </div>

          <div className="space-y-4 pt-2">
            {/* <InfoRow
              label="Solicitante"
              value={selectedEvent.nomeProdutor || "N/A"}
            /> */}
            <InfoRow
              label="Data"
              value={format(
                new Date(selectedEvent.dataInicio),
                "dd 'de' MMMM 'de' yyyy",
                { locale: ptBR },
              )}
            />
            <InfoRow
              label="Hora"
              value={`${format(new Date(selectedEvent.dataInicio), "HH:mm")} - ${format(new Date(selectedEvent.dataFim), "HH:mm")}`}
            />
            <InfoRow label="Local" value={selectedEvent.local?.split(",")[0]} />
            <InfoRow
              label="Espaço"
              value={selectedEvent.Espaco?.nome || "Não informado"}
            />
            <InfoRow label="Setor" value={selectedEvent.areaCliente || "N/A"} />
          </div>

          {selectedEvent.descricao && (
            <div className="bg-gray-50 p-4 rounded-xl mt-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Resumo do Evento:
              </h4>
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
    );
  }

  return (
    <div className="w-full border-l border-gray-100 bg-white p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-extrabold text-[#004a8d] uppercase tracking-wider">
          Eventos do dia
        </h2>
      </div>
      <div className="flex items-center w-full mb-4">
        <h3 className="text-sm font-bold text-[#b08d57] uppercase tracking-[0.2em] whitespace-nowrap">
          {date.getDate()} de{" "}
          {date?.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </h3>

        {/* Linha da Direita */}
        <div className="h-px bg-gray-100 flex-1"></div>
      </div>
      <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 flex flex-col">
        {dayEvents.length === 0 && feriadosNoDia.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center opacity-50 py-10">
            <p className="text-sm font-medium text-gray-400">Nenhum evento</p>
          </div>
        ) : (
          <>
            {dayEvents.length > 0 && (
              <div className="space-y-4 mb-4">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    className={cn(
                      "bg-white border text-left border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 relative hover:shadow-md cursor-pointer",
                      "before:content-[''] before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1.5 before:rounded-r-full",
                      getEventColorClass(event.local, event.tipo),
                    )}
                  >
                    <div className="p-4 flex items-center gap-4">
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1.5 ${getEventLateralSolidClass(event.local, event.tipo)}`}
                      ></div>
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-xs text-brand-gold-500 font-extrabold text-[#d2b57e]">
                            <Clock size={12} />
                            <span>
                              {format(new Date(event.dataInicio), "HH:mm")} -{" "}
                              {format(new Date(event.dataFim), "HH:mm")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-sm font-extrabold text-2xl leading-tight mt-1 text-[#004a8d]">
                              {event.nome}
                            </h2>
                            {event.estrategico && (
                              <Star className="w-4 h-4 text-[#00b3f5] fill-[#00b3f5] flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs  text-gray-400 font-bold">
                          <MapPin size={12} />
                          <span>{event.local || "Local não informado"}</span>
                        </div>
                        {event.Tematica?.nome?.toUpperCase() !== "OUTRO" &&
                          event.Tematica?.nome?.toUpperCase() !== "OUTROS" ? (
                          <div className="mt-1">
                            <span
                              className={cn(
                                "text-[9px] font-bold uppercase rounded-md px-2 py-0.5 items-center justify-center inline-block",
                                getEventBadgeColorClass(event.categoria || "event"),
                              )}
                            >
                              {event.Tematica?.nome || "EVENTO"}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {dayEvents.length > 0 && feriadosNoDia.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px bg-gray-100 flex-1"></div>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Feriados</span>
                <div className="h-px bg-gray-100 flex-1"></div>
              </div>
            )}

            {feriadosNoDia.length > 0 && (
              <div className="flex flex-col gap-1 mb-4">
                {feriadosNoDia.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-orange-700 uppercase tracking-wide leading-none pt-0.5">
                      {f.nomeFeriado}{f.uf ? ` - ${f.uf}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Function removed

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[120px_1fr] items-baseline border-b border-gray-50 pb-2 last:border-0">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
        {label}:
      </span>
      <span className="text-sm font-medium text-brand-gray-600 break-words">
        {value}
      </span>
    </div>
  );
}

