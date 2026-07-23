// src/components/events/event-form.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { FormProvider, useForm, useWatch, Controller } from 'react-hook-form';
import { calcularComplexidade } from '@/services/eventos/evento.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { formularioEventosData, FormularioEventosData } from '@/app/(private)/eventos/schema'; // Verifique se o caminho está correto
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@cnc-ti/layout-basic';
import { useRouter } from 'next/navigation';
import { ButtonSave } from '@/components/layouts/ui/buttons/button-save/button-save';
import { FormInput, FormSelect, FormTextarea, FormCheckbox } from '@/components/layouts/ui/form-components';
import { SelectField } from '@/layouts/ui/fields/select-field/select-field';
import Swal from 'sweetalert2';
import { MultiSelectDemandante } from './demandante-multselect';
import { MultiSelectTematica } from './tematica-multselect';
import { MultiSelectPeriodo } from './periodo-multselect';
import { AbaReservas } from './aba-reservas';
import { SelecaoLocalEspaco } from '@/components/espacos/selecao-local-espaco';
import { updateReservaAction } from '@/app/(private)/reservas/action';
import { getAllEspacosComplete } from '@/services/espacos.service';
import { AbaSolicitacao } from './aba-solicitacao';
import { deleteAnexo } from '@/services/eventos/evento.service';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
interface EventFormProps {
    initialData?: Partial<FormularioEventosData> & { Reserva?: any[], tematicas?: any[] };
    onSubmit?: (data: FormularioEventosData | FormData) => Promise<void | any>;
    submitLabel?: string;
    readOnly?: boolean;
    options?: any;
    eventId?: number;
    urlArquivo?: string;
}

export function FormularioEventos({ options, initialData, onSubmit, submitLabel = "Salvar Evento", readOnly = false, eventId }: EventFormProps) {
    const effectiveEventId = eventId || (initialData as any)?.id;
    const solicitacao = (initialData as any)?.Solicitacao;
    const ticketId = solicitacao?.idTicket;
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'main' | 'details' | 'reservas' | 'solicitacao' | 'complexidade'>('main');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [espacosCompletos, setEspacosCompletos] = useState<any[]>([]);
    const [fileToView, setFileToView] = useState<{ url: string, name: string, type: 'image' | 'pdf' | 'text' | 'other', textContent?: string } | null>(null);
    const [isLoadingFile, setIsLoadingFile] = useState(false);
    const methods = useForm({
        resolver: zodResolver(formularioEventosData),
        mode: "all",
        defaultValues: {
            ...initialData,
            idsReservas: initialData?.Reserva?.map((r: any) => r.id) || [],
            isExternal: !!initialData?.isExternal || !!initialData?.localExterno,
            previstoNoOrcamento: !!initialData?.previstoNoOrcamento,
            integrado: !!initialData?.integrado,
            isCeremonial: !!initialData?.isCeremonial || !!(initialData as any)?.solenidade,
            producaoEstande: !!initialData?.producaoEstande,
            estrategico: !!initialData?.estrategico,
            restrito: !!initialData?.restrito,
            idComplexidade: (initialData as any)?.idComplexidade ? String((initialData as any).idComplexidade) : "",
            idSegmento: (initialData as any)?.idSegmento ? String((initialData as any).idSegmento) : "",
            idClassificacao: (initialData as any)?.idClassificacao ? String((initialData as any).idClassificacao) : "",
            idSegmentoPublico: (initialData as any)?.idSegmentoPublico ? String((initialData as any).idSegmentoPublico) : "",
            idPublicoAlvo: (initialData as any)?.idPublicoAlvo ? String((initialData as any).idPublicoAlvo) : "",
            categoria: (initialData as any)?.idCategoria ? String((initialData as any).idCategoria) : "",
            idEntidade: (initialData as any)?.idEntidade ? String((initialData as any).idEntidade) : "",
            formato: (initialData as any)?.idFormato ? String((initialData as any).idFormato) : "",
            tipo: (initialData as any)?.idTipo ? String((initialData as any).idTipo) : "",
            idTipoEspaco: (initialData as any)?.idTipoEspaco ? String((initialData as any).idTipoEspaco) : "",
            demandantesArea: initialData?.demandantesArea || [],
            idsTematicas: initialData?.tematicas?.map((t: any) => t.id) || [],
            periodos: initialData?.periodos || (initialData as any)?.Periodos || [],
        } as any
    });

    const { register, handleSubmit, setValue, control, formState: { errors, isValid } } = methods;

    // Estado reativo para a complexidade calculada automaticamente
    const classificacaoEsforcoAtual = (initialData as any)?.classificacaoEsforco ?? null;
    const classificacaoImpactoAtual = (initialData as any)?.classificacaoImpacto ?? null;
    const nivelAssessoriaAtual = (initialData as any)?.NivelAssessoria?.nivel ? `N${(initialData as any).NivelAssessoria.nivel}` : null;
    
    const [complexidadeCalculada, setComplexidadeCalculada] = useState<string | null>(classificacaoEsforcoAtual);
    const [impactoCalculado, setImpactoCalculado] = useState<string | null>(classificacaoImpactoAtual);
    const [nivelAssessoriaCalculado, setNivelAssessoriaCalculado] = useState<string | null>(nivelAssessoriaAtual);
    const [isCalculandoComplexidade, setIsCalculandoComplexidade] = useState(false);

    // Sincroniza quando initialData é atualizado (ex: após save e React Query invalidation)
    useEffect(() => {
        setComplexidadeCalculada(classificacaoEsforcoAtual);
        setImpactoCalculado(classificacaoImpactoAtual);
        setNivelAssessoriaCalculado(nivelAssessoriaAtual);
    }, [classificacaoEsforcoAtual, classificacaoImpactoAtual, nivelAssessoriaAtual]);

    useEffect(() => {
        register('idsReservas');
    }, [register]);

    const isExternal = useWatch({ control, name: 'isExternal' });
    const watchedIdEspaco = useWatch({ control, name: 'idEspaco' }) as string | number | undefined;
    const watchedPeriodos = useWatch({ control, name: 'periodos' }) as any[];
    const watchedTipo = useWatch({ control, name: 'tipo' });
    const watchedGuestCount = useWatch({ control, name: 'guestCount' });
    const watchedIdPacoteServico = useWatch({ control, name: 'idPacoteServico' });
    const watchedIdNivelContratacao = useWatch({ control, name: 'idNivelContratacao' });
    const watchedIdFaixaAtivacao = useWatch({ control, name: 'idFaixaAtivacao' });
    const watchedJornadaParticipante = useWatch({ control, name: 'jornadaParticipante' });
    const watchedLegislacao = useWatch({ control, name: 'legislacao' });
    const watchedIdFaixaAutoridade = useWatch({ control, name: 'idFaixaAutoridade' });
    const watchedIsCeremonial = useWatch({ control, name: 'isCeremonial' });
    const watchedEstrategico = useWatch({ control, name: 'estrategico' });
    const watchedIdPublicoAlvo = useWatch({ control, name: 'idPublicoAlvo' });
    const watchedIdTipoEspaco = useWatch({ control, name: 'idTipoEspaco' });

    useEffect(() => {
        const timeout = setTimeout(async () => {
            const temCampos =
                watchedTipo ||
                watchedGuestCount ||
                watchedIdPacoteServico ||
                watchedIdNivelContratacao ||
                watchedIdFaixaAtivacao ||
                watchedJornadaParticipante ||
                watchedLegislacao ||
                watchedIdFaixaAutoridade ||
                watchedIsCeremonial ||
                watchedEstrategico ||
                watchedIdPublicoAlvo ||
                watchedIdTipoEspaco;

            if (!temCampos && !initialData) return;

            setIsCalculandoComplexidade(true);
            try {
                const { classificacaoEsforco, classificacaoImpacto, nivelAssessoria } = await calcularComplexidade({
                    idTipo: watchedTipo ? Number(watchedTipo) : undefined,
                    idNumeroParticipantes: watchedGuestCount ? Number(watchedGuestCount) : undefined,
                    idPacoteServico: watchedIdPacoteServico ? Number(watchedIdPacoteServico) : undefined,
                    idNivelContratacao: watchedIdNivelContratacao ? Number(watchedIdNivelContratacao) : undefined,
                    idFaixaAtivacao: watchedIdFaixaAtivacao ? Number(watchedIdFaixaAtivacao) : undefined,
                    jornadaParticipante: !!watchedJornadaParticipante,
                    legislacao: !!watchedLegislacao,
                    idFaixaAutoridade: watchedIdFaixaAutoridade ? Number(watchedIdFaixaAutoridade) : undefined,
                    solenidade: !!watchedIsCeremonial,
                    estrategico: !!watchedEstrategico,
                    idPublicoAlvo: watchedIdPublicoAlvo ? Number(watchedIdPublicoAlvo) : undefined,
                    idTipoEspaco: watchedIdTipoEspaco ? Number(watchedIdTipoEspaco) : undefined,
                });

                setComplexidadeCalculada(classificacaoEsforco ?? null);
                setImpactoCalculado(classificacaoImpacto ?? null);
                setNivelAssessoriaCalculado(nivelAssessoria ? `N${nivelAssessoria}` : null);
            } catch (error) {
                console.error('Erro ao calcular complexidade:', error);
            } finally {
                setIsCalculandoComplexidade(false);
            }
        }, 600);

        return () => clearTimeout(timeout);
    }, [
        watchedTipo,
        watchedGuestCount,
        watchedIdPacoteServico,
        watchedIdNivelContratacao,
        watchedIdFaixaAtivacao,
        watchedJornadaParticipante,
        watchedLegislacao,
        watchedIdFaixaAutoridade,
        watchedIsCeremonial,
        watchedEstrategico,
        watchedIdPublicoAlvo,
        watchedIdTipoEspaco,
        initialData,
    ]);

    // Auto-calculate duracao based on periodos
    useEffect(() => {
        if (watchedPeriodos && Array.isArray(watchedPeriodos)) {
            let totalHoras = 0;
            watchedPeriodos.forEach(p => {
                if (p.dataInicio && p.dataFim) {
                    const start = new Date(p.dataInicio).getTime();
                    const end = new Date(p.dataFim).getTime();
                    if (end > start) {
                        totalHoras += (end - start) / (1000 * 60 * 60);
                    }
                }
            });
            // Only update if we have a valid duration or explicitly clear it if empty
            setValue('duracao', totalHoras > 0 ? parseFloat(totalHoras.toFixed(2)) : '', { shouldValidate: true, shouldDirty: true });
        }
    }, [watchedPeriodos, setValue]);

    const [carregando, setCarregando] = useState<boolean>(false);

    // Dia da semana agora pode ser removido ou tratado para o primeiro periodo se necessário.
    // Vamos deixar vazio pois temos vários períodos.
    useEffect(() => {
        setValue('dayOfWeek', '');
    }, [setValue]);

    // Load complete space data with idLocal
    useEffect(() => {
        getAllEspacosComplete().then((data) => {
            setEspacosCompletos(data);
        }).catch((error) => {
            console.error('Error loading complete spaces:', error);
        });
    }, []);

    const [existingFiles, setExistingFiles] = useState<any[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);

    useEffect(() => {
        const anexos = (initialData as any)?.AnexoEvento || [];
        const legacyUrl = (initialData as any)?.urlArquivo;
        const filesToShow = anexos.length > 0 ? anexos : (legacyUrl ? [{ urlArquivo: legacyUrl, nome: 'Arquivo Principal', id: 'legacy' }] : []);
        setExistingFiles(filesToShow);
    }, [initialData]);

    const handleViewFile = async (anexo: { urlArquivo: string, nome: string, type?: string }) => {
        const fileUrl = anexo.urlArquivo;
        let url = fileUrl;
        let type: 'image' | 'pdf' | 'text' | 'other' = 'other';
        let textContent = '';

        const name = anexo.nome || 'Anexo';
        const extension = name.split('.').pop()?.toLowerCase();

        if (anexo.type === 'new') {
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
                type = 'image';
            } else if (extension === 'pdf') {
                type = 'pdf';
            }
            setFileToView({ url, name, type });
            return;
        }

        setIsLoadingFile(true);
        try {
            const res = await fetch(fileUrl);
            if (res.ok) {
                const contentType = res.headers.get('content-type') || '';
                if (contentType.includes('text/plain')) {
                    textContent = await res.text();
                    type = 'text';
                } else {
                    const blob = await res.blob();
                    url = URL.createObjectURL(blob);
                }
            }
        } catch (err) {
            console.error("Erro ao tentar visualizar anexo:", err);
        } finally {
            setIsLoadingFile(false);
        }

        if (type !== 'text') {
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
                type = 'image';
            } else if (extension === 'pdf') {
                type = 'pdf';
            }
        }

        setFileToView({ url, name, type, textContent });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files);
            const updatedFiles = [...newFiles, ...filesArray];
            setNewFiles(updatedFiles);
            setValue('mapFile', updatedFiles as any, { shouldValidate: true });

            // Clear input so same file can be selected again if needed
            e.target.value = '';
        }
    };

    const handleRemoveNewFile = (index: number) => {
        const updatedFiles = newFiles.filter((_, i) => i !== index);
        setNewFiles(updatedFiles);
        setValue('mapFile', updatedFiles as any, { shouldValidate: true });
    };

    const handleDeleteAnexo = async (fileId: number | string) => {
        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: "Você não poderá reverter isso!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                if (fileId === 'legacy') {
                    Swal.fire('Info', 'Este é um arquivo legado. Por favor, faça upload de um novo para substituir.', 'info');
                    return;
                }

                await deleteAnexo(Number(fileId));
                setExistingFiles(prev => prev.filter(f => f.id !== fileId));
                Swal.fire('Excluído!', 'O anexo foi excluído.', 'success');
            } catch (error) {
                console.error(error);
                Swal.fire('Erro!', 'Não foi possível excluir o anexo.', 'error');
            }
        }
    };

    const handleFormSubmit = async (data: FormularioEventosData) => {
        setCarregando(true);
        // FORCE inject selectedReservas IDs to ensure they are sent regardless of form registration
        const rawPayload = {
            ...data,
            idsReservas: selectedReservas.map(r => r.id),
        };
        const payload = handlerDadosMapeados(rawPayload);

        setIsSubmitting(true);
        try {
            if (onSubmit) {
                // Se houver arquivo, enviar como FormData
                // Se houver arquivos, enviar como FormData
                if (data.mapFile && data.mapFile.length > 0) {
                    const formData = new FormData();
                    // Append all files
                    Array.from(data.mapFile).forEach((file: any) => {
                        formData.append('mapFile', file);
                    });

                    // Adicionar todos os outros campos como JSON string ou valor direto
                    Object.keys(payload).forEach(key => {
                        if (key !== 'mapFile' && payload[key] !== undefined && payload[key] !== null) {
                            if (Array.isArray(payload[key]) || (typeof payload[key] === 'object' && !(payload[key] instanceof Date))) {
                                formData.append(key, JSON.stringify(payload[key]));
                            } else {
                                formData.append(key, payload[key]);
                            }
                        }
                    });




                    const result = await onSubmit(formData);
                    if (result?.success) {
                        setNewFiles([]);
                        setValue('mapFile', [] as any);
                        Swal.fire({
                            text: "Evento salvo com sucesso!",
                            icon: "success",
                            width: 500,
                            showConfirmButton: false,
                            timer: 2000,
                        });

                        if (result?.data?.id && !effectiveEventId) {
                            router.push(`/eventos/buscar`);
                        }
                    } else {
                        throw new Error(result?.error || "Erro ao salvar evento.");
                    }
                } else {
                    // Sem arquivo, enviar JSON normal
                    const result = await onSubmit(payload);
                    if (result?.success) {
                        Swal.fire({
                            text: "Evento salvo com sucesso!",
                            icon: "success",
                            width: 500,
                            showConfirmButton: false,
                            timer: 2000,
                        });

                        if (result?.data?.id && !effectiveEventId) {
                            router.push(`/eventos/buscar`);
                        }
                    } else {
                        throw new Error(result?.error || "Erro ao salvar evento.");
                    }
                }
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                text: err instanceof Error ? err.message : "Erro desconhecido ao salvar evento",
                icon: "error",
                width: 500,
                showConfirmButton: true,
            });
        } finally {
            setIsSubmitting(false);
            setCarregando(false);
        }
    };
    function handlerDadosMapeados(data: any) {

        const dadosMapeados = {
            ...data,
            dataInicio: data.dataInicio || undefined,
            dataFim: data.dataFim || undefined,

            idTamanho: Number(data.tamanho) || undefined,
            idFormato: Number(data.formato) || undefined,
            idSituacao: Number(data.idSituacao) || undefined,
            idPeriodicidade: Number(data.frequencia) || undefined,

            // Only assign to ID field if it's a valid number.
            // If it's a string name, it should stay in its original field (e.g. nomeProdutor)
            idContatoFocal: !isNaN(Number(data.clientArea)) && data.clientArea ? Number(data.clientArea) : undefined,
            idContatoProdutor: !isNaN(Number(data.nomeProdutor)) && data.nomeProdutor ? Number(data.nomeProdutor) : undefined,

            // Handle idEspaco vs isExternal (converted to number)
            idEspaco: !data.isExternal ? (data.idEspaco ? Number(data.idEspaco) : null) : undefined,

            idComplexidade: Number(data.idComplexidade) || undefined,
            idFaseProjeto: Number(data.faseProjeto) || undefined,
            idCategoria: Number(data.categoria) || undefined,
            idTipo: Number(data.tipo) || undefined,
            
            idFaixaAutoridade: data.idFaixaAutoridade ? Number(data.idFaixaAutoridade) : null,
            idFaixaAtivacao: data.idFaixaAtivacao ? Number(data.idFaixaAtivacao) : null,
            idPacoteServico: data.idPacoteServico ? Number(data.idPacoteServico) : null,
            idNivelContratacao: data.idNivelContratacao ? Number(data.idNivelContratacao) : null,
            legislacao: data.legislacao,
            jornadaParticipante: data.jornadaParticipante,

            idSegmento: Number(data.idSegmento) || undefined,
            idClassificacao: Number(data.idClassificacao) || undefined,
            idPublicoAlvo: Number(data.idPublicoAlvo) || undefined,
            idSegmentoPublico: Number(data.idSegmentoPublico) || undefined,
            detalhesPlanejamento: data.planejamento || undefined,

            demandantesEvento: Array.isArray(data.demandantesArea) ? data.demandantesArea.map((m: any) => ({
                demandanteId: Number(m.demandanteId),
                dadosContato: m.dadosContato
            })) : undefined,
            isExternal: data.isExternal,
            solenidade: data.isCeremonial,
            idNumeroParticipantes: Number(data.guestCount) || undefined,
        };

        // Remove campos que só existem no Front ou estão mapeados
        delete dadosMapeados.dayOfWeek;
        delete dadosMapeados.tamanho;
        delete dadosMapeados.formato;
        delete dadosMapeados.frequencia;
        delete dadosMapeados.faseProjeto;
        delete dadosMapeados.categoria;
        delete dadosMapeados.tipo;
        delete dadosMapeados.demandantesArea;
        delete dadosMapeados.planejamento;
        delete dadosMapeados.complexidade;
        delete dadosMapeados.entidade;
        delete dadosMapeados.classificacao;
        // delete dadosMapeados.periodos; // Mantido pois o backend agora usa 'periodos'

        // delete dadosMapeados.idEspaco; // Renamed to idEspaco, handled above
        delete dadosMapeados.idLocal;
        delete dadosMapeados.guestCount;
        delete dadosMapeados.isCeremonial;
        // delete dadosMapeados.mapFile; // MANTIDO: Permitir envio para o backend
        delete dadosMapeados.localName;
        delete dadosMapeados.clientArea; // Mapped to idContatoFocal
        delete dadosMapeados.partnerEntidade;
        delete dadosMapeados.idContato;



        // We do NOT delete nomeProdutor because it might be needed as a string if it wasn't an ID
        // delete dadosMapeados.nomeProdutor;


        return dadosMapeados
    }
    const handleTabChange = (value: 'main' | 'details' | 'reservas' | 'solicitacao' | 'complexidade') => {
        setActiveTab(value);
    };

    const [selectedReservas, setSelectedReservas] = useState<any[]>([]);

    useEffect(() => {
        if (initialData?.Reserva && Array.isArray(initialData.Reserva)) {
            setSelectedReservas(initialData.Reserva);
            setValue('idsReservas', initialData.Reserva.map((r: any) => r.id));
        }
    }, [initialData, setValue]);

    async function handleReservaSelect(reserva: any) {
        const isSelected = selectedReservas.some(r => r.id === reserva.id);

        if (isSelected) {
            handleDesvincularReserva(reserva);
            return;
        }

        const newSelection = [...selectedReservas, reserva];
        setSelectedReservas(newSelection);

        // IMMEDIATE SAVE
        if (effectiveEventId) {
            try {
                await updateReservaAction(reserva.id, { idEvento: effectiveEventId } as any);
                Swal.fire({
                    icon: 'success',
                    title: 'Reserva Vinculada!',
                    text: `Reserva #${reserva.id} salva automaticamente.`,
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'warning',
                    title: 'Atenção',
                    text: 'A reserva foi selecionada na tela, mas houve erro ao salvar vínculo no banco.',
                    toast: true,
                    position: 'top-end'
                });
            }
        }

        // Force update values ONLY if it's the first one, to help user filling form
        if (newSelection.length === 1) {
            if (reserva.idEspaco) setValue('idEspaco', reserva.idEspaco, { shouldValidate: true, shouldDirty: true });
        }

        // SAVE RESERVAS IDs
        setValue('idsReservas', newSelection.map(r => r.id), { shouldValidate: true, shouldDirty: true });
    }

    async function handleDesvincularReserva(reserva: any) {
        if (!reserva) return;

        const newSelection = selectedReservas.filter(r => r.id !== reserva.id);
        setSelectedReservas(newSelection);

        // IMMEDIATE UNLINK
        if (effectiveEventId) {
            try {
                await updateReservaAction(reserva.id, { idEvento: null } as any);
                Swal.fire({
                    icon: 'success',
                    title: 'Reserva Desvinculada!',
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'warning',
                    title: 'Atenção',
                    text: 'Houve erro ao remover vínculo no banco.',
                    toast: true,
                    position: 'top-end'
                });
            }
        }

        setValue('idsReservas', newSelection.map(r => r.id), { shouldDirty: true });

        if (newSelection.length === 0) {
            setValue('reservaId', null); // Clear legacy field if needed
        }
    }
    const onError = (_errors: any) => {
        // Validation errors handled silently
    };
    const hasErrors = Object.keys(errors).length > 0;
    return (
        <FormProvider {...methods}>
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex border-b bg-gray-50/50 px-6 pt-6 gap-4">
                    <Tabs value={activeTab} onValueChange={handleTabChange as any}>
                        <TabsList className="overflow-scroll lg:overflow-hidden">
                            <TabsTrigger
                                value={"main"}
                                disabled={activeTab === "main"}
                                className={activeTab === "main" ? "cursor-not-allowed opacity-60" : ""}
                            >
                                Informações Gerais
                            </TabsTrigger>
                            <TabsTrigger
                                key={"details"}
                                value={'details'}
                                disabled={activeTab === "details"}
                                className={activeTab === "details" ? "cursor-not-allowed opacity-60" : ""}
                            >
                                Detalhes & Planejamento
                            </TabsTrigger>
                            <TabsTrigger
                                key={"reservas"}
                                value={'reservas'}
                                disabled={activeTab === "reservas"}
                                className={activeTab === "reservas" ? "cursor-not-allowed opacity-60" : ""}
                            >
                                Reservas
                                {selectedReservas.length > 0 && (
                                    <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                                        {selectedReservas.length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                key={"complexidade"}
                                value={'complexidade'}
                                disabled={activeTab === "complexidade"}
                                className={activeTab === "complexidade" ? "cursor-not-allowed opacity-60" : ""}
                            >
                                Complexidade
                            </TabsTrigger>
                            {ticketId && (
                                <TabsTrigger
                                    key={"solicitacao"}
                                    value={'solicitacao'}
                                    disabled={activeTab === "solicitacao"}
                                    className={activeTab === "solicitacao" ? "cursor-not-allowed opacity-60" : ""}
                                >
                                    Solicitação
                                </TabsTrigger>
                            )}
                        </TabsList>
                    </Tabs>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit, onError)}
                    className="p-6 md:p-8 transition-all duration-300 relative"
                    noValidate>

                    <fieldset disabled={readOnly || carregando} className={cn("contents", carregando && "opacity-60 cursor-not-allowed")}>
                        <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-6", activeTab !== 'main' && "hidden")}>

                            {selectedReservas.length > 0 && (
                                <div className="md:col-span-12 bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></svg>
                                        </div>
                                        <h3 className="text-sm font-bold text-blue-800">Reservas Vinculadas ({selectedReservas.length})</h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {selectedReservas.map(res => (
                                            <div key={res.id} className="bg-white p-3 rounded border border-blue-100 flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{res.motivo || "Reserva sem motivo"}</p>
                                                    <p className="text-xs text-gray-500">{new Date(res.dataInicio).toLocaleDateString()} - {res.Espaco?.nome}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDesvincularReserva(res)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                    aria-label="Desvincular reserva"
                                                    title="Desvincular reserva"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Identificação Básica ... (rest is unchanged) */}

                            {/* Identificação Básica */}

                            {/* ATUALIZADO: 'title' -> 'nome' */}
                            <FormInput disabled={readOnly} label="Título do Evento" className="md:col-span-8" required error={errors.nome?.message as string} {...register('nome')} />

                            <div className="md:col-span-4">
                                <MultiSelectTematica
                                    control={control}
                                    name="idsTematicas"
                                    options={options?.tematicas || []}
                                    initialOptions={initialData?.tematicas?.map((t: any) => ({
                                        value: t.id,
                                        label: t.nome
                                    })) || []}
                                    readOnly={readOnly}
                                />
                            </div>

                            <MultiSelectPeriodo
                                control={control}
                                register={register}
                                errors={errors}
                                required
                                readOnly={readOnly}
                            />

                            {/* ATUALIZADO: 'duration' -> 'duracao'. Now calculated automatically and disabled. */}
                            <FormInput readOnly label="Duração (h)" type="number" step="0.5" className="md:col-span-2" {...register('duracao')} />

                            <div className="md:col-span-4">
                                {/* ATUALIZADO: 'frequency' -> 'frequencia' */}
                                <SelectField disabled={readOnly} options={options?.frequencias} label="Frequência" className="md:col-span-4" name="frequencia" />
                            </div>
                            <div className="md:col-span-6">
                                <SelectField
                                    disabled={readOnly}
                                    options={options?.situacoes || []}
                                    label="Situação"
                                    className="md:col-span-6"
                                    required
                                    error={errors.idSituacao?.message as string}
                                    name="idSituacao"
                                />
                            </div>

                            {/* Localização e Logística */}
                            <div className="md:col-span-12 border-t pt-4 mt-2">
                                <h3 className="text-sm font-bold text-gray-900 mb-4">Localização</h3>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    <div className="md:col-span-12 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div className="flex flex-col gap-2 mb-4">
                                            <span className="text-sm font-semibold text-gray-700">Tipo de Local</span>
                                            <Controller
                                                control={control}
                                                name="isExternal"
                                                render={({ field }) => (
                                                    <div className="flex gap-4">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                                checked={field.value === false}
                                                                onChange={() => field.onChange(false)}
                                                                disabled={readOnly}

                                                            />
                                                            <span className="text-sm text-gray-700">Interno</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                                checked={field.value === true}
                                                                onChange={() => field.onChange(true)}
                                                                disabled={readOnly}
                                                            />
                                                            <span className="text-sm text-gray-700">Externo</span>
                                                        </label>
                                                    </div>
                                                )}
                                            />
                                        </div>

                                        {isExternal && (
                                            <div className="grid grid-cols-2 gap-4 mt-4 animate-in slide-in-from-top-2">
                                                {/* ATUALIZADO: 'country' -> 'pais' e 'state' -> 'estado' */}
                                                <FormInput disabled={readOnly} label="País" error={errors.pais?.message as string} {...register('pais')} />
                                                <FormInput disabled={readOnly} label="Estado" error={errors.estado?.message as string} {...register('estado')} />
                                                <FormInput disabled={readOnly} label="Local Externo" className="col-span-2" error={errors.localExterno?.message as string} {...register('localExterno')} />
                                            </div>
                                        )}
                                    </div>

                                    {!isExternal && (
                                        <SelecaoLocalEspaco
                                            name="idEspaco"
                                            control={control}
                                            setValue={setValue}
                                            errors={errors}
                                            locais={options?.locais || []}
                                            espacos={espacosCompletos}
                                            readOnly={readOnly}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Métricas */}
                            <div className="md:col-span-12 border-t pt-4 mt-2">
                                <h3 className="text-sm font-bold text-gray-900 mb-4">Dimensões e Formato</h3>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    <div className="md:col-span-6">
                                        {/* ATUALIZADO: 'format' -> 'formato' */}
                                        <SelectField disabled={readOnly} options={options?.formatos} label="Formato" className="w-full" name="formato" />
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-12">
                                <MultiSelectDemandante
                                    control={control}
                                    register={register}
                                    errors={errors}
                                    options={options?.demandantes} // Espera array de { value, label }
                                    readOnly={readOnly}
                                    required={true}
                                />
                                {/* <SelectField disabled={readOnly} options={optionsSelect.demandantes} label="Cliente / Área Demandante" className="md:col-span-4" required error={errors.clientArea?.message as string} {...register('demandanteId')} /> */}
                            </div>
                            <div className="md:col-span-4">
                                <SelectField disabled={readOnly} options={options?.categorias} label="Categoria" className="w-full" required error={errors.categoria?.message as string} name="categoria" />
                            </div>
                            <div className="md:col-span-4">
                                <FormInput disabled={readOnly} label="Produtor GEV (Responsável)" className="md:col-span-6" required error={errors.nomeProdutor?.message as string} {...register('nomeProdutor')} />
                            </div>
                            <div className="md:col-span-4">
                                <SelectField disabled={readOnly} options={options?.entidades} label="Entidade Parceira (Apoio)" className="md:col-span-4" name="idEntidade" />
                            </div>

                            <FormTextarea disabled={readOnly} label="Descrição do Evento" className="md:col-span-12" rows={3} {...register('descricao')} />

                            <div className="md:col-span-12">
                                <FormCheckbox disabled={readOnly} label="Evento previsto no Orçamento" {...register('previstoNoOrcamento')} />
                            </div>
                        </div>


                        <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-6", activeTab !== 'details' && "hidden")}>
                            <div className="md:col-span-4">
                                <SelectField disabled={readOnly} options={options?.tipos} label="Escopo de Atuação" className="w-full" name="tipo" />
                            </div>

                            <div className="md:col-span-4">
                                <SelectField disabled={readOnly} options={options?.segmentos} label="Segmento" placeholder="Ex: Educacional" name="idSegmento" />
                            </div>

                            <div className="md:col-span-4">
                                <SelectField disabled={readOnly} options={options?.classificacoes} label="Classificação" className="w-full" name="idClassificacao" />
                            </div>


                            <div className="md:col-span-6">
                                <SelectField disabled={readOnly} options={options?.segmentosPublicos} label="Segmento do público-alvo" className="md:col-span-6" name="idSegmentoPublico" />
                            </div>

                            <div className="md:col-span-2 flex flex-col justify-end pb-2">
                                <Controller
                                    control={control}
                                    name="restrito"
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="restrito"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={readOnly || field.disabled}
                                            />
                                            <label htmlFor="restrito" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                Restrito
                                            </label>
                                        </div>
                                    )}
                                />
                            </div>



                            <FormTextarea disabled={readOnly} label="Detalhes do Planejamento" className="md:col-span-12" rows={3} {...register('planejamento')} />

                            <div className="md:col-span-12">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Anexo do Evento (Upload)</label>
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.docx,.xlsx"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    onChange={handleFileSelect}
                                />
                                {errors.mapFile && <p className="text-red-500 text-xs mt-1">{errors.mapFile.message as string}</p>}

                                {/* Galeria de Anexos */}
                                <div className="mt-6 space-y-4">
                                    {(() => {
                                        const combinedAnexos = [
                                            ...existingFiles.map((f, i) => ({
                                                type: 'existing',
                                                id: f.id,
                                                index: i,
                                                urlArquivo: f.id && f.id !== 'legacy' ? `${process.env.NEXT_PUBLIC_API_URL}/eventos/download/${f.id}` : f.urlArquivo,
                                                nome: f.nome || 'Anexo Principal'
                                            })),
                                            ...newFiles.map((f, i) => ({
                                                type: 'new',
                                                id: null,
                                                index: i,
                                                urlArquivo: URL.createObjectURL(f),
                                                nome: f.name
                                            }))
                                        ];

                                        if (combinedAnexos.length === 0) {
                                            return null;
                                        }

                                        return (
                                            <div className={`grid grid-cols-1 ${combinedAnexos.length > 1 ? 'md:grid-cols-2' : ''} gap-4`}>
                                                {combinedAnexos.map((anexo, idx) => {
                                                    const isPdf = typeof anexo.urlArquivo === 'string' && anexo.urlArquivo.toLowerCase().includes('.pdf');
                                                    // Handle object URL extension fallback guessing logic based on type or just use name for new files
                                                    const finalIsPdf = isPdf || (anexo.nome && anexo.nome.toLowerCase().endsWith('.pdf'));

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="relative w-full rounded-lg border border-gray-200 shadow-sm bg-white hover:bg-gray-50 transition-colors p-3 flex items-center justify-between group cursor-pointer"
                                                            onClick={() => handleViewFile(anexo)}
                                                        >
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <div className={`p-2 rounded-lg ${finalIsPdf ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                                                    {finalIsPdf ? (
                                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                        </svg>
                                                                    ) : (
                                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col truncate">
                                                                    <span className="text-sm font-semibold text-gray-800 truncate">{anexo.nome}</span>
                                                                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                                        <span className={cn("inline-block w-1.5 h-1.5 rounded-full", anexo.type === 'new' ? "bg-green-500" : "bg-blue-500")}></span>
                                                                        {anexo.type === 'new' ? 'Novo Anexo' : 'Anexo Existente'}
                                                                        <span className="mx-1 text-gray-300">•</span>
                                                                        <span className="text-blue-600 font-medium group-hover:underline">Clique para visualizar</span>
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {(!readOnly && anexo.id !== 'legacy') && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        if (anexo.type === 'new') {
                                                                            handleRemoveNewFile(anexo.index);
                                                                        } else {
                                                                            handleDeleteAnexo(anexo.id);
                                                                        }
                                                                    }}
                                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0 ml-2"
                                                                    title="Excluir anexo"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <path d="M3 6h18"></path>
                                                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}
                                </div>

                                <p className="text-xs text-gray-400 mt-2">PDF, DOCX, XLSX até 10 MB. Clique no card para abrir.</p>
                            </div>

                            <div className="md:col-span-12 p-5 bg-blue-50/50 border border-blue-100 rounded-lg space-y-4">
                                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide">Integração & Checklist</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FormCheckbox disabled={readOnly} label="Integrado CNC–SESC–SENAC" {...register('integrado')} />

                                    <FormCheckbox disabled={readOnly} label="Produção de Estande / Ativação" {...register('producaoEstande')} />
                                </div>
                            </div>

                            <FormTextarea disabled={readOnly} label="Desenvolvimento da Jornada e Experiência do Cliente" className="md:col-span-12" rows={4} {...register('observacao')} />
                        </div>

                        <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-6", activeTab !== 'complexidade' && "hidden")}>
                            {/* Resultado calculado */}
                            <div className="md:col-span-12">
                                <div className="p-5 bg-blue-50/60 border border-blue-100 rounded-lg flex flex-col md:flex-row gap-6 items-start">
                                    <div className="flex flex-col gap-1 flex-1">
                                        <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Esforço</label>
                                        <div className="min-h-[40px] px-3 py-2 flex items-center rounded-md border border-blue-200 bg-white text-sm text-blue-900 select-none cursor-not-allowed">
                                            {isCalculandoComplexidade ? <span className="text-blue-300 italic">Calculando...</span> : complexidadeCalculada ? <span className="font-bold text-blue-700">{complexidadeCalculada}</span> : <span className="text-blue-300 italic">Calculado ao salvar</span>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1">
                                        <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Impacto</label>
                                        <div className="min-h-[40px] px-3 py-2 flex items-center rounded-md border border-blue-200 bg-white text-sm text-blue-900 select-none cursor-not-allowed">
                                            {isCalculandoComplexidade ? <span className="text-blue-300 italic">Calculando...</span> : impactoCalculado ? <span className="font-bold text-blue-700">{impactoCalculado}</span> : <span className="text-blue-300 italic">Calculado ao salvar</span>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1">
                                        <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Complexidade</label>
                                        <div className="min-h-[40px] px-3 py-2 flex items-center rounded-md border border-blue-200 bg-white text-sm text-blue-900 select-none cursor-not-allowed">
                                            {isCalculandoComplexidade ? <span className="text-blue-300 italic">Calculando...</span> : nivelAssessoriaCalculado ? <span className="font-bold text-blue-700">{nivelAssessoriaCalculado}</span> : <span className="text-blue-300 italic">Calculado ao salvar</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bloco: Variáveis de Esforço */}
                            <div className="md:col-span-12 p-5 bg-gray-50/50 border border-gray-100 rounded-lg space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Variáveis de Esforço</h3>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    <div className="md:col-span-6">
                                        <SelectField disabled={readOnly} options={options?.numeroParticipantes} label="Público Alvo" className="w-full" name="guestCount" />
                                    </div>
                                    <div className="md:col-span-4">
                                        <SelectField disabled={readOnly} options={options?.tiposEspaco || []} label="Tipo de Espaço" name="idTipoEspaco" />
                                    </div>
                                    <div className="md:col-span-4">
                                        <SelectField disabled={readOnly} options={options?.faixasAtivacoes || []} label="Faixa de Ativações" name="idFaixaAtivacao" />
                                    </div>
                                    <div className="md:col-span-4">
                                        <SelectField disabled={readOnly} options={options?.pacotesServicos || []} label="Pacote de Serviços" name="idPacoteServico" />
                                    </div>
                                    <div className="md:col-span-4">
                                        <SelectField disabled={readOnly} options={options?.niveisContratacao || []} label="Contratação" name="idNivelContratacao" />
                                    </div>

                                    <div className="md:col-span-12 flex flex-col md:flex-row md:flex-wrap gap-4 md:gap-6 mt-2">
                                        <Controller
                                            control={control}
                                            name="legislacao"
                                            render={({ field }) => (
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id="legislacao"
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={readOnly || field.disabled}
                                                    />
                                                    <label htmlFor="legislacao" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                        Legislação
                                                    </label>
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            control={control}
                                            name="jornadaParticipante"
                                            render={({ field }) => (
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id="jornadaParticipante"
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={readOnly || field.disabled}
                                                    />
                                                    <label htmlFor="jornadaParticipante" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                        Jornada do Participante
                                                    </label>
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bloco: Variáveis de Impacto */}
                            <div className="md:col-span-12 p-5 bg-gray-50/50 border border-gray-100 rounded-lg space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Variáveis de Impacto</h3>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    <div className="md:col-span-6">
                                        <SelectField disabled={readOnly} label="Tipo de público" options={options?.publicosAlvo || []} className="w-full" placeholder="Ex: Interno, Externo..." name="idPublicoAlvo" />
                                    </div>
                                    <div className="md:col-span-6">
                                        <SelectField disabled={readOnly} options={options?.faixasAutoridades || []} label="Autoridades" name="idFaixaAutoridade" />
                                    </div>

                                    <div className="md:col-span-12 flex flex-col md:flex-row md:flex-wrap gap-4 md:gap-6 mt-2">
                                        <Controller
                                            control={control}
                                            name="isCeremonial"
                                            render={({ field }) => (
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id="isCeremonial"
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={readOnly || field.disabled}
                                                    />
                                                    <label htmlFor="isCeremonial" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                        Solenidade / Cerimonial
                                                    </label>
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            control={control}
                                            name="estrategico"
                                            render={({ field }) => (
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id="estrategico"
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={readOnly || field.disabled}
                                                    />
                                                    <label htmlFor="estrategico" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                        Evento Estratégico
                                                    </label>
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-6", activeTab !== 'reservas' && "hidden")}>
                            <div className="md:col-span-12">
                                <AbaReservas
                                    onSelectReserva={handleReservaSelect}
                                    onDeselectReserva={handleDesvincularReserva}
                                    selectedReservas={selectedReservas} // Pass array
                                    readOnly={readOnly}
                                    espacos={options?.espacos || []}
                                    locais={options?.locais || []}
                                    eventos={options?.eventos || []}
                                    eventoId={effectiveEventId}
                                    initialEspacoId={watchedIdEspaco}
                                />
                            </div>
                        </div>

                        <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-6", activeTab !== 'solicitacao' && "hidden")}>
                            <div className="md:col-span-12">
                                <AbaSolicitacao ticketId={ticketId} dadosSolicitacao={solicitacao} />
                            </div>
                        </div>
                    </fieldset>

                    <div className="mt-8 pt-6 border-t flex justify-between items-center">
                        {Object.keys(errors).length > 0 && (
                            <span className="text-red-600 text-sm font-medium">
                                Existem campos inválidos. Verifique as abas.
                            </span>
                        )}

                        <div className="flex gap-3 ml-auto">
                            {!readOnly && <ButtonSave type="submit" loading={carregando} />}
                        </div>
                    </div>

                </form>
            </div >

            <Dialog open={!!fileToView} onOpenChange={(open) => !open && setFileToView(null)}>
                <DialogContent className="max-w-4xl w-full h-[85vh] flex flex-col p-0 overflow-hidden bg-gray-50/95 backdrop-blur-sm border-gray-200/50 shadow-2xl">
                    <DialogHeader className="p-4 border-b border-gray-200/50 bg-white shadow-sm shrink-0 flex flex-row items-center justify-between">
                        <DialogTitle className="text-lg font-bold text-[#003366] flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {fileToView?.name || 'Visualização do Anexo'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto bg-gray-100 p-4 md:p-8 flex items-center justify-center relative">
                        {isLoadingFile && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm">
                                <span className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-sm font-bold text-gray-700">Carregando arquivo seguro...</p>
                            </div>
                        )}
                        {fileToView?.type === 'image' && (
                            <div className="relative w-full h-full max-h-full flex items-center justify-center">
                                <img
                                    src={fileToView.url}
                                    alt={fileToView.name}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-sm border border-gray-200 bg-white p-2"
                                />
                            </div>
                        )}
                        {fileToView?.type === 'pdf' && (
                            <iframe
                                src={`${fileToView.url}#toolbar=0`}
                                className="w-full h-full rounded-lg shadow-sm border border-gray-200 bg-white"
                                title={fileToView.name}
                            />
                        )}
                        {fileToView?.type === 'text' && (
                            <div className="w-full h-full p-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-auto">
                                <pre className="text-gray-700 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                    {fileToView.textContent}
                                </pre>
                            </div>
                        )}
                        {fileToView?.type === 'other' && (
                            <div className="text-center bg-white p-12 rounded-2xl shadow-sm border border-gray-200">
                                <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Visualização não disponível</h3>
                                <p className="text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
                                    Este tipo de arquivo não pode ser visualizado diretamente no navegador.
                                </p>
                                <a
                                    href={fileToView.url}
                                    download={fileToView.name}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    BAIXAR ARQUIVO
                                </a>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </FormProvider >
    );
}