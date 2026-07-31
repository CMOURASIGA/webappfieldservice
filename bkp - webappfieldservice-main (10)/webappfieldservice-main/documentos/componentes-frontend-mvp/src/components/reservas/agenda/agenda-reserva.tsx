import { format, addDays, isSameDay, parseISO, areIntervalsOverlapping } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ReservaFormData } from '@/app/(private)/reservas/schema';

interface AgendaSemanalProps {
    reserva?: Partial<ReservaFormData>;
    agenda: Record<string, any[]>;
    dataReferencia: string;
    dataInicioAtual?: string;
    dataFimAtual?: string;
    reservaIdAtual?: number;
    verificarConflito: (conflito: boolean) => void
}

export function AgendaSemanal({ reserva, agenda, dataReferencia, dataInicioAtual, dataFimAtual, verificarConflito }: AgendaSemanalProps) {
    const dataRef = dataReferencia ? parseISO(dataReferencia) : new Date();
    const diasDaSemana = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(dataRef, i);
        return {
            key: format(date, 'yyyy-MM-dd'),
            label: format(date, 'dd/MM'),
            diaSemana: format(date, 'eee', { locale: ptBR }),
            isHoje: isSameDay(date, new Date())
        };
    });

    const verificarConflitoVisual = () => {
        if (!dataInicioAtual || !dataFimAtual) return false;

        const inicio = new Date(dataInicioAtual);
        const fim = new Date(dataFimAtual);

        if (isNaN(inicio.getTime()) || isNaN(fim.getTime()) || fim <= inicio) return false;

        const diasParaVerificar = [];
        let dataCursor = new Date(inicio);
        while (dataCursor.toISOString().split('T')[0] <= dataFimAtual.split('T')[0]) {
            diasParaVerificar.push(dataCursor.toISOString().split('T')[0]);
            dataCursor.setDate(dataCursor.getDate() + 1);
        }

        return diasParaVerificar.some(dia => {
            const reservasDoDia = agenda[dia] || [];

            return reservasDoDia.some(res => {
                // Ignorar a própria reserva se for uma edição
                if (reserva && res.id === reserva.id) return false;

                return areIntervalsOverlapping(
                    { start: inicio, end: fim },
                    { start: new Date(res.dataInicio), end: new Date(res.dataFim) },
                    { inclusive: false } // Se quiser que o fim de uma possa ser o início de outra, mantenha false
                );
            });
        });
    };
    function formatDateString(dateStr: string) {
        const dateForm = new Date(dateStr);
        const day = dateForm.getDate();
        const month = dateForm.getMonth() + 1;
        const year = dateForm.getFullYear();
        return new Date(`${year}-${month}-${day}`);
    }

    const temConflito = verificarConflitoVisual();
    verificarConflito(temConflito);
    const isDataValida = dataInicioAtual && dataFimAtual && new Date(dataFimAtual) > new Date(dataInicioAtual);
    return (
        <div className="mt-6 border rounded-xl overflow-hidden shadow-sm bg-white border-gray-200">
            <div className={cn(
                "p-3 text-xs font-bold uppercase tracking-wider text-center transition-all duration-500",
                temConflito ? "bg-red-600 text-white" : "text-white bg-[#1e3a8a]" // Usei sua cor primária
            )}>
                {temConflito ? "⚠️ Horário Indisponível para Reserva" : "Mapa de Ocupação Semanal"}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 divide-x divide-gray-200">
                {diasDaSemana.map((dia) => (
                    <div key={dia.key} className={cn("min-h-[160px] flex flex-col", dia.isHoje && "bg-slate-50")}>
                        {/* Cabeçalho do Dia */}
                        <div className="bg-gray-50 p-2 text-center border-b border-gray-100">
                            <span className="block text-[10px] uppercase text-gray-400 font-extrabold">{dia.diaSemana}</span>
                            <span className="text-sm font-bold text-gray-700">{dia.label}</span>
                        </div>

                        <div className="p-1.5 space-y-1.5 flex-1 relative">
                            {agenda[dia.key]?.map((res: any) => {
                                const isMinhaPropriaReserva = reserva?.id && res.id === reserva?.id;
                                return (
                                    <div key={res.id} className={cn(
                                        "border-l-2 p-1.5 rounded-sm shadow-sm",
                                        isMinhaPropriaReserva
                                            ? "bg-blue-50 border-blue-300 opacity-50" // Deixa a original clarinha
                                            : "bg-red-50 border-red-500"
                                    )}>
                                        <p className={cn("text-[10px] font-bold leading-none", isMinhaPropriaReserva ? "text-blue-700" : "text-red-700")}>
                                            {(() => {
                                                const diaKey = dia.key;
                                                const inicioDate = res.dataInicio.split('T')[0];
                                                const fimDate = res.dataFim.split('T')[0];
                                                const inicioTime = format(new Date(res.dataInicio), 'HH:mm');
                                                const fimTime = format(new Date(res.dataFim), 'HH:mm');
                                                if (inicioDate === fimDate) return `${inicioTime} - ${fimTime}`;
                                                if (diaKey === inicioDate) return `${inicioTime} - 23:59`;
                                                if (diaKey === fimDate) return `00:00 - ${fimTime}`;
                                                return '00:00 - 23:59';
                                            })()}
                                        </p>
                                        <p className={cn("text-[9px] truncate mt-0.5 uppercase", (isMinhaPropriaReserva) ? "text-blue-500" : "text-red-600")}>
                                            {isMinhaPropriaReserva ? "Horário Original" : "Ocupado"}
                                        </p>
                                    </div>
                                )
                            })}
                            {dataInicioAtual?.startsWith(dia.key) && (
                                <div className={cn(
                                    "border-l-2 p-2 rounded-sm shadow-md transition-all duration-300",
                                    !isDataValida ? "bg-gray-200 border-gray-400 text-gray-500" :
                                        temConflito ? "bg-red-600 border-red-900 text-white shadow-red-200" :
                                            "bg-green-600 border-green-800 text-white shadow-green-200" // REMOVIDO animate-pulse
                                )}
                                    style={(!temConflito && isDataValida) ? { animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 1' } : {}}
                                >
                                    <p className="text-[10px] font-bold leading-none uppercase">
                                        {!isDataValida ? "Aguardando..." : (temConflito) ? "Conflito!" : "Sua Reserva"}
                                    </p>
                                    <p className="text-[8px] mt-1 font-mono">
                                        {(() => {
                                            if (!isDataValida || !dataInicioAtual || !dataFimAtual) return "Selecione o período";

                                            const inicioISO = dataInicioAtual.split('T')[0];
                                            const fimISO = dataFimAtual.split('T')[0];

                                            // Se Início e Fim são no mesmo dia: mostra (Hora Início) - (Hora Fim)
                                            if (inicioISO === fimISO) {
                                                return `${format(new Date(dataInicioAtual), 'HH:mm')} - ${format(new Date(dataFimAtual), 'HH:mm')}`;
                                            }

                                            // Se são dias diferentes: mostra (Hora Início) - 23:59
                                            return `${format(new Date(dataInicioAtual), 'HH:mm')} - 23:59`;
                                        })()}
                                    </p>
                                </div>
                            )}
                            {(() => {
                                const isNoIntervalo = dataInicioAtual && dataFimAtual && (new Date(dia.key) >= formatDateString(dataInicioAtual) && new Date(dia.key) <= formatDateString(dataFimAtual))
                                return isNoIntervalo && (
                                    <div className={cn(
                                        "border-l-2 p-2 rounded-sm shadow-md transition-all duration-300",
                                        !isDataValida ? "bg-gray-200 border-gray-400 text-gray-500" :
                                            (temConflito && !(new Date(dia.key) >= new Date(dataFimAtual.split("T")[0]) || !Object.keys(agenda).includes(dia.key))) ? "bg-red-600 border-red-900 text-white shadow-red-200" :
                                                "bg-green-600 border-green-800 text-white shadow-green-200" // REMOVIDO animate-pulse
                                    )}
                                        style={(!temConflito && isDataValida) ? { animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 1' } : {}}
                                    >
                                        <p className="text-[10px] font-bold leading-none uppercase">
                                            {!isDataValida ? "Aguardando..." : temConflito ? (new Date(dia.key) >= new Date(dataFimAtual.split("T")[0]) || !Object.keys(agenda).includes(dia.key)) ? "Livre" : "Conflito!" : "Sua Reserva"}
                                        </p>
                                        <p className="text-[8px] mt-1 font-mono">
                                            {(() => {
                                                if (!isDataValida || !dataFimAtual) return "Selecione a data fim";

                                                const dataFimISO = dataFimAtual.split("T")[0];
                                                const dataInicioISO = dataInicioAtual?.split("T")[0];

                                                // Lógica de "Está Livre" (seguindo o padrão que você gostou no título)
                                                const isRealmenteLivre = new Date(dia.key) >= new Date(dataFimISO) && !Object.keys(agenda).includes(dia.key);

                                                if (temConflito && !isRealmenteLivre) {
                                                    return "Reservado o dia inteiro 00:00 - 23:59";
                                                }

                                                if (isRealmenteLivre) {
                                                    return "Disponível";
                                                }

                                                // Se não há conflito ou está no seu range verde:
                                                // 1. Caso seja reserva no mesmo dia
                                                if (dataInicioISO === dataFimISO) {
                                                    return `${format(new Date(dataInicioAtual!), 'HH:mm')} - ${format(new Date(dataFimAtual), 'HH:mm')}`;
                                                }

                                                // 2. Caso seja reserva de vários dias
                                                if (dia.key === dataInicioISO) return `${format(new Date(dataInicioAtual!), 'HH:mm')} - 23:59`;
                                                if (dia.key === dataFimISO) return `00:00 - ${format(new Date(dataFimAtual), 'HH:mm')}`;

                                                return "00:00 - 23:59";
                                            })()}
                                        </p>
                                    </div>
                                )
                            })()}
                            {(((!agenda[dia.key] || agenda[dia.key].length === 0) && !dataInicioAtual?.startsWith(dia.key)) && (new Date(dia.key) > new Date(dataFimAtual?.split("T")[0] || '') || Object.keys(agenda).includes(dia.key))) && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-7 pointer-events-none">
                                    <span className="text-[10px] text-green-600 font-bold uppercase rotate-[-45deg]">Livre</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}