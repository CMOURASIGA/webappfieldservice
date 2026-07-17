import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Unit, Location, Asset, Provider, PreventivePlan, Category } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";
import { addDays, format } from "date-fns";

export const NovaPreventiva = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    unitId: currentUser?.unitId || "",
    locationId: "",
    assetId: "",
    categoryId: "",
    type: "Preventiva",
    description: "",
    periodicity: "mensal",
    nextExecution: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    providerId: "",
  });

  const [checklistItems, setChecklistItems] = useState([{ id: crypto.randomUUID(), description: "", checked: false }]);

  useEffect(() => {
    setUnits(storageService.get("gsi_units").filter(u => u.active));
    setLocations(storageService.get("gsi_locations").filter(l => l.active));
    setAssets(storageService.get("gsi_assets").filter(a => a.status === "Ativo" && a.active !== false));
    setProviders(storageService.get("gsi_providers").filter(p => p.status === "Ativo" && p.active !== false));
    setCategories(storageService.get("gsi_categories").filter(c => c.active !== false));
  }, []);

  const filteredLocations = locations.filter(l => l.unitId === formData.unitId);
  const filteredAssets = assets.filter(a => a.locationId === formData.locationId || (!formData.locationId && a.unitId === formData.unitId));

  const handleAddChecklistItem = () => {
    setChecklistItems([...checklistItems, { id: crypto.randomUUID(), description: "", checked: false }]);
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id));
  };

  const handleChecklistChange = (id: string, value: string) => {
    setChecklistItems(checklistItems.map(item => item.id === id ? { ...item, description: value } : item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const validChecklist = checklistItems.filter(item => item.description.trim() !== "");

    const newPlan: PreventivePlan = {
      id: crypto.randomUUID(),
      code: `PREV-${Math.floor(1000 + Math.random() * 9000)}`,
      unitId: formData.unitId,
      locationId: formData.locationId,
      assetId: formData.assetId,
      type: formData.type,
      categoryId: formData.categoryId,
      description: formData.description,
      periodicity: formData.periodicity,
      nextExecution: new Date(formData.nextExecution).toISOString(),
      providerId: formData.providerId,
      checklist: validChecklist,
      status: "Ativo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
    };

    const plans = storageService.get("gsi_preventive_plans");
    plans.push(newPlan);
    storageService.set("gsi_preventive_plans", plans);
    
    storageService.logAudit(currentUser.id, "Plano Preventivo Criado", newPlan.id, "PreventivePlan");

    navigate("/preventivas");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Novo Plano Preventivo</h1>
        <p className="text-sm text-slate-500">Cadastre uma nova rotina de manutenção preventiva.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Unidade"
                required
                value={formData.unitId}
                onChange={e => setFormData({ ...formData, unitId: e.target.value, locationId: "", assetId: "" })}
                options={units.map(u => ({ value: u.id, label: u.name }))}
              />
              <Select
                label="Local/Ambiente (Opcional)"
                value={formData.locationId}
                onChange={e => setFormData({ ...formData, locationId: e.target.value, assetId: "" })}
                options={filteredLocations.map(l => ({ value: l.id, label: l.name }))}
                disabled={!formData.unitId}
              />
              <Select
                label="Ativo (Opcional)"
                value={formData.assetId}
                onChange={e => setFormData({ ...formData, assetId: e.target.value })}
                options={filteredAssets.map(a => ({ value: a.id, label: `${a.code} - ${a.name}` }))}
                disabled={!formData.unitId}
              />
              <Select
                label="Categoria"
                required
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                options={categories.map(c => ({ value: c.id, label: c.name }))}
              />
              <Select
                label="Prestador de Serviço"
                value={formData.providerId}
                onChange={e => setFormData({ ...formData, providerId: e.target.value })}
                options={providers.map(p => ({ value: p.id, label: p.name }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Periodicidade"
                  required
                  value={formData.periodicity}
                  onChange={e => setFormData({ ...formData, periodicity: e.target.value })}
                  options={[
                    { value: "diaria", label: "Diária" },
                    { value: "semanal", label: "Semanal" },
                    { value: "mensal", label: "Mensal" },
                    { value: "trimestral", label: "Trimestral" },
                    { value: "semestral", label: "Semestral" },
                    { value: "anual", label: "Anual" },
                  ]}
                />
                <Input
                  type="date"
                  label="Primeira Execução"
                  required
                  value={formData.nextExecution}
                  onChange={e => setFormData({ ...formData, nextExecution: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-6">
              <Textarea
                label="Descrição / Escopo do Serviço"
                required
                placeholder="Descreva o que deve ser feito na preventiva..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Checklist de Verificação</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddChecklistItem}>
              + Adicionar Item
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklistItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder={`Item ${index + 1}`}
                      value={item.description}
                      onChange={e => handleChecklistChange(item.id, e.target.value)}
                    />
                  </div>
                  {checklistItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => navigate("/preventivas")}>
            Cancelar
          </Button>
          <Button type="submit">
            Salvar Plano
          </Button>
        </div>
      </form>
    </div>
  );
};
