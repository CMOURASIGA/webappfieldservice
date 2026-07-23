'use client';

import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { espacoSchema, EspacoFormData } from '@/app/(private)/espacos/schema';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@cnc-ti/layout-basic';
import { ButtonSave } from '@/components/layouts/ui/buttons/button-save/button-save';
import { FormInput, FormSwitch, FormTextarea } from '@/components/layouts/ui/form-components';
import { SelectField } from '@/layouts/ui/fields/select-field/select-field';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { MultiSelectCaracteristicas } from './caracteristicas-multselect';
import { updateReservaAction } from '@/app/(private)/reservas/action';
import { Reserva } from '@/services/reservas/tipo-reserva';
export type Caracteristica = {
    id?: number;
    nome: string;
}
interface EspacoFormProps {
    caracteristicas?: Caracteristica[]
    initialData?: any;

    onSubmit?: (data: EspacoFormData) => Promise<void | any>;
    readOnly?: boolean;
    options: {
        label: string;
        value: string;
    }[];
    espacoId?: number;
    eventosOptions?: { label: string; value: string }[];
    reservas?: Reserva[]
}

export function FormularioEspacos({ options, initialData, caracteristicas = [], onSubmit, readOnly = false, espacoId, eventosOptions, reservas }: EspacoFormProps) {

    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'main' | 'details' | 'reservas'>('main');
    const [selectedReservas, setSelectedReservas] = useState<any[]>([]);
    const effectiveEspacoId = espacoId || (initialData as any)?.id;
    const methods = useForm({
        resolver: zodResolver(espacoSchema),
        defaultValues: {
            ativo: true,
            caracteristicasArray: [],
            ...initialData,
        }
    });
    const { register, handleSubmit, control, setValue, watch, formState: { errors, isValid, isDirty } } = methods;
    const caracteristicasOptions = useMemo(() => {
        if (!caracteristicas) return [];

        return caracteristicas.map((m: Caracteristica) => ({
            label: m.nome.toString(),
            value: m.id?.toString() || ''
        }));
    }, [caracteristicas]);
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty && !isSubmitting) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty, isSubmitting]);
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');

            if (anchor && isDirty && !isSubmitting) {
                const href = anchor.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('javascript')) {
                    e.preventDefault();
                    e.stopPropagation();

                    Swal.fire({
                        title: 'Alterações não salvas',
                        text: "Você tem alterações pendentes. Deseja realmente sair?",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#1e3a8a',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Sim, sair',
                        cancelButtonText: 'Ficar aqui'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Se confirmou, navegamos manualmente
                            router.push(href);
                        }
                    });
                }
            }
        };

        document.addEventListener('click', handleClick, true);
        return () => document.removeEventListener('click', handleClick, true);
    }, [isDirty, isSubmitting, router]);
    const handleFormSubmit = async (data: EspacoFormData) => {

        setIsSubmitting(true);
        try {
            if (onSubmit) {
                await onSubmit(data)
                methods.reset(data);
                await Swal.fire({
                    text: "Espaço cadastrado com sucesso.",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                });
                router.push('/espacos'); // Retorno automático para listagem
            }
        } catch (err) {

            console.error(err);
            Swal.fire({
                text: "Erro ao cadastrar o espaço.",
                icon: "error",
                confirmButtonColor: "#1e3a8a"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTabChange = (value: 'main' | 'reservas') => {
        setActiveTab(value);
    };
    async function handleReservaSelect(reserva: any) {
        const isSelected = selectedReservas.some(r => r.id === reserva.id);
        if (isSelected) return;

        if (effectiveEspacoId) {
            try {
                await updateReservaAction(reserva.id, { idEspaco: effectiveEspacoId } as any);
                setSelectedReservas(prev => [...prev, reserva]);

                Swal.fire({
                    icon: 'success',
                    title: 'Espaço Vinculado!',
                    text: `A reserva #${reserva.id} agora pertence a este espaço.`,
                    timer: 2000,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Erro ao vincular no banco' });
            }
        } else {
            // Se for um cadastro novo, apenas mantém no estado local (opcional)
            setSelectedReservas(prev => [...prev, reserva]);
        }
    }
    async function handleDesvincularReserva(reserva: any) {
        if (effectiveEspacoId) {
            try {
                // Remove o idEspaco da reserva
                await updateReservaAction(reserva.id, { idEspaco: null } as any);
                setSelectedReservas(prev => prev.filter(r => r.id !== reserva.id));

                Swal.fire({
                    icon: 'success',
                    title: 'Reserva Removida!',
                    text: 'O espaço foi desvinculado desta reserva.',
                    timer: 2000,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Erro ao desvincular' });
            }
        } else {
            setSelectedReservas(prev => prev.filter(r => r.id !== reserva.id));
        }
    }
    return (
        <FormProvider {...methods}>
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                {/* Header com Aba */}
                {/* <div className="flex border-b bg-gray-50/50 px-6 pt-6 gap-4">
                    <Tabs value={activeTab} onValueChange={handleTabChange as any}>
                        <TabsList>
                            <TabsTrigger disabled={activeTab === "main"} value="main">Informações Gerais</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div> */}

                <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 md:p-8" noValidate>
                    <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-6", activeTab !== 'main' && "hidden")}>
                        <FormInput
                            disabled={readOnly}
                            label="Nome do Espaço"
                            placeholder="Ex: Auditório 4º andar"
                            className="md:col-span-8"
                            required
                            error={errors.nome?.message?.toString()}
                            {...register('nome')}
                        />
                        <FormSwitch
                            disabled={readOnly}
                            label="Espaço Ativo"
                            className="md:col-span-3"
                            {...register('ativo')}
                        />
                        {/* <FormInput
                            disabled={readOnly}
                            label="Código"
                            placeholder="Ex: AUD-04"
                            className="md:col-span-4"
                            error={errors.codigo?.message?.toString()}
                            {...register('codigo')}
                        /> */}

                        <div className="md:col-span-6">
                            <SelectField
                                disabled={readOnly}
                                options={options}
                                label="Local"
                                required
                                error={errors.idLocal?.message?.toString()}
                                {...register('idLocal')}
                            />
                        </div>

                        <FormInput
                            disabled={readOnly}
                            label="Capacidade (Pessoas)"
                            type="number"
                            className="md:col-span-3"
                            {...register('capacidade')}
                        />

                        {/* Status Ativo */}

                        <div className="md:col-span-12">
                            <MultiSelectCaracteristicas
                                control={control}
                                register={register}
                                errors={errors}
                                options={caracteristicasOptions}
                                readOnly={readOnly}
                            />
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t flex justify-between items-center">
                        <div>
                            {Object.keys(errors).length > 0 && (
                                <span className="text-red-600 text-sm font-medium italic">
                                    Preencha todos os campos obrigatórios corretamente.
                                </span>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {!readOnly && (
                                <ButtonSave
                                    type="submit"
                                    loading={isSubmitting}
                                    disabled={
                                        !isValid ||
                                        isSubmitting}
                                />
                            )}
                        </div>
                    </div>
                </form>
            </div >
        </FormProvider >
    );
}