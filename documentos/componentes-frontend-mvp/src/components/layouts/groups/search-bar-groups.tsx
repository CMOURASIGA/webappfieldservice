"use client";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { TextField } from "../ui/fields/text-field/text-field";
import { ButtonSearch } from "../ui/buttons/button-search/button-search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cnc-ti/layout-basic";
import { useQueryString } from "@/hooks/useQueryParams";
import { useEffect, useState } from "react";

interface FormSearchBarSubGroups {
  grupoId: string;
  descricaoMTE: string;
  descricaoCNC: string;
  tipoClausula: string;
}

interface SearchBarGroupsProps {
  onSubmit: (data: FormSearchBarSubGroups) => void;
}

type TypeClausesOptionsDto = {
  value: string;
  label: string;
};

export function SearchBarGroups({ onSubmit }: SearchBarGroupsProps) {
  const typeClausesOptions: TypeClausesOptionsDto[] = [
    { value: "0", label: "Todos" },
    { value: "S", label: "Social" },
    { value: "E", label: "Econômica" },
  ];
  const [params, setParams] = useState<FormSearchBarSubGroups>();

  const { getAllQueryStrings } = useQueryString();

  useEffect(() => {
    const queryParams = getAllQueryStrings();
    setParams(queryParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const methods = useForm<FormSearchBarSubGroups>({
    defaultValues: params,
  });

  useEffect(() => {
    if (params) {
      methods.reset(params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function handleSubmit(data: any) {
    onSubmit(data);
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleSubmit)}
        className="flex lg:flex-row flex-col gap-4 lg:gap-8 md:items-end"
        role="search"
        aria-label="Buscar grupos"
      >
        <div className="flex-1">
          <label className="text-sm block mb-1 font-medium text-gray-600">
            Descrição MTE
          </label>
          <TextField
            name="descricaoMTE"
            placeholder="Digite parte da descrição CNC (ex: adicional, salário, auxílio...)"
            aria-label="Buscar por parte da descrição CNC"
            id="field-description-mte"
            className="h-10"
          />
        </div>

        <div className="flex-1">
          <label className="text-sm block mb-1 font-medium text-gray-600">
            Descrição CNC
          </label>
          <TextField
            name="descricaoCNC"
            placeholder="Digite parte da descrição CNC (ex: adicional, salário, auxílio...)"
            aria-label="Buscar por parte da descrição CNC"
            id="field-description-cnc"
            className="h-10"
          />
        </div>

        <Controller
          name="tipoClausula"
          render={({ field }) => (
            <div className="flex-1">
              <label className="text-sm block mb-1 font-medium text-gray-600">
                Tipo da Cláusula
              </label>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo da cláusula" />
                </SelectTrigger>
                <SelectContent className="max-w-[442px] md:w-80">
                  {typeClausesOptions?.map((entity: TypeClausesOptionsDto) => (
                    <SelectItem key={entity.value} value={entity.value!}>
                      {entity.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <ButtonSearch aria-label="Buscar grupos" />
      </form>
    </FormProvider>
  );
}
