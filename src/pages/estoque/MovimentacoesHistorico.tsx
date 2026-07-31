import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { OperationalPageHeader } from "../../components/ui/OperationalPage";
import { storageService } from "../../services/storageService";
import { StockMaterial, StockMovement } from "../../types";

export const MovimentacoesHistorico = () => {
  const [searchParams] = useSearchParams();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [materials, setMaterials] = useState<StockMaterial[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const materialIdFilter = searchParams.get("materialId");

  const [draftSearch, setDraftSearch] = useState("");
  const [draftType, setDraftType] = useState("Todos");
  const [draftUser, setDraftUser] = useState("Todos");
  const [draftSector, setDraftSector] = useState("Todos");
  const [draftCategory, setDraftCategory] = useState("Todas");

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [userFilter, setUserFilter] = useState("Todos");
  const [sectorFilter, setSectorFilter] = useState("Todos");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    const allMovements = (storageService.get("gsi_stock_movements") || []).sort((a: StockMovement, b: StockMovement) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const allMaterials = storageService.get("gsi_stock_materials") || [];

    setMovements(allMovements);
    setMaterials(allMaterials);
    setUsers(storageService.get("gsi_users") || []);

    if (materialIdFilter) {
      const selectedMaterial = allMaterials.find((material: StockMaterial) => material.id === materialIdFilter);
      if (selectedMaterial) {
        setDraftSearch(selectedMaterial.name);
        setSearchTerm(selectedMaterial.name);
      }
    }
  }, [materialIdFilter]);

  const getMaterialName = (id: string) => materials.find((material) => material.id === id)?.name || id;
  const getUserName = (id: string) => users.find((user) => user.id === id)?.name || "Usuário";
  const getMaterialCategory = (id: string) => materials.find((material) => material.id === id)?.category || "Sem categoria";

  const filtered = useMemo(
    () =>
      movements.filter((movement) => {
        const matchesMaterial = !materialIdFilter || movement.materialId === materialIdFilter;
        const matchesSearch = getMaterialName(movement.materialId).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "Todos" || movement.type === typeFilter;
        const matchesUser = userFilter === "Todos" || movement.userId === userFilter || movement.technicianId === userFilter;
        const matchesSector = sectorFilter === "Todos" || movement.sector === sectorFilter;
        const matchesCategory = categoryFilter === "Todas" || getMaterialCategory(movement.materialId) === categoryFilter;
        return matchesMaterial && matchesSearch && matchesType && matchesUser && matchesSector && matchesCategory;
      }),
    [categoryFilter, materialIdFilter, movements, searchTerm, sectorFilter, typeFilter, userFilter],
  );

  const sectors = [...new Set(movements.map((movement) => movement.sector).filter(Boolean))] as string[];
  const categories = [...new Set(materials.map((material) => material.category).filter(Boolean))];

  const applyFilters = () => {
    setSearchTerm(draftSearch);
    setTypeFilter(draftType);
    setUserFilter(draftUser);
    setSectorFilter(draftSector);
    setCategoryFilter(draftCategory);
  };

  const clearFilters = () => {
    setDraftSearch("");
    setDraftType("Todos");
    setDraftUser("Todos");
    setDraftSector("Todos");
    setDraftCategory("Todas");
    setSearchTerm("");
    setTypeFilter("Todos");
    setUserFilter("Todos");
    setSectorFilter("Todos");
    setCategoryFilter("Todas");
    setShowAdvancedFilters(false);
  };

  const activeFilterCount = [
    searchTerm,
    typeFilter !== "Todos" ? typeFilter : "",
    userFilter !== "Todos" ? userFilter : "",
    sectorFilter !== "Todos" ? sectorFilter : "",
    categoryFilter !== "Todas" ? categoryFilter : "",
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <OperationalPageHeader title="Histórico de Movimentações" description="Página de busca das entradas, saídas, reservas e ajustes de estoque." backTo="/estoque" />

      <section className="rounded-xl border-2 border-slate-300 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-4 border-b border-slate-200 p-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)_auto]">
          <Input label="Titulo / Palavra-chave" placeholder="Nome do material" value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-700">Tipo</label>
            <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftType} onChange={(event) => setDraftType(event.target.value)}>
              <option value="Todos">Todos os tipos</option>
              <option value="Entrada">Entrada</option>
              <option value="Saída">Saída</option>
              <option value="Ajuste">Ajuste</option>
              <option value="Reserva">Reserva</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button type="button" variant="secondary" className="h-10 px-3" onClick={() => setShowAdvancedFilters((current) => !current)}><SlidersHorizontal className="h-4 w-4" /></Button>
            <Button type="button" className="search-action-button" onClick={applyFilters}><Search className="h-4 w-4" />Pesquisar</Button>
            <Button type="button" variant="secondary" className="search-clear-button" onClick={clearFilters}><X className="h-4 w-4" />Limpar</Button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 gap-4 border-b border-slate-200 bg-slate-50/70 p-4 md:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Responsável</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftUser} onChange={(event) => setDraftUser(event.target.value)}>
                <option value="Todos">Todos os responsáveis</option>
                {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Setor</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftSector} onChange={(event) => setDraftSector(event.target.value)}>
                <option value="Todos">Todos os setores</option>
                {sectors.map((sector) => <option key={sector}>{sector}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Categoria</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftCategory} onChange={(event) => setDraftCategory(event.target.value)}>
                <option value="Todas">Todas as categorias</option>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="p-4">
          <p className="text-lg font-semibold text-brand-900">Movimentações encontradas | {filtered.length}</p>
          <p className="text-sm text-slate-500">{activeFilterCount > 0 ? `Filtros aplicados: ${activeFilterCount}.` : "Exibindo todo o histórico disponível."}</p>
        </div>
      </section>

      <div className="space-y-4">
        {filtered.map((movement) => (
          <Card key={movement.id} className="overflow-hidden border-2 border-slate-300 shadow-sm transition-all hover:border-brand-700 hover:shadow-md">
            <CardContent className="space-y-4 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={movement.type === "Entrada" ? "success" : movement.type === "Saída" ? "danger" : "warning"}>{movement.type}</Badge>
                    <h3 className="text-lg font-semibold text-slate-900">{getMaterialName(movement.materialId)}</h3>
                    <span className="text-sm text-slate-500">{getMaterialCategory(movement.materialId)}</span>
                  </div>
                  <p className="text-sm text-slate-500">Data: {format(parseISO(movement.date), "dd/MM/yyyy HH:mm")} • Responsável: {getUserName(movement.userId)}</p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                    <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Quantidade</p><p className="mt-1 font-semibold text-slate-900">{movement.type === "Saída" ? "-" : movement.type === "Entrada" ? "+" : ""}{movement.quantity}</p></div>
                    <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Saldo anterior</p><p className="mt-1 font-semibold text-slate-900">{movement.previousBalance ?? 0}</p></div>
                    <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Saldo atual</p><p className="mt-1 font-semibold text-slate-900">{movement.newBalance ?? 0}</p></div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600 lg:text-right">
                  {movement.sector && <p>Setor: {movement.sector}</p>}
                  {movement.workOrderId && (
                    <Link className="font-semibold text-brand-700 underline-offset-2 hover:underline" to={`/ordens/${movement.workOrderId}`}>
                      Destino: {storageService.get("gsi_work_orders").find((order: any) => order.id === movement.workOrderId)?.number || movement.workOrderId}
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-slate-200 py-12 text-center">
            <p className="text-slate-500">Nenhuma movimentação encontrada para os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  );
};
