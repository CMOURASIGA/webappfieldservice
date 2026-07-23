'use client'
import { ButtonHTMLAttributes, ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";

export interface CardPageActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Título do card */
    title?: string;
    /** Descrição da ação do card */
    description?: string;
    /** Ícone do card */
    icon?: ReactNode;
    /** Se verdadeiro, o componente será renderizado como um slot */
    asChild?: boolean;
    /** Classes CSS adicionais */
    className?: string;
}

export function CardPageAction({ 
    children, 
    title, 
    description,
    icon, 
    onClick, 
    asChild = false,
    className = "",
    ...props
}: CardPageActionProps) {
    const Comp = asChild ? Slot : "button";
    
    return (
        <Comp 
            onClick={onClick} 
            className={`cursor-pointer hover:shadow-md transition-shadow border rounded p-5 ${className}`}
            {...props}
        >
            <div className="flex flex-col items-center justify-center gap-2 p-6">
                {icon && <div className="text-blue-600">{icon}</div>}
                {title && <h3 className="text-base font-bold text-center">{title}</h3>}
                {description && <span>{description}</span>}
            </div>
            {children}
        </Comp>
    )
}