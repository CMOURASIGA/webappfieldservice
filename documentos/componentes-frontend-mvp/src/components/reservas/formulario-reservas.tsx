"use client";

import { useEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reservaSchema, ReservaFormData } from '@/app/(private)/reservas/schema';
import { Tabs, TabsList, TabsTrigger } from '@cnc-ti/layout-basic';
import { ButtonSave } from '@/components/layouts/ui/buttons/button-save/button-save';
import { FormInput, FormTextarea } from '@/components/layouts/ui/form-components';
import { SelectField } from '@/layouts/ui/fields/select-field/select-field';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { AgendaSemanal } from './agenda/agenda-reserva';
import { areIntervalsOverlapping, format, parseISO } from 'date-fns';
import { api } from '@/services/api';
import { SelecaoLocalEspaco } from '../espacos/selecao-local-espaco';

interface ReservaFormProps {
    initialData?: Partial<ReservaFormData>;
    espacos: any[];
    locais?: { label: string; value: string }[];
    eventos: { label: string; value: string }[];

    readOnly?: boolean;
    onSubmit?: (data: ReservaFormData) => Promise<void | any>;
    redirectOnSuccess?: boolean;
    espacoIsSelected?: boolean;
}

const formatarParaInput = (data: string | Date | undefined) => {
    if (!data) return "";
    const d = new Date(data);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 16);
};

export function FormularioReservas({ eventos, espacos, locais, initialData, onSubmit, readOnly = false, redirectOnSuccess = true, espacoIsSelected = false }: ReservaFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const methods = useForm({
        resolver: zodResolver(reservaSchema),
        mode: 'onChange',
        defaultValues: {
            dataInicio: '',
            dataFim: '',
            ...initialData,
        }
    });

    const { register, handleSubmit, control, setError, clearErrors, setValue, formState: { errors, isValid } } = methods;
    const selectedEspaco = useWatch({ control, name: 'idEspaco' });
    const selectedDateInicio = useWatch({ control, name: 'dataInicio' });
    const selectedDateFim = useWatch({ control, name: 'dataFim' });
    const [temConflito, setConflito] = useState(false)

    const [agenda, setAgenda] = useState<Record<string, any[]>>({});
    const obterLimiteFim = () => {
        if (!selectedDateInicio) return null;
        const dataKey = selectedDateInicio.split('T')[0];
        const ocupacoesDoDia = agenda[dataKey] || [];

        const inicioReserva = parseISO(selectedDateInicio);

        // Acha a primeira reserva que começa depois do meu início
        const proxima = ocupacoesDoDia
            .map(res => ({ ...res, dataInicio: parseISO(res.dataInicio) }))
            .filter(res => res.dataInicio > inicioReserva)
            .sort((a, b) => a.dataInicio.getTime() - b.dataInicio.getTime())[0];

        return proxima ? proxima.dataInicio : null;
    };

    const limiteDataFim = obterLimiteFim();
    function handlerDateConflito(data: string) {
        if (!selectedEspaco) return;
        api.get(`/reservas/ocupacao-semanal/${selectedEspaco}?data=${data}`)
            .then(response => {
                setAgenda(response.data)
            });
    }
    useEffect(() => {
        if (selectedDateInicio !== "" && selectedEspaco) {
            handlerDateConflito(selectedDateInicio);
        }
        register('idEvento');
    }, [selectedEspaco, selectedDateInicio, register]);

    const reservaId = initialData?.id;
    useEffect(() => {
        clearErrors(['dataFim']);
        if (!selectedDateInicio || !selectedDateFim || !selectedEspaco) return;

        const inicio = new Date(selectedDateInicio);
        const fim = new Date(selectedDateFim);
        if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) return;

        if (fim <= inicio) {
            setError('dataFim', { type: 'manual', message: 'Término deve ser após o início.' });
            return;
        }

        const diaChave = selectedDateInicio.split('T')[0];
        const reservasDoDia = agenda[diaChave] || [];

        const conflitoEncontrado = reservasDoDia.some(res => {
            if (reservaId && res.id === reservaId) return false;

            return areIntervalsOverlapping(
                { start: inicio, end: fim },
                { start: new Date(res.dataInicio), end: new Date(res.dataFim) },
                { inclusive: false }
            );
        });

        if (conflitoEncontrado) {
            setError('dataFim', {
                type: 'manual',
                message: 'Horário indisponível neste espaço.'
            });
        }
    }, [selectedDateInicio, selectedDateFim, selectedEspaco, agenda, reservaId, setError, clearErrors]);

    const handleFormSubmit = async (data: ReservaFormData) => {
        setIsSubmitting(true);
        try {
            if (onSubmit) {
                await onSubmit(data);
            }
            await Swal.fire({
                text: "Reserva criada com sucesso.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });
            if (redirectOnSuccess) {
                router.push('/espacos/reservas/buscar');
                router.refresh();
            }
        } catch (err: any) {
            Swal.fire({
                title: "Não foi possível reservar",
                text: err.message,
                icon: "error",
                confirmButtonColor: "#1e3a8a",
                confirmButtonText: "Entendido"
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    const verificarConflito = (conflito: boolean) => {
        setConflito(conflito);
    }
    return (
        <FormProvider {...methods}>
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex border-b bg-gray-50/50 px-6 pt-6 gap-4">
                    {/* <Tabs value="main">
                        <TabsList>
                            <TabsTrigger value="main">Informações Gerais</TabsTrigger>
                        </TabsList>
                    </Tabs> */}
                </div>

                <form onSubmit={(e) => {
                    e.stopPropagation();
                    handleSubmit(handleFormSubmit)(e);
                }} className="p-6 md:p-8" noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                        <SelecaoLocalEspaco
                            control={control}
                            setValue={setValue}
                            errors={errors}
                            locais={locais || []}
                            espacos={espacos}
                            readOnly={readOnly}
                            required={true}
                        />

                        {/* <div className="md:col-span-6">
                            <FormInput
                                label="Solicitante"
                                className="md:col-span-6"
                                readOnly={true}
                                {...register('dataInicio')}
                            /> 
                        </div> */}

                        <div className="md:col-span-6">
                            <FormInput
                                disabled={readOnly || !selectedEspaco}
                                label="Data/Hora Início"
                                type="datetime-local"
                                required
                                error={errors.dataInicio?.message}
                                {...register('dataInicio')}
                            />
                        </div>

                        {/* Data e Hora Fim */}
                        <div className="md:col-span-6">

                            <FormInput
                                disabled={readOnly || !selectedDateInicio}
                                label="Data/Hora Fim"
                                type="datetime-local"
                                required
                                error={errors.dataFim?.message}
                                {...register('dataFim')}
                            />
                            {limiteDataFim && (
                                <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="text-[11px] text-blue-700">
                                        Horário limite disponível: <b>{format(limiteDataFim, "HH:mm 'do dia' dd/MM")}</b>
                                    </span>
                                </div>
                            )}
                        </div>
                        <FormTextarea
                            disabled={readOnly}
                            label="Motivo / Descrição da Reserva"
                            placeholder="Descreva a finalidade desta reserva..."
                            rows={3}
                            className="md:col-span-12 [&_button]:!bg-white [&_div[role=combobox]]:!bg-white"
                            required
                            error={errors.motivo?.message}
                            {...register('motivo')}
                        />
                    </div >
                    {!!selectedEspaco && !!selectedDateInicio && (
                        <div className="md:col-span-12">
                            <AgendaSemanal
                                reserva={initialData}
                                agenda={agenda}
                                dataReferencia={selectedDateInicio}
                                dataInicioAtual={selectedDateInicio}
                                dataFimAtual={selectedDateFim}
                                verificarConflito={verificarConflito}
                            />
                        </div>
                    )
                    }

                    <div className="mt-8 pt-6 border-t flex justify-between items-center">
                        <div className="flex flex-col">
                            {Object.keys(errors).length > 0 && (
                                <span className="text-red-500 text-xs font-medium">
                                    Verifique os campos obrigatórios e possíveis conflitos de datas.
                                </span>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {!readOnly && (
                                <ButtonSave
                                    type="submit"
                                    loading={isSubmitting}
                                    disabled={!isValid || isSubmitting || temConflito}
                                />
                            )}
                        </div>
                    </div>
                </form >
            </div>
        </FormProvider >
    );
}
