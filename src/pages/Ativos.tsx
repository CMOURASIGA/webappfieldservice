import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { CardFooterActions } from "../components/ui/CardFooterActions";
import { Drawer } from "../components/ui/Drawer";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { useAuth } from "../contexts/AuthContext";
import { storageService } from "../services/storageService";
import { Asset, Location, Unit } from "../types";
import { OperationalPageHeader } from "../components/ui/OperationalPage";
import { Plus } from "lucide-react";

export const Ativos = () => {
  const { currentUser } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState<Partial<Asset>>({
    code: "",
    name: "",
    category: "",
    unitId: "",
    locationId: "",
    manufacturer: "",
    model: "",
    patrimonyNumber: "",
    criticality: "Baixa",
    status: "Ativo",
    observations: "",
  });

  const loadData = () => {
    setAssets(storageService.get("gsi_assets").filter((asset) => asset.active));
    setUnits(storageService.get("gsi_units").filter((unit) => unit.active));
    setLocations(storageService.get("gsi_locations").filter((location) => location.active));
  };

  useEffect(() => {
    loadData();
  }, []);

  const getUnitName = (id: string) => units.find((unit) => unit.id === id)?.name || "N/A";
  const getLocationName = (id: string) => locations.find((location) => location.id === id)?.name || "N/A";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ativo":
        return <Badge variant="success">{status}</Badge>;
      case "Inativo":
        return <Badge variant="default">{status}</Badge>;
      case "Em manutenção":
        return <Badge variant="warning">{status}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const handleOpenNew = () => {
    setEditingAsset(null);
    setFormData({
      code: `ATV-${Math.floor(1000 + Math.random() * 9000)}`,
      name: "",
      category: "",
      unitId: currentUser?.unitId || "",
      locationId: "",
      manufacturer: "",
      model: "",
      patrimonyNumber: "",
      criticality: "Baixa",
      status: "Ativo",
      observations: "",
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({ ...asset });
    setIsDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    const allAssets = storageService.get("gsi_assets");
    const index = allAssets.findIndex((asset) => asset.id === id);
    if (index === -1) return;

    allAssets[index].active = false;
    storageService.set("gsi_assets", allAssets);

    if (currentUser) {
      storageService.logAudit(currentUser.id, "Inativou Ativo", id, "Asset");
    }

    loadData();
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();

    const allAssets = storageService.get("gsi_assets");

    if (editingAsset) {
      const index = allAssets.findIndex((asset) => asset.id === editingAsset.id);
      if (index !== -1) {
        allAssets[index] = { ...allAssets[index], ...formData } as Asset;
      }
      if (currentUser) {
        storageService.logAudit(currentUser.id, "Editou Ativo", editingAsset.id, "Asset");
      }
    } else {
      const newAsset: Asset = {
        ...(formData as Asset),
        id: crypto.randomUUID(),
        active: true,
      };
      allAssets.push(newAsset);
      if (currentUser) {
        storageService.logAudit(currentUser.id, "Criou Ativo", newAsset.id, "Asset");
      }
    }

    storageService.set("gsi_assets", allAssets);
    loadData();
    setIsDrawerOpen(false);
  };

  const filteredLocations = locations.filter((location) => location.unitId === formData.unitId);

  return (
    <div className="space-y-6">
      <OperationalPageHeader
        title="Ativos"
        description="Gestão do patrimônio e dos equipamentos vinculados às unidades."
        backTo="/servicos"
        actions={<Button onClick={handleOpenNew} className="gap-2"><Plus className="h-4 w-4" /> Novo Ativo</Button>}
      />

      <Card className="p-4">
        <CardContent className="p-0">
            <div className="operational-grid">
              {assets.map((asset) => (
                <Card key={asset.id} className="operational-card flex h-full flex-col">
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

                    <div className="operational-card-fields mt-2 flex-1">
                      <div className="operational-card-field">
                        <p className="text-xs text-slate-400">Local</p>
                        <p className="font-medium text-slate-700">{getLocationName(asset.locationId)}</p>
                      </div>
                      <div className="operational-card-field border-r-0">
                        <p className="text-xs text-slate-400">Unidade</p>
                        <p className="font-medium text-slate-700">{getUnitName(asset.unitId)}</p>
                      </div>
                      <div className="operational-card-field col-span-2 border-b-0 border-r-0">
                        <p className="text-xs text-slate-400">Patrimonio / Fabricante</p>
                        <p className="font-medium text-slate-700">
                          {asset.patrimonyNumber || "-"} {asset.manufacturer && <span className="text-slate-500 font-normal">/ {asset.manufacturer}</span>}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="mt-auto border-t border-slate-200 px-5 py-4">
                    <CardFooterActions
                      viewLink={`/ativos/${asset.id}`}
                      viewLabel="Ver detalhes"
                      onEdit={() => handleOpenEdit(asset)}
                      editLabel="Editar ativo"
                      onDelete={() => handleDelete(asset.id)}
                      deleteLabel="Inativar ativo"
                      isDeactivate={true}
                    />
                  </CardFooter>
                </Card>
              ))}
            </div>
            {assets.length === 0 && (
              <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                Nenhum ativo encontrado.
              </div>
            )}
        </CardContent>
      </Card>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={editingAsset ? "Editar Ativo" : "Novo Ativo"}>
        <form onSubmit={handleSave} className="space-y-4 rounded-lg border border-slate-300 bg-slate-50/70 p-4">
          <Input label="Codigo do Ativo" required value={formData.code || ""} onChange={(event) => setFormData({ ...formData, code: event.target.value })} />
          <Input
            label="Nome do Ativo"
            required
            value={formData.name || ""}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            placeholder="Ex: Ar Condicionado Split"
          />
          <Select
            label="Categoria"
            required
            value={formData.category || ""}
            onChange={(event) => setFormData({ ...formData, category: event.target.value })}
            options={[
              { value: "Climatizacao", label: "Climatizacao" },
              { value: "Eletrica", label: "Eletrica" },
              { value: "Hidraulica", label: "Hidraulica" },
              { value: "Mobiliario", label: "Mobiliario" },
              { value: "TI / Equipamentos", label: "TI / Equipamentos" },
            ]}
          />
          <Select
            label="Unidade"
            required
            value={formData.unitId || ""}
            onChange={(event) => setFormData({ ...formData, unitId: event.target.value, locationId: "" })}
            options={units.map((unit) => ({ value: unit.id, label: unit.name }))}
          />
          <Select
            label="Local"
            required
            value={formData.locationId || ""}
            onChange={(event) => setFormData({ ...formData, locationId: event.target.value })}
            options={filteredLocations.map((location) => ({ value: location.id, label: location.name }))}
            disabled={!formData.unitId}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Fabricante" value={formData.manufacturer || ""} onChange={(event) => setFormData({ ...formData, manufacturer: event.target.value })} />
            <Input label="Modelo" value={formData.model || ""} onChange={(event) => setFormData({ ...formData, model: event.target.value })} />
          </div>
          <Input label="Numero de Patrimonio" value={formData.patrimonyNumber || ""} onChange={(event) => setFormData({ ...formData, patrimonyNumber: event.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Criticidade"
              required
              value={formData.criticality || "Baixa"}
              onChange={(event) => setFormData({ ...formData, criticality: event.target.value as any })}
              options={[
                { value: "Baixa", label: "Baixa" },
                { value: "Média", label: "Media" },
                { value: "Alta", label: "Alta" },
              ]}
            />
            <Select
              label="Status"
              required
              value={formData.status || "Ativo"}
              onChange={(event) => setFormData({ ...formData, status: event.target.value as any })}
              options={[
                { value: "Ativo", label: "Ativo" },
                { value: "Inativo", label: "Inativo" },
                { value: "Em manutenção", label: "Em manutencao" },
              ]}
            />
          </div>
          <Textarea label="Observacoes" value={formData.observations || ""} onChange={(event) => setFormData({ ...formData, observations: event.target.value })} rows={3} />
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsDrawerOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Ativo</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
