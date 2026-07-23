import { useEffect, useState } from 'react';
import { getAgideskData } from '@/services/eventos.service';

interface AbaSolicitacaoProps {
    ticketId: string;
    dadosSolicitacao?: any; // Recebe os dados diretamente
}

export function AbaSolicitacao({ ticketId, dadosSolicitacao }: AbaSolicitacaoProps) {
    const data = dadosSolicitacao;

    // Removed Fetch Logic as requested
    /*
    useEffect(() => {
        // ...
    }, [ticketId]); 
    */

    if (!ticketId) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">Este evento não possui solicitação vinculada.</p>
            </div>
        );
    }





    if (!data) return <div className="p-8 text-center text-gray-500">Nenhuma informação retornada.</div>;

    // Helper to format keys for display
    const formatLabel = (key: string) => {
        const labels: Record<string, string> = {
            localExterno: 'Localização externa',
            pais: 'País',
            estado: 'Estado',
            local: 'Local',
            espaco: 'Espaço',
            dataInicio: 'Data do Evento',
            dataFim: 'Horário de Término',
            demandante: 'Informe o setor',
            solicitante: 'Solicitante',
            centroCusto: 'Centro de custo',
            email: 'e-mail',
            telefone: 'Telefone',
            titulo: 'Título do evento',
            descricao: 'Descrição',
            tematica: 'Temática',
            novaTematica: 'Outros temática',
            tipoEvento: 'Tipo de Evento',
            duracao: 'Duração do Evento',
            formato: 'Formato da reunião',
            escopo: 'Escopo de Atuação da CNC',
            orcamentoAprovado: 'Orçamento Aprovado',
            orcamento: 'Valor do Orçamento (R$)',
            tipoEspaco: 'Tipo de Espaço',
            publicoAlvo: 'Público alvo',
            numeroParticipantes: 'Número de participantes',
            servicos: 'Serviços Internos',
            contratacao: 'Pacote de Contratações',
            autoridades: 'Autoridades Convidadas',
            plataforma: 'Plataforma',
            cerimonial: 'Cerimonial',
            ativacoes: 'Ativações',
            jornada: 'Jornada do Participante',
            observacao: 'Observações Gerais',
            status: 'Status Agidesk'
        };
        return labels[key] || key.replace(/([A-Z])/g, ' $1').trim();
    };


    // Helper to format values
    const formatValue = (key: string, value: any) => {
        if (value === null || value === undefined) return '-';
        if (key === 'orcamento') {
            try {
                return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
            } catch { return String(value); }
        }

        if (key.includes('data') || key.includes('Date')) {
            try {
                return new Date(value).toLocaleDateString('pt-BR') + ' ' + new Date(value).toLocaleTimeString('pt-BR').slice(0, 5);
            } catch { return String(value); }
        }
        if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
        return String(value);
    };

    const groups = [
        {
            title: 'IDENTIFICAÇÃO DO SOLICITANTE',
            keys: ['demandante', 'solicitante', 'centroCusto', 'email', 'telefone']
        },
        {
            title: 'DADOS DO EVENTO',
            keys: ['titulo', 'descricao', 'tematica', 'novaTematica', 'tipoEvento', 'duracao', 'formato', 'escopo']
        },
        {
            title: 'DISPONIBILIDADE DO EVENTO',
            keys: ['tipoEspaco', 'localExterno', 'pais', 'estado', 'local', 'espaco', 'dataInicio', 'dataFim']
        },
        {
            title: 'INFORMAÇÕES EXTRAS',
            keys: ['autoridades', 'plataforma', 'cerimonial', 'ativacoes', 'jornada']
        },
        {
            title: 'OBSERVAÇÕES',
            keys: ['observacao']
        }
    ];

    const existingKeys = Object.keys(data);
    const usedKeys = new Set<string>();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-gradient-to-r from-blue-50 to-white p-5 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                    <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                        Solicitação de Origem
                    </h3>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-gray-900 tracking-tight">
                            #ATD-{data.idTicket || ticketId}
                        </span>
                        {data.estado && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase">
                                {String(data.estado)}
                            </span>
                        )}
                    </div>
                </div>
                <div className="hidden md:block text-right">
                    <span className="text-xs text-gray-400 font-medium">Fonte de Dados</span>
                    <p className="text-sm font-bold text-gray-600">AGIDESK</p>
                </div>
            </div>

            {groups.map((group) => {
                const groupKeys = group.keys.filter(k => existingKeys.includes(k) && data[k] !== undefined && data[k] !== null);
                if (groupKeys.length === 0) return null;

                groupKeys.forEach(k => usedKeys.add(k));

                return (
                    <div key={group.title} className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2">
                            {group.title}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {groupKeys.map((key) => {
                                const value = data[key];
                                const isCurrency = key === 'orcamento' || key === 'orcamentoAprovado';
                                return (
                                    <div key={key} className={`bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${key === 'descricao' || key === 'observacao' ? 'md:col-span-2 lg:col-span-3' : ''}`}>
                                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                                            {formatLabel(key)}
                                        </span>
                                        <span className={`block break-words leading-relaxed font-medium ${isCurrency ? 'text-green-600 font-bold' : 'text-gray-800 text-sm'}`}>
                                            {formatValue(key, value)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {(() => {
                const remainingKeys = existingKeys.filter(k =>
                    !usedKeys.has(k) &&
                    !['id', 'idTicket', 'status', 'estado'].includes(k) &&
                    !(typeof data[k] === 'object' && data[k] !== null && !(data[k] instanceof Date)) &&
                    data[k] !== undefined && data[k] !== null
                );

                if (remainingKeys.length === 0) return null;

                return (
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2">
                            OUTROS DADOS
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {remainingKeys.map((key) => {
                                const value = data[key];
                                const isCurrency = key === 'orcamento' || key === 'orcamentoAprovado';
                                return (
                                    <div key={key} className={`bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${key === 'descricao' || key === 'observacao' ? 'md:col-span-2 lg:col-span-3' : ''}`}>
                                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                                            {formatLabel(key)}
                                        </span>
                                        <span className={`block break-words leading-relaxed font-medium ${isCurrency ? 'text-green-600 font-bold' : 'text-gray-800 text-sm'}`}>
                                            {formatValue(key, value)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
