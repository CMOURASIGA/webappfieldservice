"use client";
import Link from "next/link";
import { Button, PageHeader, PageHeaderTitle, PageHeaderTitleContent } from "@cnc-ti/layout-basic";
import { ButtonBack } from "@/components/layouts/ui/buttons/button-back/button-back";

export function CabecalhoBuscaReservas() {
    return (
        <PageHeader className="flex flex-col gap-y-6 lg:flex-row items-center">
            <PageHeaderTitleContent className="flex flex-col lg:flex-row gap-6 items-center">
                <ButtonBack />
                <div className="flex flex-col lg:flex-row w-full items-center gap-4 lg:gap-6 text-center lg:text-start">
                    <PageHeaderTitle title="Buscar Reservas" description="Página de busca de reservas de espaço" />
                </div>
            </PageHeaderTitleContent>
            <div>
                <Link href="/reservas/novo">
                    <Button variant="create" className="font-semibold">
                        Nova Reserva
                    </Button>
                </Link>
            </div>
        </PageHeader>
    );
}
