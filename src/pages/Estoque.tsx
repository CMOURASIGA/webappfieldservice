import React, { useEffect, useState } from "react";
import { ArrowRightLeft, PackageOpen, Plus, Search, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MetricButton } from "../components/ui/OperationalPage";
import { storageService } from "../services/storageService";
import { StockMaterial, StockRequest } from "../types";
import { getPendingStockRequests, reconcileMaterial } from "../utils/stock";

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

  const metrics = {
    reposicaoNecessaria: materials.filter((material) => (material.physicalBalance - material.reservedBalance) <= material.minStock).length,
    abaixoMinimo: materials.filter((material) => material.physicalBalance < material.minStock).length,
    reservaMaior: materials.filter((material) => material.reservedBalance > material.physicalBalance).length,
    solicitacoesPendentes: getPendingStockRequests(requests).length,
  };

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricButton
            label="Reposição Necessária"
            value={metrics.reposicaoNecessaria}
            valueClassName="text-orange-700"
            onClick={() => navigate("/estoque/verificar?status=Reposição")}
          />
          <MetricButton
            label="Abaixo do Mínimo"
            value={metrics.abaixoMinimo}
            valueClassName="text-red-700"
            onClick={() => navigate("/estoque/verificar?status=Abaixo%20do%20mínimo")}
          />
          <MetricButton
            label="Reserva Maior que Saldo"
            value={metrics.reservaMaior}
            valueClassName="text-amber-700"
            onClick={() => navigate("/estoque/verificar?status=Reserva%20maior")}
          />
          <MetricButton
            label="Solicitações Pendentes"
            value={metrics.solicitacoesPendentes}
            onClick={() => navigate("/estoque/fila")}
          />
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
