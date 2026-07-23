import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ChevronLeft,
  Clock,
  ExternalLink,
  Link as LinkIcon,
  Mail,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EventBadge } from "./event-badge";

interface ProximoEvento {
  id: number;
  dia: number;
  mes: string;
  horario: string;
  titulo: string;
  tematica?: string;

  solicitante?: string;
  dataCompleta?: string;
  local?: string;
  espaco?: string;
  setor?: string;
  resumo?: string;
  badges?: Array<{
    label: string;
    variant: "blue" | "green" | "orange" | "gray" | "yellow";
  }>;
}

interface ProximosEventosSidebarProps {
  eventos: ProximoEvento[];
  currentEventTitle?: string;
  currentEventTheme?: string;
  currentEventId?: number | string;
}

export function ProximosEventosSidebar({
  eventos,
  currentEventTheme,
  currentEventTitle,
  currentEventId,
}: ProximosEventosSidebarProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const selectedEvento = eventos.find((e) => e.id === selectedId);

  const handleTogglePreview = (id: number) => {
    setSelectedId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (selectedEvento) {
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
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Badges ... (rest remains same) */}
        <div className="flex flex-wrap gap-2">
          {selectedEvento.badges?.map((badge, idx) => (
            <EventBadge
              key={idx}
              label={badge.label}
              variant={badge.variant}
              className="text-[10px] px-4 py-1.5"
            />
          ))}
        </div>

        {/* Título */}
        <div className="relative pb-4">
          <h2 className="text-xl font-bold text-[#003366] leading-tight tracking-tight">
            {selectedEvento.titulo}
          </h2>
          <div className="absolute bottom-0 left-0 w-12 h-1 bg-[#D4C3A3]"></div>
        </div>

        {/* Detalhes Grid */}
        <div className="space-y-6">
          <DetailRow label="SOLICITANTE:" value={selectedEvento.solicitante} />
          <DetailRow label="DATA:" value={selectedEvento.dataCompleta} />
          <DetailRow label="HORA:" value={selectedEvento.horario} />
          <DetailRow label="LOCAL:" value={selectedEvento.local} />
          <DetailRow label="ESPAÇO:" value={selectedEvento.espaco} />
          <DetailRow label="SETOR:" value={selectedEvento.setor} />
        </div>

        {/* Resumo */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] mt-4">
          <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">
            Resumo do Evento:
          </h3>
          <p className="text-gray-500 italic text-sm leading-relaxed font-medium">
            &ldquo;
            {selectedEvento.resumo ||
              "Nenhuma descrição detalhada disponível para este evento."}
            &rdquo;
          </p>
        </div>

        {/* Botão Ação e Link */}
        <div className="space-y-4">
          <Link
            href={`/eventos/visualizar/${selectedEvento.id}`}
            className="bg-[#004A8D] text-white rounded-full py-3.5 px-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#003366] transition-all shadow-lg shadow-blue-900/10 active:scale-[0.98]"
          >
            Ver Link do Evento
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Link Publico removed */}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-[10px] sm:text-xs font-extrabold text-[#003366] uppercase tracking-wider flex items-center gap-2">
            Mostrando os próximos {eventos.length} eventos
          </h3>
          {currentEventTheme && (
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {currentEventTheme}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
            isCollapsed
              ? "bg-orange-50 text-[#FF6B35]"
              : "bg-gray-50 text-gray-400 hover:bg-gray-100",
          )}
          title={isCollapsed ? "Mostrar Lista" : "Esconder Lista"}
        >
          <svg
            className={cn(
              "w-4 h-4 transition-transform duration-300",
              isCollapsed && "rotate-180",
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isCollapsed ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <div className="mt-8 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="mb-6">
            <a
              href="#"
              className="inline-flex items-center gap-2 text-[10px] text-gray-400 hover:text-gray-600 uppercase tracking-widest font-bold transition-colors group"
            >
              <span className="w-4 h-[1px] bg-gray-300 group-hover:w-6 transition-all"></span>
              Cronograma Completo
            </a>
          </div>

          <div className="space-y-6">
            {eventos.map((evento) => (
              <button
                key={evento.id}
                onClick={() => handleTogglePreview(evento.id)}
                className="flex w-full text-left gap-4 pb-0 group cursor-pointer decoration-transparent outline-none"
              >
                <div className="flex flex-col items-center justify-center bg-white border border-gray-100 shadow-sm rounded-xl p-3 min-w-[64px] h-[72px] group-hover:border-blue-200 transition-transform group-hover:scale-105 active:scale-95 duration-200">
                  <span className="text-2xl font-black text-[#003366] leading-none">
                    {evento.dia}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">
                    {evento.mes}
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-1.5 py-0.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <Clock className="w-3 h-3 text-orange-400" />
                    <span>{evento.horario}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#003366] line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                    {evento.titulo}
                  </h4>
                  <div className="mt-1 flex items-center gap-2">
                    {evento.tematica && (
                      <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black text-gray-500 bg-gray-100 uppercase tracking-wider">
                        {evento.tematica}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 font-bold">
                      @ CNC-RJ
                    </span>
                  </div>
                </div>
              </button>
            ))}
            {/* <div className="flex-shrink-0 w-full sm:w-auto">
              <ShareButton title={currentEventTitle || 'Evento'} eventoId={currentEventId || 0} />
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
}

// helpers for sharing
function buildShareData(title: string, eventoId?: number | string) {
  const url = eventoId
    ? `${window.location.origin}/eventos/visualizar/${eventoId}`
    : window.location.href;
  const message = `Veja esse evento: ${title} - ${url}`;
  return { url, message };
}

export function ShareButton({
  title,
  eventoId,
}: {
  title: string;
  eventoId?: number | string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { url, message } = buildShareData(title, eventoId);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copiado para a área de transferência");
    });
  }
  function shareEmail() {
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
  }
  function shareExternal() {
    if (navigator.share) {
      navigator.share({ title, text: message, url }).catch(() => {
        alert("Falha ao abrir o compartilhamento nativo");
      });
    } else {
      alert("Compartilhamento externo não suportado neste navegador.");
    }
  }
  function shareWhatsApp() {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20 active:scale-[0.98] group"
      >
        <Share2 className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-widest">
          Compartilhar
        </span>
      </button>
      {menuOpen && (
        <div
          style={{ zIndex: 10 }}
          className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-index-50 animate-in fade-in zoom-in-95 duration-200"
        >
          <button
            onClick={copyLink}
            className="flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-gray-50 transition-colors text-sm"
          >
            <LinkIcon className="w-4 h-4 text-gray-600" />
            Copiar link
          </button>
          <button
            onClick={shareEmail}
            className="flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-gray-50 transition-colors text-sm"
          >
            <Mail className="w-4 h-4 text-gray-600" />
            Compartilhar por e-mail
          </button>
          <button
            onClick={shareExternal}
            className="flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-gray-50 transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4 text-gray-600" />
            Compartilhar externamente
          </button>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-gray-50 transition-colors text-sm"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 text-green-500"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between items-center border-b border-gray-50 pb-4">
      <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.1em]">
        {label}
      </span>
      <span className="text-xs font-black text-[#003366] capitalize text-right max-w-[180px] break-words">
        {value || "---"}
      </span>
    </div>
  );
}
