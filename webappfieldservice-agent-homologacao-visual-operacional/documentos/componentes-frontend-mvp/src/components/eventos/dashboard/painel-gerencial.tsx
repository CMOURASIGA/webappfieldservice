"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardGerencial } from "@/services/eventos.service";
import { Card, CardContent, CardHeader } from "@cnc-ti/layout-basic";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { useState } from "react";
import { CalendarIcon, MapPinIcon, DollarSignIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function PainelGerencialSkeleton() {
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-2">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-6 flex gap-5 items-center">
              <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border border-slate-200 shadow-sm rounded-2xl bg-white flex flex-col h-[340px]">
            <CardHeader className="pb-0 pt-6 px-6 border-b-0 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-32" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
              <Skeleton className="w-48 h-48 rounded-full" />
              <div className="flex justify-center gap-4 mt-6 w-full">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white">
        <CardHeader className="pb-0 pt-6 px-6 border-b-0 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-40" />
        </CardHeader>
        <CardContent className="h-[320px] p-6 pt-4">
          <Skeleton className="w-full h-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}

export function PainelGerencial() {
  const defaultInicio = new Date();
  defaultInicio.setDate(defaultInicio.getDate() - 30);
  const [dataInicio, setDataInicio] = useState(defaultInicio.toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-gerencial", dataInicio, dataFim],
    queryFn: () => getDashboardGerencial(0, dataInicio, dataFim),
  });

  if (isLoading) return <PainelGerencialSkeleton />;
  if (isError || !data) return <div className="p-8 text-center text-red-500">Erro ao carregar dados do dashboard.</div>;

  const { resumo, graficoOrcamento, graficoAutoridade, graficoComplexidade, graficoTipo } = data;

  const nivoTheme = {
    grid: {
      line: {
        stroke: '#e2e8f0',
        strokeWidth: 1,
        strokeDasharray: '4 4'
      }
    },
    axis: {
      ticks: {
        text: {
          fill: '#64748b',
          fontSize: 11
        }
      }
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-[22px] font-bold text-slate-900 tracking-tight">Informações gerenciais</h2>
          <p className="text-slate-500 text-[14px]">Resumo dos eventos no período selecionado</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[13px] text-slate-500 font-medium">Período:</label>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              className="border-slate-200 rounded-lg text-[13px] font-medium py-1.5 px-3 bg-white border outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 shadow-sm"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
            <span className="text-slate-400 text-sm">até</span>
            <input 
              type="date" 
              className="border-slate-200 rounded-lg text-[13px] font-medium py-1.5 px-3 bg-white border outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 shadow-sm"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white flex flex-col h-[180px] justify-between">
          <div className="flex flex-col items-start w-full px-6 pt-6 pb-0 space-y-1">
            <h3 className="text-base font-semibold text-slate-800 tracking-tight">Total de eventos</h3>
            <p className="text-[13px] text-slate-500">no período</p>
          </div>
          <CardContent className="p-6 pt-4 flex items-center justify-between mt-auto">
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">{resumo.totalEventos}</h3>
            </div>
            <div className="bg-blue-50 text-blue-500 p-4 rounded-2xl flex-shrink-0">
              <CalendarIcon className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white flex flex-col h-[180px] justify-between">
          <div className="flex flex-col items-start w-full px-6 pt-6 pb-0 space-y-1">
            <h3 className="text-base font-semibold text-slate-800 tracking-tight">Cessões de espaço</h3>
            <p className="text-[13px] text-slate-500">reservas confirmadas</p>
          </div>
          <CardContent className="p-6 pt-4 flex items-center justify-between mt-auto">
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">{resumo.cessaoEspacoConfirmadas}</h3>
            </div>
            <div className="bg-green-50 text-green-500 p-4 rounded-2xl flex-shrink-0">
              <MapPinIcon className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white flex flex-col h-[180px] justify-between">
          <div className="flex flex-col items-start w-full px-6 pt-6 pb-0 space-y-1">
            <h3 className="text-base font-semibold text-slate-800 tracking-tight">Com orçamento</h3>
            <p className="text-[13px] text-slate-500">{resumo.percentualOrcamento}% orçados</p>
          </div>
          <CardContent className="p-6 pt-4 flex items-center justify-between mt-auto">
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">{resumo.comOrcamento}</h3>
            </div>
            <div className="bg-amber-50 text-amber-500 p-4 rounded-2xl flex-shrink-0">
              <DollarSignIcon className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gráfico de Orçamento */}
        <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white flex flex-col h-[340px]">
          <div className="flex flex-col items-start w-full px-6 pt-6 pb-0 space-y-1">
            <h3 className="text-base font-semibold text-slate-800 tracking-tight">Com / sem orçamento</h3>
            <p className="text-[13px] text-slate-500">Proporção orçada no período</p>
          </div>
          <CardContent className="flex-1 flex flex-col relative px-4">
            <div className="flex-1 min-h-0 relative -mt-4">
              <ResponsivePie
                data={graficoOrcamento}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                innerRadius={0.65}
                padAngle={2}
                cornerRadius={4}
                activeOuterRadiusOffset={4}
                colors={['#22c55e', '#f59e0b']}
                enableArcLinkLabels={false}
                enableArcLabels={false}
              />
            </div>
            <div className="flex justify-center gap-6 pb-6 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#22c55e]"></span>
                <span className="text-[13px] text-slate-600">Com orçamento</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span>
                <span className="text-[13px] text-slate-600">Sem orçamento</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Autoridade */}
        <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white flex flex-col h-[340px]">
          <div className="flex flex-col items-start w-full px-6 pt-6 pb-0 space-y-1">
            <h3 className="text-base font-semibold text-slate-800 tracking-tight">Eventos por autoridade</h3>
            <p className="text-[13px] text-slate-500">Faixa de autoridades por evento</p>
          </div>
          <CardContent className="flex-1 flex flex-col relative px-4">
            <div className="flex-1 min-h-0 relative -mt-4">
              <ResponsivePie
                data={graficoAutoridade}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                innerRadius={0.65}
                padAngle={2}
                cornerRadius={4}
                activeOuterRadiusOffset={4}
                colors={['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#0033cc']}
                enableArcLinkLabels={false}
                enableArcLabels={false}
              />
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 pb-6 pt-2 px-2">
              {graficoAutoridade.map((item: any, i: number) => {
                const c = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#0033cc'];
                return (
                  <div key={item.id} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c[i % c.length] }}></span>
                    <span className="text-[12px] text-slate-600 whitespace-nowrap">{item.id}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Complexidade */}
        <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white flex flex-col h-[340px]">
          <div className="flex flex-col items-start w-full px-6 pt-6 pb-0 space-y-1">
            <h3 className="text-base font-semibold text-slate-800 tracking-tight">Eventos por complexidade</h3>
            <p className="text-[13px] text-slate-500">Distribuição por nível</p>
          </div>
          <CardContent className="flex-1 flex flex-col relative px-4">
            <div className="flex-1 min-h-0 relative -mt-4">
              <ResponsivePie
                data={graficoComplexidade}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                innerRadius={0.65}
                padAngle={2}
                cornerRadius={4}
                activeOuterRadiusOffset={4}
                colors={['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#0033cc']}
                enableArcLinkLabels={false}
                enableArcLabels={false}
              />
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 pb-6 pt-2 px-2">
              {graficoComplexidade.map((item: any, i: number) => {
                const c = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#0033cc'];
                return (
                  <div key={item.id} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c[i % c.length] }}></span>
                    <span className="text-[12px] text-slate-600 whitespace-nowrap">{item.id}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white">
        <div className="flex flex-col items-start w-full px-6 pt-6 pb-0 space-y-1">
          <h3 className="text-base font-semibold text-slate-800 tracking-tight">Eventos por Tipo</h3>
          <p className="text-[13px] text-slate-500">Distribuição por categoria</p>
        </div>
        <CardContent className="h-[320px] p-6 pt-4">
          <ResponsiveBar
            data={graficoTipo}
            keys={['quantidade']}
            indexBy="tipo"
            margin={{ top: 10, right: 10, bottom: 30, left: 30 }}
            padding={0.4}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={['#22c55e']}
            borderRadius={4}
            theme={nivoTheme}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 12,
              tickRotation: 0,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 12,
              tickRotation: 0,
              tickValues: 5,
            }}
            enableGridY={true}
            enableLabel={false}
            isInteractive={true}
            tooltip={(e) => (
              <div style={{ background: 'white', borderRadius: '2px', boxShadow: 'rgba(0, 0, 0, 0.25) 0px 1px 2px', padding: '5px 9px' }}>
                <div style={{ whiteSpace: 'pre', display: 'flex', alignItems: 'center' }}>
                  <span style={{ display: 'block', width: '12px', height: '12px', background: e.color, marginRight: '7px' }}></span>
                  <span style={{ fontSize: '13px', color: '#333' }}>
                    {e.indexValue}: <strong>{e.value}</strong>
                  </span>
                </div>
              </div>
            )}
            role="application"
            ariaLabel="Nivo bar chart demo"
            barAriaLabel={e=>e.id+": "+e.formattedValue+" in tipo: "+e.indexValue}
          />
        </CardContent>
      </Card>
    </div>
  );
}
