import React, { useEffect, useState } from "react";
import { ArrowRightLeft, PackageOpen, Plus, Search, ShoppingCart } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cnc-ti/layout-basic";
import { Badge } from "../components/ui/Badge";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { CardFooterActions } from "../components/ui/CardFooterActions";
import { storageService } from "../services/storageService";
import { Location, StockMaterial, StockRequest, Unit } from "../types";
import { MovimentacoesHistorico } from "./estoque/MovimentacoesHistorico";
import { NovoMaterialModal } from "./estoque/NovoMaterialModal";
import { getPendingStockRequests, getStockStatus, reconcileMaterial } from "../utils/stock";
import { MetricButton, OperationalPageHeader, SearchToolbar } from "../components/ui/OperationalPage";

export const Estoque = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<StockMaterial[]>([]);
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchParams] = useSearchParams();
  const initialStatusFilter = searchParams.get("status") || "Todos";
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [showNovoMaterial, setShowNovoMaterial] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [locationFilter, setLocationFilter] = useState("Todos");
  const [editingMaterial, setEditingMaterial] = useState<StockMaterial | undefined>();

  const loadData = () => {
    setMaterials((storageService.get("gsi_stock_materials") || []).filter((material: StockMaterial) => material.active !== false).map(reconcileMaterial));
    setRequests(storageService.get("gsi_stock_requests") || []);
    setUnits(storageService.get("gsi_units") || []);
    setLocations(storageService.get("gsi_locations") || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getUnitName = (id: string) => units.find((unit) => unit.id === id)?.name || id;

  const metrics = {
    total: materials.length,
    normal: materials.filter((material) => getStockStatus(material) === "Normal").length,
    atencao: materials.filter((material) => getStockStatus(material) === "Atenção").length,
    critico: materials.filter((material) => ["Crítico", "Sem saldo"].includes(getStockStatus(material))).length,
    reposicaoNecessaria: materials.filter((material) => (material.physicalBalance - material.reservedBalance) <= material.minStock).length,
    abaixoMinimo: materials.filter((material) => material.physicalBalance < material.minStock).length,
    reservaMaior: materials.filter((material) => material.reservedBalance > material.physicalBalance).length,
    solicitacoesPendentes: getPendingStockRequests(requests).length,
    valorTotal: materials.reduce((total, material) => total + Number(material.physicalBalance || 0) * Number(material.unitPrice || 0), 0),
  };

  const filteredMaterials = materials.filter((material) => {
    const term = searchTerm.trim().toLowerCase();
    if (term && ![material.name, material.code, material.description, material.category]
      .some((value) => value?.toLowerCase().includes(term))) return false;
    if (categoryFilter !== "Todas" && material.category !== categoryFilter) return false;
    if (locationFilter !== "Todos" && material.locationId !== locationFilter) return false;
    if (statusFilter === "Todos") return true;
    if (statusFilter === "Normal" || statusFilter === "Atenção" || statusFilter === "Crítico") {
      const materialStatus = getStockStatus(material);
      return statusFilter === "Crítico" ? ["Crítico", "Sem saldo"].includes(materialStatus) : materialStatus === statusFilter;
    }
    if (statusFilter === "Reposição") return (material.physicalBalance - material.reservedBalance) <= material.minStock;
    if (statusFilter === "Abaixo Minimo") return material.physicalBalance < material.minStock;
    if (statusFilter === "Reserva Maior") return material.reservedBalance > material.physicalBalance;
    return true;
  });

  const categories = [...new Set(materials.map((material) => material.category).filter(Boolean))];
  const handleDeactivateMaterial = (material: StockMaterial) => {
    if (!confirm(`Inativar ${material.name}? O histórico de movimentações será preservado.`)) return;
    storageService.set("gsi_stock_materials", storageService.get("gsi_stock_materials").map((item) => item.id === material.id ? { ...item, active: false, updatedAt: new Date().toISOString() } : item));
    loadData();
  };

  return (
    <div className="space-y-6">
      <OperationalPageHeader
        title="Gestão de Estoque"
        description="Controle de materiais, movimentações e necessidades de reposição."
        backTo={-1}
        actionsBelow
        actions={
          <>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/estoque/movimentacoes/nova?tipo=Entrada")}>
            <ArrowRightLeft className="w-4 h-4" /> Registrar Entrada
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/estoque/movimentacoes/nova?tipo=Saída")}>
            <ArrowRightLeft className="w-4 h-4" /> Registrar Saída
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/estoque/solicitacoes/nova")}>
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

      <SearchToolbar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar por material, código, descrição ou categoria..."
        resultCount={filteredMaterials.length}
      />

      <div className="grid grid-cols-1 gap-3 rounded-xl border-2 border-slate-300 bg-white p-4 shadow-1 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-slate-600">Categoria</label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Todas">Todas as categorias</SelectItem>{categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-slate-600">Local / Almoxarifado</label>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Todos">Todos os locais</SelectItem>{locations.map((location) => <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MetricButton label="Total de Itens" value={metrics.total} active={statusFilter === "Todos"} onClick={() => setStatusFilter("Todos")} />
        <MetricButton label="Normal" value={metrics.normal} active={statusFilter === "Normal"} valueClassName="text-green-700" onClick={() => setStatusFilter("Normal")} />
        <MetricButton label="Atenção" value={metrics.atencao} active={statusFilter === "Atenção"} valueClassName="text-amber-700" onClick={() => setStatusFilter("Atenção")} />
        <MetricButton label="Crítico / sem saldo" value={metrics.critico} active={statusFilter === "Crítico"} valueClassName="text-red-700" onClick={() => setStatusFilter("Crítico")} />
        <MetricButton label="Reposição Necessária" value={metrics.reposicaoNecessaria} active={statusFilter === "Reposição"} valueClassName="text-orange-700" onClick={() => setStatusFilter("Reposição")} />
        <MetricButton label="Solicitações Pendentes" value={metrics.solicitacoesPendentes} onClick={() => navigate("/estoque/fila")} />
      </div>
      <div className="rounded-xl border-2 border-slate-300 bg-white p-4 text-sm text-slate-700 shadow-1"><strong>Valor estimado do estoque:</strong> {metrics.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} <span className="ml-2 text-slate-500">Baseado no valor unitário cadastrado para cada material.</span></div>

      {metrics.reposicaoNecessaria > 0 && <section className="rounded-xl border-2 border-orange-400 bg-orange-50 p-4 shadow-1"><div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="font-bold text-orange-950">Reposição urgente</h2><p className="text-sm text-orange-800">Itens cujo saldo disponível exige compra ou reposição imediata.</p></div><Button variant="outline" onClick={() => setStatusFilter("Reposição")}>Ver todos</Button></div><div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">{materials.filter((material) => (material.physicalBalance - material.reservedBalance) <= material.minStock).map((material) => { const available = material.physicalBalance - material.reservedBalance; return <div key={material.id} className="rounded-lg border-2 border-orange-200 bg-white p-3 text-sm"><strong>{material.name}</strong><p className="mt-1 text-slate-600">Disponível: {available} {material.unit} | Mínimo: {material.minStock}</p><p className="mt-1 font-semibold text-orange-900">Sugestão: repor {Math.max(0, Number(material.idealStock || material.minStock) - available)} {material.unit}</p></div>; })}</div></section>}

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
                {available <= material.minStock && <div className="mb-3 rounded-md border border-orange-300 bg-orange-50 p-2 text-xs text-orange-900"><strong>Reposição sugerida:</strong> {Math.max(0, Number(material.idealStock || material.minStock) - available)} {material.unit} para atingir o nível ideal.</div>}
              </CardContent>

              <CardFooter className="mt-3 border-t border-slate-100 px-4 pb-4 pt-3">
                <CardFooterActions
                  onView={() => navigate(`/estoque/movimentacoes?materialId=${material.id}`)}
                  viewLabel="Histórico"
                  onEdit={() => { setEditingMaterial(material); setShowNovoMaterial(true); }}
                  onDelete={() => handleDeactivateMaterial(material)}
                  deleteLabel="Inativar material"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="card-action-button"
                    title="Solicitar material"
                    aria-label="Solicitar material"
                    onClick={() => navigate(`/estoque/solicitacoes/nova?materialId=${material.id}`)}
                  >
                    <PackageOpen className="h-4 w-4" />
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

      <NovoMaterialModal open={showNovoMaterial} onOpenChange={(open) => { setShowNovoMaterial(open); if (!open) setEditingMaterial(undefined); }} onSuccess={loadData} material={editingMaterial} />
    </div>
  );
};
