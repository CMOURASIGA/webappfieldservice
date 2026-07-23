"use client";

import { Badge, Card, CardContent, CardFooter, CardHeader } from "@cnc-ti/layout-basic";
import { Espaco } from "@/services/espacos/tipo-espaco";
import { CardFooterActions, TruncatedText } from "@/components/shared/cards";
import { IconMapPin, IconUsers } from "@/components/shared/icons";

type CardEspacoProps = {
  espaco: Espaco;
  onDeleteClick?: (espaco: Espaco) => void;
  readOnly?: boolean;
};

export function CardEspaco({ espaco, onDeleteClick, readOnly = false }: CardEspacoProps) {
  return (
    <Card className="border border-gray-200 shadow-sm h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 !pb-2 !border-b-0 gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-md font-semibold cnc-text-brand-blue-600 capitalize break-words">
            {espaco.nome}
          </p>
          <div className="flex flex-col space-y-1 mt-2">
            <p className="text-sm cnc-text-brand-gray-500 flex items-center gap-2">
              <IconMapPin />
              <span className="capitalize">{espaco.local || "Local não informado"}</span>
            </p>
            <p className="text-sm cnc-text-brand-gray-500 flex items-center gap-2">
              <IconUsers />
              <span>
                {espaco.capacidade && espaco.capacidade > 0
                  ? `Capacidade: ${espaco.capacidade} pessoas`
                  : "Capacidade: não informada"}
              </span>
            </p>
          </div>
        </div>
        <div className="shrink-0 mt-0.5">
          <Badge
            variant={espaco.ativo ? "primary" : "default"}
            className={espaco.ativo
              ? "whitespace-nowrap"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300 border-none whitespace-nowrap"
            }
          >
            {espaco.ativo ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="!pt-2 !pb-2 mt-auto border-t border-gray-200">
        <div className="h-[4.2rem]">
          <TruncatedText
            lines={3}
            emptyText="Nenhuma característica cadastrada para este espaço."
          >
            {espaco.caracteristicas}
          </TruncatedText>
        </div>
      </CardContent>
      {!readOnly && (
        <CardFooter className="!mt-0 [&>*]:border-gray-200 divide-gray-200 border-t border-gray-200">
          <CardFooterActions
            viewHref={`/espacos/${espaco.Id}`}
            editHref={`/espacos/editar/${espaco.Id}`}
            onDelete={onDeleteClick ? () => onDeleteClick(espaco) : undefined}
          />
        </CardFooter>
      )}
    </Card>
  );
}
