"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@cnc-ti/layout-basic";
import Link from "next/link";
import IconTrash from "@/icons/trash";
import { ShieldCheck, Wrench, Calendar, MapPin } from "lucide-react";
import { Evento } from "@/services/eventos/tipo-evento";
import { CardFooterActions, TruncatedText, CardBadge } from "@/components/shared/cards";

type CardEventoProps = {
  evento: Evento & { sessoes?: Evento[] };
  onDeleteClick?: (ev: Evento) => void;
  validatingEventId?: string | null;
  readOnly?: boolean;
};

function formatSessionDate(data: string, dataFim?: string) {
  const startDate = new Date(data);
  const startDateString = startDate.toLocaleDateString("pt-BR");
  const startTimeString = startDate.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });

  if (!dataFim) {
    return `${startDateString} às ${startTimeString}`;
  }

  const endDate = new Date(dataFim);
  const endDateString = endDate.toLocaleDateString("pt-BR");
  const endTimeString = endDate.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });

  if (startDateString === endDateString) {
    return `${startDateString} das ${startTimeString} às ${endTimeString}`;
  }

  return `${startDateString} ${startTimeString} até ${endDateString} ${endTimeString}`;
}

export function CardEvento({ evento, onDeleteClick, validatingEventId, readOnly = false }: CardEventoProps) {
  const sessoes = evento.sessoes || [evento];

  return (
    <Card className="border border-gray-200 shadow-sm h-full flex flex-col justify-between">
      <CardHeader className="relative !pb-2 !border-b-0">
        <div className="w-full">
          <div className="flex items-center gap-2">
            <CardBadge variant="default">
              {evento.uf} {evento.data ? new Date(evento.data).getFullYear() : (evento.Periodos && evento.Periodos.length > 0 ? new Date(evento.Periodos[0].dataInicio).getFullYear() : "")}
            </CardBadge>
            {evento.necessitaAjuste && (
              <CardBadge
                variant="warning"
                className="flex items-center gap-1"
                title="Este evento foi devolvido para ajuste"
              >
                <Wrench className="w-3 h-3" />
                <span>Necessita ajuste</span>
              </CardBadge>
            )}
          </div>
          <p className="text-md mt-2 font-semibold cnc-text-brand-blue-600 capitalize pr-20">
            {evento.titulo}
          </p>
        </div>
        <div className="absolute top-0 right-2 flex gap-2">
          {evento.NivelAssessoria && (
            <CardBadge
              variant="primary"
              title="Nível de Assessoria"
            >
              <span className="uppercase font-bold">N{evento.NivelAssessoria.nivel}</span>
            </CardBadge>
          )}
          <CardBadge variant="default">
            <span className="capitalize">{evento.status || evento.Situacao?.nome}</span>
          </CardBadge>
        </div>
      </CardHeader>

      <CardContent className="!pt-0 !pb-2 flex-grow flex flex-col">
        <div className="mb-3">
          <TruncatedText lines={2}>
            {evento.descricao}
          </TruncatedText>
        </div>

        <div className="mt-auto flex flex-col border-t border-gray-100 pt-3">
          <span className="text-xs font-semibold text-gray-500 uppercase mb-2">
            {sessoes.length === 1 ? "1 Sessão Agendada" : `${sessoes.length} Sessões Agendadas`}
          </span>
          
          <div className="flex flex-col gap-2 h-[120px] overflow-y-auto pr-1 custom-scrollbar">
            {sessoes.map((sessao: Evento, index: number) => (
              <div key={`${sessao.id}-${index}`} className="text-sm flex flex-col gap-1.5 relative group transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-1.5 overflow-hidden">
                    {sessao.Periodos && sessao.Periodos.length > 0 ? (
                      sessao.Periodos.map((periodo) => (
                        <p key={periodo.id} className="text-xs cnc-text-brand-gray-600 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {formatSessionDate(periodo.dataInicio, periodo.dataFim)}
                          </span>
                        </p>
                      ))
                    ) : (
                      <p className="text-xs cnc-text-brand-gray-600 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">
                          {formatSessionDate(sessao.data, sessao.dataFim)}
                        </span>
                      </p>
                    )}
                    <p className="text-xs cnc-text-brand-gray-600 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate capitalize" title={sessao.local}>{sessao.local || "Local não definido"}</span>
                    </p>
                  </div>
                </div>

                {sessao.Reserva && sessao.Reserva.length > 0 && (
                  <div className="mt-1">
                    <Link href={`/reservas/${sessao.Reserva[0].id}`}>
                      <CardBadge variant="primary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer w-fit" title="Possui reserva vinculada (Clique para ver)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></svg>
                        <span className="text-[10px]">Com Reserva</span>
                      </CardBadge>
                    </Link>
                  </div>
                )}
                
                {/* Botões individuais de sessão (caso sejam eventos separados na base) */}
                {!readOnly && onDeleteClick && sessoes.length > 1 && sessoes.some((s: Evento) => s.id !== evento.id) && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white p-0.5 rounded shadow-sm border border-gray-200">
                    <button type="button" onClick={() => onDeleteClick(sessao)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Excluir apenas esta sessão">
                      <IconTrash className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      
      {!readOnly && (
        <CardFooter className="!mt-0 [&>*]:border-gray-200 divide-gray-200 border-t border-gray-200">
          <CardFooterActions
            viewHref={`/eventos/visualizar/${evento.id}`}
            editHref={`/eventos/editar/${evento.id}`}
            onDelete={onDeleteClick ? () => onDeleteClick(evento) : undefined}
            isDeleting={validatingEventId === evento.id}
            viewTitle="Visualizar Evento Principal"
            editTitle="Editar Evento Principal"
            deleteTitle="Excluir Evento (Todas as Sessões)"
            customActions={[
              <Link
                key="status-flow"
                href={`/eventos/editar/${evento.id}?viewStatus=true`}
                className="cnc-text-brand-blue-500"
                title="Fluxo de Status"
              >
                <ShieldCheck strokeWidth={1.25} className="w-[18px] h-[18px]" />
              </Link>
            ]}
          />
        </CardFooter>
      )}
    </Card>
  );
}
