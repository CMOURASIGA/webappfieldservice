import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, ChevronLeft, ArrowRight, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProximaReserva {
  id: number;
  dia: number;
  mes: string;
  horario: string;
  titulo: string;
  solicitante?: string;
  dataCompleta?: string;
  local?: string;
  espaco?: string;
  motivo?: string;
}

interface ProximasReservasSidebarProps {
  reservas: ProximaReserva[];
}

export function ProximasReservasSidebar({ reservas }: ProximasReservasSidebarProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const selectedReserva = reservas.find(e => e.id === selectedId);

  const handleTogglePreview = (id: number) => {
    setSelectedId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (selectedReserva) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Header Preview com Voltar e Fechar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedId(null)}
            className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] hover:text-[#003366] transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para Lista
          </button>

          <button
            onClick={() => setSelectedId(null)}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-all active:scale-95"
            title="Fechar Preview"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Título */}
        <div className="relative pb-4">
          <h2 className="text-xl font-bold text-[#003366] leading-tight tracking-tight">
            {selectedReserva.titulo}
          </h2>
          <div className="absolute bottom-0 left-0 w-12 h-1 bg-[#D4C3A3]"></div>
        </div>

        {/* Detalhes Grid */}
        <div className="space-y-6">
          <DetailRow label="SOLICITANTE:" value={selectedReserva.solicitante} />
          <DetailRow label="DATA:" value={selectedReserva.dataCompleta} />
          <DetailRow label="HORA:" value={selectedReserva.horario} />
          <DetailRow label="LOCAL:" value={selectedReserva.local} />
          <DetailRow label="ESPAÇO:" value={selectedReserva.espaco} />
        </div>

        {/* Motivo */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] mt-4">
          <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">
            Motivo da Reserva:
          </h3>
          <p className="text-gray-500 italic text-sm leading-relaxed font-medium">
            &ldquo;{selectedReserva.motivo || 'Nenhum motivo informado.'}&rdquo;
          </p>
        </div>

        {/* Botão Ação e Link */}
        <div className="space-y-4">
          <button
            onClick={() => {
              router.push(`/reservas/${selectedReserva.id}`);
            }}
            className="bg-[#004A8D] text-white rounded-full py-3.5 px-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#003366] transition-all shadow-lg shadow-blue-900/10 active:scale-[0.98] w-full"
          >
            Ver Detalhes da Reserva
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-[#003366] uppercase tracking-[0.15em] flex items-center gap-2">
          Próximas Reservas
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
        </h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
            isCollapsed ? "bg-orange-50 text-orange-500" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
          )}
          title={isCollapsed ? "Mostrar Lista" : "Esconder Lista"}
        >
          <svg
            className={cn("w-4 h-4 transition-transform duration-300", isCollapsed && "rotate-180")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <div className="mt-8 animate-in fade-in slide-in-from-top-2 duration-300">

          <div className="space-y-6">
            {reservas.length === 0 ? (
              <p className="text-sm text-gray-500 font-medium text-center py-4">
                Próximas reservas não encontradas.
              </p>
            ) : (
              reservas.map((reserva) => (
                <button
                  key={reserva.id}
                  onClick={() => handleTogglePreview(reserva.id)}
                  className="flex w-full text-left gap-4 pb-0 group cursor-pointer decoration-transparent outline-none"
                >
                  <div className="flex flex-col items-center justify-center bg-white border border-gray-100 shadow-sm rounded-xl p-3 min-w-[64px] h-[72px] group-hover:border-blue-200 transition-transform group-hover:scale-105 active:scale-95 duration-200">
                    <span className="text-2xl font-black text-[#003366] leading-none">{reserva.dia}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">{reserva.mes}</span>
                  </div>

                  <div className="flex-1 flex flex-col gap-1.5 py-0.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      <Clock className="w-3 h-3 text-orange-400" />
                      <span>{reserva.horario}</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#003366] line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                      {reserva.titulo}
                    </h4>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {reserva.espaco}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}

          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between items-center border-b border-gray-50 pb-4">
      <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.1em]">{label}</span>
      <span className="text-xs font-black text-[#003366] uppercase text-right max-w-[180px] break-words">
        {value || '---'}
      </span>
    </div>
  );
}
