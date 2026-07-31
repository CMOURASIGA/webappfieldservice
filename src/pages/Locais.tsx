import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { CardFooterActions } from "../components/ui/CardFooterActions";
import { Drawer } from "../components/ui/Drawer";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useAuth } from "../contexts/AuthContext";
import { storageService } from "../services/storageService";
import { Location, Unit } from "../types";
import { OperationalPageHeader } from "../components/ui/OperationalPage";

export const Locais = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const [draftSearch, setDraftSearch] = useState("");
  const [draftUnit, setDraftUnit] = useState("");
  const [draftType, setDraftType] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [formData, setFormData] = useState<Partial<Location>>({});

  const loadData = () => {
    setLocations(storageService.get("gsi_locations").filter((location: Location) => location.active));
    setUnits(storageService.get("gsi_units").filter((unit: Unit) => unit.active));
  };

  useEffect(() => {
    loadData();
  }, []);

  const getUnitName = (id: string) => units.find((unit) => unit.id === id)?.name || "N/A";

  const handleOpenNew = () => navigate("/locais/novo");

  const handleOpenEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData(location);
    setIsDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    const allLocations = storageService.get("gsi_locations");
    const index = allLocations.findIndex((location: Location) => location.id === id);
    if (index === -1) return;

    allLocations[index].active = false;
    storageService.set("gsi_locations", allLocations);

    if (currentUser) {
      storageService.logAudit(currentUser.id, "Inativou Local", id, "Location");
    }

    loadData();
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();

    const allLocations = storageService.get("gsi_locations");

    if (editingLocation) {
      const index = allLocations.findIndex((location: Location) => location.id === editingLocation.id);
      if (index !== -1) {
        allLocations[index] = { ...allLocations[index], ...formData } as Location;
      }
      if (currentUser) {
        storageService.logAudit(currentUser.id, "Editou Local", editingLocation.id, "Location");
      }
    } else {
      const newLocation: Location = {
        ...(formData as Location),
        id: crypto.randomUUID(),
        active: true,
      };
      allLocations.push(newLocation);
      if (currentUser) {
        storageService.logAudit(currentUser.id, "Criou Local", newLocation.id, "Location");
      }
    }

    storageService.set("gsi_locations", allLocations);
    loadData();
    setIsDrawerOpen(false);
  };

  const filteredLocations = useMemo(
    () =>
      locations.filter((location) => {
        const term = searchTerm.trim().toLowerCase();
        if (
          term &&
          ![location.name, location.code, location.type, location.area, location.floor, location.environment, getUnitName(location.unitId)].some((value) =>
            value?.toLowerCase().includes(term),
          )
        ) {
          return false;
        }
        if (unitFilter && location.unitId !== unitFilter) return false;
        if (typeFilter && location.type !== typeFilter) return false;
        return true;
      }),
    [locations, searchTerm, typeFilter, unitFilter],
  );

  const applyFilters = () => {
    setSearchTerm(draftSearch);
    setUnitFilter(draftUnit);
    setTypeFilter(draftType);
  };

  const clearFilters = () => {
    setDraftSearch("");
    setDraftUnit("");
    setDraftType("");
    setSearchTerm("");
    setUnitFilter("");
    setTypeFilter("");
    setShowAdvancedFilters(false);
  };

  const activeFilterCount = [searchTerm, unitFilter, typeFilter].filter(Boolean).length;
  const types = [...new Set(locations.map((location) => location.type).filter(Boolean))];

  return (
    <div className="space-y-6">
      <OperationalPageHeader
        title="Locais"
        description="Página de busca dos ambientes, áreas e espaços operacionais."
        backTo="/servicos"
        actions={
          <Button onClick={handleOpenNew} className="new-register-button new-register-button--green gap-2">
            <Plus className="h-4 w-4" /> Novo Local
          </Button>
        }
      />

      <section className="rounded-xl border-2 border-slate-300 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-4 border-b border-slate-200 p-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)_auto]">
          <Input label="Titulo / Palavra-chave" placeholder="Local, codigo, tipo, unidade ou ambiente" value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-700">Tipo</label>
            <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftType} onChange={(event) => setDraftType(event.target.value)}>
              <option value="">Selecione uma opcao</option>
              {types.map((type) => <option key={type}>{type}</option>)}
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
              <label className="text-[13px] font-semibold text-slate-700">Unidade</label>
              <select className="h-10 rounded-md border-2 border-slate-300 bg-white px-3 text-sm" value={draftUnit} onChange={(event) => setDraftUnit(event.target.value)}>
                <option value="">Selecione uma opcao</option>
                {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="p-4">
          <p className="text-lg font-semibold text-brand-900">Locais encontrados | {filteredLocations.length}</p>
          <p className="text-sm text-slate-500">{activeFilterCount > 0 ? `Filtros aplicados: ${activeFilterCount}.` : "Exibindo todos os locais disponíveis."}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredLocations.map((location) => (
          <Card key={location.id} className="overflow-hidden border-2 border-slate-300 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-700 hover:shadow-md">
            <CardContent className="space-y-4 p-0">
              <div className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant="default">{location.code}</Badge>
                  <Badge variant="default">{location.type}</Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="line-clamp-2 text-lg font-semibold text-slate-900" title={location.name}>{location.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-slate-200">
                  <div className="border-b border-r border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Unidade</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{getUnitName(location.unitId)}</p>
                  </div>
                  <div className="border-b border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Área</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{location.area || "-"}</p>
                  </div>
                  <div className="border-r border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Pavimento</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{location.floor || "-"}</p>
                  </div>
                  <div className="bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ambiente</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{location.environment || "-"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="mt-auto border-t border-slate-200 px-5 py-4">
              <CardFooterActions
                viewLink={`/locais/${location.id}`}
                viewLabel="Ver detalhes"
                onEdit={() => handleOpenEdit(location)}
                editLabel="Editar local"
                onDelete={() => handleDelete(location.id)}
                deleteLabel="Inativar local"
                isDeactivate={true}
              />
            </CardFooter>
          </Card>
        ))}

        {filteredLocations.length === 0 && (
          <div className="col-span-full rounded-lg border-2 border-dashed border-slate-200 py-12 text-center">
            <p className="text-slate-500">Nenhum local encontrado.</p>
          </div>
        )}
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Editar Local">
        <form onSubmit={handleSave} className="space-y-4 rounded-lg border border-slate-300 bg-slate-50/70 p-4">
          <Input label="Codigo do Local" required value={formData.code || ""} onChange={(event) => setFormData({ ...formData, code: event.target.value })} />
          <Input label="Nome do Local" required value={formData.name || ""} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="Ex: Sala 101" />
          <Select label="Unidade" required value={formData.unitId || ""} onChange={(event) => setFormData({ ...formData, unitId: event.target.value })} options={units.map((unit) => ({ value: unit.id, label: unit.name }))} />
          <Select label="Tipo" required value={formData.type || ""} onChange={(event) => setFormData({ ...formData, type: event.target.value })} options={[
            { value: "Edificio", label: "Edificio" },
            { value: "Andar/Pavimento", label: "Andar/Pavimento" },
            { value: "Sala", label: "Sala" },
            { value: "Area Externa", label: "Area Externa" },
            { value: "Galpao", label: "Galpao" },
          ]} />
          <Input label="Area" value={formData.area || ""} onChange={(event) => setFormData({ ...formData, area: event.target.value })} placeholder="Ex: Bloco A" />
          <Input label="Pavimento" value={formData.floor || ""} onChange={(event) => setFormData({ ...formData, floor: event.target.value })} placeholder="Ex: Terreo" />
          <Input label="Ambiente" value={formData.environment || ""} onChange={(event) => setFormData({ ...formData, environment: event.target.value })} placeholder="Ex: Recepcao" />
          <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsDrawerOpen(false)}>Cancelar</Button>
            <Button type="submit" className="save-action-button">Salvar Local</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
