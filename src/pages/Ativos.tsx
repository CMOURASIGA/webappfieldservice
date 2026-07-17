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
        <Button onClick={handleOpenNew}>+ Novo Ativo</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200">Código</th>
                  <th className="px-6 py-4 border-b border-slate-200">Nome / Modelo</th>
                  <th className="px-6 py-4 border-b border-slate-200">Unidade</th>
                  <th className="px-6 py-4 border-b border-slate-200">Local</th>
                  <th className="px-6 py-4 border-b border-slate-200">Status</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {assets.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{asset.code}</td>
                    <td className="px-6 py-4 text-slate-900 flex flex-col">
                      <span>{asset.name}</span>
                      <span className="text-xs text-slate-400">{asset.model || asset.manufacturer || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{getUnitName(asset.unitId)}</td>
                    <td className="px-6 py-4 text-slate-600">{getLocationName(asset.locationId)}</td>
                    <td className="px-6 py-4">{getStatusBadge(asset.status)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenEdit(asset)}
                        className="text-brand-600 hover:text-brand-700 font-medium text-sm"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(asset.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {assets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      Nenhum ativo cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
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
    </div>
  );
};
