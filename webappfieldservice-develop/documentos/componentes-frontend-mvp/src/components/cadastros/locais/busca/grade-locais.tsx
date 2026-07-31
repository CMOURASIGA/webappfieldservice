"use client";

import { FolderOpenIcon } from "lucide-react";
import { Local } from "@/services/locais.service";
import { Skeleton } from "@/components/ui/skeleton";
import { CardLocal } from "../card-local";

type Props = {
  itens: Local[];
  onDeleteClick: (id: number) => void;
  loading?: boolean;
};

export function GradeLocais({ itens, onDeleteClick, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border shadow-sm h-[200px] p-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-grow">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            <div className="flex gap-2 pt-4 justify-between border-t mt-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!itens || itens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <FolderOpenIcon className="mb-4 size-12 opacity-50" />
        <span className="text-lg font-medium">Nenhum local encontrado.</span>
        <p className="text-sm mt-2">Tente ajustar os filtros ou cadastre um novo local.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
      {itens.map((local) => (
        <CardLocal
          key={local.id}
          local={local}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </div>
  );
}
