"use client";

import { useEffect, useState } from "react";
import { FiltrosEspacosProps } from "@/services/espacos/espaco.service";
import { Button } from "@cnc-ti/layout-basic";
import { FunnelXIcon } from "@/components/layouts/ui/icons/funnelX";
import { FormProvider, useForm } from "react-hook-form";
import { SelectField } from "@/layouts/ui/fields/select-field/select-field";
import { SearchIcon } from "lucide-react";
import { getLocais } from "@/services/dominios/dominios.service";
import { getEspacos } from "@/services/espacos/espaco.service";
import { SelecaoLocalEspaco } from "../selecao-local-espaco";

import { Espaco } from "@/services/espacos/tipo-espaco";

type Props = {
    filtros: FiltrosEspacosProps;
    loading?: boolean;
    enviarFiltros: (data: FiltrosEspacosProps) => void;
    limparFiltros: () => void;
};

export default function CamposBuscaEspacos({ filtros, loading, enviarFiltros, limparFiltros }: Props) {
    const [locais, setLocais] = useState<{ label: string; value: string }[]>([]);
    const [espacos, setEspacos] = useState<Espaco[]>([]);
    const [chaveDeRenderizacao, setChaveDeRenderizacao] = useState(0);

    useEffect(() => {
        getLocais().then(setLocais);
        getEspacos().then(setEspacos);
    }, []);

    const methods = useForm({
        defaultValues: {
            nome: filtros.nome || "",
            ativo: filtros.ativo || "",
            idLocal: filtros.idLocal ? String(filtros.idLocal) : "",
            idEspaco: filtros.idEspaco ? String(filtros.idEspaco) : "",
        },
        shouldFocusError: false
    });

    const { reset, handleSubmit } = methods;

    useEffect(() => {
        reset({
            nome: filtros.nome || "",
            ativo: filtros.ativo || "",
            idLocal: filtros.idLocal ? String(filtros.idLocal) : "",
            idEspaco: filtros.idEspaco ? String(filtros.idEspaco) : "",
        }, { keepDefaultValues: true });
    }, [filtros, reset]);

    function executarLimpeza() {
        reset({ nome: "", ativo: "", idLocal: "", idEspaco: "" });
        limparFiltros();
        setChaveDeRenderizacao(prev => prev + 1);
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(enviarFiltros)} key={chaveDeRenderizacao} className="w-full">
                <div className="flex w-full items-end justify-between gap-4 flex-wrap">
                    <div className="flex flex-wrap items-end gap-4 flex-1">
                        <SelecaoLocalEspaco
                            control={methods.control}
                            setValue={methods.setValue}
                            errors={methods.formState.errors}
                            locais={locais}
                            espacos={espacos}
                            required={false}
                            containerClassItem="min-w-[30%] flex-1"
                        />

                        <div className="min-w-[20%]">
                            <SelectField
                                label="Status"
                                name="ativo"
                                className="[&_button]:!bg-white [&_div[role=combobox]]:!bg-white"
                                options={[
                                    { label: "Todos", value: "" },
                                    { label: "Ativo", value: "true" },
                                    { label: "Inativo", value: "false" }
                                ]}
                            />
                        </div>
                    </div>

                    <div className="flex items-end gap-3 shrink-0">
                        <Button
                            type="submit"
                            isLoading={loading}
                            className="h-10 gap-2 text-xs font-medium"
                        >
                            <SearchIcon className="size-4" />
                            Pesquisar
                        </Button>
                        <Button
                            type="button"
                            onClick={executarLimpeza}
                            disabled={loading}
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