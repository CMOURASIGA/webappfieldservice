"use client";

import { Clock, MapPin, Calendar, Bookmark } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EventBadge } from '@/components/eventos/visualizacao/event-badge';
import Image from "next/image";
import { InfoCard } from '@/components/eventos/visualizacao/info-card';
import { AgendaSemanal } from '../agenda/agenda-reserva';
import { ProximasReservasSidebar } from './proximas-reservas-sidebar';
import { api } from '@/services/api';
import { useEffect, useState } from 'react';

interface VisualizacaoReservaProps {
    reserva: any;
}

export function VisualizacaoReserva({ reserva }: VisualizacaoReservaProps) {
    const [agenda, setAgenda] = useState<Record<string, any[]>>({});
    const [proximasReservas, setProximasReservas] = useState<any[]>([]);

    useEffect(() => {
        if (reserva?.idEspaco && reserva?.dataInicio) {
            api.get(`/reservas/ocupacao-semanal/${reserva.idEspaco}?data=${reserva.dataInicio}`)
                .then(response => {
                    setAgenda(response.data);
                })
                .catch(err => console.error("Erro ao carregar agenda", err));
        }



        const url = reserva.idEvento
            ? `/reservas/proximas?idEvento=${reserva.idEvento}`
            : reserva.idEspaco
                ? `/reservas/proximas?idEspaco=${reserva.idEspaco}`
                : '/reservas/proximas';



        api.get(url)
            .then(response => {

                const reservasFiltradas = response.data.filter((r: any) => r.id !== reserva.id);

                const mapeadas = reservasFiltradas.slice(0, 5).map((res: any) => ({
                    id: res.id,
                    dia: new Date(res.dataInicio).getDate(),
                    mes: format(new Date(res.dataInicio), 'MMM', { locale: ptBR }).toUpperCase(),
                    horario: `${format(new Date(res.dataInicio), 'HH:mm')} - ${format(new Date(res.dataFim), 'HH:mm')}`,
                    titulo: res.Evento?.nome || res.Espaco?.nome || 'Reserva',
                    solicitante: res.Solicitacao?.dadosSolicitante || 'N/A',
                    dataCompleta: format(new Date(res.dataInicio), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR }).toUpperCase(),
                    local: res.Espaco?.Local?.nome || 'CNC-RJ',
                    espaco: res.Espaco?.nome || 'N/A',
                    motivo: res.motivo
                }));
                setProximasReservas(mapeadas);
            })
            .catch(err => console.error("Erro ao carregar próximas reservas", err));

    }, [reserva]);

    if (!reserva) return null;

    // Formatar datas
    const dataInicioFormatada = reserva.dataInicio
        ? format(parseISO(reserva.dataInicio), "dd/MM/yyyy", { locale: ptBR })
        : '';
    const dataFimFormatada = reserva.dataFim
        ? format(parseISO(reserva.dataFim), "dd/MM/yyyy", { locale: ptBR })
        : '';
    const horarioInicio = reserva.dataInicio
        ? format(parseISO(reserva.dataInicio), "HH:mm", { locale: ptBR })
        : '';
    const horarioFim = reserva.dataFim
        ? format(parseISO(reserva.dataFim), "HH:mm", { locale: ptBR })
        : '';

    // Status baseado no tempo
    const getStatus = () => {
        const now = new Date();
        const start = reserva.dataInicio ? parseISO(reserva.dataInicio) : null;
        const end = reserva.dataFim ? parseISO(reserva.dataFim) : null;

        if (!start || !end) return { label: 'Pendente', variant: 'gray' as const };
        if (now > end) return { label: 'Concluída', variant: 'gray' as const };
        if (now >= start && now <= end) return { label: 'Em Execução', variant: 'green' as const };
        return { label: 'Ativa', variant: 'blue' as const };
    };

    const status = getStatus();

    return (
        <div className="flex flex-col xl:flex-row gap-8">
            {/* Conteúdo Principal */}
            <div className="flex-1 w-full min-w-0">
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="p-4 md:p-10 space-y-10">
                        {/* Banner do Título */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 via-blue-50/20 to-white p-6 md:p-12 border border-gray-100">
                            <div className="absolute right-[-5%] top-[-10%] h-[120%] w-1/2 opacity-20 pointer-events-none">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-300 to-transparent blur-3xl"></div>
                            </div>

                            <div className="relative z-10 space-y-8">
                                <div className="flex flex-wrap gap-2">
                                    <EventBadge
                                        type="status"
                                        label={status.label}
                                        variant={status.variant}
                                    />
                                    {reserva.Evento && (
                                        <EventBadge
                                            type="category"
                                            label="Vinculada a Evento"
                                            variant="blue"
                                            icon={<Bookmark className="w-3.5 h-3.5" />}
                                        />
                                    )}
                                </div>

                                <div className="space-y-6 relative">
                                    <div className="relative z-10">
                                        <h2 className="text-2xl md:text-3xl font-bold text-[#003366] leading-snug tracking-tight max-w-5xl">
                                            {reserva.Espaco?.nome || "Espaço não informado"}
                                        </h2>
                                        {reserva.Evento?.nome && (
                                            <p className="text-lg md:text-xl text-blue-600 font-semibold mt-2">
                                                Evento: {reserva.Evento.nome}
                                            </p>
                                        )}
                                        {reserva.motivo && (
                                            <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-3xl font-medium mt-4">
                                                {reserva.motivo}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Galeria de Anexos ou Placeholder */}
                        <div className="space-y-4">
                            {(() => {
                                const anexos = reserva.Evento?.AnexoEvento?.length > 0
                                    ? reserva.Evento.AnexoEvento
                                    : (reserva.Evento?.urlArquivo ? [{ urlArquivo: reserva.Evento.urlArquivo, nome: 'Anexo Principal' }] : []);

                                if (anexos.length === 0) {
                                    return null;
                                }

                                return (
                                    <div className={`grid grid-cols-1 ${anexos.length > 1 ? 'md:grid-cols-2' : ''} gap-4`}>
                                        {anexos.map((anexo: any, idx: number) => (
                                            <div key={idx} className="relative w-full aspect-video rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 group">
                                                {anexo.urlArquivo.toLowerCase().endsWith('.pdf') ? (
                                                    <div className="flex flex-col items-center justify-center h-full gap-4 p-6 bg-white">
                                                        <div className="p-4 bg-red-50 rounded-full group-hover:bg-red-100 transition-colors">
                                                            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <div className="text-center w-full">
                                                            <p className="text-sm font-bold text-gray-700 mb-2 line-clamp-1 px-4">{anexo.nome || 'Documento PDF'}</p>
                                                            <a
                                                                href={anexo.urlArquivo}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-4 py-2 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors inline-block shadow-sm"
                                                            >
                                                                VISUALIZAR
                                                            </a>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Image
                                                            src={anexo.urlArquivo}
                                                            alt={anexo.nome || "Imagem do Evento"}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                            unoptimized
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                                        {anexo.nome && (
                                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                <p className="text-white text-sm font-medium truncate">{anexo.nome}</p>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Grid de Informações */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoCard
                                icon={<Calendar />}
                                label="Período da Reserva"
                                value={`${dataInicioFormatada} até ${dataFimFormatada}`}
                            />
                            <InfoCard
                                icon={<Clock />}
                                label="Horário"
                                value={`${horarioInicio} às ${horarioFim}`}
                            />
                            <InfoCard
                                icon={<MapPin />}
                                label="Localização"
                                value={reserva.Espaco?.Local?.nome || 'Não informado'}
                                sublabel={reserva.Espaco?.Local?.endereco}
                            />
                        </div>

                        {/* Mapa de Ocupação Semanal */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-extrabold text-blue-400 uppercase tracking-[0.2em] px-2">
                                Ocupação Semanal do Espaço
                            </h3>
                            <AgendaSemanal
                                reserva={reserva}
                                agenda={agenda}
                                dataReferencia={reserva.dataInicio}
                                dataInicioAtual={reserva.dataInicio}
                                dataFimAtual={reserva.dataFim}
                                verificarConflito={() => { }} // Função vazia pois é apenas visualização
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-full xl:w-96 flex-shrink-0">
                <ProximasReservasSidebar reservas={proximasReservas} />
            </div>
        </div>
    );
}
