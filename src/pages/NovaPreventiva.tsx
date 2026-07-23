import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Unit, Location, Asset, PreventivePlan, Category, Provider, ChecklistTemplate, ChecklistItem, User } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";
import { format, isValid, addDays } from "date-fns";
import { OperationalPageHeader } from "../components/ui/OperationalPage";

export const NovaPreventiva = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    unitId: currentUser?.unitId || "",
    locationId: "",
    assetId: "",
    categoryId: "",
    templateId: "",
    type: "Preventiva",
    description: "",
    periodicity: "mensal",
    nextExecution: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    providerId: "",
    responsibleId: "",
    estimatedValue: "",
  });

  const [checklistItems, setChecklistItems] = useState<{id: string, description: string, required: boolean}[]>([{ id: crypto.randomUUID(), description: "", required: true }]);

  useEffect(() => {
    setUnits(storageService.get("gsi_units").filter(u => u.active));
    setLocations(storageService.get("gsi_locations").filter(l => l.active));
    setAssets(storageService.get("gsi_assets").filter(a => a.status === "Ativo" && a.active !== false));
    setProviders(storageService.get("gsi_providers").filter(p => p.status === "Ativo" && p.active !== false));
    setCategories(storageService.get("gsi_categories").filter(c => c.active !== false));
    setTemplates(storageService.get("gsi_checklist_templates")?.filter(t => t.active) || []);
    setUsers(storageService.get("gsi_users").filter((user) => user.active));
  }, []);

  const filteredLocations = locations.filter(l => l.unitId === formData.unitId);
  const filteredAssets = assets.filter(a => a.locationId === formData.locationId || (!formData.locationId && a.unitId === formData.unitId));

  const handleTemplateChange = (templateId: string) => {
    setFormData(prev => ({ ...prev, templateId }));
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setChecklistItems(template.items.map(i => ({ id: crypto.randomUUID(), description: i.description, required: i.required })));
      if (template.description && !formData.description) {
        setFormData(prev => ({ ...prev, description: template.description }));
      }
      if (template.categoryId && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: template.categoryId }));
      }
    }
  };

  const handleAddChecklistItem = () => {
    setChecklistItems([...checklistItems, { id: crypto.randomUUID(), description: "", required: true }]);
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id));
  };

  const handleChecklistChange = (id: string, field: "description" | "required", value: any) => {
    setChecklistItems(checklistItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const validChecklist: ChecklistItem[] = checklistItems
      .filter(item => item.description.trim() !== "")
      .map(item => ({ ...item }));

    const newPlan: PreventivePlan = {
      id: crypto.randomUUID(),
      code: `PREV-${Math.floor(1000 + Math.random() * 9000)}`,
      unitId: formData.unitId,
      locationId: formData.locationId,
      assetId: formData.assetId,
      type: formData.type,
      categoryId: formData.categoryId,
      templateId: formData.templateId || undefined,
      description: formData.description,
      periodicity: formData.periodicity,
      startDate: new Date(formData.nextExecution).toISOString(),
      nextExecution: new Date(formData.nextExecution).toISOString(),
      providerId: formData.providerId,
      responsibleId: formData.responsibleId || undefined,
      estimatedValue: Number(formData.estimatedValue || 0),
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
      <OperationalPageHeader
        title="Nova Manutenção Preventiva"
        description="Cadastre uma nova rotina de manutenção preventiva."
        backTo="/preventivas"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Manutenção</CardTitle>
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
                label="Modelo de Checklist (Opcional)"
                value={formData.templateId}
                onChange={e => handleTemplateChange(e.target.value)}
                options={templates.map(t => ({ value: t.id, label: t.name }))}
              />
              <Select
                label="Prestador de Serviço"
                value={formData.providerId}
                onChange={e => setFormData({ ...formData, providerId: e.target.value })}
                options={providers.map(p => ({ value: p.id, label: p.name }))}
              />
              <Select
                label="Responsável interno"
                value={formData.responsibleId}
                onChange={e => setFormData({ ...formData, responsibleId: e.target.value })}
                options={[{ value: "", label: "Não atribuído" }, ...users.map((user) => ({ value: user.id, label: user.name }))]}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <Input type="number" min="0" step="0.01" label="Valor estimado" value={formData.estimatedValue} onChange={e => setFormData({ ...formData, estimatedValue: e.target.value })} />
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
            <Button type="button" variant="secondary" size="sm" onClick={handleAddChecklistItem}>
              + Adicionar Item
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklistItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-4 border border-slate-200 p-3 rounded-md">
                  <div className="flex-1">
                    <Input
                      placeholder={`Descrição do Item ${index + 1}`}
                      value={item.description}
                      onChange={e => handleChecklistChange(item.id, "description", e.target.value)}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-700 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      checked={item.required} 
                      onChange={e => handleChecklistChange(item.id, "required", e.target.checked)} 
                    />
                    Obrigatório
                  </label>
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
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
};
