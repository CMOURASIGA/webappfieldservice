"use client";

import { Tabs, TabsList, TabsTrigger } from "@cnc-ti/layout-basic";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Building2, Calendar, Clock, MapPin, Users, Video } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { AttendanceCard } from "./visualizacao/attendance-card";
import { EventBadge } from "./visualizacao/event-badge";
import { InfoCard } from "./visualizacao/info-card";
import {
  ProximosEventosSidebar,
  ShareButton,
} from "./visualizacao/proximos-eventos-sidebar";

interface VisualizacaoEventoProps {
  evento: Record<string, any>;
  proximosEventos?: Record<string, any>[];
  isPublic?: boolean;
}

import { getAllDominios } from "@/services/dominios/dominios.service";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ButtonBack } from "@/components/layouts/ui/buttons/button-back/button-back";

export function VisualizacaoEvento({
  evento,
  proximosEventos = [],
  isPublic = false,
}: VisualizacaoEventoProps) {
  const { data: session } = useSession();
  const isAuthenticated = !!session;
  const [activeTab, setActiveTab] = useState<"main" | "details">("main");

  const [fileToView, setFileToView] = useState<{
    url: string;
    name: string;
    type: "image" | "pdf" | "text" | "other";
    textContent?: string;
  } | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const handleViewFile = async (file: any) => {
    const fileUrl =
      file.id && file.id !== "legacy"
        ? `${process.env.NEXT_PUBLIC_API_URL}/eventos/download/${file.id}`
        : file.urlArquivo;

    let url = fileUrl;
    let type: "image" | "pdf" | "text" | "other" = "other";
    let textContent = "";

    setIsLoadingFile(true);
    try {
      const res = await fetch(fileUrl);
      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("text/plain")) {
          textContent = await res.text();
          type = "text";
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

    const name = file.nome || "Anexo";
    const extension = name.split(".").pop()?.toLowerCase();

    // Preserve text type if we already detected it via content-type headers
    if (type !== "text") {
      if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
        type = "image";
      } else if (extension === "pdf") {
        type = "pdf";
      }
    }

    setFileToView({ url, name, type, textContent });
  };

  const { data: options } = useQuery({
    queryKey: ["dominios"],
    queryFn: () => getAllDominios(),
  });

  const ticketId = evento.Solicitacao?.idTicket;

  const handleTabChange = (value: string) => {
    setActiveTab(value as "main" | "details");
  };

  // Calcular dias restantes
  const diasRestantes = evento.dataInicio
    ? differenceInDays(new Date(evento.dataInicio), new Date())
    : null;

  // Formatar datas
  const dataInicioFormatada = evento.dataInicio
    ? format(new Date(evento.dataInicio), "dd/MM/yyyy", { locale: ptBR })
    : "";
  const dataFimFormatada = evento.dataFim
    ? format(new Date(evento.dataFim), "dd/MM/yyyy", { locale: ptBR })
    : "";
  const horarioInicio = evento.dataInicio
    ? format(new Date(evento.dataInicio), "HH:mm", { locale: ptBR })
    : "";
  const horarioFim = evento.dataFim
    ? format(new Date(evento.dataFim), "HH:mm", { locale: ptBR })
    : "";

  // Mapear próximos eventos
  const proximosEventosMapeados = proximosEventos.slice(0, 5).map((ev) => ({
    id: ev.id,
    dia: new Date(ev.dataInicio).getDate(),
    mes: format(new Date(ev.dataInicio), "MMM", { locale: ptBR }).toUpperCase(),
    horario: `${format(new Date(ev.dataInicio), "HH:mm")} - ${format(new Date(ev.dataFim), "HH:mm")}`,
    titulo: ev.nome,
    tematica: ev.tematicas?.[0]?.nome || ev.Categoria?.nome,
    // Novos campos para o preview
    solicitante: ev.solicitante || ev.Demandante?.nome || "N/A",
    dataCompleta: format(
      new Date(ev.dataInicio),
      "EEEE, dd 'de' MMMM 'de' yyyy",
      { locale: ptBR },
    ),
    local: ev.localExterno || ev.Espaco?.Local?.nome || "CNC-RJ",
    espaco: ev.Espaco?.nome || "N/A",
    setor: ev.setor || "GEV",
    resumo: ev.descricao || "",
    badges: [
      { label: ev.Categoria?.nome || "EVENTO", variant: "gray" as const },
      { label: ev.Tipo?.nome || "ECONOMIA", variant: "gray" as const },
      { label: ev.NivelAssessoria ? `Complexidade: N${ev.NivelAssessoria.nivel}` : "Não calculado", variant: "gray" as const },
    ].filter((b) => b.label),
  }));

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* Conteúdo Principal */}
      <div className="flex-1 w-full min-w-0">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {/* Abas - Exibir apenas se autenticado (Organizador) */}
          {isAuthenticated && (
            <div className="flex border-b bg-gray-50/50 px-6 pt-6 gap-4">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="overflow-scroll lg:overflow-hidden">
                  <TabsTrigger
                    value="main"
                    disabled={activeTab === "main"}
                    className={
                      activeTab === "main"
                        ? "cursor-not-allowed opacity-60"
                        : ""
                    }
                  >
                    Informações Gerais
                  </TabsTrigger>
                  <TabsTrigger
                    value="details"
                    disabled={activeTab === "details"}
                    className={
                      activeTab === "details"
                        ? "cursor-not-allowed opacity-60"
                        : ""
                    }
                  >
                    Detalhes & Planejamento
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Conteúdo das Abas */}
          <div className="p-4 md:p-10">
            {activeTab === "main" && (
              <div className="space-y-10">
                {/* Banner do Título */}
                <div className="relative rounded-3xl bg-gradient-to-br from-gray-50 to-white p-6 md:p-12 border border-gray-100">
                  <div className="relative z-10 space-y-8">
                    {/* Badges and Share Button Row */}
                    <div className="flex flex-wrap items-center gap-2 justify-between">
                      <div className="flex flex-wrap gap-2">
                        {/* Prioritize Tematica (Theme) over Category */}
                        {evento.tematicas && evento.tematicas.length > 0 ? (
                          evento.tematicas.map((tematica: any) => (
                            <EventBadge
                              key={tematica.id || tematica.nome}
                              label={tematica.nome}
                              variant="gray"
                              className="capitalize"
                            />
                          ))
                        ) : evento.Categoria?.nome ? (
                          <EventBadge
                            label={evento.Categoria.nome}
                            variant="gray"
                            className="capitalize"
                          />
                        ) : null}

                        {diasRestantes !== null && diasRestantes > 0 && (
                          <EventBadge
                            label={`Faltam ${diasRestantes} dias`}
                            variant="gray"
                            icon={
                              <Calendar className="w-3.5 h-3.5 text-[#FF6B35]" />
                            }
                          />
                        )}
                        {!!evento.idNumeroParticipantes && (
                          <EventBadge
                            type="info"
                            label={`${options?.numeroParticipantes?.find((o) => o.value == evento.idNumeroParticipantes)?.label || evento.idNumeroParticipantes} participantes`}
                            variant="gray"
                            icon={
                              <Users className="w-3.5 h-3.5 text-blue-500" />
                            }
                          />
                        )}
                        {(evento.Situacao?.nome || evento.status || evento.estado) && (
                          <EventBadge
                            label={evento.Situacao?.nome || evento.status || evento.estado}
                            variant="gray"
                            className="capitalize font-bold"
                          />
                        )}
                        {evento.NivelAssessoria && (
                          <EventBadge
                            label={`Complexidade: N${evento.NivelAssessoria.nivel}`}
                            variant="gray"
                            className="uppercase font-bold text-blue-700 bg-blue-50"
                          />
                        )}
                      </div>
                    </div>

                    {/* Título e Descrição */}
                    <div className="space-y-6 relative flex flex-col md:flex-row md:justify-between">
                      <div className="relative z-10 min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                          {isPublic ? (
                            <div className="flex items-center gap-3 md:gap-4">
                              <ButtonBack
                                gateFromAgenda
                                className="flex-shrink-0"
                              />
                              <h2 className="text-2xl md:text-3xl font-bold text-[#003366] leading-snug tracking-tight max-w-5xl min-w-0 flex-1">
                                {evento.nome}
                              </h2>
                            </div>
                          ) : (
                            <h2 className="text-2xl md:text-3xl font-bold text-[#003366] leading-snug tracking-tight max-w-5xl">
                              {evento.nome}
                            </h2>
                          )}
                          {evento.descricao && (
                            <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-3xl font-medium mt-4">
                              {evento.descricao}
                            </p>
                          )}
                          {/* Share button — mobile only, immediately after description */}
                          <div className="mt-4 md:hidden">
                            <ShareButton title={evento.nome || "Evento CNC"} />
                          </div>
                        </div>
                      </div>
                      <div className="hidden md:block mt-8 pt-6 border-t border-gray-50">
                        <ShareButton title={evento.nome || "Evento CNC"} />
                      </div>
                    </div>

                    {/* Galeria de Anexos */}
                    {/* <div className="space-y-4">
                      {(() => {
                        const anexos = evento.AnexoEvento?.length > 0
                          ? evento.AnexoEvento
                          : (evento.urlArquivo ? [{ urlArquivo: evento.urlArquivo, nome: 'Anexo Principal' }] : []);

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
                    </div> */}
                  </div>
                </div>

                {/* Grid de Informações */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                  <InfoCard
                    icon={<Calendar />}
                    label="Data do Evento"
                    value={`${dataInicioFormatada} até ${dataFimFormatada}`}
                  />
                  <InfoCard
                    icon={<Clock />}
                    label="Grade Horária"
                    value={`${horarioInicio} às ${horarioFim}`}
                  />
                  <InfoCard
                    icon={<MapPin />}
                    label="Localização"
                    value={
                      evento.Espaco?.Local?.nome ||
                      evento.Mapa?.Local?.nome ||
                      evento.localExterno ||
                      "Não informado"
                    }
                    sublabel={
                      evento.Espaco?.Local?.endereco ||
                      evento.Mapa?.Local?.endereco
                    }
                  />
                  <InfoCard
                    icon={<Building2 />}
                    label="Espaço Reservado"
                    value={
                      evento.Espaco?.nome ||
                      evento.Mapa?.descricao ||
                      evento.Mapa?.nome ||
                      "Não informado"
                    }
                  />
                  {evento.Formato?.nome && (
                    <InfoCard
                      icon={<Video />}
                      label="Formato da Reunião"
                      value={evento.Formato.nome}
                    />
                  )}
                  {/* Complexidade */}
                  {evento.NivelAssessoria ? (
                    <InfoCard
                      icon={<Building2 />}
                      label="Complexidade"
                      value={`N${evento.NivelAssessoria.nivel}`}
                    />
                  ) : evento.Complexidade?.nome ? (
                    <InfoCard
                      icon={<Building2 />}
                      label="Complexidade"
                      value={evento.Complexidade.nome}
                    />
                  ) : null}
                </div>

                {/* Público & Atendimentos */}
                {evento.estatisticas?.length > 0 &&
                  evento.estatisticas.map((estatistica: any, idx: number) => (
                    <AttendanceCard
                      key={estatistica.plataformaOrigem || idx}
                      metrics={[
                        {
                          label: "Inscritos",
                          value: estatistica.totalInscritos ?? 0,
                          color: "#3b82f6",
                        },
                        {
                          label: "Presentes",
                          value: estatistica.presencas ?? 0,
                          color: "#3b82f6",
                        },
                        {
                          label: "Atendidos",
                          value: estatistica.atendimento ?? 0,
                          color: "#3b82f6",
                        },
                      ]}
                      source={estatistica.plataformaOrigem}
                      updatedAt=""
                      showUpdatedAt={false}
                    />
                  ))}

                {/* Mapa */}
                {/* Localização e Mapa */}
                {(() => {
                  const localData = evento.Espaco?.Local || evento.Mapa?.Local;
                  const mapLink = localData?.linkMapa;
                  const address = localData?.endereco;

                  // Simple check for embeddable Google Maps URL
                  // Standard formats:
                  // https://www.google.com/maps/embed?pb=...
                  // https://maps.google.com/maps?output=embed...
                  const isEmbeddable =
                    mapLink &&
                    (mapLink.includes("/embed") ||
                      mapLink.includes("output=embed"));

                  const searchQuery = address || localData?.nome || "";
                  const hasData = mapLink || searchQuery;

                  if (!localData || !hasData) return null;

                  const embedSrc = isEmbeddable
                    ? mapLink
                    : `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

                  const viewLink = searchQuery
                    ? `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}`
                    : mapLink;

                  return (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">
                          Localização Geográfica
                        </h3>
                        {(mapLink || address) && (
                          <a
                            href={viewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1.5 transition-colors group"
                          >
                            VER NO MAPA
                            <svg
                              className="w-4 h-4 text-[#FF6B35] group-hover:text-[#e85a2a] transition-colors"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded-3xl h-72 border border-gray-100 flex items-center justify-center relative overflow-hidden group">
                        <iframe
                          src={embedSrc}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === "details" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {evento.tematicas && evento.tematicas.length > 0 && (
                    <InfoCard
                      icon={<Building2 />}
                      label="Temática(s)"
                      value={evento.tematicas
                        .map((t: any) => t.nome)
                        .join(", ")}
                    />
                  )}
                  {evento.FaseProjeto?.nome && (
                    <InfoCard
                      icon={<Calendar />}
                      label="Fase do Projeto"
                      value={evento.FaseProjeto.nome}
                    />
                  )}
                  {evento.Tipo?.nome && (
                    <InfoCard
                      icon={<Building2 />}
                      label="Tipo"
                      value={evento.Tipo.nome}
                    />
                  )}
                  {evento.Tamanho?.nome && (
                    <InfoCard
                      icon={<Users />}
                      label="Tamanho"
                      value={evento.Tamanho.nome}
                    />
                  )}
                  {evento.Segmento?.nome && (
                    <InfoCard
                      icon={<Building2 />}
                      label="Segmento"
                      value={evento.Segmento.nome}
                    />
                  )}
                  {evento.Classificacao?.nome && (
                    <InfoCard
                      icon={<Building2 />}
                      label="Classificação"
                      value={evento.Classificacao.nome}
                    />
                  )}
                  {evento.PublicoAlvo?.nome && (
                    <InfoCard
                      icon={<Users />}
                      label="Público Alvo"
                      value={evento.PublicoAlvo.nome}
                    />
                  )}
                  {evento.SegmentoPublico?.nome && (
                    <InfoCard
                      icon={<Users />}
                      label="Segmento do Público Alvo"
                      value={evento.SegmentoPublico.nome}
                    />
                  )}
                </div>

                {evento.detalhesPlanejamento && (
                  <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                    <h3 className="text-[10px] font-extrabold text-blue-400 uppercase tracking-[0.2em] mb-4">
                      Detalhes do Planejamento
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-medium">
                      {evento.detalhesPlanejamento}
                    </p>
                  </div>
                )}

                {evento.observacao && (
                  <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                    <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] mb-4">
                      Observações Adicionais
                    </h3>
                    <p className="text-gray-500 leading-relaxed font-medium">
                      {evento.observacao}
                    </p>
                  </div>
                )}

                {/* Lista de Anexos */}
                {(() => {
                  const anexos =
                    evento.AnexoEvento?.length > 0
                      ? evento.AnexoEvento
                      : evento.urlArquivo
                        ? [
                            {
                              urlArquivo: evento.urlArquivo,
                              nome: "Arquivo Principal",
                              id: "legacy",
                            },
                          ]
                        : [];

                  if (anexos.length === 0) return null;

                  return (
                    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                      <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] mb-4">
                        Anexos do Evento
                      </h3>
                      <div className="space-y-3">
                        {anexos.map((file: any, idx: number) => (
                          <div
                            key={file.id || idx}
                            className="p-4 bg-white rounded-xl border border-gray-100 flex items-center justify-between shadow-sm"
                          >
                            <div className="flex items-center gap-4">
                              <div className="bg-blue-50 p-3 rounded-lg text-blue-500">
                                {file.nome?.toLowerCase().endsWith(".pdf") ? (
                                  <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                                  {file.nome || "Anexo"}
                                </span>
                                <span className="text-xs text-gray-400">
                                  Clique ao lado para visualizar
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleViewFile(file)}
                              disabled={isLoadingFile}
                              className="text-xs bg-blue-50 text-blue-600 font-bold px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors uppercase"
                            >
                              Visualizar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Visualização de Arquivo */}
      <Dialog
        open={!!fileToView}
        onOpenChange={(open) => !open && setFileToView(null)}
      >
        <DialogContent className="max-w-4xl w-full h-[85vh] flex flex-col p-0 overflow-hidden bg-gray-50/95 backdrop-blur-sm border-gray-200/50 shadow-2xl">
          <DialogHeader className="p-4 border-b border-gray-200/50 bg-white shadow-sm shrink-0 flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-bold text-[#003366] flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {fileToView?.name || "Visualização do Anexo"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto bg-gray-100 p-4 md:p-8 flex items-center justify-center relative">
            {isLoadingFile && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm">
                <span className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-bold text-gray-700">
                  Carregando arquivo seguro...
                </p>
              </div>
            )}
            {fileToView?.type === "image" && (
              <div className="relative w-full h-full max-h-full flex items-center justify-center">
                <img
                  src={fileToView.url}
                  alt={fileToView.name}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-sm border border-gray-200 bg-white p-2"
                />
              </div>
            )}
            {fileToView?.type === "pdf" && (
              <iframe
                src={`${fileToView.url}#toolbar=0`}
                className="w-full h-full rounded-lg shadow-sm border border-gray-200 bg-white"
                title={fileToView.name}
                onLoad={() => setIsLoadingFile(false)}
              />
            )}
            {fileToView?.type === "text" && (
              <div className="w-full h-full p-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-auto">
                <pre className="text-gray-700 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {fileToView.textContent}
                </pre>
              </div>
            )}
            {fileToView?.type === "other" && (
              <div className="text-center bg-white p-12 rounded-2xl shadow-sm border border-gray-200">
                <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Visualização não disponível
                </h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
                  Este tipo de arquivo não pode ser visualizado diretamente no
                  navegador.
                </p>
                <a
                  href={fileToView.url}
                  download={fileToView.name}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
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
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  BAIXAR ARQUIVO
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sidebar */}
      {proximosEventosMapeados.length > 0 && (
        <div className="w-full xl:w-96 flex-shrink-0">
          <ProximosEventosSidebar
            eventos={proximosEventosMapeados}
            currentEventTitle={evento.nome}
            currentEventTheme={
              evento.tematicas?.[0]?.nome &&
              !["OUTROS", "OUTRO"].includes(
                evento.tematicas[0].nome.toUpperCase(),
              )
                ? evento.tematicas[0].nome
                : undefined
            }
            currentEventId={evento.id}
          />
        </div>
      )}
    </div>
  );
}
