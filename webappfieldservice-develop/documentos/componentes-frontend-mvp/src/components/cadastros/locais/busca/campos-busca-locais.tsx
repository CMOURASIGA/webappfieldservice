"use client";

import { useEffect } from "react";
import {
  Button,
} from "@cnc-ti/layout-basic";
import { FunnelXIcon } from "@/components/layouts/ui/icons/funnelX";
import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "@/components/layouts/ui/form-components";
import { SearchIcon } from "lucide-react";

export interface FiltrosLocaisProps {
  q?: string;
}

type Props = {
  filtros: FiltrosLocaisProps;
  loading?: boolean;
  enviarFiltros: (data: FiltrosLocaisProps) => void;
};

export default function CamposBuscaLocais({
  filtros,
  loading,
  enviarFiltros,
}: Props) {
  const methods = useForm({
    defaultValues: {
      q: filtros?.q || "",
    },
    shouldFocusError: false,
  });

  const { register, reset, handleSubmit } = methods;

  useEffect(() => {
    reset({
      q: filtros?.q || "",
    });
  }, [filtros, reset]);

  function handleClear() {
    const emptyFilters = { q: "" };
    reset(emptyFilters);
    enviarFiltros(emptyFilters);
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(enviarFiltros)} className="w-full">
        <div className="flex w-full items-end justify-between gap-4 flex-wrap">
          {/* CAMPOS VISÍVEIS */}
          <div className="flex flex-wrap items-end gap-4 flex-1">
            <div className="min-w-[50%]">
              <FormInput
                label="Nome / Código / Endereço"
                placeholder="Pesquise por nome, código ou endereço"
                {...register("q")}
              />
            </div>
          </div>

          {/* BOTÕES */}
          <div className="flex items-end gap-3 shrink-0">
            <Button
              isLoading={loading}
              className="h-10 gap-2 text-xs font-medium"
            >
              <SearchIcon size={16} />
              Pesquisar
            </Button>

            <Button
              type="button"
              onClick={handleClear}
              disabled={loading}
              aria-label="Limpar filtros"
              variant="outline"
              className="h-10 gap-2 text-xs font-medium"
            >
              <FunnelXIcon className="size-5" />
              <span>Limpar</span>
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
