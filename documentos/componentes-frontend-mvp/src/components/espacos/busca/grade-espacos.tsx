"use client";

import { Espaco } from "@/services/espacos/tipo-espaco";
import { Skeleton } from "@/components/ui/skeleton";
import { CardEspaco } from "../card-espaco";

type Props = {
    itens?: Espaco[];
    onDeleteClick: (espaco: Espaco) => void;
    loading?: boolean;
};

export function GradeEspacos({ itens, onDeleteClick, loading }: Props) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg border  shadow-sm h-[250px] p-4 flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-16" />
                            </div>
                            <Skeleton className="h-6 w-3/4" />
                            <div className="space-y-2 pt-2">
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
            {itens && itens.map((e) => (
                <CardEspaco
                    key={e.Id}
                    espaco={e}
                    onDeleteClick={onDeleteClick}
                />
            ))}
        </div>
    );
}
