import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { FormGrid, OperationalPageHeader } from "../../components/ui/OperationalPage";
import { useAuth } from "../../contexts/AuthContext";
import { storageService } from "../../services/storageService";
import { StockMovement, WorkOrder, WorkOrderStatus } from "../../types";
import { getAvailableStock, reconcileMaterial, updateOrderMaterialAvailability } from "../../utils/stock";
import { Save, X } from "lucide-react";

type MovementType = "Entrada" | "Saída" | "Ajuste";

export const NovaMovimentacaoEstoque = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const queryType = searchParams.get("tipo");
  const initialType: MovementType = queryType === "Saída" ? "Saída" : queryType === "Ajuste" ? "Ajuste" : "Entrada";
  const [type, setType] = useState<MovementType>(initialType);
  const [data, setData] = useState({ materialId: "", quantity: "", unitId: "", locationId: "", sector: "", providerId: "", invoice: "", technicianId: "", workOrderId: "", observations: "" });
  const [error, setError] = useState("");
  const materials = storageService.get("gsi_stock_materials") || [];
  const units = storageService.get("gsi_units") || [];
  const locations = storageService.get("gsi_locations") || [];
  const users = storageService.get("gsi_users") || [];
  const orders = (storageService.get("gsi_work_orders") || []).filter((order: WorkOrder) => !["Concluída", "Cancelada"].includes(order.status));
  const selectedMaterial = materials.find((item: any) => item.id === data.materialId);

  useEffect(() => { setType(initialType); }, [initialType]);
  useEffect(() => {
    if (!selectedMaterial) return;
    setData((current) => ({ ...current, unitId: selectedMaterial.unitId || "", locationId: selectedMaterial.locationId || "" }));
  }, [selectedMaterial]);

  const setField = (field: keyof typeof data, value: string) => setData((current) => ({ ...current, [field]: value }));
  const activeMaterials = useMemo(() => materials.filter((item: any) => item.active !== false), [materials]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    const quantity = Number(data.quantity);
    if (!data.materialId || !data.unitId || !quantity || quantity <= 0) return setError("Preencha material, quantidade e unidade organizacional.");
    if (type === "Ajuste" && !data.observations.trim()) return setError("Informe a justificativa do ajuste de inventário.");
    const allMaterials = storageService.get("gsi_stock_materials") || [];
    const index = allMaterials.findIndex((item: any) => item.id === data.materialId);
    if (index === -1) return setError("Material não encontrado.");
    const material = { ...allMaterials[index] };
    const previousBalance = Number(material.physicalBalance || 0);
    const previousReserved = Number(material.reservedBalance || 0);
    const available = getAvailableStock(material);
    if (type === "Saída" && available < quantity) return setError(`Saldo disponível insuficiente. Disponível: ${available}.`);
    const newBalance = type === "Entrada" ? previousBalance + quantity : type === "Saída" ? previousBalance - quantity : quantity;
    const newReserved = type === "Saída" && data.workOrderId ? Math.max(0, previousReserved - Math.min(previousReserved, quantity)) : previousReserved;
    allMaterials[index] = reconcileMaterial({ ...material, physicalBalance: newBalance, reservedBalance: newReserved });
    storageService.set("gsi_stock_materials", allMaterials);
    const movement: StockMovement = { id: `mov-${Date.now()}`, type, materialId: data.materialId, quantity: type === "Ajuste" ? Math.abs(newBalance - previousBalance) : quantity, previousBalance, newBalance, unitId: data.unitId, locationId: data.locationId || undefined, sector: data.sector || undefined, providerId: data.providerId || undefined, technicianId: data.technicianId || undefined, workOrderId: data.workOrderId || undefined, invoice: data.invoice || undefined, observations: data.observations || undefined, userId: currentUser?.id || "usr-1", date: new Date().toISOString() };
    storageService.set("gsi_stock_movements", [...(storageService.get("gsi_stock_movements") || []), movement]);
    if (data.workOrderId) storageService.set("gsi_work_orders", (storageService.get("gsi_work_orders") || []).map((order: WorkOrder) => order.id !== data.workOrderId ? order : { ...updateOrderMaterialAvailability(order, data.materialId, undefined, (item) => ({ ...item, availability: type === "Entrada" ? "Reservado" : "Consumido", quantityUsed: type === "Saída" ? quantity : item.quantityUsed })), status: type === "Saída" && ["Material liberado", "Aguardando material", "Aguardando estoque"].includes(order.status) ? "Em execução" as WorkOrderStatus : order.status, updatedAt: new Date().toISOString() }));
    storageService.logAudit(currentUser?.id || "system", "Registrou movimentação de estoque", movement.id, "StockMovement", undefined, movement);
    navigate("/estoque/movimentacoes", { state: { message: `${type} registrada com sucesso.` } });
  };

  return <div className="mx-auto max-w-5xl space-y-6"><OperationalPageHeader title={`Registrar ${type} de Material`} description={type === "Entrada" ? "Registre o recebimento e atualize o saldo físico do estoque." : type === "Saída" ? "Vincule a saída ao destino e, quando aplicável, à Ordem de Serviço." : "Ajuste o saldo físico após conferência, informando a justificativa."} backTo="/estoque" />
    <form onSubmit={submit} className="system-form-section overflow-hidden"><div className="space-y-6 p-5"><FormGrid><Select label="Tipo de movimentação" value={type} onChange={(e) => setType(e.target.value as MovementType)} options={[{ value: "Entrada", label: "Entrada" }, { value: "Saída", label: "Saída" }, { value: "Ajuste", label: "Ajuste de inventário" }]} /><Select label="Material" required value={data.materialId} onChange={(e) => setField("materialId", e.target.value)} options={[{ value: "", label: "Selecione o material" }, ...activeMaterials.map((item: any) => ({ value: item.id, label: `${item.code} - ${item.name}` }))]} /></FormGrid>
      {selectedMaterial && <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4 text-sm text-blue-950"><strong>Saldo atual:</strong> físico {selectedMaterial.physicalBalance}, reservado {selectedMaterial.reservedBalance}, disponível {getAvailableStock(selectedMaterial)}.</div>}
      <FormGrid><Input label={type === "Ajuste" ? "Novo saldo físico" : "Quantidade"} required type="number" min="0.01" step="0.01" value={data.quantity} onChange={(e) => setField("quantity", e.target.value)} /><Select label="Unidade organizacional" required value={data.unitId} onChange={(e) => setField("unitId", e.target.value)} options={[{ value: "", label: "Selecione" }, ...units.map((unit: any) => ({ value: unit.id, label: unit.name }))]} /><Select label="Local / almoxarifado" value={data.locationId} onChange={(e) => setField("locationId", e.target.value)} options={[{ value: "", label: "Não informado" }, ...locations.map((item: any) => ({ value: item.id, label: item.name }))]} /><Input label="Setor solicitante ou destino" value={data.sector} onChange={(e) => setField("sector", e.target.value)} placeholder="Ex.: Manutenção" /></FormGrid>
      {type === "Entrada" && <FormGrid><Input label="Fornecedor" value={data.providerId} onChange={(e) => setField("providerId", e.target.value)} /><Input label="Nota fiscal ou pedido" value={data.invoice} onChange={(e) => setField("invoice", e.target.value)} /></FormGrid>}
      {type === "Saída" && <FormGrid><Select label="Técnico ou retirante" value={data.technicianId} onChange={(e) => setField("technicianId", e.target.value)} options={[{ value: "", label: "Selecione" }, ...users.map((user: any) => ({ value: user.id, label: user.name }))]} /><Select label="Ordem de Serviço de destino" value={data.workOrderId} onChange={(e) => setField("workOrderId", e.target.value)} options={[{ value: "", label: "Não vinculada a OS" }, ...orders.map((order: WorkOrder) => ({ value: order.id, label: `${order.number} - ${order.technicalDescription}` }))]} /></FormGrid>}
      <Textarea label={type === "Ajuste" ? "Justificativa do ajuste" : "Observações"} required={type === "Ajuste"} value={data.observations} onChange={(e) => setField("observations", e.target.value)} placeholder="Inclua detalhes relevantes para rastreabilidade." />
      {error && <p className="rounded-md border-2 border-red-400 bg-red-50 p-3 text-sm text-red-800">{error}</p>}</div><div className="operational-form-actions"><Button type="button" variant="secondary" onClick={() => navigate("/estoque")}><X className="h-4 w-4" /> Cancelar</Button><Button type="submit" variant="create"><Save className="h-4 w-4" /> Confirmar {type}</Button></div></form></div>;
};
