import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { storageService } from "../services/storageService";
import { Asset, Unit, Location } from "../types";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Drawer } from "../components/ui/Drawer";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { useAuth } from "../contexts/AuthContext";

export const Ativos = () => {
  const { currentUser } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<"ativos" | "locais">("ativos");
  const [isLocationDrawerOpen, setIsLocationDrawerOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locationFormData, setLocationFormData] = useState<Partial<Location>>({});

  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const [formData, setFormData] = useState<Partial<Asset>>({
    code: "", name: "", category: "", unitId: "", locationId: "", manufacturer: "",
    model: "", patrimonyNumber: "", criticality: "Baixa", status: "Ativo", observations: ""
  });

  const loadData = () => {
    setAssets(storageService.get("gsi_assets").filter(a => a.active));
    setUnits(storageService.get("gsi_units").filter(u => u.active));
    setLocations(storageService.get("gsi_locations").filter(l => l.active));
  };

  useEffect(() => {
    loadData();
  }, []);

  const getUnitName = (id: string) => units.find(u => u.id === id)?.name || "N/A";
  const getLocationName = (id: string) => locations.find(l => l.id === id)?.name || "N/A";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ativo": return <Badge variant="success">{status}</Badge>;
      case "Inativo": return <Badge variant="default">{status}</Badge>;
      case "Em manutenção": return <Badge variant="warning">{status}</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  
  const handleOpenNewLocation = () => {
    setEditingLocation(null);
    setLocationFormData({ active: true, type: "Sala", unitId: units[0]?.id || "" });
    setIsLocationDrawerOpen(true);
  };

  const handleOpenEditLocation = (loc: Location) => {
    setEditingLocation(loc);
    setLocationFormData(loc);
    setIsLocationDrawerOpen(true);
  };

  const handleDeleteLocation = (id: string) => {
    if (confirm("Tem certeza que deseja inativar este local?")) {
      const allLocs = storageService.get("gsi_locations");
      const idx = allLocs.findIndex(l => l.id === id);
      if (idx !== -1) {
        allLocs[idx].active = false;
        storageService.set("gsi_locations", allLocs);
        if (currentUser) {
          storageService.logAudit(currentUser.id, "Inativou Local", id, "Location");
        }
        loadData();
      }
    }
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const allLocs = storageService.get("gsi_locations");
    if (editingLocation) {
      const idx = allLocs.findIndex(l => l.id === editingLocation.id);
      if (idx !== -1) {
        allLocs[idx] = { ...allLocs[idx], ...locationFormData } as Location;
      }
      if (currentUser) storageService.logAudit(currentUser.id, "Editou Local", editingLocation.id, "Location");
    } else {
      const newLoc: Location = {
        ...(locationFormData as Location),
        id: crypto.randomUUID(),
        active: true
      };
      allLocs.push(newLoc);
      if (currentUser) storageService.logAudit(currentUser.id, "Criou Local", newLoc.id, "Location");
    }
    storageService.set("gsi_locations", allLocs);
    loadData();
    setIsLocationDrawerOpen(false);
  };

  const handleOpenNew = () => {
    setEditingAsset(null);
    setFormData({
      code: `ATV-${Math.floor(1000 + Math.random() * 9000)}`, name: "", category: "",
      unitId: currentUser?.unitId || "", locationId: "", manufacturer: "",
      model: "", patrimonyNumber: "", criticality: "Baixa", status: "Ativo", observations: ""
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({ ...asset });
    setIsDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este ativo?")) {
      const allAssets = storageService.get("gsi_assets");
      const idx = allAssets.findIndex(a => a.id === id);
      if (idx !== -1) {
        allAssets[idx].active = false;
        storageService.set("gsi_assets", allAssets);
        if (currentUser) {
          storageService.logAudit(currentUser.id, "Excluiu Ativo", id, "Asset");
        }
        loadData();
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const allAssets = storageService.get("gsi_assets");

    if (editingAsset) {
      const idx = allAssets.findIndex(a => a.id === editingAsset.id);
      if (idx !== -1) {
        allAssets[idx] = { ...allAssets[idx], ...formData } as Asset;
      }
      if (currentUser) storageService.logAudit(currentUser.id, "Editou Ativo", editingAsset.id, "Asset");
    } else {
      const newAsset: Asset = {
        ...(formData as Asset),
        id: crypto.randomUUID(),
        active: true
      };
      allAssets.push(newAsset);
      if (currentUser) storageService.logAudit(currentUser.id, "Criou Ativo", newAsset.id, "Asset");
    }

    storageService.set("gsi_assets", allAssets);
    loadData();
    setIsDrawerOpen(false);
  };

  const filteredLocations = locations.filter(l => l.unitId === formData.unitId);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Ativos e Locais</h1>
          <p className="text-sm text-slate-500">Gestão do patrimônio predial.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "ativos" ? (
            <Button onClick={handleOpenNew}>+ Novo Ativo</Button>
          ) : (
            <Button onClick={handleOpenNewLocation}>+ Novo Local</Button>
          )}
        </div>
      </div>
      
      <div className="flex border-b border-slate-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'ativos' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('ativos')}
        >
          Ativos
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'locais' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('locais')}
        >
          Locais
        </button>
      </div>


      
      {activeTab === "ativos" ? (
      <Card>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {assets.map(asset => (
              <Card key={asset.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded font-semibold">{asset.code}</span>
                        {getStatusBadge(asset.status)}
                      </div>
                      <h3 className="font-semibold text-slate-900 line-clamp-1" title={asset.name}>{asset.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{asset.category}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm mt-2 flex-1">
                    <div>
                      <p className="text-xs text-slate-400">Local</p>
                      <p className="font-medium text-slate-700">{getLocationName(asset.locationId)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Unidade</p>
                      <p className="font-medium text-slate-700">{getUnitName(asset.unitId)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-slate-400">Patrimônio / Fabricante</p>
                      <p className="font-medium text-slate-700">{asset.patrimonyNumber || "-"} {asset.manufacturer && <span className="text-slate-500 font-normal">/ {asset.manufacturer}</span>}</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-2">
                    <Link to={`/ativos/${asset.id}`}>
                      <Button variant="secondary" size="sm">Ver Detalhes</Button>
                    </Link>
                    <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(asset)}>Editar</Button>
                    <Button variant="secondary" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(asset.id)}>Excluir</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {assets.length === 0 && (
            <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
              Nenhum ativo encontrado.
            </div>
          )}

          </div>
        </CardContent>
      </Card>

      ) : (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {locations.map(loc => (
              <Card key={loc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded font-semibold">{loc.code}</span>
                        <Badge variant="secondary">{loc.type}</Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900 line-clamp-1" title={loc.name}>{loc.name}</h3>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm mt-2 flex-1">
                    <div>
                      <p className="text-xs text-slate-400">Unidade</p>
                      <p className="font-medium text-slate-700">{getUnitName(loc.unitId)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Detalhes</p>
                      <p className="font-medium text-slate-700 text-xs">
                        {loc.area && <span className="block">Área: {loc.area}</span>}
                        {loc.floor && <span className="block">Pavimento: {loc.floor}</span>}
                        {loc.environment && <span className="block">Ambiente: {loc.environment}</span>}
                        {!loc.area && !loc.floor && !loc.environment && "-"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-2">
                    <Link to={`/locais/${loc.id}`}>
                      <Button variant="secondary" size="sm">Ver Detalhes</Button>
                    </Link>
                    <Button variant="secondary" size="sm" onClick={() => handleOpenEditLocation(loc)}>Editar</Button>
                    <Button variant="secondary" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteLocation(loc.id)}>Excluir</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {locations.length === 0 && (
            <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
              Nenhum local encontrado.
            </div>
          )}

          </div>
        </CardContent>
      </Card>
      )}

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingAsset ? "Editar Ativo" : "Novo Ativo"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Código do Ativo"
            required
            value={formData.code || ""}
            onChange={e => setFormData({ ...formData, code: e.target.value })}
          />
          <Input
            label="Nome do Ativo"
            required
            value={formData.name || ""}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Ar Condicionado Split"
          />
          <Select
            label="Categoria"
            required
            value={formData.category || ""}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            options={[
              { value: "Climatização", label: "Climatização" },
              { value: "Elétrica", label: "Elétrica" },
              { value: "Hidráulica", label: "Hidráulica" },
              { value: "Mobiliário", label: "Mobiliário" },
              { value: "TI / Equipamentos", label: "TI / Equipamentos" },
            ]}
          />
          <Select
            label="Unidade"
            required
            value={formData.unitId || ""}
            onChange={e => setFormData({ ...formData, unitId: e.target.value, locationId: "" })}
            options={units.map(u => ({ value: u.id, label: u.name }))}
          />
          <Select
            label="Local"
            required
            value={formData.locationId || ""}
            onChange={e => setFormData({ ...formData, locationId: e.target.value })}
            options={filteredLocations.map(l => ({ value: l.id, label: l.name }))}
            disabled={!formData.unitId}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Fabricante"
              value={formData.manufacturer || ""}
              onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
            />
            <Input
              label="Modelo"
              value={formData.model || ""}
              onChange={e => setFormData({ ...formData, model: e.target.value })}
            />
          </div>
          <Input
            label="Nº Patrimônio"
            value={formData.patrimonyNumber || ""}
            onChange={e => setFormData({ ...formData, patrimonyNumber: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Criticidade"
              required
              value={formData.criticality || "Baixa"}
              onChange={e => setFormData({ ...formData, criticality: e.target.value as any })}
              options={[
                { value: "Baixa", label: "Baixa" },
                { value: "Média", label: "Média" },
                { value: "Alta", label: "Alta" },
              ]}
            />
            <Select
              label="Status"
              required
              value={formData.status || "Ativo"}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
              options={[
                { value: "Ativo", label: "Ativo" },
                { value: "Inativo", label: "Inativo" },
                { value: "Em manutenção", label: "Em manutenção" },
              ]}
            />
          </div>
          <Textarea
            label="Observações"
            value={formData.observations || ""}
            onChange={e => setFormData({ ...formData, observations: e.target.value })}
            rows={3}
          />
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsDrawerOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar Ativo</Button>
          </div>
        </form>
      </Drawer>

      <Drawer
        isOpen={isLocationDrawerOpen}
        onClose={() => setIsLocationDrawerOpen(false)}
        title={editingLocation ? "Editar Local" : "Novo Local"}
      >
        <form onSubmit={handleSaveLocation} className="space-y-4">
          <Input
            label="Código do Local"
            required
            value={locationFormData.code || ""}
            onChange={e => setLocationFormData({ ...locationFormData, code: e.target.value })}
          />
          <Input
            label="Nome do Local"
            required
            value={locationFormData.name || ""}
            onChange={e => setLocationFormData({ ...locationFormData, name: e.target.value })}
            placeholder="Ex: Sala 101"
          />
          <Select
            label="Unidade"
            required
            value={locationFormData.unitId || ""}
            onChange={e => setLocationFormData({ ...locationFormData, unitId: e.target.value })}
            options={units.map(u => ({ value: u.id, label: u.name }))}
          />
          <Select
            label="Tipo"
            required
            value={locationFormData.type || ""}
            onChange={e => setLocationFormData({ ...locationFormData, type: e.target.value })}
            options={[
              { value: "Edifício", label: "Edifício" },
              { value: "Andar/Pavimento", label: "Andar/Pavimento" },
              { value: "Sala", label: "Sala" },
              { value: "Área Externa", label: "Área Externa" },
              { value: "Galpão", label: "Galpão" },
            ]}
          />
          <Input
            label="Área"
            value={locationFormData.area || ""}
            onChange={e => setLocationFormData({ ...locationFormData, area: e.target.value })}
            placeholder="Ex: Bloco A"
          />
          <Input
            label="Pavimento"
            value={locationFormData.floor || ""}
            onChange={e => setLocationFormData({ ...locationFormData, floor: e.target.value })}
            placeholder="Ex: Térreo"
          />
          <Input
            label="Ambiente"
            value={locationFormData.environment || ""}
            onChange={e => setLocationFormData({ ...locationFormData, environment: e.target.value })}
            placeholder="Ex: Recepção"
          />
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsLocationDrawerOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar Local</Button>
          </div>
        </form>
      </Drawer>

    </div>
  );
};

