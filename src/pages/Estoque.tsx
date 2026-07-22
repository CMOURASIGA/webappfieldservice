import React, { useState, useEffect } from "react";
import { storageService } from "../services/storageService";
import { StockMaterial, Unit } from "../types";
import { Card, CardContent } from "../components/ui/Card";
import { Button, PageHeader, PageHeaderTitle, PageHeaderTitleContent, PageHeaderActionsContainer } from "@cnc-ti/layout-basic";
import { Badge } from "../components/ui/Badge";
import { Package, AlertTriangle, Plus, PackageOpen, Inbox, ShoppingCart, ArrowRightLeft, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getStockStatus } from "../utils/stockStatus";
import { NovoMaterialModal } from "./estoque/NovoMaterialModal";
import { MovimentacaoModal } from "./estoque/MovimentacaoModal";
import { NovaSolicitacaoModal } from "./estoque/NovaSolicitacaoModal";

export const Estoque = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<StockMaterial[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [statusFilter, setStatusFilter] = useState("Todos");

  const [showNovoMaterial, setShowNovoMaterial] = useState(false);
  const [showMovimentacao, setShowMovimentacao] = useState(false);
  const [showSolicitacao, setShowSolicitacao] = useState(false);
  const [movimentacaoType, setMovimentacaoType] = useState<"Entrada" | "Saída" | "Ajuste">("Entrada");

  const loadData = () => {
    setMaterials(storageService.get("gsi_stock_materials") || []);
    setUnits(storageService.get("gsi_units") || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getUnitName = (id: string) => units.find(u => u.id === id)?.name || id;

  // Calculos baseados na regra:
  // Saldo disponível = physicalBalance - reservedBalance
  // Reposição necessária quando availableBalance <= minStock
  
  const metrics = {
    total: materials.length,
    reposicaoNecessaria: materials.filter(m => (m.physicalBalance - m.reservedBalance) <= m.minStock).length,
    abaixoMinimo: materials.filter(m => m.physicalBalance < m.minStock).length,
    reservaMaior: materials.filter(m => m.reservedBalance > m.physicalBalance).length,
    solicitacoesPendentes: 0, // Mock
  };

  const filteredMaterials = materials.filter(m => {
    if (statusFilter === "Todos") return true;
    if (statusFilter === "Reposição") return (m.physicalBalance - m.reservedBalance) <= m.minStock;
    if (statusFilter === "Abaixo Minimo") return m.physicalBalance < m.minStock;
    if (statusFilter === "Reserva Maior") return m.reservedBalance > m.physicalBalance;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Ações Rápidas no Topo */}
      <PageHeader>
        <PageHeaderTitleContent>
          <PageHeaderTitle>Gestão de Estoque</PageHeaderTitle>
          <p className="text-sm text-slate-500">Controle materiais, movimentações e necessidades de reposição.</p>
        </PageHeaderTitleContent>
        <PageHeaderActionsContainer>
          <Button variant="outline" className="gap-2" onClick={() => { setMovimentacaoType("Entrada"); setShowMovimentacao(true); }}><ArrowRightLeft className="w-4 h-4" /> Registrar Entrada</Button>
          <Button variant="outline" className="gap-2" onClick={() => { setMovimentacaoType("Saída"); setShowMovimentacao(true); }}><ArrowRightLeft className="w-4 h-4" /> Registrar Saída</Button>
          <Button variant="outline" className="gap-2" onClick={() => setShowSolicitacao(true)}><PackageOpen className="w-4 h-4" /> Solicitar Material</Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/estoque/movimentacoes")}><Search className="w-4 h-4" /> Consultar Movimentações</Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/estoque/fila")}><ShoppingCart className="w-4 h-4" /> Solicitações</Button>
          <Button variant="create" className="gap-2" onClick={() => setShowNovoMaterial(true)}><Plus className="w-4 h-4" /> Novo Material</Button>
        </PageHeaderActionsContainer>
      </PageHeader>

      {/* Indicadores Acionáveis */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button onClick={() => setStatusFilter("Todos")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Todos" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Total de Itens</p>
          <p className="text-2xl font-bold text-slate-900">{metrics.total}</p>
        </button>
        <button onClick={() => setStatusFilter("Reposição")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Reposição" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Reposição Necessária</p>
          <p className="text-2xl font-bold text-orange-600">{metrics.reposicaoNecessaria}</p>
        </button>
        <button onClick={() => setStatusFilter("Abaixo Minimo")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Abaixo Minimo" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Abaixo do Mínimo</p>
          <p className="text-2xl font-bold text-red-600">{metrics.abaixoMinimo}</p>
        </button>
        <button onClick={() => setStatusFilter("Reserva Maior")} className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === "Reserva Maior" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"}`}>
          <p className="text-sm font-medium text-slate-600 mb-1">Reserva &gt; Disp.</p>
          <p className="text-2xl font-bold text-red-600">{metrics.reservaMaior}</p>
        </button>
      </div>

      {/* Filtros Contextuais */}
      {statusFilter !== "Todos" && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Filtro aplicado:</span>
          <Badge variant="outline" className="bg-brand-50 text-brand-700 border-brand-200 flex items-center gap-1">
            {statusFilter}
            <button onClick={() => setStatusFilter("Todos")} className="ml-1 hover:text-brand-900 font-bold">×</button>
          </Badge>
        </div>
      )}

      {/* Cards Operacionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMaterials.map(mat => {
          const disponivel = mat.physicalBalance - mat.reservedBalance;
          const status = getStockStatus(mat);
          
          return (
            <Card key={mat.id} className="hover:border-brand-300 transition-colors flex flex-col">
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-semibold text-slate-900 truncate" title={mat.name}>{mat.name}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{mat.code}</p>
                  </div>
                  {status !== "Normal" && (
                    <Badge variant="outline" className={
                      status === "Sem saldo" ? "bg-red-50 text-red-700 border-red-200" :
                      status === "Crítico" ? "bg-orange-50 text-orange-700 border-orange-200" :
                      "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }>
                      {status}
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-slate-500 mb-3 truncate" title={getUnitName(mat.unitId)}>
                  Unidade: {getUnitName(mat.unitId)}
                </div>
                
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-md border border-slate-100 mb-4">
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Físico</p>
                    <p className="font-semibold text-slate-700">{mat.physicalBalance}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Reserva</p>
                    <p className={`font-semibold ${mat.reservedBalance > mat.physicalBalance ? 'text-red-600' : 'text-slate-700'}`}>{mat.reservedBalance}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Disp.</p>
                    <p className={`font-semibold ${disponivel <= 0 ? 'text-red-600' : 'text-green-600'}`}>{disponivel}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 flex justify-between mb-4">
                  <span>Mínimo: {mat.minStock}</span>
                  <span>Ideal: {mat.idealStock || 0}</span>
                </div>

                {/* Ações dentro do card */}
                <div className="mt-auto flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8">Abrir</Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8">Solicitar</Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        
        {filteredMaterials.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-lg">
             <p className="text-slate-500">Nenhum material encontrado para o filtro atual.</p>
          </div>
        )}
      </div>

    </div>
  );
};
