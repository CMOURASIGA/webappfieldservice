import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, FileSearch, FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Document } from "../types";
import { getDocumentStatus } from "../utils/documentStatus";

type ActionMetric = {
  label: string;
  value: number;
  description: string;
  href: string;
  variant: "danger" | "warning" | "attention" | "info" | "neutral";
  icon: React.ElementType;
};

type QuickAction = {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  featured?: boolean;
};

export const Documentos = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    setDocuments((storageService.get("gsi_documents") || []).filter((document: Document) => document.active !== false));
  }, []);

  const metrics = useMemo<ActionMetric[]>(() => {
    const criticos = documents.filter((document) => getDocumentStatus(document) === "Crítico").length;
    const vencidos = documents.filter((document) => getDocumentStatus(document) === "Vencido").length;
    const atencao = documents.filter((document) => getDocumentStatus(document) === "Atenção").length;
    const semAnexo = documents.filter((document) => !(document.attachments && document.attachments.length > 0)).length;

    return [
      {
        label: "Documentos críticos",
        value: criticos,
        description: "Exigem atuação imediata da operação.",
        href: "/documentos/verificar?status=Críticos",
        variant: "danger",
        icon: AlertTriangle,
      },
      {
        label: "Documentos vencidos",
        value: vencidos,
        description: "Pendências já fora do prazo.",
        href: "/documentos/verificar?status=Vencidos",
        variant: "warning",
        icon: CalendarDays,
      },
      {
        label: "Atenção próximos 30 dias",
        value: atencao,
        description: "Antecipe regularizações e renovações.",
        href: "/documentos/verificar?status=Atenção",
        variant: "attention",
        icon: CalendarDays,
      },
      {
        label: "Sem anexo",
        value: semAnexo,
        description: "Cadastros sem evidência anexada.",
        href: "/documentos/verificar?status=Falta%20Anexo",
        variant: "neutral",
        icon: FileText,
      },
    ];
  }, [documents]);

  const quickActions = useMemo<QuickAction[]>(
    () => [
      {
        label: "Novo documento",
        description: "Cadastrar uma nova licença, laudo, ART ou certificado.",
        href: "/documentos/novo",
        icon: Plus,
        featured: true,
      },
      {
        label: "Verificar documentos",
        description: "Consultar lista completa, filtros e status regulatórios.",
        href: "/documentos/verificar",
        icon: FileSearch,
      },
      {
        label: "Consultar vencimentos",
        description: "Abrir documentos vencidos, críticos e em atenção.",
        href: "/documentos/verificar?status=Vencimentos",
        icon: CalendarDays,
      },
    ],
    [],
  );

  return (
    <div className="service-dashboard">
      <header className="service-dashboard__header">
        <h1>Documentação Regulatória</h1>
        <p>Acompanhe licenças, laudos, ARTs e certificados com foco no que exige ação.</p>
      </header>

      <section aria-label="Pendências documentais">
        <h2 className="service-dashboard__section-title">O que precisa de ação</h2>
        <div className="service-metrics">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <button
                type="button"
                key={metric.label}
                onClick={() => navigate(metric.href)}
                className={`service-metric service-metric--${metric.variant}`}
              >
                <span className="service-metric__top">
                  <span className="service-metric__icon">
                    <Icon size={20} />
                  </span>
                  <strong>{metric.value}</strong>
                </span>
                <span className="service-metric__label">{metric.label}</span>
                <span className="service-metric__description">{metric.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-label="Ações rápidas">
        <h2 className="service-dashboard__section-title">Ações rápidas</h2>
        <div className="service-action-grid">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.href)}
                className={action.featured ? "service-action-card service-action-card--primary" : "service-action-card"}
              >
                <div className="service-action-card__content">
                  <span className={action.featured ? "service-action-card__icon service-action-card__icon--primary" : "service-action-card__icon"}>
                    <Icon size={18} />
                  </span>
                  <span className="service-action-card__text">
                    <span className="service-action-card__title">{action.label}</span>
                    <span className="service-action-card__description">{action.description}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
