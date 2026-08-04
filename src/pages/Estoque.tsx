import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRightLeft, Boxes, PackageOpen, Plus, Search, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { StockMaterial, StockRequest } from "../types";
import { getPendingStockRequests, reconcileMaterial } from "../utils/stock";

type ActionMetric = {
  label: string;
  value: number;
  description: string;
  href: string;
  variant: "danger" | "warning" | "attention" | "info" | "neutral";
  icon: React.ElementType;
};

export const Estoque = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<StockMaterial[]>([]);
  const [requests, setRequests] = useState<StockRequest[]>([]);

  useEffect(() => {
    setMaterials(
      (storageService.get("gsi_stock_materials") || [])
        .filter((material: StockMaterial) => material.active !== false)
        .map(reconcileMaterial),
    );
    setRequests(storageService.get("gsi_stock_requests") || []);
  }, []);

  const metrics = useMemo<ActionMetric[]>(
    () => [
      {
        label: "Reposição necessária",
        value: materials.filter((material) => material.physicalBalance - material.reservedBalance <= material.minStock).length,
        description: "Itens que já pedem abastecimento para evitar ruptura.",
        href: "/estoque/verificar?status=Reposição",
        variant: "attention",
        icon: ShoppingCart,
      },
      {
        label: "Abaixo do mínimo",
        value: materials.filter((material) => material.physicalBalance < material.minStock).length,
        description: "Materiais com saldo físico abaixo do nível mínimo.",
        href: "/estoque/verificar?status=Abaixo%20do%20mínimo",
        variant: "danger",
        icon: AlertTriangle,
      },
      {
        label: "Reserva maior que saldo",
        value: materials.filter((material) => material.reservedBalance > material.physicalBalance).length,
        description: "Reservas acima do disponível exigem ajuste imediato.",
        href: "/estoque/verificar?status=Reserva%20maior",
        variant: "warning",
        icon: Boxes,
      },
      {
        label: "Solicitações pendentes",
        value: getPendingStockRequests(requests).length,
        description: "Demandas aguardando análise ou atendimento do estoque.",
        href: "/estoque/fila",
        variant: "info",
        icon: PackageOpen,
      },
    ],
    [materials, requests],
  );

  const quickActions = [
    {
      label: "Novo material",
      description: "Cadastrar um novo item no estoque.",
      icon: Plus,
      featured: true,
      onClick: () => navigate("/estoque/materiais/novo"),
    },
    {
      label: "Verificar estoque",
      description: "Consultar saldos, filtros e detalhes dos materiais.",
      icon: Search,
      onClick: () => navigate("/estoque/verificar"),
    },
    {
      label: "Registrar entrada",
      description: "Lancar recebimento e atualizacao de saldo.",
      icon: ArrowRightLeft,
      onClick: () => navigate("/estoque/movimentacoes/nova?tipo=Entrada"),
    },
    {
      label: "Registrar saida",
      description: "Baixar consumo, retirada ou transferencia.",
      icon: ArrowRightLeft,
      onClick: () => navigate("/estoque/movimentacoes/nova?tipo=Saida"),
    },
    {
      label: "Solicitacoes",
      description: "Acompanhar fila e necessidades do estoque.",
      icon: ShoppingCart,
      onClick: () => navigate("/estoque/fila"),
    },
  ];

  const supportRoutines = [
    {
      label: "Solicitar material",
      description: "Registrar uma nova necessidade de material.",
      icon: PackageOpen,
      onClick: () => navigate("/estoque/solicitacoes/nova"),
    },
    {
      label: "Movimentacoes",
      description: "Consultar entradas, saidas e historico.",
      icon: Search,
      onClick: () => navigate("/estoque/movimentacoes"),
    },
  ];

  return (
    <div className="service-dashboard">
      <header className="service-dashboard__header">
        <h1>Gestão de Estoque</h1>
        <p>Controle materiais, movimentações e necessidades de reposição da operação.</p>
      </header>

      <section aria-label="Pendencias do estoque">
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

      <section aria-label="Acoes rapidas">
        <h2 className="service-dashboard__section-title">Ações rápidas</h2>
        <div className="service-action-grid">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.label}
                type="button"
                className={action.featured ? "service-action-card service-action-card--primary" : "service-action-card"}
                onClick={action.onClick}
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

      <section aria-label="Cadastros e rotinas de apoio">
        <h2 className="service-dashboard__section-title">Cadastros de apoio</h2>
        <div className="service-support-grid">
          {supportRoutines.map((routine) => {
            const Icon = routine.icon;

            return (
              <button
                key={routine.label}
                type="button"
                className="service-support-card"
                onClick={routine.onClick}
              >
                <span className="service-support-card__icon">
                  <Icon size={18} />
                </span>
                <span className="service-support-card__title">{routine.label}</span>
                <span className="service-support-card__description">{routine.description}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
