"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardGerencial, getDashboardOperacional, getProximosEventos } from "@/services/eventos.service";
import { Card, CardContent, CardHeader } from "@cnc-ti/layout-basic";
import { MapPinIcon, CalendarDaysIcon, ClockIcon, SearchIcon, BuildingIcon, FileTextIcon } from "lucide-react";
import { ProximosEventos } from "./proximos-eventos";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";

export function CentroControle() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "Fabio"; // fallback to Fabio as per screenshot

  const { data: eventos = [], isLoading: isLoadingEventos } = useQuery({
    queryKey: ["eventos", "proximos"],
    queryFn: () => getProximosEventos(),
  });

  const { data: gerencialData, isLoading: isLoadingGerencial } = useQuery({
    queryKey: ["dashboard-gerencial", 30],
    queryFn: () => getDashboardGerencial(30),
  });

  const espacosColors = [
    "bg-blue-100 text-blue-600",
    "bg-green-100 text-green-600",
    "bg-amber-100 text-amber-600",
    "bg-purple-100 text-purple-600",
  ];

  const espacosUtilizados = gerencialData?.espacosUtilizados?.map((espaco: any, index: number) => ({
    id: espaco.id,
    nome: espaco.nome,
    local: espaco.local,
    uso: `${espaco.quantidade} evento${espaco.quantidade > 1 ? 's' : ''}`,
    cor: espacosColors[index % espacosColors.length],
  })) || [];

  return (
    <div className="w-full space-y-6">
      <div className="mb-6">
        {status === "loading" ? (
          <div className="space-y-3">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-96 max-w-full" />
          </div>
        ) : (
          <>
            <h2 className="text-[28px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Eventos
            </h2>
            <p className="text-slate-500 text-[15px]">
              Crie eventos e acompanhe seus indicadores.
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-2">
        <button onClick={() => router.push('/eventos/novo')} className="text-left group outline-none">
          <Card className="border-0 shadow-sm transition-all bg-[#001C6A] hover:bg-[#00144d] text-white h-full cursor-pointer rounded-2xl">
            <CardContent className="p-5 pt-5 flex items-center gap-4 h-full">
              <div className="bg-white/10 p-3.5 rounded-xl group-hover:bg-white/20 transition-colors flex items-center justify-center">
                <span className="text-xl font-light leading-none">+</span>
              </div>
              <div>
                <h3 className="font-semibold text-[15px]">Novo evento</h3>
                <p className="text-xs text-blue-200/80 mt-0.5">Cadastrar um novo evento</p>
              </div>
            </CardContent>
          </Card>
        </button>

        <button onClick={() => router.push('/reservas/novo')} className="text-left group outline-none">
          <Card className="border border-slate-200 shadow-sm transition-all bg-white hover:border-slate-300 hover:shadow-md h-full cursor-pointer rounded-2xl">
            <CardContent className="p-5 pt-5 flex items-center gap-4 h-full">
              <div className="bg-blue-50 text-blue-500 p-3.5 rounded-xl group-hover:bg-blue-100 transition-colors">
                <MapPinIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-[15px]">Reservar espaço</h3>
                <p className="text-xs text-slate-500 mt-0.5">Cessão de espaço físico</p>
              </div>
            </CardContent>
          </Card>
        </button>

        <button onClick={() => router.push('/')} className="text-left group outline-none">
          <Card className="border border-slate-200 shadow-sm transition-all bg-white hover:border-slate-300 hover:shadow-md h-full cursor-pointer rounded-2xl">
            <CardContent className="p-5 pt-5 flex items-center gap-4 h-full">
              <div className="bg-blue-50 text-blue-500 p-3.5 rounded-xl group-hover:bg-blue-100 transition-colors">
                <CalendarDaysIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-[15px]">Ver agenda</h3>
                <p className="text-xs text-slate-500 mt-0.5">Compromissos da semana</p>
              </div>
            </CardContent>
          </Card>
        </button>

        <button onClick={() => router.push('/eventos/buscar')} className="text-left group outline-none">
          <Card className="border border-slate-200 shadow-sm transition-all bg-white hover:border-slate-300 hover:shadow-md h-full cursor-pointer rounded-2xl">
            <CardContent className="p-5 pt-5 flex items-center gap-4 h-full">
              <div className="bg-blue-50 text-blue-500 p-3.5 rounded-xl group-hover:bg-blue-100 transition-colors">
                <SearchIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-[15px]">Buscar eventos</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pesquisar e filtrar eventos</p>
              </div>
            </CardContent>
          </Card>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-slate-200 shadow-sm h-[420px] flex flex-col rounded-2xl bg-white overflow-hidden">
          <div className="flex flex-row justify-between items-start w-full px-5 pt-5 pb-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-800 tracking-tight">Próximos eventos</h3>
              <p className="text-[13px] text-slate-500">Agenda dos próximos dias</p>
            </div>
            <button className="text-[13px] font-medium text-blue-600 hover:text-blue-800 transition-colors pt-1" onClick={() => router.push('/')}>Abrir agenda →</button>
          </div>
          <div className="overflow-y-auto flex-1">
            {isLoadingEventos ? (
              <div className="p-5 space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-5 animate-pulse">
                    <div className="flex flex-col items-center gap-1 w-10">
                      <Skeleton className="h-2.5 w-6" />
                      <Skeleton className="h-6 w-8" />
                      <Skeleton className="h-2 w-7" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-4 w-16 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ProximosEventos events={eventos.slice(0, 9)} className="border-0 shadow-none mt-0" />
            )}
          </div>
        </Card>

        <Card className="border border-slate-200 shadow-sm h-[420px] flex flex-col rounded-2xl bg-white overflow-hidden">
          <div className="flex flex-row items-start w-full px-5 pt-5 pb-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-800 tracking-tight">Cessão de espaço por demandante</h3>
              <p className="text-[13px] text-slate-500">Top demandantes no período</p>
            </div>
          </div>
          <div className="p-5 overflow-y-auto flex-1">
            {isLoadingGerencial ? (
              <div className="space-y-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex justify-between items-end mb-2">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-6" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : gerencialData?.graficoDemandantesCessao && gerencialData.graficoDemandantesCessao.length > 0 ? (
              <div className="space-y-5">
                {gerencialData.graficoDemandantesCessao.map((item: any, i: number) => {
                  const max = Math.max(...gerencialData.graficoDemandantesCessao.map((d: any) => d.quantidade));
                  const percentage = Math.max(5, (item.quantidade / max) * 100);
                  const colors = [
                    'bg-[#0033cc]', // blue
                    'bg-[#22c55e]', // green
                    'bg-[#f59e0b]', // orange
                    'bg-[#ef4444]', // red
                    'bg-[#a855f7]', // purple
                    'bg-[#3b82f6]'  // light blue
                  ];
                  return (
                    <div 
                      key={item.demandante} 
                      className="group cursor-pointer hover:bg-slate-50/50 p-2 -mx-2 rounded-lg transition-colors"
                      onClick={() => {
                        if (item.id) {
                          const dCorte = new Date();
                          dCorte.setDate(dCorte.getDate() - 30);
                          const dataInicioStr = dCorte.toISOString().split('T')[0];
                          router.push(`/eventos/buscar?idDemandante=${item.id}&isCessao=true&dataInicio=${dataInicioStr}`);
                        }
                      }}
                    >
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[13px] font-medium text-slate-700">{item.demandante}</span>
                        <span className="text-[13px] font-bold text-slate-600">{item.quantidade}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${colors[i % colors.length]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-[14px]">
                Sem dados de cessão no período
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
