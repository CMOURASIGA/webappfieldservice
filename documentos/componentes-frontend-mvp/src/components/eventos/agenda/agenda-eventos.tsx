"use client";

import { EventoDTO } from "@/app/(private)/eventos/eventoDTO";
import { clearNavigateToEventFromAgenda } from "@/lib/navigation/event-from-agenda";
import { cn } from "@/lib/utils";
import { getAgendaEvents, getTematicas } from "@/services/eventos.service";
import { Feriado, getFeriados } from "@/services/feriados.service";
import { useQuery } from "@tanstack/react-query";
import { addMonths, format, isSameDay, subMonths, eachDayOfInterval } from "date-fns";
import { Star } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { agendaCessaoAccentClass } from "@/components/eventos/agenda/agenda-display";
import { AgendaToolbar } from "./agenda-toolbar";
import { CalendarView } from "./calendar-view";
import { DayEventsPanel } from "./day-events-panel";
import { ListView } from "./list-view";

interface AgendaEventosProps {
  initialEvents?: EventoDTO[];
  isPublic?: boolean;
}

export type ViewMode = "calendar" | "list";

function modoFromUrl(value: string | null): ViewMode {
  if (value === "lista") return "list";
  return "calendar";
}

function modoToUrl(mode: ViewMode): string {
  return mode === "list" ? "lista" : "calendario";
}

function parseAgendaStateFromSearchParams(sp: URLSearchParams): {
  date: Date;
  viewMode: ViewMode;
  selectedEventId: string | null;
} {
  const ano = sp.get("ano");
  const mes = sp.get("mes");
  const dia = sp.get("dia");
  let date = new Date();
  if (ano && mes) {
    const y = Number(ano);
    const m = Number(mes);
    const dRaw = dia;
    const d = dRaw != null && dRaw !== "" ? Number(dRaw) : 1;
    if (
      Number.isFinite(y) &&
      Number.isFinite(m) &&
      m >= 1 &&
      m <= 12 &&
      Number.isFinite(d) &&
      d >= 1
    ) {
      const candidate = new Date(y, m - 1, d);
      if (!Number.isNaN(candidate.getTime())) {
        date = candidate;
      }
    }
  }
  const ev = sp.get("evento");
  return {
    date,
    viewMode: modoFromUrl(sp.get("modo")),
    selectedEventId: ev && ev.length > 0 ? ev : null,
  };
}

export function AgendaEventos({ initialEvents = [], isPublic = false }: AgendaEventosProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const paramsKey = searchParams.toString();

  const [viewMode, setViewMode] = useState<ViewMode>(
    () =>
      parseAgendaStateFromSearchParams(
        new URLSearchParams(searchParams.toString()),
      ).viewMode,
  );
  const [currentDate, setCurrentDate] = useState(
    () =>
      parseAgendaStateFromSearchParams(
        new URLSearchParams(searchParams.toString()),
      ).date,
  );
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    () =>
      parseAgendaStateFromSearchParams(
        new URLSearchParams(searchParams.toString()),
      ).selectedEventId,
  );

  const [filter, setFilter] = useState("");

  const year = currentDate.getFullYear();

  const { data: events = initialEvents } = useQuery<EventoDTO[]>({
    queryKey: ["agenda-events", year],
    queryFn: () =>
      getAgendaEvents(new Date(year, 0, 1), new Date(year, 11, 31)),
    staleTime: 5 * 60 * 1000,
  });

  const { data: themes = [] } = useQuery<string[]>({
    queryKey: ["tematicas"],
    queryFn: getTematicas,
    staleTime: Infinity,
  });

  const { data: feriados = [] } = useQuery<Feriado[]>({
    queryKey: ["feriados", year],
    queryFn: () => getFeriados(year),
    staleTime: 24 * 60 * 60 * 1000, // 24h — feriados não mudam no dia
  });

  const persistAgendaUrl = useCallback(
    (date: Date, mode: ViewMode, eventId: string | null) => {
      const p = new URLSearchParams();
      p.set("ano", String(date.getFullYear()));
      p.set("mes", String(date.getMonth() + 1));
      p.set("dia", String(date.getDate()));
      p.set("modo", modoToUrl(mode));
      if (eventId) p.set("evento", eventId);
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [pathname, router],
  );

  useEffect(() => {
    const parsed = parseAgendaStateFromSearchParams(
      new URLSearchParams(searchParams.toString()),
    );
    setCurrentDate((prev) =>
      isSameDay(prev, parsed.date) ? prev : parsed.date,
    );
    setViewMode((prev) => (prev === parsed.viewMode ? prev : parsed.viewMode));
    setSelectedEventId((prev) => {
      if (prev === parsed.selectedEventId) return prev;
      return parsed.selectedEventId;
    });
  }, [paramsKey, searchParams]);

  // Dynamically calculate all possible themes combining API and existing events
  const allAvailableThemes = useMemo(() => {
    const themeSet = new Set<string>();
    // Add themes from db
    themes.forEach((t) => themeSet.add(t));
    // Add themes present in events
    events.forEach((e) => {
      const t = e.Tematica?.nome;
      if (t) themeSet.add(t);
    });
    return Array.from(themeSet).sort();
  }, [themes, events]);

  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showEstrategicos, setShowEstrategicos] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isMobile = useIsMobile(1024); // lg breakpoint

  useEffect(() => {
    clearNavigateToEventFromAgenda();
  }, []);

  // Sync selectedThemes when available themes load
  useEffect(() => {
    if (allAvailableThemes.length === 0) return;
    if (!isInitialized) {
      setSelectedThemes(allAvailableThemes);
      setIsInitialized(true);
    } else {
      setSelectedThemes((prev) => {
        const newThemes = allAvailableThemes.filter((t) => !prev.includes(t));
        if (newThemes.length === 0) return prev; // mesma referência = sem re-render
        return [...prev, ...newThemes];
      });
    }
  }, [allAvailableThemes, isInitialized]);

  // Filter events based on selected themes
  const filteredEvents = events.filter((event) => {
    // If no themes are selected, show nothing (standard checkbox filter behavior)
    if (selectedThemes.length === 0) {
      return false;
    }

    const theme = event.Tematica?.nome;
    if (theme && !selectedThemes.includes(theme)) return false;

    // Strategic filter: When active, show ONLY strategic. When inactive, show all.
    if (showEstrategicos && !event.estrategico) {
      return false;
    }

    return true;
  });

  const expandedEvents = useMemo(() => {
    const result: EventoDTO[] = [];

    for (const evt of filteredEvents) {
      if (!evt.dataInicio || !evt.dataFim) {
        result.push(evt);
        continue;
      }

      // Se houver Periodos, iteramos por eles
      if (evt.Periodos && evt.Periodos.length > 0) {
        for (const p of evt.Periodos) {
          if (!p.dataInicio || !p.dataFim) continue;
          const start = new Date(p.dataInicio);
          const end = new Date(p.dataFim);

          if (isSameDay(start, end)) {
            result.push({ ...evt, dataInicio: start, dataFim: end });
          } else {
            const days = eachDayOfInterval({ start, end });
            days.forEach((day, idx) => {
              let dayStart = new Date(day);
              let dayEnd = new Date(day);

              if (idx === 0) {
                dayStart = new Date(start);
                dayEnd.setHours(18, 0, 0, 0);
              } else if (idx === days.length - 1) {
                dayStart.setHours(9, 0, 0, 0);
                dayEnd = new Date(end);
              } else {
                dayStart.setHours(9, 0, 0, 0);
                dayEnd.setHours(18, 0, 0, 0);
              }

              result.push({
                ...evt,
                dataInicio: new Date(dayStart.toISOString()),
                dataFim: new Date(dayEnd.toISOString())
              });
            });
          }
        }
      } else {
        // Fallback: se não tiver períodos, usa a data do evento (comportamento antigo)
        const start = new Date(evt.dataInicio);
        const end = new Date(evt.dataFim);

        if (isSameDay(start, end)) {
          result.push(evt);
        } else {
          const days = eachDayOfInterval({ start, end });
          days.forEach((day, idx) => {
            let dayStart = new Date(day);
            let dayEnd = new Date(day);

            if (idx === 0) {
              dayStart = new Date(start);
              dayEnd.setHours(18, 0, 0, 0);
            } else if (idx === days.length - 1) {
              dayStart.setHours(9, 0, 0, 0);
              dayEnd = new Date(end);
            } else {
              dayStart.setHours(9, 0, 0, 0);
              dayEnd.setHours(18, 0, 0, 0);
            }

            result.push({
              ...evt,
              dataInicio: new Date(dayStart.toISOString()),
              dataFim: new Date(dayEnd.toISOString())
            });
          });
        }
      }
    }

    return result;
  }, [filteredEvents]);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    const matches = expandedEvents.filter((e) => e.id === selectedEventId);
    if (matches.length === 0) return null;
    const forCurrentDate = matches.find((e) => isSameDay(new Date(e.dataInicio), currentDate));
    return forCurrentDate ?? matches[0] ?? null;
  }, [expandedEvents, selectedEventId, currentDate]);

  const handlePreviousMonth = () => {
    const next = subMonths(currentDate, 1);
    setCurrentDate(next);
    setSelectedEventId(null);
    persistAgendaUrl(next, viewMode, null);
  };

  const handleNextMonth = () => {
    const next = addMonths(currentDate, 1);
    setCurrentDate(next);
    setSelectedEventId(null);
    persistAgendaUrl(next, viewMode, null);
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    setSelectedEventId(null);
    persistAgendaUrl(date, viewMode, null);
    if (isMobile) setMobileDrawerOpen(true);
  };

  const handleToolbarDateChange = (date: Date) => {
    setCurrentDate(date);
    setSelectedEventId(null);
    persistAgendaUrl(date, viewMode, null);
  };

  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    persistAgendaUrl(currentDate, mode, selectedEventId);
  };

  const handleSelectEvent = (event: EventoDTO) => {
    setSelectedEventId(event.id);
    persistAgendaUrl(currentDate, viewMode, event.id);
  };

  const handleClearSelection = () => {
    setSelectedEventId(null);
    persistAgendaUrl(currentDate, viewMode, null);
  };

  return (
    <div className="w-full">
      <div className="w-full pb-3">
        <div className="flex flex-col gap-1">
          <AgendaToolbar
            currentDate={currentDate}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
            onFilterChange={setFilter}
            onDateChange={handleToolbarDateChange}
            availableThemes={allAvailableThemes}
            selectedThemes={selectedThemes}
            onThemeChange={setSelectedThemes}
            showEstrategicos={showEstrategicos}
            onShowEstrategicosChange={setShowEstrategicos}
            isPublic={isPublic}
          />

          {/* Legend and View Toggle */}
          <div className="flex flex-col md:flex-row justify-between items-center px-0 gap-2 md:gap-3 pt-0">
            {/* Legend */}
            <div className="hidden md:flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold text-gray-500 uppercase">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-[#00247d]" />
                </span>
                <span>CNC - RJ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-[#0076cd]" />
                </span>
                <span>CNC - DF</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-[#b1b4b7]" />
                </span>
                <span>Outros Locais</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      agendaCessaoAccentClass,
                    )}
                  />
                </span>
                <span>Cessão de espaço</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                  <Star className="h-3.5 w-3.5 text-[#00b3f5] fill-[#00b3f5]" />
                </span>
                <span>Estratégico</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-orange-400" />
                </span>
                <span>Feriado</span>
              </div>
            </div>
            <div
              className="bg-gray-100 p-1 rounded-full flex text-[10px] font-bold uppercase"
              style={{
                boxShadow: "-3px 3px 6px #59595912",
                borderRadius: "20px",
                padding: "3px 14px",
              }}
            >
              <button
                type="button"
                onClick={() => handleSetViewMode("calendar")}
                className={cn(
                  "px-4 py-1.5 rounded-full transition-all duration-300",
                  viewMode === "calendar"
                    ? "bg-white text-brand-gray-500 shadow-sm"
                    : "text-gray-400 hover:text-gray-600",
                )}
              >
                Calendário
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode("list")}
                className={cn(
                  "px-4 py-1.5 rounded-full transition-all duration-300",
                  viewMode === "list"
                    ? "bg-white text-brand-gray-500 shadow-sm"
                    : "text-gray-400 hover:text-gray-600",
                )}
              >
                Lista
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="p-0 pt-0 space-y-2">
        <div
          className={cn(
            "bg-white min-h-[600px]",
            viewMode === "list"
              ? "overflow-visible rounded-2xl p-3 md:p-6 shadow-sm border border-gray-100"
              : "overflow-hidden rounded-none md:rounded-2xl p-0 md:p-6 border-0 md:border md:border-gray-100 shadow-none md:shadow-sm",
          )}
        >
          {viewMode === "calendar" ? (
            <div className="flex flex-col lg:flex-row h-full items-stretch gap-4 lg:gap-6">
              <div className="flex-none lg:flex-1 min-h-0 w-full p-0 overflow-y-auto custom-scrollbar">
                <CalendarView
                  currentDate={currentDate}
                  events={expandedEvents}
                  filter={filter}
                  feriados={feriados}
                  onDateChange={handleDateSelect}
                />
              </div>

              {/* Legend — mobile only, immediately below calendar */}
              <div className="flex flex-col gap-2 text-[10px] font-bold text-gray-500 uppercase pt-1 md:hidden">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-[#00247d]" />
                  </span>
                  <span>CNC - RJ</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-[#0076cd]" />
                  </span>
                  <span>CNC - DF</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-[#b1b4b7]" />
                  </span>
                  <span>Outros Locais</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        agendaCessaoAccentClass,
                      )}
                    />
                  </span>
                  <span>Cessão de espaço</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                    <Star className="h-3.5 w-3.5 text-[#00b3f5] fill-[#00b3f5]" />
                  </span>
                  <span>Estratégico</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-orange-400" />
                  </span>
                  <span>Feriado</span>
                </div>
              </div>

              <div className="block lg:hidden">
                <Sheet
                  open={mobileDrawerOpen}
                  onOpenChange={setMobileDrawerOpen}
                >
                  <SheetContent side="right" className="w-[92vw] max-w-sm p-0">
                    <SheetTitle className="sr-only">Eventos do dia</SheetTitle>
                    <DayEventsPanel
                      key={format(currentDate, "yyyy-MM-dd")}
                      date={currentDate}
                      events={expandedEvents}
                      feriados={feriados}
                      selectedEvent={selectedEvent}
                      onSelectEvent={handleSelectEvent}
                      onClearSelection={handleClearSelection}
                    />
                  </SheetContent>
                </Sheet>
              </div>

              {/* Persistent Right Panel */}
              <div className="hidden lg:block w-full lg:w-[400px] flex-shrink-0 lg:h-auto overflow-hidden">
                <DayEventsPanel
                  key={format(currentDate, "yyyy-MM-dd")}
                  date={currentDate}
                  events={expandedEvents}
                  feriados={feriados}
                  selectedEvent={selectedEvent}
                  onSelectEvent={handleSelectEvent}
                  onClearSelection={handleClearSelection}
                />
              </div>
            </div>
          ) : (
            <>
              <ListView
                currentDate={currentDate}
                events={expandedEvents}
                selectedEvent={selectedEvent}
                onSelectEvent={handleSelectEvent}
                onClearSelection={handleClearSelection}
              />
              <div className="flex flex-col gap-2 text-[10px] font-bold text-gray-500 uppercase pt-3 md:hidden">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-[#00247d]" />
                  </span>
                  <span>CNC - RJ</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-[#0076cd]" />
                  </span>
                  <span>CNC - DF</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-[#b1b4b7]" />
                  </span>
                  <span>Outros Locais</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        agendaCessaoAccentClass,
                      )}
                    />
                  </span>
                  <span>Cessão de espaço</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                    <Star className="h-3.5 w-3.5 text-[#00b3f5] fill-[#00b3f5]" />
                  </span>
                  <span>Estratégico</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-orange-400" />
                  </span>
                  <span>Feriado</span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
