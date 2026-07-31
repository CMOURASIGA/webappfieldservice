import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { CalendarClock, CheckCircle2, FileText, Package, Play, Printer, RotateCcw, Send, SquarePause, Upload } from "lucide-react";
import { storageService } from "../services/storageService";
import { Asset, Attachment, Category, Location, Provider, StockMaterial, StockRequest, Unit, User, WorkOrder, WorkOrderKanbanColumn, WorkOrderStatus } from "../types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Drawer } from "../components/ui/Drawer";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { OperationalPageHeader } from "../components/ui/OperationalPage";
import { TabsComponent } from "../components/ui/TabsComponent";
import { useAuth } from "../contexts/AuthContext";
import { getAvailableStock, reconcileMaterial } from "../utils/stock";

const PAUSE_REASONS = [
  "Aguardando acesso ao local",
  "Aguardando autorizacao",
  "Indisponibilidade do ativo",
  "Dependencia de outra area",
  "Necessidade de nova vistoria",
  "Outro",
];

const statusToColumn: Record<WorkOrderStatus, WorkOrderKanbanColumn> = {
  Nova: "Nova",
  "Em planejamento": "Planejamento",
  Planejada: "Planejamento",
  "Atribuída": "Planejamento",
  "Aguardando estoque": "Planejamento",
  "Aguardando material": "Planejamento",
  "Material liberado": "Planejamento",
  Programada: "Programada",
  "Em execução": "Em execução",
  Pausada: "Em execução",
  "Aguardando terceiro": "Em execução",
  "Em validação": "Validação",
  "Concluída": "Concluída",
  Cancelada: "Concluída",
  Reaberta: "Em execução",
};

const fileToAttachment = (file: File) =>
  new Promise<Attachment>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        uploadedAt: new Date().toISOString(),
        dataUrl: String(reader.result),
      });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const DetalheOrdem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const createdOrderNumber = (location.state as { createdOrderNumber?: string } | null)?.createdOrderNumber;

  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [materialsCatalog, setMaterialsCatalog] = useState<StockMaterial[]>([]);
  const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [schedule, setSchedule] = useState({ technicianId: "", date: "", time: "", duration: "60", notes: "" });
  const [executionNotes, setExecutionNotes] = useState("");
  const [trackingComment, setTrackingComment] = useState("");
  const [pauseReason, setPauseReason] = useState("");
  const [pauseComment, setPauseComment] = useState("");

  const load = () => {
    const found = storageService.get("gsi_work_orders").find((item) => item.id === id);
    setOrder(found || null);
    setStockRequests(storageService.get("gsi_stock_requests") || []);
    setMaterialsCatalog((storageService.get("gsi_stock_materials") || []).map(reconcileMaterial));
  };

  useEffect(() => {
    load();
    setUnits(storageService.get("gsi_units"));
    setLocations(storageService.get("gsi_locations"));
    setCategories(storageService.get("gsi_categories"));
    setAssets(storageService.get("gsi_assets"));
    setUsers(storageService.get("gsi_users").filter((item) => item.active));
    setProviders(storageService.get("gsi_providers").filter((item) => item.active));
  }, [id]);

  const nameFor = (items: Array<{ id: string; name: string }>, itemId?: string, fallback = "Nao informado") =>
    items.find((item) => item.id === itemId)?.name || fallback;

  const assetNames = order
    ? (order.assetIds?.length ? order.assetIds : order.assetId ? [order.assetId] : [])
        .map((assetId) => assets.find((asset) => asset.id === assetId))
        .filter(Boolean)
        .map((asset) => `${asset!.code} - ${asset!.name}`)
        .join(", ") || "Sem ativo vinculado"
    : "";

  const appendObservation = (current: WorkOrder, text: string) =>
    `${current.observations ? `${current.observations}\n\n` : ""}[${new Date().toLocaleString("pt-BR")} - ${currentUser?.name || "Sistema"}] ${text}`;

  const findCatalogMaterial = (materialId?: string) => materialsCatalog.find((item) => item.id === materialId);
  const findLinkedRequest = (description: string, materialId?: string) =>
    stockRequests.find((request) => request.workOrderId === order?.id && (materialId ? request.materialId === materialId : request.suggestedDescription === description));

  const supplyBadgeVariant = (availability?: string) =>
    availability === "Consumido" || availability === "Liberado" || availability === "Reservado" || availability === "Disponível"
      ? "success"
      : availability === "Parcialmente disponível" || availability === "Aguardando validação"
        ? "warning"
        : availability === "Indisponível" || availability === "Cancelado"
          ? "danger"
          : "default";

  const transition = async (status: WorkOrderStatus, message: string, note = "") => {
    if (!order || !currentUser) return;
    const orders = storageService.get("gsi_work_orders");
    const index = orders.findIndex((item) => item.id === order.id);
    if (index === -1) return;

    const oldStatus = orders[index].status;
    orders[index] = {
      ...orders[index],
      status,
      operationalSituation: statusToColumn[status],
      observations: note ? appendObservation(orders[index], note) : orders[index].observations,
      resolution: status === "Em validação" || status === "Concluída" ? note || orders[index].resolution : orders[index].resolution,
      completedAt: status === "Concluída" ? new Date().toISOString() : orders[index].completedAt,
      updatedAt: new Date().toISOString(),
    };

    storageService.set("gsi_work_orders", orders);
    storageService.logAudit(currentUser.id, message, order.id, "WorkOrder", oldStatus, status);
    load();
  };

  const openSchedule = () => {
    if (!order) return;
    const start = order.plannedStart ? new Date(order.plannedStart) : null;
    setSchedule({
      technicianId: order.responsibleId || order.providerId || "",
      date: start ? start.toISOString().slice(0, 10) : order.plannedDate || "",
      time: start ? start.toTimeString().slice(0, 5) : "",
      duration: String(order.estimatedDurationMinutes || 60),
      notes: order.scheduleNotes || "",
    });
    setScheduleOpen(true);
  };

  const saveSchedule = async () => {
    if (!order || !currentUser || !schedule.technicianId || !schedule.date || !schedule.time) {
      await Swal.fire({ icon: "warning", title: "Complete a programacao", text: "Responsavel, data e horario sao obrigatorios." });
      return;
    }

    const isInternal = users.some((item) => item.id === schedule.technicianId);
    const start = new Date(`${schedule.date}T${schedule.time}:00`);
    const duration = Number(schedule.duration);
    const orders = storageService.get("gsi_work_orders");
    const index = orders.findIndex((item) => item.id === order.id);
    if (index === -1) return;

    orders[index] = {
      ...orders[index],
      responsibleId: isInternal ? schedule.technicianId : undefined,
      providerId: isInternal ? undefined : schedule.technicianId,
      plannedDate: schedule.date,
      plannedStart: start.toISOString(),
      plannedEnd: new Date(start.getTime() + duration * 60_000).toISOString(),
      estimatedDurationMinutes: duration,
      scheduleNotes: schedule.notes.trim() || undefined,
      scheduleStatus: "Programada",
      status: "Programada",
      operationalSituation: "Programada",
      updatedAt: new Date().toISOString(),
    };

    storageService.set("gsi_work_orders", orders);
    storageService.logAudit(currentUser.id, "Programou OS", order.id, "WorkOrder", order.status, "Programada");
    setScheduleOpen(false);
    load();
    await Swal.fire({ icon: "success", title: "OS programada.", timer: 1300, showConfirmButton: false });
  };

  const addTracking = () => {
    if (!order || !currentUser || !trackingComment.trim()) return;
    const orders = storageService.get("gsi_work_orders");
    const index = orders.findIndex((item) => item.id === order.id);
    if (index === -1) return;

    orders[index] = {
      ...orders[index],
      observations: appendObservation(orders[index], trackingComment.trim()),
      updatedAt: new Date().toISOString(),
    };

    storageService.set("gsi_work_orders", orders);
    storageService.logAudit(currentUser.id, "Registrou acompanhamento", order.id, "WorkOrder", "", trackingComment.trim());
    setTrackingComment("");
    load();
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!order || !currentUser || !files?.length) return;
    const attachments = await Promise.all(Array.from(files).map(fileToAttachment));
    const orders = storageService.get("gsi_work_orders");
    const index = orders.findIndex((item) => item.id === order.id);
    if (index === -1) return;

    orders[index] = {
      ...orders[index],
      attachments: [...(orders[index].attachments || []), ...attachments],
      updatedAt: new Date().toISOString(),
    };

    storageService.set("gsi_work_orders", orders);
    storageService.logAudit(currentUser.id, "Incluiu anexos na OS", order.id, "WorkOrder");
    load();
  };

  const updateChecklist = (itemId: string, result: "Conforme" | "Não conforme" | "Não se aplica") => {
    if (!order || order.status !== "Em execução") return;
    const orders = storageService.get("gsi_work_orders");
    const index = orders.findIndex((item) => item.id === order.id);
    if (index === -1) return;

    orders[index] = {
      ...orders[index],
      checklist: orders[index].checklist.map((item) => (item.id === itemId ? { ...item, result } : item)),
      updatedAt: new Date().toISOString(),
    };

    storageService.set("gsi_work_orders", orders);
    load();
  };

  if (!order) {
    return <div className="p-6">Ordem de servico nao encontrada.</div>;
  }

  const statusVariant =
    order.status === "Concluída"
      ? "success"
      : order.status === "Em execução" || order.status === "Programada"
        ? "info"
        : order.status === "Em validação"
          ? "warning"
          : "default";

  const canSubmitForValidation =
    executionNotes.trim().length >= 10 &&
    order.checklist.filter((item) => item.required).every((item) => item.result);

  const nextActionDescription =
    order.status === "Nova"
      ? "Programe o atendimento para encaminhar a OS."
      : order.status === "Programada"
        ? "O servico esta pronto para iniciar."
        : order.status === "Em execução"
          ? "Registre a execucao e envie para validacao."
          : order.status === "Pausada"
            ? "Retome o servico quando a pendencia for resolvida."
            : order.status === "Em validação"
              ? "Valide o resultado e encerre ou devolva a OS."
              : order.status === "Concluída"
                ? "A OS esta encerrada."
                : "Revise a programacao da ordem.";

  const tabs = [
    {
      value: "resumo",
      title: "Resumo da OS",
      children: (
        <div className="space-y-7 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{order.type} · {order.priority}</h2>
              <p className="mt-1 text-sm text-slate-600">Criada em {new Date(order.createdAt).toLocaleString("pt-BR")}</p>
            </div>
            <Badge variant={statusVariant}>{order.status}</Badge>
          </div>

          <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-slate-200 text-sm sm:grid-cols-2">
            <div className="border-b border-r border-slate-200 p-4">
              <span className="block text-xs font-semibold uppercase text-slate-500">Unidade</span>
              {nameFor(units, order.unitId)}
            </div>
            <div className="border-b border-slate-200 p-4">
              <span className="block text-xs font-semibold uppercase text-slate-500">Local</span>
              {nameFor(locations, order.locationId)}
            </div>
            <div className="border-b border-r border-slate-200 p-4">
              <span className="block text-xs font-semibold uppercase text-slate-500">Categoria</span>
              {nameFor(categories, order.categoryId)}
            </div>
            <div className="border-b border-slate-200 p-4">
              <span className="block text-xs font-semibold uppercase text-slate-500">Prazo</span>
              {order.deadline ? new Date(order.deadline).toLocaleDateString("pt-BR") : "Nao definido"}
            </div>
            <div className="p-4 sm:col-span-2">
              <span className="block text-xs font-semibold uppercase text-slate-500">Ativos atendidos</span>
              {assetNames}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-base font-semibold text-slate-900">Descricao tecnica</h3>
            <div className="mt-3 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {order.technicalDescription}
            </div>
          </div>

          {order.requestId && (
            <Link className="text-sm font-medium text-brand-900 underline" to={`/servicos/${order.requestId}`}>
              Ver manutencao corretiva de origem
            </Link>
          )}
        </div>
      ),
    },
    {
      value: "materiais",
      title: "Materiais",
      children: (
        <div className="space-y-7 p-6">
          {order.materials?.length ? (
            <div className="space-y-4">
              {order.materials.map((material) => {
                const catalogMaterial = findCatalogMaterial(material.materialId);
                const linkedRequest = findLinkedRequest(material.description, material.materialId);

                return (
                  <div key={material.id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-slate-500" />
                          <h3 className="text-sm font-semibold text-slate-900">{material.description}</h3>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {material.isUnregistered ? "Material nao cadastrado" : `Material de estoque${catalogMaterial ? ` · ${catalogMaterial.code}` : ""}`}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={supplyBadgeVariant(material.availability)}>{material.availability || "Nao informado"}</Badge>
                        {linkedRequest && <Badge variant="warning">{linkedRequest.status}</Badge>}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                        <span className="block text-xs font-semibold uppercase text-slate-500">Quantidade prevista</span>
                        {material.quantity} {material.type || ""}
                      </div>
                      <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                        <span className="block text-xs font-semibold uppercase text-slate-500">Classificacao</span>
                        {material.classification || "Nao informado"}
                      </div>
                      {catalogMaterial && (
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                          <span className="block text-xs font-semibold uppercase text-slate-500">Saldo disponivel</span>
                          {getAvailableStock(catalogMaterial)} {catalogMaterial.unit}
                        </div>
                      )}
                      {typeof material.quantityUsed === "number" && (
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                          <span className="block text-xs font-semibold uppercase text-slate-500">Quantidade consumida</span>
                          {material.quantityUsed} {material.type || ""}
                        </div>
                      )}
                      {linkedRequest && (
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                          <span className="block text-xs font-semibold uppercase text-slate-500">Solicitacao de estoque</span>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span>{linkedRequest.protocol || linkedRequest.id}</span>
                            <Link className="text-brand-900 underline" to="/estoque/fila">
                              Abrir fila de estoque
                            </Link>
                          </div>
                        </div>
                      )}
                      {material.justification && (
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                          <span className="block text-xs font-semibold uppercase text-slate-500">Justificativa</span>
                          <p className="mt-1 whitespace-pre-wrap text-slate-700">{material.justification}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Nenhum material foi vinculado a esta OS.
            </div>
          )}
        </div>
      ),
    },
    {
      value: "execucao",
      title: "Execucao",
      children: (
        <div className="space-y-7 p-6">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong>Programacao:</strong>{" "}
            {order.plannedStart ? `${new Date(order.plannedStart).toLocaleString("pt-BR")} · ${order.estimatedDurationMinutes || 60} min` : "Aguardando programacao"}
            <br />
            <strong>Responsavel:</strong> {nameFor(users, order.responsibleId, nameFor(providers, order.providerId))}
          </div>

          {order.checklist.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-slate-900">Checklist da execucao</h3>
              <div className="mt-3 space-y-3">
                {order.checklist.map((item, index) => (
                  <div key={item.id} className="rounded-md border border-slate-200 p-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <span className="text-sm">
                        {index + 1}. {item.description}
                        {item.required ? " *" : ""}
                      </span>
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="secondary" disabled={order.status !== "Em execução"} onClick={() => updateChecklist(item.id, "Conforme")}>
                          Conforme
                        </Button>
                        <Button type="button" size="sm" variant="secondary" disabled={order.status !== "Em execução"} onClick={() => updateChecklist(item.id, "Não conforme")}>
                          Nao conforme
                        </Button>
                        <Button type="button" size="sm" variant="secondary" disabled={order.status !== "Em execução"} onClick={() => updateChecklist(item.id, "Não se aplica")}>
                          N/A
                        </Button>
                      </div>
                    </div>
                    {item.result && <p className="mt-2 text-xs text-slate-500">Resultado: {item.result}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 pt-6">
            <Textarea
              label="Registro da execucao"
              value={executionNotes}
              onChange={(event) => setExecutionNotes(event.target.value)}
              disabled={order.status !== "Em execução"}
              placeholder="Descreva o atendimento realizado, testes e resultado obtido."
            />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-slate-700">Evidencias e anexos</label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-400 bg-white px-3 py-2 text-sm font-semibold text-brand-900 hover:bg-slate-50">
              <Upload className="h-4 w-4" /> Anexar arquivos
              <input type="file" className="sr-only" multiple accept="image/*,.pdf" onChange={(event) => uploadFiles(event.target.files)} />
            </label>
          </div>
        </div>
      ),
    },
    {
      value: "historico",
      title: "Historico e anexos",
      children: (
        <div className="space-y-7 p-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Acompanhamento</h3>
            <div className="mt-3">
              <Textarea value={trackingComment} onChange={(event) => setTrackingComment(event.target.value)} placeholder="Registre uma atualizacao do atendimento." />
              <div className="mt-3 flex justify-end">
                <Button type="button" size="sm" onClick={addTracking} disabled={!trackingComment.trim()}>
                  Adicionar acompanhamento
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-base font-semibold text-slate-900">Historico registrado</h3>
            <div className="mt-3 min-h-24 whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {order.observations || "Ainda nao ha registros."}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-base font-semibold text-slate-900">Arquivos</h3>
            {order.attachments?.length ? (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {order.attachments.map((attachment) => (
                  <a key={attachment.id} href={attachment.dataUrl || attachment.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-md border border-slate-200 p-3 hover:bg-slate-50">
                    <FileText className="h-5 w-5 text-slate-500" />
                    <span className="truncate text-sm">{attachment.name}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Nenhum arquivo anexado.</p>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {createdOrderNumber && (
        <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-950">
          <strong>Ordem criada com sucesso:</strong> {createdOrderNumber}. Agora programe e acompanhe a execucao nesta ficha.
        </div>
      )}

      <OperationalPageHeader
        title={`OS ${order.number}`}
        description="Programacao, execucao, validacao e encerramento do servico."
        backTo="/ordens"
        actions={
          <>
            <Button variant="secondary" className="gap-2" onClick={() => window.open(`/ordens/${order.id}/imprimir`, "_blank")}>
              <Printer className="h-4 w-4" /> Imprimir
            </Button>
            <Button className="gap-2" onClick={openSchedule}>
              <CalendarClock className="h-4 w-4" /> {order.scheduleStatus === "Programada" ? "Reprogramar" : "Programar"}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="system-form-section overflow-hidden">
          <TabsComponent items={tabs} />
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-slate-200 bg-slate-50">
              <CardTitle>Proxima acao</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <p className="text-sm text-slate-600">{nextActionDescription}</p>

              {["Nova", "Planejada", "Atribuída"].includes(order.status) && (
                <Button className="w-full gap-2" onClick={openSchedule}>
                  <CalendarClock className="h-4 w-4" /> Programar atendimento
                </Button>
              )}

              {order.status === "Programada" && (
                <Button className="w-full gap-2" onClick={() => transition("Em execução", "Iniciou execução da OS", "Inicio da execucao do servico.")}>
                  <Play className="h-4 w-4" /> Iniciar servico
                </Button>
              )}

              {order.status === "Em execução" && (
                <>
                  <Button className="w-full gap-2" disabled={!canSubmitForValidation} onClick={() => transition("Em validação", "Enviou OS para validacao", executionNotes.trim())}>
                    <Send className="h-4 w-4" /> Enviar para validacao
                  </Button>

                  <Select label="Motivo da pausa" value={pauseReason} onChange={(event) => setPauseReason(event.target.value)} options={[{ value: "", label: "Selecione" }, ...PAUSE_REASONS.map((reason) => ({ value: reason, label: reason }))]} />

                  {pauseReason && (
                    <>
                      <Textarea placeholder="Detalhe a pausa, se necessario." value={pauseComment} onChange={(event) => setPauseComment(event.target.value)} />
                      <Button variant="secondary" className="w-full gap-2" onClick={() => transition("Pausada", "Pausou a OS", `Pausa: ${pauseReason}${pauseComment ? ` - ${pauseComment}` : ""}`)}>
                        <SquarePause className="h-4 w-4" /> Confirmar pausa
                      </Button>
                    </>
                  )}
                </>
              )}

              {order.status === "Pausada" && (
                <Button className="w-full gap-2" onClick={() => transition("Em execução", "Retomou a OS", "Servico retomado.")}>
                  <RotateCcw className="h-4 w-4" /> Retomar servico
                </Button>
              )}

              {order.status === "Em validação" && (
                <>
                  <Textarea label="Comentario da validacao" value={executionNotes} onChange={(event) => setExecutionNotes(event.target.value)} placeholder="Informe o aceite ou motivo da devolucao." />
                  <Button className="w-full gap-2" onClick={() => transition("Concluída", "Validou e encerrou a OS", executionNotes.trim() || "Servico validado e encerrado.")}>
                    <CheckCircle2 className="h-4 w-4" /> Aprovar e encerrar
                  </Button>
                  <Button variant="secondary" className="w-full" onClick={() => transition("Em execução", "Devolveu OS para execução", executionNotes.trim() || "OS devolvida para ajuste.")}>
                    Devolver para execucao
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Drawer isOpen={scheduleOpen} onClose={() => setScheduleOpen(false)} title="Programar Ordem de Servico">
        <div className="space-y-5 rounded-md border border-slate-200 bg-white p-4">
          <Select
            label="Responsavel *"
            value={schedule.technicianId}
            onChange={(event) => setSchedule({ ...schedule, technicianId: event.target.value })}
            options={[
              { value: "", label: "Selecione" },
              ...users
                .filter((item) => item.role === "Executor/Técnico" || item.role === "Administrador")
                .map((item) => ({ value: item.id, label: item.name })),
              ...providers.map((item) => ({ value: item.id, label: `${item.name} (externo)` })),
            ]}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Data *" type="date" value={schedule.date} onChange={(event) => setSchedule({ ...schedule, date: event.target.value })} />
            <Input label="Hora *" type="time" value={schedule.time} onChange={(event) => setSchedule({ ...schedule, time: event.target.value })} />
          </div>

          <Select
            label="Duracao estimada"
            value={schedule.duration}
            onChange={(event) => setSchedule({ ...schedule, duration: event.target.value })}
            options={[
              { value: "30", label: "30 minutos" },
              { value: "60", label: "1 hora" },
              { value: "120", label: "2 horas" },
              { value: "240", label: "4 horas" },
              { value: "480", label: "8 horas" },
            ]}
          />

          <Textarea label="Orientacoes" value={schedule.notes} onChange={(event) => setSchedule({ ...schedule, notes: event.target.value })} placeholder="Acesso ao local, contatos ou observacoes." />

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <Button variant="secondary" onClick={() => setScheduleOpen(false)}>
              Cancelar
            </Button>
            <Button className="save-action-button" onClick={saveSchedule}>
              Salvar
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
