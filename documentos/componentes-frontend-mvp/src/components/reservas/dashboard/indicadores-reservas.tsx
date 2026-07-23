"use client";

import Link from "next/link";
import { Card, CardHeader } from "@cnc-ti/layout-basic";
import { useIndicadoresReservas } from "@/hooks/reservas/use-indicadores-reservas";
import { cn } from "@/lib/utils";

type IndicadorProps = {
    titulo: string;
    valor: number | string;
    className?: string;
};

// Indicadores sem clique, apenas visualização por enquanto
function IndicadorCard({ titulo, valor, className, href }: IndicadorProps & { href?: string }) {
    const Content = (
        <Card className="cnc-border cnc-border-brand-blue-60 h-[120px] transition-all hover:bg-slate-50 cursor-pointer">
            <CardHeader className="h-full p-4 border-b-0 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-sm font-semibold cnc-text-brand-blue-600 text-center">{titulo}</p>
                    <p className="text-3xl font-bold cnc-text-brand-blue-600 text-center">{valor}</p>
                </div>
            </CardHeader>
        </Card>
    );

    if (href) {
        return (
            <div className={cn("block w-full", className)}>
                <Link href={href} className="block h-full">
                    {Content}
                </Link>
            </div>
        );
    }

    return (
        <div className={cn("block w-full", className)}>
            {Content}
        </div>
    );
}

function getLinkForTitle(title: string): string | undefined {
    switch (title) {
        case 'Reserva em execução':
            return '/espacos/reservas/buscar?status=EM_EXECUCAO';
        case 'Reserva ativa':
            return '/espacos/reservas/buscar?status=ATIVA';
        case 'Reserva concluídas':
            return '/espacos/reservas/buscar?status=CONCLUIDA';
        default:
            return undefined;
    }
}

export function IndicadoresReservas() {
    const {
        dadosStatus,
        isLoading,
        isError,
    } = useIndicadoresReservas();

    if (isError) {
        return <div className="mb-4 rounded-md bg-red-50 p-4 cnc-border cnc-border-brand-blue-100">Não foi possível carregar os indicadores</div>;
    }

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <IndicadorCard key={i} titulo="Carregando..." valor="--" />
                    ))
                    : dadosStatus?.map((item) => (
                        <IndicadorCard
                            key={item.titulo}
                            titulo={item.titulo}
                            valor={item.quantidade}
                            href={getLinkForTitle(item.titulo)}
                        />
                    ))}
            </div>
        </div>
    );
}
