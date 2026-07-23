"use client";

import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FunnelXIcon } from "@/components/layouts/ui/icons/funnelX";
import { FormInput } from "@/components/layouts/ui/form-components";
import { getLocais, OptionItem } from "@/services/dominios/dominios.service"; // Assumindo que este serviço existe
import { Espaco } from "@/services/espacos/tipo-espaco";
import { FiltrosDisponibilidade } from "@/hooks/espacos/use-busca-disponibilidade";
import { SearchIcon } from "lucide-react";
import { getEspacos } from "@/services/espacos/espaco.service";
import {
    Button,
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@cnc-ti/layout-basic";
import { SelecaoLocalEspaco } from "@/components/espacos/selecao-local-espaco";
// Interface baseada nos requisitos de disponibilidade
import { ChevronDown } from "lucide-react";

export interface FiltrosNovaReserva extends FiltrosDisponibilidade {
    horaInicial?: string;
    horaFinal?: string;
}

type Props = {
    filtros: FiltrosNovaReserva;
    loading?: boolean;
    enviarFiltros: (data: FiltrosNovaReserva) => void;
};

export function CamposFiltroNovaReserva({ filtros, loading, enviarFiltros }: Props) {
    const [mostrarAvancados, setMostrarAvancados] = useState(false);
    const [locais, setLocais] = useState<OptionItem[]>([]);
    const [espacos, setEspacos] = useState<Espaco[]>([])
    const methods = useForm({
        defaultValues: {
            idLocal: filtros.idLocal ? String(filtros.idLocal) : "",
            Id: filtros.Id ? String(filtros.Id) : "",
            nome: filtros.nome || "",
            dataInicial: filtros.dataInicial || "",
            dataFinal: filtros.dataFinal || "",
            horaInicial: filtros.horaInicial || "",
            horaFinal: filtros.horaFinal || "",
            capacidade: filtros.capacidade ? Number(filtros.capacidade) : 0
        }
    });
    const { register, reset, handleSubmit, watch, control, setValue } = methods;




    useEffect(() => {
        getLocais().then((data) => setLocais(data));
        getEspacos().then((data) => setEspacos(data));
    }, []);

    useEffect(() => {
        reset({
            idLocal: filtros.idLocal ? String(filtros.idLocal) : "",
            Id: filtros.Id ? String(filtros.Id) : "",
            nome: filtros.nome || "",
            dataInicial: filtros.dataInicial || "",
            dataFinal: filtros.dataFinal || "",
            horaInicial: filtros.horaInicial || "",
            horaFinal: filtros.horaFinal || "",
            capacidade: filtros.capacidade ? Number(filtros.capacidade) : 0
        });
    }, [filtros, reset]);


    function handleSubmitWithValidation(data: any) {
        if (data.dataInicial && data.dataFinal) {
            const start = new Date(data.dataInicial);
            const end = new Date(data.dataFinal);
            if (start > end) {
                alert("A data inicial não pode ser maior que a data final.");
                return;
            }
        }
        if (!data.idLocal) {
            alert("O Local é obrigatório para a pesquisa de horários.");
            return;
        }
        enviarFiltros(data);
    }

    function handleClear() {
        enviarFiltros({});
    }


    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleSubmitWithValidation)} className="w-full">
                <Collapsible
                    open={mostrarAvancados}
                    onOpenChange={setMostrarAvancados}
                    className="flex flex-col gap-4 w-full bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                >
                    {/* Linha Principal de Filtros */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">

                        {/* Local e Espaço Integrados usando Componente */}
                        <SelecaoLocalEspaco
                            control={control}
                            setValue={setValue}
                            errors={{}} // Filtros geralmente não exibem erros de validação
                            locais={locais}
                            espacos={espacos}
                            name="Id"
                            required={false}
                            containerClassItem="lg:col-span-4"
                        />

                        {/* Ações/Botões */}
                        <div className="flex items-center gap-2 lg:col-span-4 justify-end">
                            <CollapsibleTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 border border-gray-200"
                                    title={mostrarAvancados ? "Menos filtros" : "Mais filtros"}
                                >
                                    <ChevronDown
                                        className={`h-4 w-4 transition-transform duration-200 ${mostrarAvancados ? "rotate-180" : ""
                                            }`}
                                    />
                                </Button>
                            </CollapsibleTrigger>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClear}
                                disabled={loading}
                                className="gap-2 text-xs"
                            >
                                <FunnelXIcon className="size-4" />
                                <span className="hidden sm:inline">Limpar</span>
                            </Button>

                            <Button
                                type="submit"
                                isLoading={loading}
                                className="gap-2 text-xs bg-[#004A8D] hover:bg-[#003566]"
                            >
                                <SearchIcon className="size-4" />
                                Pesquisar
                            </Button>
                        </div>
                    </div>

                    {/* Filtros Avançados (Segunda Linha) */}
                    <CollapsibleContent className="pt-4 border-t border-gray-100 transition-all">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                            <div className="lg:col-span-2">
                                <FormInput
                                    label="Data Inicial"
                                    type="date"
                                    {...register('dataInicial')}
                                    className="w-full bg-gray-50"
                                />
                            </div>

                            <div className="lg:col-span-2">
                                <FormInput
                                    label="Data Final"
                                    type="date"
                                    {...register('dataFinal')}
                                    className="w-full bg-gray-50"
                                />
                            </div>

                            <div className="lg:col-span-2">
                                <FormInput
                                    label="Hora Inicial"
                                    type="time"
                                    {...register('horaInicial')}
                                    className="w-full bg-gray-50"
                                />
                            </div>

                            <div className="lg:col-span-2">
                                <FormInput
                                    label="Hora Final"
                                    type="time"
                                    {...register('horaFinal')}
                                    className="w-full bg-gray-50"
                                />
                            </div>

                            <div className="lg:col-span-4">
                                <FormInput
                                    label="Mínimo de Pessoas"
                                    type="number"
                                    placeholder="Ex: 10"
                                    {...register('capacidade')}
                                    className="w-full bg-gray-50"
                                />
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </form>
        </FormProvider>
    );
}