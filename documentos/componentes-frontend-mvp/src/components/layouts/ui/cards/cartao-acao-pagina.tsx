import { ReactNode } from "react";
import Link, { LinkProps } from "next/link";
import { cn } from "@/lib/utils";

export interface CartaoAcaoPaginaProps extends LinkProps {
    /** Título do cartão */
    titulo?: string;
    /** Descrição da ação do cartão */
    descricao?: string;
    /** Ícone do cartão */
    icone?: ReactNode;
    /** Classes CSS adicionais */
    className?: string;
}

export function CartaoAcaoPagina({
    titulo,
    descricao,
    icone,
    className = "",
    ...props
}: CartaoAcaoPaginaProps) {

    return (
        <Link
            className={cn(
                "flex flex-col items-center justify-center p-8", // Layout e Espaçamento
                "cursor-pointer hover:shadow-md transition-shadow border border-gray-200 rounded-lg", // Estilo visual
                "bg-white text-center", // Garante fundo branco e texto centralizado
                className // Suas classes customizadas (ex: w-full, w-64) entram aqui
            )}
            {...props}
        >
            {icone && <div className="text-[#0130A4] mb-4">{icone}</div>}
            {titulo && <h3 className="text-base font-bold text-center">{titulo}</h3>}
            {descricao && <span className="text-xs text-slate-500 text-center">{descricao}</span>}
        </Link >
    )
}
