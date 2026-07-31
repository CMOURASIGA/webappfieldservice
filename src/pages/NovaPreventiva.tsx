import React, { useEffect, useState } from "react";
import { format, addDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Asset, Category, ChecklistItem, ChecklistTemplate, Location, PreventivePlan, Provider, Unit, User } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { MultiSelectField } from "../components/ui/MultiSelectField";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { useAuth } from "../contexts/AuthContext";
import { OperationalPageHeader } from "../components/ui/OperationalPage";
import { TabbedFormCard } from "../components/ui/TabbedFormCard";

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
    unitId: "",
    locationId: "",
    assetIds: [] as string[],
    categoryId: "",
    templateId: "",
    type: "Preventiva",
    description: "",
    periodicity: "mensal",
    expectedWorkOrders: "12",
    nextExecution: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    providerId: "",
    responsibleId: "",
    estimatedValue: "",
    alertDaysAttention: "30",
    alertDaysCritical: "15",
  });

  const [checklistItems, setChecklistItems] = useState<{ id: string; description: string; required: boolean }[]>([
    { id: crypto.randomUUID(), description: "", required: true },
  ]);

  useEffect(() => {
    setUnits(storageService.get("gsi_units").filter((item) => item.active));
    setLocations(storageService.get("gsi_locations").filter((item) => item.active));
    setAssets(storageService.get("gsi_assets").filter((item) => item.status === "Ativo" && item.active !== false));
    setProviders(storageService.get("gsi_providers").filter((item) => item.status === "Ativo" && item.active !== false));
    setCategories(storageService.get("gsi_categories").filter((item) => item.active !== false));
    setTemplates(storageService.get("gsi_checklist_templates")?.filter((item) => item.active) || []);
    setUsers(storageService.get("gsi_users").filter((item) => item.active));
  }, []);

  const filteredLocations = locations.filter((item) => item.unitId === formData.unitId);
  const availableAssets = assets;

  const handleTemplateChange = (templateId: string) => {
    setFormData((current) => ({ ...current, templateId }));
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;

    setChecklistItems(template.items.map((item) => ({
      id: crypto.randomUUID(),
      description: item.description,
      required: item.required,
    })));

    setFormData((current) => ({
      ...current,
      templateId,
      description: current.description || template.description,
      categoryId: current.categoryId || template.categoryId,
    }));
  };

  const handleAddChecklistItem = () => {
    setChecklistItems((current) => [...current, { id: crypto.randomUUID(), description: "", required: true }]);
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems((current) => current.filter((item) => item.id !== id));
  };

  const handleChecklistChange = (id: string, field: "description" | "required", value: string | boolean) => {
    setChecklistItems((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser) return;

    const validChecklist: ChecklistItem[] = checklistItems
      .filter((item) => item.description.trim() !== "")
      .map((item) => ({ ...item }));

    const newPlan: PreventivePlan = {
      id: crypto.randomUUID(),
      code: `PREV-${Math.floor(1000 + Math.random() * 9000)}`,
      unitId: formData.unitId,
      locationId: formData.locationId || undefined,
      assetId: formData.assetIds[0],
      assetIds: formData.assetIds,
      type: formData.type,
      categoryId: formData.categoryId,
      templateId: formData.templateId || undefined,
      description: formData.description,
      periodicity: formData.periodicity,
      expectedWorkOrders: Number(formData.expectedWorkOrders || 1),
      startDate: new Date(formData.nextExecution).toISOString(),
      nextExecution: new Date(formData.nextExecution).toISOString(),
      providerId: formData.providerId || undefined,
      responsibleId: formData.responsibleId || undefined,
      estimatedValue: Number(formData.estimatedValue || 0),
      alertDaysAttention: Number(formData.alertDaysAttention || 30),
      alertDaysCritical: Number(formData.alertDaysCritical || 15),
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

  const formSectionTitleClass = "text-base font-semibold text-slate-900";
  const formSectionDescriptionClass = "mt-1 text-sm text-slate-600";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <OperationalPageHeader
        title="Nova Manutencao Preventiva"
        description="Cadastre uma nova rotina de manutencao preventiva."
        backTo="/preventivas"
      />

      <form onSubmit={handleSubmit}>
        <TabbedFormCard
          submitLabel="Salvar"
          tabs={[
            {
              value: "planejamento",
              label: "Planejamento",
              content: (
                <div className="space-y-7 p-6">
                  <div>
                    <h2 className={formSectionTitleClass}>Abrangencia e planejamento</h2>
                    <p className={formSectionDescriptionClass}>Defina os ativos, a rotina e os responsaveis pelo plano.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Select
                      label="Unidade"
                      required
                      value={formData.unitId}
                      onChange={(event) => setFormData({ ...formData, unitId: event.target.value, locationId: "" })}
                      options={units.map((item) => ({ value: item.id, label: item.name }))}
                    />
                    <Select
                      label="Local/Ambiente (Opcional)"
                      value={formData.locationId}
                      onChange={(event) => setFormData({ ...formData, locationId: event.target.value })}
                      options={filteredLocations.map((item) => ({ value: item.id, label: item.name }))}
                      disabled={!formData.unitId}
                    />

                    <div className="md:col-span-2">
                      <MultiSelectField
                        label="Ativos abrangidos pelo plano"
                        value={formData.assetIds}
                        onChange={(assetIds) => setFormData({ ...formData, assetIds })}
                        options={availableAssets.map((item) => ({ value: item.id, label: `${item.code} - ${item.name}` }))}
                        helperText="A selecao comeca em branco. Um plano pode abranger varios ativos e, na geracao, sera criada uma OS para cada ativo selecionado."
                        emptyMessage="Nenhum ativo adicionado ao plano."
                        searchPlaceholder="Pesquise pelo codigo ou nome do ativo..."
                        addButtonLabel="Adicionar ativo"
                      />
                    </div>

                    <Select
                      label="Tipo de manutencao"
                      required
                      value={formData.type}
                      onChange={(event) => setFormData({ ...formData, type: event.target.value })}
                      options={[
                        { value: "Preventiva", label: "Preventiva" },
                        { value: "Preditiva", label: "Preditiva" },
                        { value: "Inspecao", label: "Inspecao" },
                        { value: "Corretiva planejada", label: "Corretiva planejada" },
                      ]}
                    />
                    <Select
                      label="Categoria"
                      required
                      value={formData.categoryId}
                      onChange={(event) => setFormData({ ...formData, categoryId: event.target.value })}
                      options={categories.map((item) => ({ value: item.id, label: item.name }))}
                    />
                    <Select
                      label="Modelo de checklist (Opcional)"
                      value={formData.templateId}
                      onChange={(event) => handleTemplateChange(event.target.value)}
                      options={templates.map((item) => ({ value: item.id, label: item.name }))}
                    />
                    <Select
                      label="Prestador de servico"
                      value={formData.providerId}
                      onChange={(event) => setFormData({ ...formData, providerId: event.target.value })}
                      options={providers.map((item) => ({ value: item.id, label: item.name }))}
                    />
                    <Select
                      label="Responsavel interno"
                      value={formData.responsibleId}
                      onChange={(event) => setFormData({ ...formData, responsibleId: event.target.value })}
                      options={[{ value: "", label: "Nao atribuido" }, ...users.map((item) => ({ value: item.id, label: item.name }))]}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Select
                        label="Periodicidade"
                        required
                        value={formData.periodicity}
                        onChange={(event) => setFormData({ ...formData, periodicity: event.target.value })}
                        options={[
                          { value: "diaria", label: "Diaria" },
                          { value: "semanal", label: "Semanal" },
                          { value: "mensal", label: "Mensal" },
                          { value: "trimestral", label: "Trimestral" },
                          { value: "semestral", label: "Semestral" },
                          { value: "anual", label: "Anual" },
                        ]}
                      />
                      <Input
                        type="date"
                        label="Primeira execucao"
                        required
                        value={formData.nextExecution}
                        onChange={(event) => setFormData({ ...formData, nextExecution: event.target.value })}
                      />
                    </div>

                    <Input
                      type="number"
                      min="1"
                      label="Total de OS previstas no plano"
                      value={formData.expectedWorkOrders}
                      onChange={(event) => setFormData({ ...formData, expectedWorkOrders: event.target.value })}
                    />
                    <p className="-mt-4 text-xs text-slate-500 md:col-span-2">
                      Informe quantas ordens este plano deve gerar dentro do seu ciclo de acompanhamento. A periodicidade continua definindo o intervalo entre as geracoes.
                    </p>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      label="Valor estimado"
                      value={formData.estimatedValue}
                      onChange={(event) => setFormData({ ...formData, estimatedValue: event.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4 rounded-lg border-2 border-slate-300 bg-slate-50 p-3">
                      <Input
                        type="number"
                        min="1"
                        label="Alerta de atencao (dias)"
                        value={formData.alertDaysAttention}
                        onChange={(event) => setFormData({ ...formData, alertDaysAttention: event.target.value })}
                      />
                      <Input
                        type="number"
                        min="1"
                        label="Alerta critico (dias)"
                        value={formData.alertDaysCritical}
                        onChange={(event) => setFormData({ ...formData, alertDaysCritical: event.target.value })}
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <Textarea
                      label="Descricao / escopo do servico"
                      required
                      placeholder="Descreva o que deve ser feito na preventiva..."
                      value={formData.description}
                      onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                    />
                  </div>
                </div>
              ),
            },
            {
              value: "checklist",
              label: "Checklist",
              content: (
                <div className="space-y-7 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className={formSectionTitleClass}>Checklist de verificacao</h2>
                      <p className={formSectionDescriptionClass}>Inclua os itens que deverao ser conferidos na execucao.</p>
                    </div>
                    <Button type="button" variant="secondary" size="sm" onClick={handleAddChecklistItem}>
                      Adicionar item
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {checklistItems.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-4 rounded-md border border-slate-200 p-3">
                        <div className="flex-1">
                          <Input
                            placeholder={`Descricao do item ${index + 1}`}
                            value={item.description}
                            onChange={(event) => handleChecklistChange(item.id, "description", event.target.value)}
                          />
                        </div>
                        <label className="whitespace-nowrap text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={item.required}
                            onChange={(event) => handleChecklistChange(item.id, "required", event.target.checked)}
                          />
                          <span className="ml-2">Obrigatorio</span>
                        </label>
                        {checklistItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveChecklistItem(item.id)}
                            className="rounded-md p-2 text-slate-400 transition-colors hover:text-red-500"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ),
            },
          ]}
        />
      </form>
    </div>
  );
};
