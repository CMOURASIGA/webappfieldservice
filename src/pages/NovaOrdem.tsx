import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import { FileText, Save, Upload, X } from "lucide-react";
import { storageService } from "../services/storageService";
import { Asset, Attachment, Category, Location, Priority, Provider, Request, Unit, User, WorkOrder, WorkOrderStatus } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { OperationalPageHeader } from "../components/ui/OperationalPage";
import { TabsComponent } from "../components/ui/TabsComponent";
import { useAuth } from "../contexts/AuthContext";

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

const fileToAttachment = (file: File) => new Promise<Attachment>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, type: file.type || "application/octet-stream", size: file.size, uploadedAt: new Date().toISOString(), dataUrl: String(reader.result) });
  reader.onerror = reject;
  reader.readAsDataURL(file);
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
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<OSFormData>({
    resolver: zodResolver(osSchema),
    mode: "onChange",
    defaultValues: {
      unitId: sourceRequest?.unitId || "",
      locationId: sourceRequest?.locationId || "",
      sector: sourceRequest?.sector || "",
      // O ativo é uma escolha livre da OS. Ele não deve ser sugerido, filtrado
      // ou removido em função da unidade ou do local informado.
      assetIds: [],
      type: sourceRequest ? "Corretiva" : "Corretiva",
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
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = methods;
  const unitId = watch("unitId");
  const assetIds = watch("assetIds");
  const filteredLocations = locations.filter((item) => item.unitId === unitId);

  useEffect(() => {
    setUnits(storageService.get("gsi_units").filter((item) => item.active));
    setLocations(storageService.get("gsi_locations").filter((item) => item.active));
    setAssets(storageService.get("gsi_assets").filter((item) => item.active && item.status === "Ativo"));
    setCategories(storageService.get("gsi_categories").filter((item) => item.active));
    setUsers(storageService.get("gsi_users").filter((item) => item.active));
    setProviders(storageService.get("gsi_providers").filter((item) => item.active && item.status === "Ativo"));
  }, []);

  const onSubmit = async (data: OSFormData) => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      const attachments = await Promise.all(files.map(fileToAttachment));
      const hasAssignee = Boolean(data.responsibleId || data.providerId);
      const hasSchedule = Boolean(data.plannedDate && data.plannedStartTime && hasAssignee);
      const plannedStart = hasSchedule ? new Date(`${data.plannedDate}T${data.plannedStartTime}:00`).toISOString() : undefined;
      const estimatedDurationMinutes = Number(data.estimatedDurationMinutes || 60);
      const plannedEnd = plannedStart ? new Date(new Date(plannedStart).getTime() + estimatedDurationMinutes * 60_000).toISOString() : undefined;
      const status: WorkOrderStatus = hasSchedule ? "Programada" : hasAssignee ? "Atribuída" : "Nova";
      const operationalSituation = hasSchedule ? "Programada" : hasAssignee ? "Planejamento" : "Nova" as const;
      const newOrder: WorkOrder = {
        id: crypto.randomUUID(),
        number: `OS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        requestId: sourceRequest?.id,
        unitId: data.unitId,
        locationId: data.locationId,
        sector: data.sector?.trim() || undefined,
        assetId: data.assetIds[0],
        assetIds: data.assetIds,
        type: data.type,
        categoryId: data.categoryId,
        priority: data.priority as Priority,
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
        status,
        operationalSituation,
        checklist: [],
        observations: "",
        attachments,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true,
      };
      const orders = storageService.get("gsi_work_orders");
      storageService.set("gsi_work_orders", [...orders, newOrder]);
      if (sourceRequest) {
        const requests = storageService.get("gsi_requests").map((request) => request.id === sourceRequest.id ? { ...request, status: "Convertida em ordem" as const, updatedAt: new Date().toISOString() } : request);
        storageService.set("gsi_requests", requests);
      }
      storageService.logAudit(currentUser.id, "Criou Ordem de Serviço", newOrder.id, "WorkOrder", "", newOrder.status);
      await Swal.fire({ icon: "success", title: "OS criada com sucesso.", text: `${newOrder.number} está pronta para acompanhamento.`, timer: 1600, showConfirmButton: false });
      navigate(`/ordens/${newOrder.id}`, { state: { createdOrderNumber: newOrder.number } });
    } catch {
      await Swal.fire({ icon: "error", title: "Não foi possível salvar a OS.", text: "Revise os dados e tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <OperationalPageHeader title={sourceRequest ? `Gerar OS da ${sourceRequest.protocol}` : "Nova Ordem de Serviço"} description="Registre, programe e encaminhe a ordem para execução." backTo={sourceRequest ? `/servicos/${sourceRequest.id}` : "/ordens"} />
      {sourceRequest && <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950"><strong>Origem vinculada:</strong> {sourceRequest.title}. Os dados disponíveis foram trazidos para esta OS.</div>}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <div>
              <TabsComponent items={[
                { value: "dados-gerais", title: "Dados gerais", children: <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2"><Select label="Unidade *" error={errors.unitId?.message} {...register("unitId", { onChange: () => setValue("locationId", "", { shouldValidate: true }) })} options={units.map((item) => ({ value: item.id, label: item.name }))} /><Select label="Local / ambiente *" error={errors.locationId?.message} disabled={!unitId} {...register("locationId")} options={filteredLocations.map((item) => ({ value: item.id, label: item.name }))} /><Input label="Setor" placeholder="Ex.: Administrativo" error={errors.sector?.message} {...register("sector")} /><div className="flex flex-col gap-1.5"><label className="text-[13px] font-semibold text-slate-700">Ativos atendidos</label><select multiple value={assetIds} onChange={(event) => setValue("assetIds", Array.from(event.target.selectedOptions, (option) => option.value), { shouldValidate: true })} className="min-h-28 rounded-md border-2 border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none focus:ring-3 focus:ring-blue-700/15">{assets.map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}</select><span className="text-xs text-slate-500">Escolha livremente os ativos. Unidade e local são apenas referências de atendimento.</span></div></div> },
                { value: "atendimento", title: "Atendimento", children: <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2"><Select label="Categoria *" error={errors.categoryId?.message} {...register("categoryId")} options={categories.map((item) => ({ value: item.id, label: item.name }))} /><Select label="Tipo de serviço *" error={errors.type?.message} {...register("type")} options={[{ value: "Corretiva", label: "Corretiva" }, { value: "Preventiva", label: "Preventiva" }, { value: "Melhoria", label: "Melhoria" }]} /><Select label="Prioridade *" error={errors.priority?.message} {...register("priority")} options={[{ value: "Baixa", label: "Baixa" }, { value: "Média", label: "Média" }, { value: "Alta", label: "Alta" }, { value: "Urgente", label: "Urgente" }]} /><Input label="Prazo para conclusão" type="date" error={errors.deadline?.message} {...register("deadline")} /><div className="md:col-span-2"><Textarea label="Descrição técnica do serviço *" placeholder="Descreva o problema, o serviço esperado e os cuidados necessários." error={errors.technicalDescription?.message} {...register("technicalDescription")} /></div></div> },
                { value: "programacao", title: "Programação", children: <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2"><Select label="Técnico interno" {...register("responsibleId")} options={[{ value: "", label: "Definir depois" }, ...users.filter((item) => item.role === "Executor/Técnico" || item.role === "Administrador").map((item) => ({ value: item.id, label: item.name }))]} /><Select label="Prestador externo" {...register("providerId")} options={[{ value: "", label: "Não se aplica" }, ...providers.map((item) => ({ value: item.id, label: `${item.name} (${item.specialty})` }))]} /><Input label="Data programada" type="date" {...register("plannedDate")} /><Input label="Hora de início" type="time" {...register("plannedStartTime")} /><Select label="Duração estimada" {...register("estimatedDurationMinutes")} options={[{ value: "30", label: "30 minutos" }, { value: "60", label: "1 hora" }, { value: "120", label: "2 horas" }, { value: "240", label: "4 horas" }, { value: "480", label: "8 horas" }]} /><Textarea label="Orientações de programação" placeholder="Acesso ao local, janela de atendimento ou outra orientação." {...register("scheduleNotes")} /></div> },
                { value: "anexos-revisao", title: "Anexos e revisão", children: <div className="space-y-6 p-4"><div><label className="mb-2 block text-[13px] font-semibold text-slate-700">Anexos da OS</label><label className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 px-6 py-7 text-center hover:bg-slate-50"><Upload className="mb-2 h-7 w-7 text-slate-400" /><span className="text-sm font-medium text-brand-900">Selecionar arquivos</span><span className="mt-1 text-xs text-slate-500">Imagens e PDF, até 10 MB por arquivo.</span><input className="sr-only" type="file" multiple accept="image/*,.pdf" onChange={(event) => setFiles((current) => [...current, ...Array.from(event.target.files || [])])} /></label></div>{files.length > 0 && <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{files.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3"><FileText className="h-5 w-5 text-slate-500" /><span className="min-w-0 flex-1 truncate text-sm">{file.name}</span><button type="button" aria-label={`Remover ${file.name}`} onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} className="rounded p-1 text-red-700 hover:bg-red-50"><X className="h-4 w-4" /></button></div>)}</div>}<div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"><strong>Revisão antes de salvar</strong><p className="mt-1">O salvamento é único. Após criar, a OS seguirá para programação, execução, validação e encerramento na própria ficha.</p></div></div> },
              ]} />
            </div>
            <div className="flex justify-end border-t border-slate-200 px-0 py-4"><Button type="submit" disabled={!isValid || isSubmitting} className="gap-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900"><Save className="h-4 w-4" />{isSubmitting ? "Salvando..." : "Salvar"}</Button></div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
