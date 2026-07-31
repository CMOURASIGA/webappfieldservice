"use client";
import { Card, CardHeader } from "@cnc-ti/layout-basic";
import { useIndicadoresEventos } from "@/hooks/eventos/use-indicadores-eventos";
import { cn } from "@/lib/utils";
import { SearchIcon } from "@/components/icons/search-icon";

import { CartaoAcaoPagina } from "@/components/layouts/ui/cards/cartao-acao-pagina";
import { UsersSquarePlusIcon } from "@/components/icons/users-square-plus";
import { EventoSimples, ProximosEventos } from "./proximos-eventos";

type IndicadorProps = {
  titulo: string;
  valor: number | string;
  onClick: () => void;
  className?: string;
};

function IndicadorCard({ titulo, valor, onClick, className }: IndicadorProps) {
  return (
    <button
      onClick={onClick}
      className={cn("block w-full no-underline", className)}
    >
      <Card className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow h-[120px]">
        <CardHeader className="h-full p-4 border-b-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-semibold cnc-text-brand-blue-600 text-center">
              {titulo}
            </p>
            <p className="text-3xl font-bold cnc-text-brand-blue-600 text-center">
              {valor}
            </p>
          </div>
        </CardHeader>
      </Card>
    </button>
  );
}
interface IndicadoresEventosDashboardProps {
  eventos?: EventoSimples[];
}
export function IndicadoresEventosDashboard({
  eventos = [],
}: IndicadoresEventosDashboardProps) {
  const {
    indicadoresPorStatus,
    isLoading,
    isError,
    irParaStatus,
  } = useIndicadoresEventos();

  if (isError) {
    return (
      <div className="mb-4 rounded-md bg-red-50 p-4 cnc-border cnc-border-brand-blue-100">
        Não foi possível carregar os indicadores
      </div>
    );
  }

  return (
    <div className="w-full px-6 pt-4 space-y-6">
      {/* 1. Top Section: Events + Actions */}
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Left: Next Events */}
        <div className="flex-grow lg:w-2/3">
          <ProximosEventos events={eventos} className="mt-0 h-full" />
        </div>

        {/* Right: Action Buttons */}
        <div className="flex-shrink-0 lg:w-1/3 flex flex-col gap-4">
          <CartaoAcaoPagina
            titulo="Criar Evento"
            className="w-full px-[42px] py-7 flex-1"
            icone={<UsersSquarePlusIcon className="size-14" />}
            href="/eventos/novo"
          />

          <CartaoAcaoPagina
            titulo="Buscar Evento"
            className="w-full px-[42px] py-7 flex-1"
            icone={<SearchIcon className="size-14" />}
            href={`/eventos/buscar`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <IndicadorCard
          titulo="Em Elaboração"
          valor={isLoading ? "--" : (indicadoresPorStatus?.emElaboracao ?? "--")}
          onClick={() => irParaStatus("Em elaboração")}
        />
        <IndicadorCard
          titulo="Para Validação"
          valor={isLoading ? "--" : (indicadoresPorStatus?.validacao ?? "--")}
          onClick={() => irParaStatus("Aguardando validação")}
        />
        <IndicadorCard
          titulo="Para Aprovação"
          valor={isLoading ? "--" : (indicadoresPorStatus?.aprovacao ?? "--")}
          onClick={() => irParaStatus("Aguardando aprovação")}
        />
      </div>
    </div>
  );
}
