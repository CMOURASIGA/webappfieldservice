import React, { useEffect, useState } from "react";
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
import { OperationalPageHeader, SearchToolbar } from "../components/ui/OperationalPage";
import { Plus } from "lucide-react";

export const Locais = () => {
  const { currentUser } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<Partial<Location>>({});

  const loadData = () => {
    setLocations(storageService.get("gsi_locations").filter((location) => location.active));
    setUnits(storageService.get("gsi_units").filter((unit) => unit.active));
  };

  useEffect(() => {
    loadData();
  }, []);

  const getUnitName = (id: string) => units.find((unit) => unit.id === id)?.name || "N/A";

  const handleOpenNew = () => {
    setEditingLocation(null);
    setFormData({
      active: true,
      type: "Sala",
      unitId: units[0]?.id || "",
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData(location);
    setIsDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    const allLocations = storageService.get("gsi_locations");
    const index = allLocations.findIndex((location) => location.id === id);
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
      const index = allLocations.findIndex((location) => location.id === editingLocation.id);
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

  const filteredLocations = locations.filter((location) => {
    const term = searchTerm.trim().toLowerCase();
    return !term || [location.name, location.code, location.type, location.area, location.floor, location.environment, getUnitName(location.unitId)]
      .some((value) => value?.toLowerCase().includes(term));
  });

  return (
    <div className="space-y-6">
      <OperationalPageHeader
        title="Locais"
        description="Cadastro de prédios, andares, áreas e ambientes operacionais."
        backTo="/servicos"
        actions={<Button onClick={handleOpenNew} className="gap-2"><Plus className="h-4 w-4" /> Novo Local</Button>}
      />

      <SearchToolbar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por local, código, tipo, unidade ou ambiente..." resultCount={filteredLocations.length} />

      <Card className="p-4">
        <CardContent className="p-0">
            <div className="operational-grid">
              {filteredLocations.map((location) => (
                <Card key={location.id} className="operational-card flex h-full flex-col">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded font-semibold">
                            {location.code}
                          </span>
                          <Badge variant="default">{location.type}</Badge>
                        </div>
                        <h3 className="font-semibold text-slate-900 line-clamp-1" title={location.name}>
                          {location.name}
                        </h3>
                      </div>
                    </div>

                    <div className="operational-card-fields mt-2 flex-1">
                      <div className="operational-card-field border-b-0">
                        <p className="text-xs text-slate-400">Unidade</p>
                        <p className="font-medium text-slate-700">{getUnitName(location.unitId)}</p>
                      </div>
                      <div className="operational-card-field border-b-0 border-r-0">
                        <p className="text-xs text-slate-400">Detalhes</p>
                        <p className="font-medium text-slate-700 text-xs">
                          {location.area && <span className="block">Area: {location.area}</span>}
                          {location.floor && <span className="block">Pavimento: {location.floor}</span>}
                          {location.environment && <span className="block">Ambiente: {location.environment}</span>}
                          {!location.area && !location.floor && !location.environment && "-"}
                        </p>
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
            </div>
            {locations.length === 0 && (
              <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                Nenhum local encontrado.
              </div>
            )}
        </CardContent>
      </Card>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={editingLocation ? "Editar Local" : "Novo Local"}>
        <form onSubmit={handleSave} className="space-y-4 rounded-lg border border-slate-300 bg-slate-50/70 p-4">
          <Input label="Codigo do Local" required value={formData.code || ""} onChange={(event) => setFormData({ ...formData, code: event.target.value })} />
          <Input
            label="Nome do Local"
            required
            value={formData.name || ""}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            placeholder="Ex: Sala 101"
          />
          <Select
            label="Unidade"
            required
            value={formData.unitId || ""}
            onChange={(event) => setFormData({ ...formData, unitId: event.target.value })}
            options={units.map((unit) => ({ value: unit.id, label: unit.name }))}
          />
          <Select
            label="Tipo"
            required
            value={formData.type || ""}
            onChange={(event) => setFormData({ ...formData, type: event.target.value })}
            options={[
              { value: "Edificio", label: "Edificio" },
              { value: "Andar/Pavimento", label: "Andar/Pavimento" },
              { value: "Sala", label: "Sala" },
              { value: "Area Externa", label: "Area Externa" },
              { value: "Galpao", label: "Galpao" },
            ]}
          />
          <Input label="Area" value={formData.area || ""} onChange={(event) => setFormData({ ...formData, area: event.target.value })} placeholder="Ex: Bloco A" />
          <Input label="Pavimento" value={formData.floor || ""} onChange={(event) => setFormData({ ...formData, floor: event.target.value })} placeholder="Ex: Terreo" />
          <Input
            label="Ambiente"
            value={formData.environment || ""}
            onChange={(event) => setFormData({ ...formData, environment: event.target.value })}
            placeholder="Ex: Recepcao"
          />
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsDrawerOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Local</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
