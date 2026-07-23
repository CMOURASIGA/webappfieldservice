import React, { useEffect, useState } from "react";
import { ArrowRightLeft, PackageOpen, Plus, Search, ShoppingCart } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
} from "@cnc-ti/layout-basic";
import { Badge } from "../components/ui/Badge";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { CardFooterActions } from "../components/ui/CardFooterActions";
import { storageService } from "../services/storageService";
import { StockMaterial, StockRequest, Unit } from "../types";
import { MovimentacaoModal } from "./estoque/MovimentacaoModal";
import { MovimentacoesHistorico } from "./estoque/MovimentacoesHistorico";
import { NovaSolicitacaoModal } from "./estoque/NovaSolicitacaoModal";
import { NovoMaterialModal } from "./estoque/NovoMaterialModal";
import { getPendingStockRequests, getStockStatus, reconcileMaterial } from "../utils/stock";
import { MetricButton, OperationalPageHeader } from "../components/ui/OperationalPage";

export const Estoque = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<StockMaterial[]>([]);
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchParams] = useSearchParams();
  const initialStatusFilter = searchParams.get("status") || "Todos";
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [showNovoMaterial, setShowNovoMaterial] = useState(false);
  const [showMovimentacao, setShowMovimentacao] = useState(false);
  const [showSolicitacao, setShowSolicitacao] = useState(false);
  const [movimentacaoType, setMovimentacaoType] = useState<"Entrada" | "Saída" | "Ajuste">("Entrada");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | undefined>();

  const loadData = () => {
    setMaterials((storageService.get("gsi_stock_materials") || []).map(reconcileMaterial));
    setRequests(storageService.get("gsi_stock_requests") || []);
    setUnits(storageService.get("gsi_units") || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getUnitName = (id: string) => units.find((unit) => unit.id === id)?.name || id;

  const metrics = {
    total: materials.length,
    reposicaoNecessaria: materials.filter((material) => (material.physicalBalance - material.reservedBalance) <= material.minStock).length,
    abaixoMinimo: materials.filter((material) => material.physicalBalance < material.minStock).length,
    reservaMaior: materials.filter((material) => material.reservedBalance > material.physicalBalance).length,
    solicitacoesPendentes: getPendingStockRequests(requests).length,
  };

  const filteredMaterials = materials.filter((material) => {
    if (statusFilter === "Todos") return true;
    if (statusFilter === "Reposição") return (material.physicalBalance - material.reservedBalance) <= material.minStock;
    if (statusFilter === "Abaixo Minimo") return material.physicalBalance < material.minStock;
    if (statusFilter === "Reserva Maior") return material.reservedBalance > material.physicalBalance;
    return true;
  });

  return (
    <div className="space-y-6">
      <OperationalPageHeader
        title="Gestão de Estoque"
        description="Controle de materiais, movimentações e necessidades de reposição."
        backTo="/"
        actions={
          <>
          <Button variant="outline" className="gap-2" onClick={() => { setMovimentacaoType("Entrada"); setShowMovimentacao(true); }}>
            <ArrowRightLeft className="w-4 h-4" /> Registrar Entrada
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => { setMovimentacaoType("Saída"); setShowMovimentacao(true); }}>
            <ArrowRightLeft className="w-4 h-4" /> Registrar Saída
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => { setSelectedMaterialId(undefined); setShowSolicitacao(true); }}>
            <PackageOpen className="w-4 h-4" /> Solicitar Material
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/estoque/movimentacoes")}>
            <Search className="w-4 h-4" /> Consultar Movimentações
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/estoque/fila")}>
            <ShoppingCart className="w-4 h-4" /> Solicitações
          </Button>
          <Button variant="create" className="gap-2" onClick={() => setShowNovoMaterial(true)}>
            <Plus className="w-4 h-4" /> Novo Material
          </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <MetricButton label="Total de Itens" value={metrics.total} active={statusFilter === "Todos"} onClick={() => setStatusFilter("Todos")} />
        <MetricButton label="Reposição Necessária" value={metrics.reposicaoNecessaria} active={statusFilter === "Reposição"} valueClassName="text-orange-700" onClick={() => setStatusFilter("Reposição")} />
        <MetricButton label="Abaixo do Mínimo" value={metrics.abaixoMinimo} active={statusFilter === "Abaixo Minimo"} valueClassName="text-red-700" onClick={() => setStatusFilter("Abaixo Minimo")} />
        <MetricButton label="Reserva maior que saldo" value={metrics.reservaMaior} active={statusFilter === "Reserva Maior"} valueClassName="text-red-700" onClick={() => setStatusFilter("Reserva Maior")} />
        <MetricButton label="Solicitações Pendentes" value={metrics.solicitacoesPendentes} onClick={() => navigate("/estoque/fila")} />
      </div>

      {statusFilter !== "Todos" && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Filtro aplicado:</span>
          <Badge variant="default" className="flex items-center gap-1 border-brand-200 bg-brand-50 text-brand-700">
            {statusFilter}
            <button onClick={() => setStatusFilter("Todos")} className="ml-1 font-bold hover:text-brand-900">x</button>
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredMaterials.map((material) => {
          const available = material.physicalBalance - material.reservedBalance;
          const status = getStockStatus(material);

          return (
            <Card key={material.id} className="operational-card flex flex-col">
              <CardContent className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div className="min-w-0 flex-1 pr-2">
                    <h3 className="truncate font-semibold text-slate-900" title={material.name}>{material.name}</h3>
                    <p className="mt-0.5 font-mono text-xs text-slate-500">{material.code}</p>
                  </div>
                  {status !== "Normal" && (
                    <Badge
                      variant="default"
                      className={
                        status === "Sem saldo"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : status === "Crítico"
                            ? "border-orange-200 bg-orange-50 text-orange-700"
                            : "border-yellow-200 bg-yellow-50 text-yellow-700"
                      }
                    >
                      {status}
                    </Badge>
                  )}
                </div>

                <div className="mb-3 truncate text-xs text-slate-500" title={getUnitName(material.unitId)}>
                  Unidade: {getUnitName(material.unitId)}
                </div>

                <div className="mb-4 grid grid-cols-3 gap-2 rounded-md border border-slate-100 bg-slate-50 p-2">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Fisico</p>
                    <p className="font-semibold text-slate-700">{material.physicalBalance}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Reserva</p>
                    <p className={`font-semibold ${material.reservedBalance > material.physicalBalance ? "text-red-600" : "text-slate-700"}`}>{material.reservedBalance}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Disponivel</p>
                    <p className={`font-semibold ${available <= 0 ? "text-red-600" : "text-green-600"}`}>{available}</p>
                  </div>
                </div>

                <div className="mb-4 flex justify-between text-xs text-slate-500">
                  <span>Minimo: {material.minStock}</span>
                  <span>Ideal: {material.idealStock || 0}</span>
                </div>
              </CardContent>

              <CardFooter className="mt-3 border-t border-slate-100 px-4 pb-4 pt-3">
                <CardFooterActions
                  onView={() => navigate(`/estoque/movimentacoes?materialId=${material.id}`)}
                  viewLabel="Histórico"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      setSelectedMaterialId(material.id);
                      setShowSolicitacao(true);
                    }}
                  >
                    Solicitar
                  </Button>
                </CardFooterActions>
              </CardFooter>
            </Card>
          );
        })}

        {filteredMaterials.length === 0 && (
          <div className="col-span-full rounded-lg border-2 border-dashed border-slate-200 py-12 text-center">
            <p className="text-slate-500">Nenhum material encontrado para o filtro atual.</p>
          </div>
        )}
      </div>

      <NovoMaterialModal open={showNovoMaterial} onOpenChange={setShowNovoMaterial} onSuccess={loadData} />
      <MovimentacaoModal initialType={movimentacaoType} open={showMovimentacao} onOpenChange={setShowMovimentacao} onSuccess={loadData} />
      <NovaSolicitacaoModal open={showSolicitacao} onOpenChange={setShowSolicitacao} onSuccess={loadData} initialMaterialId={selectedMaterialId} />
    </div>
  );
};
