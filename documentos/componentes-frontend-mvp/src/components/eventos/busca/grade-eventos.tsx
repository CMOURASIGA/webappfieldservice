"use client";
import { useMemo } from "react";
import { Evento } from "@/services/eventos/tipo-evento";
import { Skeleton } from "@/components/ui/skeleton";
import { CardEvento } from "../card-evento";

type Props = {
  itens: Evento[];
  onDeleteClick: (ev: Evento) => void;
  loading?: boolean;
  validatingEventId?: string | null;
};


export function GradeEventos({ itens, onDeleteClick, loading, validatingEventId }: Props) {
  const eventosAgrupados = useMemo(() => {
    if (!itens) return [];
    const grupos = itens.reduce((acc, evento) => {
      // Usar titulo como chave primária para agrupar (ignorando case)
      const key = evento.titulo.trim().toUpperCase();
      if (!acc[key]) {
        acc[key] = { ...evento, sessoes: [] };
      }
      acc[key].sessoes.push(evento);
      return acc;
    }, {} as Record<string, Evento & { sessoes: Evento[] }>);
    return Object.values(grupos);
  }, [itens]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-h-[80vh]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border  shadow-sm h-[280px] p-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            <div className="flex gap-2 pt-4 justify-between border-t mt-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {eventosAgrupados.length > 0 && eventosAgrupados.map((e: Evento & { sessoes: Evento[] }) => (
        <CardEvento
          key={e.id}
          evento={e}
          onDeleteClick={onDeleteClick}
          validatingEventId={validatingEventId}
        />
      ))}
    </div>
  );
}
