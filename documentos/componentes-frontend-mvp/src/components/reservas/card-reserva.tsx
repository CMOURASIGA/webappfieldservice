"use client";

import { Card, CardContent, CardFooter, CardFooterItem, CardHeader } from "@cnc-ti/layout-basic";
import { Reserva } from "@/services/reservas/tipo-reserva";
import { format, parseISO } from "date-fns";
import { CardFooterActions, TruncatedText, CardBadge } from "@/components/shared/cards";
import { IconCalendar, IconMapPin } from "@/components/shared/icons";

type CardReservaProps = {
  reserva: Reserva;
  onDeleteClick?: (reserva: Reserva) => void;
  onSelect?: (reserva: Reserva) => void;
  onDeselect?: (reserva: Reserva) => void;
  isSelected?: boolean;
  readOnly?: boolean;
  isSelectionGrid?: boolean;
};

function getStatusInfo(dataInicio: string, dataFim: string): { label: string, variant: "default" | "primary" | "success", className?: string } {
  const now = new Date();
  const start = new Date(dataInicio);
  const end = new Date(dataFim);

  if (now > end) {
    return { label: "Concluída", variant: "default", className: "bg-slate-200 text-slate-700 hover:bg-slate-300" };
  }
  if (now >= start && now <= end) {
    return { label: "Em Execução", variant: "success" };
  }
  return { label: "Ativa", variant: "primary" };
}

export function CardReserva({
  reserva,
  onDeleteClick,
  onSelect,
  onDeselect,
  isSelected = false,
  readOnly = false,
  isSelectionGrid = false,
}: CardReservaProps) {
  const status = getStatusInfo(reserva.dataInicio, reserva.dataFim);

  return (
    <Card className={isSelected && !isSelectionGrid ? "border-2 border-green-500 ring-1 ring-green-500 bg-green-50/30 h-full flex flex-col justify-between" : "border border-gray-200 shadow-sm h-full flex flex-col justify-between"}>
      <CardHeader className="relative !pb-2 !border-b-0">
        <div className="w-full">
          <h3>
            <CardBadge variant="default">
              {reserva.dataInicio ? new Date(reserva.dataInicio).getFullYear() : 'N/A'}
            </CardBadge>
          </h3>
          <p className="text-md mt-2 font-semibold cnc-text-brand-blue-600">
            {reserva.Espaco?.nome || "Espaço não informado"}
          </p>
          <p className="text-sm font-bold">
            {reserva.Evento?.nome || reserva.Solicitacao?.dadosSolicitante || "Não vinculado"}
          </p>
          <div className="flex flex-col space-y-1 mt-1">
            <p className="text-sm cnc-text-brand-gray-500 flex items-center gap-2">
              <IconCalendar />
              {reserva.dataInicio ? format(parseISO(reserva.dataInicio), "dd/MM/yyyy HH:mm") : ''}
              {reserva.dataFim ? ` até ${format(parseISO(reserva.dataFim), "dd/MM/yyyy HH:mm")}` : ''}
            </p>
            <p className="text-sm cnc-text-brand-gray-500 flex items-center gap-2">
              <IconMapPin />
              {reserva.Espaco?.Local?.nome || "Local não informado"}
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-2">
          <CardBadge
            variant={status.variant}
            className={`ml-2 whitespace-nowrap ${status.className || ""}`}
          >
            {status.label}
          </CardBadge>
        </div>
      </CardHeader>
      <CardContent className="!pt-2 !pb-2 mt-auto border-t border-gray-200">
        <div className="h-[5rem]">
          <TruncatedText lines={5} emptyText="Sem motivo informado">
            {reserva.motivo}
          </TruncatedText>
        </div>
      </CardContent>
      <CardFooter className="!mt-0 [&>*]:border-gray-200 divide-gray-200 border-t border-gray-200">
        {!readOnly && onSelect ? (
          <div className="w-full flex justify-end">
            <CardFooterItem>
              {isSelected || isSelectionGrid ? (
                <button
                  type="button"
                  onClick={() => onDeselect && onDeselect(reserva)}
                  className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1 text-sm font-medium"
                  title="Desvincular"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  {isSelectionGrid ? "Remover" : "Desmarcar"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelect(reserva)}
                  className="text-green-600 hover:text-green-800 transition-colors flex items-center gap-1 text-sm font-medium"
                  title="Vincular"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Selecionar
                </button>
              )}
            </CardFooterItem>
          </div>
        ) : !readOnly && (
          <CardFooterActions
            viewHref={`/reservas/${reserva.id}`}
            editHref={`/reservas/editar/${reserva.id}`}
            onDelete={onDeleteClick ? () => onDeleteClick(reserva) : undefined}
          />
        )}
      </CardFooter>
    </Card>
  );
}
