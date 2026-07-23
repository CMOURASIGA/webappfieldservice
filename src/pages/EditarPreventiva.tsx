import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Unit, Location, Asset, PreventivePlan, Category, Provider, ChecklistTemplate, ChecklistItem } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export const EditarPreventiva = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);

  const [formData, setFormData] = useState({
    unitId: "",
    locationId: "",
    assetId: "",
    categoryId: "",
    templateId: "",
    type: "Preventiva",
    description: "",
    periodicity: "mensal",
    nextExecution: "",
    providerId: "",
  });

  const [checklistItems, setChecklistItems] = useState<{id: string, description: string, required: boolean}[]>([]);
  const [planCode, setPlanCode] = useState("");

  useEffect(() => {
    setUnits(storageService.get("gsi_units").filter(u => u.active));
    setLocations(storageService.get("gsi_locations").filter(l => l.active));
    setAssets(storageService.get("gsi_assets").filter(a => a.status === "Ativo" && a.active !== false));
    setProviders(storageService.get("gsi_providers").filter(p => p.status === "Ativo" && p.active !== false));
    setCategories(storageService.get("gsi_categories").filter(c => c.active !== false));
    setTemplates(storageService.get("gsi_checklist_templates")?.filter(t => t.active) || []);

    if (id) {
      const plans = storageService.get("gsi_preventive_plans");
      const plan = plans.find(p => p.id === id);
      if (plan) {
        setPlanCode(plan.code);
        setFormData({
          unitId: plan.unitId || "",
          locationId: plan.locationId || "",
          assetId: plan.assetId || "",
          categoryId: plan.categoryId || "",
          templateId: plan.templateId || "",
          type: plan.type || "Preventiva",
          description: plan.description || "",
          periodicity: plan.periodicity || "mensal",
          nextExecution: plan.nextExecution ? plan.nextExecution.split("T")[0] : "",
          providerId: plan.providerId || "",
        });
        if (plan.checklist && plan.checklist.length > 0) {
          setChecklistItems(plan.checklist);
        } else {
           setChecklistItems([{ id: crypto.randomUUID(), description: "", required: true }]);
        }
      }
    }
  }, [id]);

  const filteredLocations = locations.filter(l => l.unitId === formData.unitId);
  const filteredAssets = assets.filter(a => a.locationId === formData.locationId || (!formData.locationId && a.unitId === formData.unitId));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.unitId || !formData.categoryId || !formData.nextExecution) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const validChecklist = checklistItems.filter(i => i.description.trim() !== "");

    const plans = storageService.get("gsi_preventive_plans");
    const planIndex = plans.findIndex(p => p.id === id);
    
    if (planIndex === -1) return;

    const updatedPlan: PreventivePlan = {
      ...plans[planIndex],
      unitId: formData.unitId,
      locationId: formData.locationId || undefined,
      assetId: formData.assetId || undefined,
      categoryId: formData.categoryId,
      type: formData.type,
      description: formData.description,
      periodicity: formData.periodicity,
      nextExecution: new Date(formData.nextExecution).toISOString(),
      providerId: formData.providerId || undefined,
      templateId: formData.templateId || undefined,
      checklist: validChecklist,
      updatedAt: new Date().toISOString()
    };

    plans[planIndex] = updatedPlan;
    storageService.set("gsi_preventive_plans", plans);
    storageService.logAudit(currentUser?.id || "system", `Editou plano preventivo: ${updatedPlan.code}`);
    
    navigate(`/preventivas/${id}`);
  };

  const loadTemplate = (templateId: string) => {
    setFormData(prev => ({ ...prev, templateId }));
    if (!templateId) return;
    
    const template = templates.find(t => t.id === templateId);
    if (template) {
      if (!formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: template.categoryId }));
      }
      if (!formData.description) {
        setFormData(prev => ({ ...prev, description: template.description }));
      }
      setChecklistItems(template.items.map(item => ({ ...item })));
    }
  };

  const addChecklistItem = () => {
    setChecklistItems([...checklistItems, { id: crypto.randomUUID(), description: "", required: true }]);
  };

  const removeChecklistItem = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const updateChecklistItem = (index: number, field: keyof ChecklistItem, value: any) => {
    const newItems = [...checklistItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setChecklistItems(newItems);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-title-panel flex items-center gap-4">
        <Link to={`/preventivas/${id}`}>
          <Button variant="secondary" size="sm" className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Editar Manutenção: {planCode}</h1>
          <p className="text-sm text-slate-500">Altere os dados da manutenção preventiva.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unidade *</label>
                <Select required value={formData.unitId} onChange={e => setFormData({ ...formData, unitId: e.target.value, locationId: "", assetId: "" })}>
                  <option value="">Selecione...</option>
                  {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Local/Ambiente</label>
                <Select value={formData.locationId} onChange={e => setFormData({ ...formData, locationId: e.target.value, assetId: "" })} disabled={!formData.unitId}>
                  <option value="">Geral da Unidade</option>
                  {filteredLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Equipamento/Ativo</label>
                <Select value={formData.assetId} onChange={e => setFormData({ ...formData, assetId: e.target.value })} disabled={!formData.unitId}>
                  <option value="">Nenhum específico</option>
                  {filteredAssets.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria *</label>
                <Select required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })}>
                  <option value="">Selecione...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição/Serviço *</label>
                <Input required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Ex: Manutenção Mensal PMOC - Chiller" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agendamento e Responsáveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Periodicidade *</label>
                <Select required value={formData.periodicity} onChange={e => setFormData({ ...formData, periodicity: e.target.value })}>
                  <option value="diaria">Diária</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="semestral">Semestral</option>
                  <option value="anual">Anual</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Próxima Execução *</label>
                <Input type="date" required value={formData.nextExecution} onChange={e => setFormData({ ...formData, nextExecution: e.target.value })} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Prestador Responsável (Opcional)</label>
                <Select value={formData.providerId} onChange={e => setFormData({ ...formData, providerId: e.target.value })}>
                  <option value="">Atribuição Interna (Equipe GSI)</option>
                  {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Checklist (Passo a passo)</CardTitle>
            <div className="w-64">
              <Select value={formData.templateId} onChange={e => loadTemplate(e.target.value)}>
                <option value="">Carregar de um modelo...</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklistItems.map((item, idx) => (
                <div key={item.id} className="flex gap-2 items-start">
                  <Input 
                    value={item.description} 
                    onChange={e => updateChecklistItem(idx, 'description', e.target.value)} 
                    placeholder="Descrição da tarefa..."
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id={`req-${item.id}`} 
                      checked={item.required}
                      onChange={e => updateChecklistItem(idx, 'required', e.target.checked)}
                    />
                    <label htmlFor={`req-${item.id}`} className="text-sm text-slate-600 whitespace-nowrap">Obrigatório</label>
                  </div>
                  <Button type="button" variant="secondary" className="text-red-600 hover:text-red-700" onClick={() => removeChecklistItem(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={addChecklistItem} className="w-full mt-2">
                <Plus className="w-4 h-4 mr-2" /> Adicionar Item de Verificação
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link to={`/preventivas/${id}`}>
            <Button variant="secondary" type="button">Cancelar</Button>
          </Link>
          <Button type="submit">Salvar Alterações</Button>
        </div>
      </form>
    </div>
  );
};
