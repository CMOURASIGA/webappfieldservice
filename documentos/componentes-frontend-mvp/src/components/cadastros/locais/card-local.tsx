"use client";

import { Card, CardHeader, CardContent, CardFooter } from "@cnc-ti/layout-basic";
import { MapPin, Map } from "lucide-react";
import { Local } from "@/services/locais.service";
import { CardFooterActions, TruncatedText } from "@/components/shared/cards";

type CardLocalProps = {
  local: Local;
  onDeleteClick?: (id: number) => void;
  readOnly?: boolean;
};

export function CardLocal({ local, onDeleteClick, readOnly = false }: CardLocalProps) {
  return (
    <Card className="transition-all hover:shadow-md hover:border-brand-200 h-full flex flex-col justify-between">
      <CardHeader className="relative !pb-2 !border-b-0">
        <div className="flex items-start justify-between w-full">
          <div className="flex items-center gap-2">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${local.externo ? 'bg-orange-100 text-orange-600' : 'bg-brand-100 text-brand-600'}`}>
              <MapPin size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 line-clamp-1" title={local.nome}>
                {local.nome}
              </h3>
              {local.codigo && (
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded w-fit block mt-0.5">
                  {local.codigo}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="!pt-2 !pb-2 flex-grow">
        <div className="mb-4 space-y-2">
          <TruncatedText
            lines={2}
            className="text-sm text-gray-600"
            emptyText="Sem endereço cadastrado"
            emptyClassName="text-sm text-gray-400 italic"
          >
            {local.endereco}
          </TruncatedText>

          {local.linkMapa && (
            <a
              href={local.linkMapa}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-brand-600 hover:underline w-fit"
            >
              <Map size={12} /> Ver no mapa
            </a>
          )}
        </div>
      </CardContent>

      {!readOnly && (
        <CardFooter className="!mt-0 [&>*]:border-gray-200 divide-gray-200 border-t border-gray-200">
          <CardFooterActions
            editHref={`/cadastros/locais/editar/${local.id}`}
            onDelete={onDeleteClick ? () => onDeleteClick(local.id) : undefined}
          />
        </CardFooter>
      )}
    </Card>
  );
}
