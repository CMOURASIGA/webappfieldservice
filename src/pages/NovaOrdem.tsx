import React, { useEffect, useMemo, useState } from "react";
import { FieldErrors, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Swal from "sweetalert2";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FileText, Plus, Trash2, Upload, X } from "lucide-react";
import ReactSelect, { SingleValue, StylesConfig } from "react-select";
import { storageService } from "../services/storageService";
import { Asset, Attachment, Category, Location, OSMaterial, Priority, Provider, Request, StockMaterial, StockRequest, Unit, User, WorkOrder, WorkOrderStatus } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { MultiSelectField } from "../components/ui/MultiSelectField";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { OperationalPageHeader } from "../components/ui/OperationalPage";
import { TabsComponent } from "../components/ui/TabsComponent";
import { useAuth } from "../contexts/AuthContext";
import { getAvailableStock, reconcileMaterial, resolveOrderStatusFromMaterials } from "../utils/stock";

const osSchema = z.object({
  unitId: z.string().min(1, "Selecione a unidade."),
  locationId: z.string().min(1, "Selecione o local ou ambiente."),
  sector: z.string().optional(),
  assetIds: z.array(z.string()),
  type: z.string().min(1, "Selecione o tipo de serviço."),
  categoryId: z.string().min(1, "Selecione a categoria."),
  priority: z.enum(["Baixa", "Média", "Alta", "Urgente"]),
  technicalDescription: z.string().trim().min(10, "Descreva o serviço com pelo menos 10 caracteres."),
  responsibleId: z.string().optional(),
  providerId: z.string().optional(),
  plannedDate: z.string().optional(),
  plannedStartTime: z.string().optional(),
  estimatedDurationMinutes: z.string().optional(),
  deadline: z.string().optional(),
  scheduleNotes: z.string().optional(),
});

type OSFormData = z.infer<typeof osSchema>;

type SelectOption = {
  value: string;
  label: string;
};

type MaterialDraft = {
  id: string;
  mode: "registered" | "unregistered";
  materialId: string;
  description: string;
  quantity: string;
  estimatedUnit: string;
  priority: Priority;
  justification: string;
};

const materialSelectStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderWidth: 2,
    borderColor: state.isFocused ? "#1246a0" : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(18, 70, 160, 0.15)" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#1246a0" : "#94a3b8",
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: "#94a3b8",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#f4f7fd" : "#ffffff",
    color: "#0f172a",
    cursor: "pointer",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 20,
  }),
};

const fileToAttachment = (file: File) => new Promise<Attachment>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, type: file.type || "application/octet-stream", size: file.size, uploadedAt: new Date().toISOString(), dataUrl: String(reader.result) });
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const createEmptyMaterialDraft = (): MaterialDraft => ({
  id: crypto.randomUUID(),
  mode: "registered",
  materialId: "",
  description: "",
  quantity: "",
  estimatedUnit: "",
  priority: "Média",
  justification: "",
});

export const NovaOrdem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const sourceRequest = (location.state as { sourceRequest?: Request } | null)?.sourceRequest;
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [stockMaterials, setStockMaterials] = useState<StockMaterial[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [materialDrafts, setMaterialDrafts] = useState<MaterialDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<OSFormData>({
    resolver: zodResolver(osSchema),
    mode: "onChange",
    defaultValues: {
      unitId: sourceRequest?.unitId || "",
      locationId: sourceRequest?.locationId || "",
      sector: sourceRequest?.sector || "",
      assetIds: [],
      type: "Corretiva",
      categoryId: sourceRequest?.categoryId || "",
      priority: sourceRequest?.suggestedPriority || "Média",
      technicalDescription: sourceRequest?.description || "",
      responsibleId: "",
      providerId: "",
      plannedDate: "",
      plannedStartTime: "",
      estimatedDurationMinutes: "60",
      deadline: "",
      scheduleNotes: "",
    },
  });
  const { register, handleSubmit, watch, setValue, formState: { errors } } = methods;
  const [, setSearchParams] = useSearchParams();
  const unitId = watch("unitId");
  const assetIds = watch("assetIds");
  const formPriority = watch("priority");
  const filteredLocations = locations.filter((item) => item.unitId === unitId);
  const assetOptions = assets.map((item) => ({ value: item.id, label: `${item.code} - ${item.name}` }));

  const materialOptions = useMemo(
    () => stockMaterials.filter((item) => item.active).map((item) => ({
      value: item.id,
      label: `${item.code} - ${item.name} (${getAvailableStock(item)} disponível)`,
    })),
    [stockMaterials],
  );

  useEffect(() => {
    setUnits(storageService.get("gsi_units").filter((item) => item.active));
    setLocations(storageService.get("gsi_locations").filter((item) => item.active));
    setAssets(storageService.get("gsi_assets").filter((item) => item.active && item.status === "Ativo"));
    setCategories(storageService.get("gsi_categories").filter((item) => item.active));
    setUsers(storageService.get("gsi_users").filter((item) => item.active));
    setProviders(storageService.get("gsi_providers").filter((item) => item.active && item.status === "Ativo"));
    setStockMaterials((storageService.get("gsi_stock_materials") || []).map(reconcileMaterial));
  }, []);

  const addMaterialDraft = () => {
    setMaterialDrafts((current) => [...current, { ...createEmptyMaterialDraft(), priority: formPriority }]);
  };

  const updateMaterialDraft = (draftId: string, updater: (draft: MaterialDraft) => MaterialDraft) => {
    setMaterialDrafts((current) => current.map((draft) => draft.id === draftId ? updater(draft) : draft));
  };

  const removeMaterialDraft = (draftId: string) => {
    setMaterialDrafts((current) => current.filter((draft) => draft.id !== draftId));
  };

  const validateMaterialDrafts = () => {
    for (const draft of materialDrafts) {
      const quantity = Number(draft.quantity);
      if (!quantity || quantity <= 0) {
        return "Informe uma quantidade válida para todos os materiais vinculados.";
      }
      if (draft.mode === "registered" && !draft.materialId) {
        return "Selecione o material cadastrado antes de salvar a OS.";
      }
      if (draft.mode === "unregistered" && !draft.description.trim()) {
        return "Informe a descrição do material não cadastrado.";
      }
    }
    return null;
  };

  const buildSupplyData = (orderId: string, data: OSFormData) => {
    const orderMaterials: OSMaterial[] = [];
    const stockRequests: StockRequest[] = [];

    materialDrafts.forEach((draft) => {
      const quantity = Number(draft.quantity);

      if (draft.mode === "registered") {
        const material = stockMaterials.find((item) => item.id === draft.materialId);
        if (!material) return;

        const availableBalance = getAvailableStock(material);
        const missingQuantity = Math.max(0, quantity - availableBalance);
        const availability: OSMaterial["availability"] =
          missingQuantity <= 0 ? "Disponível" : availableBalance > 0 ? "Parcialmente disponível" : "Indisponível";

        orderMaterials.push({
          id: crypto.randomUUID(),
          materialId: material.id,
          description: material.name,
          type: material.unit,
          unitPrice: material.unitPrice,
          quantity,
          previousBalance: material.physicalBalance,
          newBalance: missingQuantity > 0 ? material.physicalBalance + missingQuantity : material.physicalBalance,
          total: Number(material.unitPrice || 0) * quantity,
          classification: "Obrigatório",
          availability,
          isUnregistered: false,
          justification: draft.justification.trim() || undefined,
        });

        if (missingQuantity > 0) {
          stockRequests.push({
            id: `sreq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            protocol: `REQ-${Math.floor(Math.random() * 100000)}`,
            workOrderId: orderId,
            materialId: material.id,
            isUnregistered: false,
            quantity: missingQuantity,
            previousBalance: material.physicalBalance,
            newBalance: material.physicalBalance + missingQuantity,
            estimatedUnit: material.unit,
            justification: draft.justification.trim() || `Reposição necessária para a OS ${orderId}.`,
            priority: draft.priority,
            requesterId: currentUser?.id || "usr-1",
            unitId: data.unitId,
            sector: data.sector?.trim() || undefined,
            assetId: data.assetIds[0] || undefined,
            locationId: data.locationId,
            neededDate: data.deadline || undefined,
            status: "Aguardando análise",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        orderMaterials.push({
          id: crypto.randomUUID(),
          description: draft.description.trim(),
          type: draft.estimatedUnit.trim() || "UN",
          quantity,
          classification: "Obrigatório",
          availability: "Aguardando validação",
          isUnregistered: true,
          justification: draft.justification.trim() || undefined,
        });

        stockRequests.push({
          id: `sreq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          protocol: `REQ-${Math.floor(Math.random() * 100000)}`,
          workOrderId: orderId,
          isUnregistered: true,
          suggestedDescription: draft.description.trim(),
          quantity,
          estimatedUnit: draft.estimatedUnit.trim() || "UN",
          justification: draft.justification.trim() || `Item não cadastrado solicitado para a OS ${orderId}.`,
          priority: draft.priority,
          requesterId: currentUser?.id || "usr-1",
          unitId: data.unitId,
          sector: data.sector?.trim() || undefined,
          assetId: data.assetIds[0] || undefined,
          locationId: data.locationId,
          neededDate: data.deadline || undefined,
          status: "Aguardando análise",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });

    return { orderMaterials, stockRequests };
  };

  const onSubmit = async (data: OSFormData) => {
    const materialValidationMessage = validateMaterialDrafts();
    if (materialValidationMessage) {
      setSearchParams({ tab: "materiais" }, { replace: true });
      await Swal.fire({ icon: "warning", title: "Revise os materiais da OS.", text: materialValidationMessage });
      return;
    }

    setIsSubmitting(true);
    try {
      const attachments = await Promise.all(files.map(fileToAttachment));
      const orderId = crypto.randomUUID();
      const { orderMaterials, stockRequests } = buildSupplyData(orderId, data);
      const hasAssignee = Boolean(data.responsibleId || data.providerId);
      const hasSchedule = Boolean(data.plannedDate && data.plannedStartTime && hasAssignee);
      const plannedStart = hasSchedule ? new Date(`${data.plannedDate}T${data.plannedStartTime}:00`).toISOString() : undefined;
      const estimatedDurationMinutes = Number(data.estimatedDurationMinutes || 60);
      const plannedEnd = plannedStart ? new Date(new Date(plannedStart).getTime() + estimatedDurationMinutes * 60_000).toISOString() : undefined;
      const baseStatus: WorkOrderStatus = hasSchedule ? "Programada" : hasAssignee ? "Atribuída" : "Nova";
      const newOrder: WorkOrder = {
        id: orderId,
        number: `OS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        requestId: sourceRequest?.id,
        unitId: data.unitId,
        locationId: data.locationId,
        sector: data.sector?.trim() || undefined,
        assetId: data.assetIds[0],
        assetIds: data.assetIds,
        type: data.type,
        categoryId: data.categoryId,
        priority: data.priority,
        responsibleId: data.responsibleId || undefined,
        providerId: data.providerId || undefined,
        technicalDescription: data.technicalDescription.trim(),
        deadline: data.deadline ? new Date(`${data.deadline}T23:59:59`).toISOString() : undefined,
        plannedDate: data.plannedDate || undefined,
        plannedStart,
        plannedEnd,
        estimatedDurationMinutes,
        scheduleStatus: hasSchedule ? "Programada" : undefined,
        scheduleNotes: data.scheduleNotes?.trim() || undefined,
        status: baseStatus,
        operationalSituation: hasSchedule ? "Programada" : "Planejamento",
        checklist: [],
        materials: orderMaterials,
        observations: "",
        attachments,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true,
      };

      const resolvedStatus = resolveOrderStatusFromMaterials(newOrder);
      const finalOrder: WorkOrder = {
        ...newOrder,
        status: resolvedStatus,
        operationalSituation: resolvedStatus === "Programada" ? "Programada" : resolvedStatus === "Nova" ? "Nova" : "Planejamento",
        supplyStatus: orderMaterials.length ? (stockRequests.length ? "Aguardando análise" : "Em planejamento") : "Não informado",
      };

      const orders = storageService.get("gsi_work_orders");
      storageService.set("gsi_work_orders", [...orders, finalOrder]);

      if (stockRequests.length) {
        const existingRequests = storageService.get("gsi_stock_requests") || [];
        storageService.set("gsi_stock_requests", [...existingRequests, ...stockRequests]);
      }

      if (sourceRequest) {
        const requests = storageService.get("gsi_requests").map((request) => request.id === sourceRequest.id ? { ...request, status: "Convertida em ordem" as const, updatedAt: new Date().toISOString() } : request);
        storageService.set("gsi_requests", requests);
      }

      storageService.logAudit(currentUser?.id || "sistema", "Criou Ordem de Serviço", finalOrder.id, "WorkOrder", "", finalOrder.status);
      if (stockRequests.length) {
        stockRequests.forEach((request) => {
          storageService.logAudit(currentUser?.id || "sistema", "Criou solicitação de estoque pela OS", request.id, "StockRequest", undefined, request);
        });
      }

      const successText = stockRequests.length
        ? `${finalOrder.number} criada com ${stockRequests.length} solicitação(ões) de estoque vinculada(s).`
        : `${finalOrder.number} está pronta para acompanhamento.`;
      await Swal.fire({ icon: "success", title: "OS criada com sucesso.", text: successText, timer: 2000, showConfirmButton: false });
      navigate(`/ordens/${finalOrder.id}`, { state: { createdOrderNumber: finalOrder.number } });
    } catch {
      await Swal.fire({ icon: "error", title: "Não foi possível salvar a OS.", text: "Revise os dados e tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = async (invalidFields: FieldErrors<OSFormData>) => {
    const targetTab = invalidFields.unitId || invalidFields.locationId || invalidFields.assetIds ? "dados-gerais"
      : invalidFields.categoryId || invalidFields.type || invalidFields.priority || invalidFields.technicalDescription || invalidFields.deadline ? "atendimento"
      : "dados-gerais";
    setSearchParams({ tab: targetTab }, { replace: true });
    await Swal.fire({
      icon: "warning",
      title: "Revise os campos obrigatórios.",
      text: "Os campos pendentes foram destacados na aba correspondente.",
    });
  };

  const formSectionTitleClass = "text-base font-semibold text-slate-900";
  const formSectionDescriptionClass = "mt-1 text-sm text-slate-600";
  const formDividerClass = "border-t border-slate-200 pt-6";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <OperationalPageHeader title={sourceRequest ? `Gerar OS da ${sourceRequest.protocol}` : "Nova Ordem de Serviço"} description="Registre, programe e encaminhe a ordem para execução." backTo={sourceRequest ? `/servicos/${sourceRequest.id}` : "/ordens"} />
      {sourceRequest && <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950"><strong>Origem vinculada:</strong> {sourceRequest.title}. Os dados disponíveis foram trazidos para esta OS.</div>}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="system-form-section overflow-hidden">
          <TabsComponent items={[
            {
              value: "dados-gerais",
              title: "Dados gerais",
              children: (
                <div className="space-y-7 p-6">
                  <div>
                    <h2 className={formSectionTitleClass}>Localização e escopo</h2>
                    <p className={formSectionDescriptionClass}>Informe a unidade, o local e o contexto operacional da ordem de serviço.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Select label="Unidade *" error={errors.unitId?.message} {...register("unitId", { onChange: () => setValue("locationId", "", { shouldValidate: true }) })} options={units.map((item) => ({ value: item.id, label: item.name }))} />
                    <Select label="Local / ambiente *" error={errors.locationId?.message} disabled={!unitId} {...register("locationId")} options={filteredLocations.map((item) => ({ value: item.id, label: item.name }))} />
                    <Input label="Setor" placeholder="Ex.: Administrativo" error={errors.sector?.message} {...register("sector")} />
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">
                      A seleção de ativos começa em branco e permanece livre para vincular um ou vários ativos à mesma OS.
                    </div>
                  </div>

                  <div className={formDividerClass}>
                    <h3 className={formSectionTitleClass}>Ativos atendidos</h3>
                    <p className={formSectionDescriptionClass}>Pesquise, selecione e monte a composição de ativos envolvidos na execução.</p>
                  </div>
                  <MultiSelectField
                    label="Ativos atendidos"
                    value={assetIds}
                    onChange={(nextValue) => setValue("assetIds", nextValue, { shouldValidate: true, shouldDirty: true })}
                    options={assetOptions}
                    helperText="Pesquise um ativo, adicione à relação e repita o processo até montar a composição da OS."
                    emptyMessage="Nenhum ativo adicionado à OS."
                    searchPlaceholder="Pesquise pelo código ou nome do ativo..."
                    addButtonLabel="Adicionar ativo"
                  />
                </div>
              ),
            },
            {
              value: "atendimento",
              title: "Atendimento",
              children: (
                <div className="space-y-7 p-6">
                  <div>
                    <h2 className={formSectionTitleClass}>Classificação do atendimento</h2>
                    <p className={formSectionDescriptionClass}>Defina categoria, tipo de serviço, prioridade e prazo da execução.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Select label="Categoria *" error={errors.categoryId?.message} {...register("categoryId")} options={categories.map((item) => ({ value: item.id, label: item.name }))} />
                    <Select label="Tipo de serviço *" error={errors.type?.message} {...register("type")} options={[{ value: "Corretiva", label: "Corretiva" }, { value: "Preventiva", label: "Preventiva" }, { value: "Melhoria", label: "Melhoria" }]} />
                    <Select label="Prioridade *" error={errors.priority?.message} {...register("priority")} options={[{ value: "Baixa", label: "Baixa" }, { value: "Média", label: "Média" }, { value: "Alta", label: "Alta" }, { value: "Urgente", label: "Urgente" }]} />
                    <Input label="Prazo para conclusão" type="date" error={errors.deadline?.message} {...register("deadline")} />
                  </div>

                  <div className={formDividerClass}>
                    <h3 className={formSectionTitleClass}>Descrição técnica</h3>
                    <p className={formSectionDescriptionClass}>Detalhe o problema, o serviço esperado e os cuidados necessários para a execução.</p>
                  </div>
                  <Textarea label="Descrição técnica do serviço *" placeholder="Descreva o problema, o serviço esperado e os cuidados necessários." error={errors.technicalDescription?.message} {...register("technicalDescription")} />
                </div>
              ),
            },
            {
              value: "materiais",
              title: "Materiais",
              children: (
                <div className="space-y-7 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className={formSectionTitleClass}>Materiais envolvidos na execução</h2>
                      <p className={formSectionDescriptionClass}>Quando houver item de estoque, informe a quantidade. Quando não houver cadastro ou saldo, a OS já cria a solicitação para a fila de estoque.</p>
                    </div>
                    <Button type="button" variant="secondary" className="gap-2" onClick={addMaterialDraft}>
                      <Plus className="h-4 w-4" /> Adicionar material
                    </Button>
                  </div>

                  {materialDrafts.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                      Nenhum material vinculado. Se esta OS não depende de insumos, pode salvar normalmente.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {materialDrafts.map((draft, index) => {
                        const selectedMaterial = stockMaterials.find((item) => item.id === draft.materialId);
                        const availableBalance = selectedMaterial ? getAvailableStock(selectedMaterial) : 0;
                        const quantity = Number(draft.quantity || 0);
                        const isMissingStock = draft.mode === "registered" && selectedMaterial && quantity > availableBalance;
                        return (
                          <div key={draft.id} className="rounded-lg border border-slate-200 bg-white p-4">
                            <div className="mb-4 flex items-center justify-between gap-3">
                              <div>
                                <h3 className="text-sm font-semibold text-slate-900">Material {index + 1}</h3>
                                <p className="text-xs text-slate-500">Defina se o item já existe no estoque ou se precisa gerar solicitação por item não cadastrado.</p>
                              </div>
                              <Button type="button" variant="ghost" size="sm" className="gap-2 text-red-700 hover:bg-red-50 hover:no-underline" onClick={() => removeMaterialDraft(draft.id)}>
                                <Trash2 className="h-4 w-4" /> Remover
                              </Button>
                            </div>

                            <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3">
                              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={draft.mode === "unregistered"}
                                  onChange={(event) => updateMaterialDraft(draft.id, (current) => ({
                                    ...current,
                                    mode: event.target.checked ? "unregistered" : "registered",
                                    materialId: "",
                                    description: "",
                                    estimatedUnit: event.target.checked ? current.estimatedUnit : "",
                                    justification: "",
                                  }))}
                                />
                                Material não cadastrado / fora do estoque atual
                              </label>
                            </div>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                              {draft.mode === "registered" ? (
                                <div className="flex flex-col gap-1.5 md:col-span-2">
                                  <label className="text-[13px] font-semibold text-slate-700">Material de estoque</label>
                                  <ReactSelect
                                    value={materialOptions.find((option) => option.value === draft.materialId) || null}
                                    onChange={(option: SingleValue<SelectOption>) => {
                                      const material = stockMaterials.find((item) => item.id === option?.value);
                                      updateMaterialDraft(draft.id, (current) => ({
                                        ...current,
                                        materialId: option?.value || "",
                                        description: material?.name || "",
                                        estimatedUnit: material?.unit || "",
                                      }));
                                    }}
                                    options={materialOptions}
                                    isSearchable
                                    placeholder="Pesquise o material pelo código ou nome..."
                                    noOptionsMessage={() => "Nenhum material encontrado"}
                                    styles={materialSelectStyles}
                                  />
                                  {selectedMaterial && (
                                    <div className={`rounded-md border px-3 py-2 text-xs ${isMissingStock ? "border-amber-300 bg-amber-50 text-amber-900" : "border-blue-300 bg-blue-50 text-blue-950"}`}>
                                      Saldo físico: {selectedMaterial.physicalBalance} | reservado: {selectedMaterial.reservedBalance} | disponível: {availableBalance}
                                      {isMissingStock && ` | faltam ${Math.max(0, quantity - availableBalance)} ${selectedMaterial.unit} para atender a OS`}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <Input
                                  label="Descrição do material *"
                                  placeholder="Ex.: Válvula Hydra Max 1 1/2"
                                  value={draft.description}
                                  onChange={(event) => updateMaterialDraft(draft.id, (current) => ({ ...current, description: event.target.value }))}
                                />
                              )}

                              <Input
                                label="Quantidade *"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={draft.quantity}
                                onChange={(event) => updateMaterialDraft(draft.id, (current) => ({ ...current, quantity: event.target.value }))}
                              />
                              <Input
                                label="Unidade de medida"
                                placeholder="UN, CX, RL, M2"
                                value={draft.estimatedUnit}
                                onChange={(event) => updateMaterialDraft(draft.id, (current) => ({ ...current, estimatedUnit: event.target.value }))}
                                disabled={draft.mode === "registered"}
                              />
                              <Select
                                label="Prioridade da reposição"
                                value={draft.priority}
                                onChange={(event) => updateMaterialDraft(draft.id, (current) => ({ ...current, priority: event.target.value as Priority }))}
                                options={[{ value: "Baixa", label: "Baixa" }, { value: "Média", label: "Média" }, { value: "Alta", label: "Alta" }, { value: "Urgente", label: "Urgente" }]}
                              />
                              <div className="md:col-span-2">
                                <Textarea
                                  label="Justificativa / observação do material"
                                  placeholder="Explique a aplicação do item, a necessidade de reposição ou a característica do material não cadastrado."
                                  value={draft.justification}
                                  onChange={(event) => updateMaterialDraft(draft.id, (current) => ({ ...current, justification: event.target.value }))}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ),
            },
            {
              value: "programacao",
              title: "Programação",
              children: (
                <div className="space-y-7 p-6">
                  <div>
                    <h2 className={formSectionTitleClass}>Responsáveis e janela de execução</h2>
                    <p className={formSectionDescriptionClass}>Defina os responsáveis, a data e a duração prevista do atendimento.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Select label="Técnico interno" {...register("responsibleId")} options={[{ value: "", label: "Definir depois" }, ...users.filter((item) => item.role === "Executor/Técnico" || item.role === "Administrador").map((item) => ({ value: item.id, label: item.name }))]} />
                    <Select label="Prestador externo" {...register("providerId")} options={[{ value: "", label: "Não se aplica" }, ...providers.map((item) => ({ value: item.id, label: `${item.name} (${item.specialty})` }))]} />
                    <Input label="Data programada" type="date" {...register("plannedDate")} />
                    <Input label="Hora de início" type="time" {...register("plannedStartTime")} />
                    <Select label="Duração estimada" {...register("estimatedDurationMinutes")} options={[{ value: "30", label: "30 minutos" }, { value: "60", label: "1 hora" }, { value: "120", label: "2 horas" }, { value: "240", label: "4 horas" }, { value: "480", label: "8 horas" }]} />
                    <div className="md:col-span-2">
                      <Textarea label="Orientações de programação" placeholder="Acesso ao local, janela de atendimento ou outra orientação." {...register("scheduleNotes")} />
                    </div>
                  </div>
                </div>
              ),
            },
            {
              value: "anexos-revisao",
              title: "Anexos e revisão",
              children: (
                <div className="space-y-7 p-6">
                  <div>
                    <h2 className={formSectionTitleClass}>Anexos da OS</h2>
                    <p className={formSectionDescriptionClass}>Adicione evidências, imagens e documentos que apoiem o atendimento.</p>
                  </div>
                  <div>
                    <label className="mb-2 block text-[13px] font-semibold text-slate-700">Arquivos</label>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 px-6 py-7 text-center hover:bg-slate-50">
                      <Upload className="mb-2 h-7 w-7 text-slate-400" />
                      <span className="text-sm font-medium text-brand-900">Selecionar arquivos</span>
                      <span className="mt-1 text-xs text-slate-500">Imagens e PDF, até 10 MB por arquivo.</span>
                      <input className="sr-only" type="file" multiple accept="image/*,.pdf" onChange={(event) => setFiles((current) => [...current, ...Array.from(event.target.files || [])])} />
                    </label>
                  </div>
                  {files.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {files.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                          <FileText className="h-5 w-5 text-slate-500" />
                          <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                          <Button type="button" variant="ghost" size="sm" aria-label={`Remover ${file.name}`} onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} className="h-8 px-2 text-red-700 hover:bg-red-50 hover:no-underline">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={`${formDividerClass} rounded-none border-0 bg-transparent p-0 text-sm text-slate-700`}>
                    <strong>Revisão antes de salvar</strong>
                    <p className="mt-1">Após criar, a OS seguirá para programação, execução, validação e encerramento na própria ficha. Se houver material pendente, a solicitação seguirá automaticamente para a fila de estoque.</p>
                  </div>
                </div>
              ),
            },
          ]} />
          <div className="operational-form-actions">
            <Button type="submit" disabled={isSubmitting} className="save-action-button ml-auto">
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
