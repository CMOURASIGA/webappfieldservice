"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { FiltroReserva } from "@/services/reservas/tipo-reserva";
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from "@cnc-ti/layout-basic";
import { FunnelXIcon } from "@/components/layouts/ui/icons/funnelX";
import { getEspacos } from "@/services/espacos/espaco.service";
import { Espaco } from "@/services/espacos/tipo-espaco";
import { FormProvider, useForm } from "react-hook-form";
import { SelectField } from "@/layouts/ui/fields/select-field/select-field";
import { FormInput } from "@/components/layouts/ui/form-components";
import { ChevronDown, SearchIcon } from "lucide-react";
import { getEventos } from "@/services/dominios/dominios.service";

type Props = {
    filtros: FiltroReserva;
    loading?: boolean;
    enviarFiltros: (data: any) => void;
    espacoIsSelected?: boolean;
    hideEvento?: boolean;
};

export default function CamposBuscaReservas({
    filtros,
    loading,
    enviarFiltros,
    espacoIsSelected = false,
    hideEvento = false,
}: Props) {
    const [espacos, setEspacos] = useState<Espaco[]>([]);
    const [eventos, setEventos] = useState<any[]>([]);
    const [mostrarAvancados, setMostrarAvancados] = useState(false);

    const methods = useForm({
        defaultValues: {
            idEspaco: filtros.idEspaco ? String(filtros.idEspaco) : "",
            idEvento: filtros.idEvento ? String(filtros.idEvento) : "",
            motivo: filtros.motivo ?? "",
            solicitante: filtros.solicitante ?? "",
            dataInicio: filtros.dataInicio ? filtros.dataInicio.slice(0, 10) : "",
            dataFim: filtros.dataFim ? filtros.dataFim.slice(0, 10) : "",
        },
    });

    const { register, reset, handleSubmit } = methods;

    useEffect(() => {
        getEspacos().then(setEspacos);
        getEventos().then(setEventos);
    }, []);

    useEffect(() => {
        reset({
            idEspaco: filtros.idEspaco ? String(filtros.idEspaco) : "",
            idEvento: filtros.idEvento ? String(filtros.idEvento) : "",
            motivo: filtros.motivo ?? "",
            solicitante: filtros.solicitante ?? "",
            dataInicio: filtros.dataInicio ? filtros.dataInicio.slice(0, 10) : "",
            dataFim: filtros.dataFim ? filtros.dataFim.slice(0, 10) : "",
        });
    }, [filtros, reset]);

    function handleClear() {
        enviarFiltros({ disponiveis: filtros.disponiveis });
    }

    function handleFormSubmit(data: any) {
        enviarFiltros({ ...data, disponiveis: filtros.disponiveis });
    }

    const onSubmitWithPrevention = handleSubmit((data) => {
        handleFormSubmit(data);
    });

    return (
        <FormProvider {...methods}>
            <div className="w-full">
                <Collapsible
                    open={mostrarAvancados}
                    onOpenChange={setMostrarAvancados}
                    className="flex flex-col gap-4 w-full"
                >
                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex w-full items-end justify-between gap-4 flex-wrap">
                            <div className="flex flex-wrap items-end gap-4 flex-1">
                                {!espacoIsSelected && (
                                    <div className="min-w-[30%]">
                                        <SelectField
                                            label="Espaço"
                                            name="idEspaco"
                                            className="[&_button]:!bg-white [&_div[role=combobox]]:!bg-white"
                                            options={[
                                                { label: "Todos", value: "" },
                                                ...espacos.map((e) => ({
                                                    label: e.nome,
                                                    value: String(e.Id),
                                                })),
                                            ]}
                                        />
                                    </div>
                                )}

                                {!hideEvento && (
                                    <div className="min-w-[25%]">
                                        <SelectField
                                            label="Evento"
                                            name="idEvento"
                                            className="[&_button]:!bg-white [&_div[role=combobox]]:!bg-white"
                                            options={[
                                                { label: "Todos", value: "" },
                                                ...eventos,
                                            ]}
                                        />
                                    </div>
                                )}

                                <div className="min-w-[25%] flex-grow">
                                    <FormInput
                                        label="Motivo"
                                        placeholder="Buscar por motivo"
                                        {...register('motivo')}
                                        className="w-full"
                                    />
                                </div>  {/* <div className="min-w-[25%]">
                                    <FormInput
                                        label="Solicitante"
                                        placeholder="Nome do solicitante"
                                        {...register('solicitante')}
                                        // onChange={handleSolicitante}
                                        className="w-full"
                                    />
                                </div> */}
                            </div>

                            {/* BOTÕES À DIREITA */}
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
                                    type="button"
                                    onClick={onSubmitWithPrevention}
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
                    </div>

                    <CollapsibleContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full border-t pt-4">
                            <FormInput
                                label="De"
                                type="date"
                                {...register("dataInicio")}
                            />


                            <FormInput
                                label="Até"
                                type="date"
                                {...register("dataFim")}
                            />



                        </div >
                    </CollapsibleContent >
                </Collapsible >
            </div>
        </FormProvider >
    );
}
