"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@cnc-ti/layout-basic";
import { Calendar, MapPin } from "lucide-react";

export interface EventoSimples {
  id: number;
  nome: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  estado: string;
  status: string;
  pais: string;
}

interface ProximosEventosProps {
  events: EventoSimples[];
  className?: string;
}

const getCategoryColor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('reunião')) return 'bg-blue-100 text-blue-600';
  if (n.includes('cessão')) return 'bg-green-100 text-green-600';
  if (n.includes('coquetel')) return 'bg-pink-100 text-pink-600';
  if (n.includes('treinamento')) return 'bg-amber-100 text-amber-600';
  return 'bg-slate-100 text-slate-600';
};

const getCategoryName = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('reunião')) return 'Reunião';
  if (n.includes('cessão')) return 'Cessão de Espaço';
  if (n.includes('coquetel')) return 'Coquetel';
  if (n.includes('treinamento')) return 'Treinamento';
  return 'Evento';
};

export function ProximosEventos({ events, className }: ProximosEventosProps) {
  const router = useRouter();
  const displayEvents = Array.isArray(events)
    ? [...events].sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()).slice(0, 9)
    : [];

  return (
    <div className={cn("w-full p-5", className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayEvents.length > 0 ? (
          displayEvents.map((event) => {
            const dateObj = new Date(event.dataInicio);
            const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
            const monthStr = months[dateObj.getMonth()];
            const day = dateObj.getDate().toString().padStart(2, "0");
            const time = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
            
            const categoryColor = getCategoryColor(event.nome);
            const categoryName = getCategoryName(event.nome);

            return (
              <Card 
                key={event.id} 
                className="border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-full bg-white overflow-hidden rounded-xl"
                onClick={() => router.push(`/eventos/visualizar/${event.id}`)}
              >
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <span className={cn("px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider", categoryColor)}>
                      {categoryName}
                    </span>
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-800 leading-none block">{day}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{monthStr}</span>
                    </div>
                  </div>
                  
                  <h4 className="text-[14px] font-semibold text-slate-800 leading-snug line-clamp-2 mb-2 flex-1">
                    {event.nome}
                  </h4>
                  
                  <div className="space-y-1.5 mt-auto pt-3 border-t border-slate-100">
                    <div className="flex items-center text-[12px] text-slate-500">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                      <span>{day} {monthStr} às {time}</span>
                    </div>
                    <div className="flex items-center text-[12px] text-slate-500">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                      <span className="truncate">{event.descricao || "Auditório - Sede"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center p-8 text-slate-400 text-[14px]">
            Nenhum próximo evento.
          </div>
        )}
      </div>
    </div>
  );
}
