import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PackageOpen, Search, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardFooter } from "../../components/ui/Card";
import { CardFooterActions } from "../../components/ui/CardFooterActions";
import { Input } from "../../components/ui/Input";
import { OperationalPageHeader } from "../../components/ui/OperationalPage";
import { storageService } from "../../services/storageService";
import { Location, StockMaterial, StockRequest, Unit } from "../../types";
import { getPendingStockRequests, getStockStatus, reconcileMaterial } from "../../utils/stock";
import { NovoMaterialModal } from "./NovoMaterialModal";

export const VerificarEstoque = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStatusFilter = searchParams.get("status") || "Todos";
  const [materials, setMaterials] = useState<StockMaterial[]>([]);
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [draftSearch, setDraftSearch] = useState("");
  const [draftStatus, setDraftStatus] = useState(initialStatusFilter);
  const [draftCategory, setDraftCategory] = useState("Todas");
  const [draftLocation, setDraftLocation] = useState("Todos");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [locationFilter, setLocationFilter] = useState("Todos");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showNovoMaterial, setShowNovoMaterial] = useState(false);
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

  useEffect(() => {
    setDraftStatus(initialStatusFilter);
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  const getUnitName = (id: string) => units.find((unit) => unit.id === id)?.name || id;

  const metrics = {
    reposicaoNecessaria: materials.filter((material) => material.physicalBalance - material.reservedBalance <= material.minStock).length,
    valorTotal: materials.reduce((total, material) => total + Number(material.physicalBalance || 0) * Number(material.unitPrice || 0), 0),
    solicitacoesPendentes: getPendingStockRequests(requests).length,
  };

  const filteredMaterials = useMemo(
    () =>
      materials.filter((material) => {
        const term = searchTerm.trim().toLowerCase();
        if (term && ![material.name, material.code, material.description, material.category].some((value) => value?.toLowerCase().includes(term))) {
          return false;
        }
        if (categoryFilter !== "Todas" && material.category !== categoryFilter) return false;
        if (locationFilter !== "Todos" && material.locationId !== locationFilter) return false;
        if (statusFilter === "Todos") return true;
        if (statusFilter === "Reposição") return material.physicalBalance - material.reservedBalance <= material.minStock;
        if (statusFilter === "Abaixo do mínimo") return material.physicalBalance < material.minStock;
        if (statusFilter === "Reserva maior") return material.reservedBalance > material.physicalBalance;
        return true;
      }),
    [categoryFilter, locationFilter, materials, searchTerm, statusFilter],
  );

  const categories = [...new Set(materials.map((material) => material.category).filter(Boolean))];

  const handleDeactivateMaterial = (material: StockMaterial) => {
    if (!confirm(`Inativar ${material.name}? O histórico de movimentações será preservado.`)) return;
    storageService.set("gsi_stock_materials", storageService.get("gsi_stock_materials").map((item: StockMaterial) => item.id === material.id ? { ...item, active: false, updatedAt: new Date().toISOString() } : item));
    loadData();
  };

  const applyFilters = () => {
    setSearchTerm(draftSearch);
    setStatusFilter(draftStatus);
    setCategoryFilter(draftCategory);
    setLocationFilter(draftLocation);
  };

  const clearFilters = () => {
    setDraftSearch("");
    setDraftStatus("Todos");
    setDraftCategory("Todas");
    setDraftLocation("Todos");
    setSearchTerm("");
    setStatusFilter("Todos");
    setCategoryFilter("Todas");
    setLocationFilter("Todos");
    setShowAdvancedFilters(false);
  };

  const activeFilterCount = [
    searchTerm,
    statusFilter !== "Todos" ? statusFilter : "",
    categoryFilter !== "Todas" ? categoryFilter : "",
    locationFilter !== "Todos" ? locationFilter : "",
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <OperationalPageHeader title="Verificar Estoque" description="Página de busca dos materiais, saldos e necessidades de reposição." backTo="/estoque" />

      <section className="rounded-xl border-2 border-slate-300 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-4 border-b border-slate-200 p-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)_auto]">
          <Input label="Titulo / Palavra-chave" placeholder="Material, codigo, descricao ou categoria" value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-700">Situação</label>
            <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftStatus} onChange={(event) => setDraftStatus(event.target.value)}>
              <option value="Todos">Todos os materiais</option>
              <option value="Reposição">Reposição necessária</option>
              <option value="Abaixo do mínimo">Abaixo do mínimo</option>
              <option value="Reserva maior">Reserva maior que saldo</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button type="button" variant="secondary" className="h-10 px-3" onClick={() => setShowAdvancedFilters((current) => !current)}><SlidersHorizontal className="h-4 w-4" /></Button>
            <Button type="button" className="search-action-button" onClick={applyFilters}><Search className="h-4 w-4" />Pesquisar</Button>
            <Button type="button" variant="secondary" className="search-clear-button" onClick={clearFilters}><X className="h-4 w-4" />Limpar</Button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 gap-4 border-b border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Categoria</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftCategory} onChange={(event) => setDraftCategory(event.target.value)}>
                <option value="Todas">Todas as categorias</option>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Local / Almoxarifado</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftLocation} onChange={(event) => setDraftLocation(event.target.value)}>
                <option value="Todos">Todos os locais</option>
                {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="p-4">
          <p className="text-lg font-semibold text-brand-900">Materiais encontrados | {filteredMaterials.length}</p>
          <p className="text-sm text-slate-500">{activeFilterCount > 0 ? `Filtros aplicados: ${activeFilterCount}.` : "Exibindo todos os materiais disponíveis."}</p>
        </div>
      </section>

      <div className="rounded-xl border-2 border-slate-300 bg-white p-4 text-sm text-slate-700 shadow-sm">
        <strong>Valor estimado do estoque:</strong> {metrics.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        <span className="ml-2 text-slate-500">Solicitações pendentes: {String(metrics.solicitacoesPendentes).padStart(2, "0")}.</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredMaterials.map((material) => {
          const available = material.physicalBalance - material.reservedBalance;
          const status = getStockStatus(material);
          return (
            <Card key={material.id} className="record-card">
              <CardContent className="record-card-content">
                <div className="record-card-body">
                  <div className="record-card-header">
                    <Badge variant="default">{material.code}</Badge>
                    {status !== "Normal" && (
                      <Badge variant="default" className={status === "Sem saldo" ? "border-red-200 bg-red-50 text-red-700" : status === "Crítico" ? "border-orange-200 bg-orange-50 text-orange-700" : "border-yellow-200 bg-yellow-50 text-yellow-700"}>{status}</Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="record-card-title" title={material.name}>{material.name}</h3>
                    <p className="record-card-subtitle">Unidade: {getUnitName(material.unitId)}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                    <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Físico</p><p className="mt-1 font-semibold text-slate-900">{material.physicalBalance}</p></div>
                    <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Reserva</p><p className={`mt-1 font-semibold ${material.reservedBalance > material.physicalBalance ? "text-red-600" : "text-slate-900"}`}>{material.reservedBalance}</p></div>
                    <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Disponível</p><p className={`mt-1 font-semibold ${available <= 0 ? "text-red-600" : "text-green-600"}`}>{available}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                    <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Mínimo</p><p className="mt-1 font-semibold text-slate-900">{material.minStock}</p></div>
                    <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ideal</p><p className="mt-1 font-semibold text-slate-900">{material.idealStock || 0}</p></div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="mt-auto border-t border-slate-200 p-0">
                <CardFooterActions
                  onView={() => navigate(`/estoque/movimentacoes?materialId=${material.id}`)}
                  viewLabel="Historico"
                  onEdit={() => { setEditingMaterial(material); setShowNovoMaterial(true); }}
                  onDelete={() => handleDeactivateMaterial(material)}
                  deleteLabel="Inativar material"
                >
                  <button type="button" className="card-action-button" title="Solicitar material" aria-label="Solicitar material" onClick={() => navigate(`/estoque/solicitacoes/nova?materialId=${material.id}`)}>
                    <PackageOpen className="h-4 w-4" />
                  </button>
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

      <NovoMaterialModal open={showNovoMaterial} onOpenChange={(open) => { setShowNovoMaterial(open); if (!open) { setEditingMaterial(undefined); loadData(); } }} onSuccess={() => { setShowNovoMaterial(false); setEditingMaterial(undefined); loadData(); }} material={editingMaterial} />
    </div>
  );
};
