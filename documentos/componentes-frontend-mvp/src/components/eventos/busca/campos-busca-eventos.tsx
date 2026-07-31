"use client";

import { useEffect, useState } from "react";
import { FiltrosEventosProps } from "@/services/eventos/evento.service";
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@cnc-ti/layout-basic";
import { FunnelXIcon } from "@/components/layouts/ui/icons/funnelX";
import { getDemandantes, getLocais, getTematicas, getNiveisAssessoria } from "@/services/dominios/dominios.service";
import { OptionItem } from "@/services/dominios/dominios.service";
import { FormProvider, useForm } from "react-hook-form";
import { SelectField } from "@/layouts/ui/fields/select-field/select-field";
import { FormInput } from "@/components/layouts/ui/form-components";
import { ChevronDown, SearchIcon } from "lucide-react";

type Props = {
  filtros: FiltrosEventosProps;
  loading?: boolean;
  enviarFiltros: (data: FiltrosEventosProps) => void;
  onLimpar?: () => void;
};

export default function CamposBuscaEventos({
  filtros,
  loading,
  enviarFiltros,
  onLimpar,
}: Props) {

  const [tematicasOptions, setTematicasOptions] = useState<OptionItem[]>([]);
  const [locaisOptions, setLocaisOptions] = useState<OptionItem[]>([]);
  const [demandantesOptions, setDemandantesOptions] = useState<OptionItem[]>([]);
  const [niveisAssessoriaOptions, setNiveisAssessoriaOptions] = useState<OptionItem[]>([]);
  const [mostrarAvancados, setMostrarAvancados] = useState(false);

  const methods = useForm({
    defaultValues: {
      q: filtros?.q || "",
      status: filtros?.status || "",
      nivelAssessoria: filtros?.nivelAssessoria || "",
      idTematica: filtros?.idTematica || "",
      dataInicio: filtros?.dataInicio || "",
      dataFim: filtros?.dataFim || "",
      idLocal: filtros?.idLocal || "",
      idTicket: filtros?.idTicket || "",
      idDemandante: filtros?.idDemandante || "",
      estrategico: filtros?.estrategico || "",
    },
    shouldFocusError: false,
  });

  const { register, reset, handleSubmit } = methods;

  useEffect(() => {

    getTematicas().then((data) => {
      setTematicasOptions(data);
    });
    getLocais().then((data) => {
      setLocaisOptions(data);
    });
    getDemandantes().then((data) => {
      setDemandantesOptions(data);
    });
    getNiveisAssessoria().then((data) => {
      setNiveisAssessoriaOptions(data);
    });
  }, []);

  useEffect(() => {
    reset({
      q: filtros?.q || "",
      status: filtros?.status || "",
      nivelAssessoria: filtros?.nivelAssessoria || "",
      idTematica: filtros?.idTematica || "",
      dataInicio: filtros?.dataInicio || "",
      dataFim: filtros?.dataFim || "",
      idLocal: filtros?.idLocal || "",
      idTicket: filtros?.idTicket || "",
      idDemandante: filtros?.idDemandante || "",
      estrategico: filtros?.estrategico || "",
    });
  }, [filtros, reset]);

  function handleClear() {
    reset({
      q: "",
      status: "",
      nivelAssessoria: "",
      idTematica: "",
      dataInicio: "",
      dataFim: "",
      idLocal: "",
      idTicket: "",
      idDemandante: "",
      estrategico: "",
    });
    if (onLimpar) {
      onLimpar();
    } else {
      enviarFiltros({
        q: "",
        status: "",
        nivelAssessoria: "",
        idTematica: "",
        dataInicio: "",
        dataFim: "",
        idLocal: "",
        idTicket: "",
        idDemandante: "",
        estrategico: "",
      });
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(enviarFiltros)} className="w-full">
        <Collapsible
          open={mostrarAvancados}
          onOpenChange={setMostrarAvancados}
          className="flex flex-col gap-4 w-full"
        >
          {/* LINHA PRINCIPAL */}
          <div className="flex w-full items-end justify-between gap-4 flex-wrap">
            {/* CAMPOS VISÍVEIS */}
            <div className="flex flex-wrap items-end gap-4 flex-1">
              <div className="flex-1 min-w-[200px]">
                <FormInput
                  label="Título / Palavra-chave"
                  placeholder="Título, local, solicitante ou palavra-chave"
                  {...register("q")}
                />
              </div>

              <div className="min-w-[25%]">
                <SelectField
                  label="Demandante"
                  name="idDemandante"
                  className="[&_button]:!bg-white [&_div[role=combobox]]:!bg-white"
                  options={[
                    { label: "Todos os Demandantes", value: "" },
                    ...demandantesOptions.map((opt) => ({
                      label: opt.label,
                      value: opt.value,
                    })),
                  ]}
                />
              </div>

              <div className="min-w-[13%]">
                <FormInput
                  label="De:"
                  type="date"
                  {...register("dataInicio")}
                />
              </div>

              <div className="min-w-[13%]">
                <FormInput
                  label="Até:"
                  type="date"
                  {...register("dataFim")}
                />
              </div>
            </div>

            {/* BOTÕES */}
            <div className="flex items-end gap-3 shrink-0">
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex h-10 items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={
                    mostrarAvancados
                      ? "Ocultar filtros avançados"
                      : "Mostrar filtros avançados"
                  }
                >
                  <i className="fa-solid fa-sliders text-sm" />
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${mostrarAvancados ? "rotate-180" : ""
                      }`}
                  />
                </button>
              </CollapsibleTrigger>

              <Button
                isLoading={loading}
                className="h-10 gap-2 text-xs font-medium"
              >
                <SearchIcon />
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

          {/* CAMPOS AVANÇADOS */}
          <CollapsibleContent>
            <div className="flex flex-wrap gap-4 w-full border-t pt-4">

              <div className="min-w-[20%]">
                <SelectField
                  label="Status"
                  name="status"
                  className="[&_button]:!bg-white [&_div[role=combobox]]:!bg-white"
                  options={[
                    { label: "Todos os Status", value: "" },
                    { label: "Em elaboração", value: "Em elaboração" },
                    { label: "Aguardando validação", value: "Aguardando validação" },
                    { label: "Aguardando aprovação", value: "Aguardando aprovação" },
                    { label: "Aguardando confirmação", value: "Aguardando confirmação" },
                    { label: "Confirmado", value: "Confirmado" },
                    { label: "Concluído", value: "Concluído" },
                    { label: "Cancelado", value: "Cancelado" },
                    { label: "Rejeitado", value: "Rejeitado" },
                  ]}
                />
              </div>

              <div className="min-w-[20%]">
                <SelectField
                  label="Complexidade"
                  name="nivelAssessoria"
                  className="[&_button]:!bg-white [&_div[role=combobox]]:!bg-white"
                  options={[
                    { label: "Todos os Níveis", value: "" },
                    ...niveisAssessoriaOptions
                  ]}
                />
              </div>

              <div className="min-w-[20%]">
                <SelectField
                  label="Local"
                  name="idLocal"
                  className="[&_button]:!bg-white [&_div[role=combobox]]:!bg-white"
                  options={[
                    { label: "Todos os Locais", value: "" },
                    ...locaisOptions.map((opt) => ({
                      label: opt.label,
                      value: opt.value,
                    })),
                  ]}
                />
              </div>

              <div className="min-w-[20%]">
                <SelectField
                  label="Temática"
                  name="idTematica"
                  className="[&_button]:!bg-white [&_div[role=combobox]]:!bg-white"
                  options={[
                    { label: "Todas as Temáticas", value: "" },
                    ...tematicasOptions.map((opt) => ({
                      label: opt.label,
                      value: opt.value,
                    })),
                  ]}
                />
              </div>

              <div className="min-w-[20%]">
                <FormInput
                  label="Ticket Agidesk"
                  placeholder="Ex: ATD-27939"
                  {...register("idTicket")}
                />
              </div>

              <div className="min-w-[20%]">
                <SelectField
                  label="Estratégico"
                  name="estrategico"
                  className="[&_button]:!bg-white [&_div[role=combobox]]:!bg-white"
                  options={[
                    { label: "Todos", value: "" },
                    { label: "Sim", value: "true" },
                    { label: "Não", value: "false" },
                  ]}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </form>
    </FormProvider>
  );
}
