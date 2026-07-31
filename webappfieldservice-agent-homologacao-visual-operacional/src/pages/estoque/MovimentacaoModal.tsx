import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Button,
  Combobox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cnc-ti/layout-basic";
import { useAuth } from "../../contexts/AuthContext";
import { storageService } from "../../services/storageService";
import { StockMovement, WorkOrder, WorkOrderStatus } from "../../types";
import { getAvailableStock, reconcileMaterial, updateOrderMaterialAvailability } from "../../utils/stock";

const schema = z.object({
  type: z.enum(["Entrada", "Saída", "Ajuste"]),
  materialId: z.string().min(1, "Material e obrigatorio"),
  quantity: z.coerce.number().min(0.01, "Quantidade deve ser maior que zero"),
  unitId: z.string().min(1, "Unidade organizacional e obrigatoria"),
  sector: z.string().optional(),
  locationId: z.string().optional(),
  providerId: z.string().optional(),
  technicianId: z.string().optional(),
  workOrderId: z.string().optional(),
  invoice: z.string().optional(),
  observations: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === "Ajuste" && !data.observations?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["observations"],
      message: "Informe a justificativa do ajuste de inventario.",
    });
  }
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialType?: "Entrada" | "Saída" | "Ajuste";
}

export const MovimentacaoModal = ({ open, onOpenChange, onSuccess, initialType = "Entrada" }: Props) => {
  const { currentUser } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: initialType,
    },
  });

  useEffect(() => {
    if (!open) {
      reset({ type: initialType });
    }
  }, [initialType, open, reset]);

  const selectedType = watch("type") || initialType;
  const selectedMaterialId = watch("materialId");

  const materials = storageService.get("gsi_stock_materials") || [];
  const units = storageService.get("gsi_units") || [];
  const locations = storageService.get("gsi_locations") || [];
  const users = storageService.get("gsi_users") || [];
  const orders = (storageService.get("gsi_work_orders") || []).filter((order: WorkOrder) => !["Concluída", "Cancelada"].includes(order.status));

  const materialOptions = useMemo(
    () =>
      materials
        .filter((material: any) => material.active)
        .map((material: any) => ({
          value: material.id,
          label: `${material.code} - ${material.name} (${getAvailableStock(material)} disponivel)`,
        })),
    [materials],
  );

  const selectedMaterial = materials.find((material: any) => material.id === selectedMaterialId);

  useEffect(() => {
    if (!selectedMaterial) return;
    setValue("unitId", selectedMaterial.unitId || "");
    setValue("locationId", selectedMaterial.locationId || "");
  }, [selectedMaterial, setValue]);

  const onSubmit = (data: any) => {
    const allMaterials = storageService.get("gsi_stock_materials") || [];
    const materialIndex = allMaterials.findIndex((material: any) => material.id === data.materialId);

    if (materialIndex === -1) {
      alert("Material nao encontrado.");
      return;
    }

    const material = { ...allMaterials[materialIndex] };
    const previousBalance = Number(material.physicalBalance || 0);
    const previousReserved = Number(material.reservedBalance || 0);
    const availableBefore = getAvailableStock(material);
    let newBalance = previousBalance;
    let newReserved = previousReserved;

    if (data.type === "Entrada") {
      newBalance = previousBalance + Number(data.quantity);
    } else if (data.type === "Saída") {
      if (availableBefore < Number(data.quantity)) {
        alert("Saldo disponivel insuficiente para esta saida.");
        return;
      }
      newBalance = previousBalance - Number(data.quantity);
      const reservedToRelease = data.workOrderId ? Math.min(previousReserved, Number(data.quantity)) : 0;
      newReserved = Math.max(0, previousReserved - reservedToRelease);
    } else {
      newBalance = Number(data.quantity);
    }

    const updatedMaterial = reconcileMaterial({
      ...material,
      physicalBalance: newBalance,
      reservedBalance: newReserved,
    });

    allMaterials[materialIndex] = updatedMaterial;
    storageService.set("gsi_stock_materials", allMaterials);

    const movements = storageService.get("gsi_stock_movements") || [];
    const quantity = data.type === "Ajuste" ? Math.abs(newBalance - previousBalance) : Number(data.quantity);

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      type: data.type,
      materialId: data.materialId,
      quantity,
      previousBalance,
      newBalance,
      unitId: data.unitId,
      locationId: data.locationId,
      sector: data.sector,
      providerId: data.providerId,
      technicianId: data.technicianId,
      workOrderId: data.workOrderId,
      invoice: data.invoice,
      observations: data.observations,
      userId: currentUser?.id || "usr-1",
      date: new Date().toISOString(),
    };

    storageService.set("gsi_stock_movements", [...movements, newMovement]);

    if (data.workOrderId) {
      const orders = storageService.get("gsi_work_orders");
      const nextOrders = orders.map((order: WorkOrder) => {
        if (order.id !== data.workOrderId) return order;

        const nextAvailability = data.type === "Entrada" ? "Reservado" : "Consumido";
        const nextOrder = updateOrderMaterialAvailability(order, data.materialId, undefined, (item) => ({
          ...item,
          availability: nextAvailability,
          quantityUsed: data.type === "Saída" ? Number(data.quantity) : item.quantityUsed,
        }));

        if (data.type === "Saída" && ["Material liberado", "Aguardando material", "Aguardando estoque"].includes(nextOrder.status)) {
          return {
            ...nextOrder,
            status: "Em execução" as WorkOrderStatus,
            updatedAt: new Date().toISOString(),
          };
        }

        return nextOrder;
      });

      storageService.set("gsi_work_orders", nextOrders);
    }

    storageService.logAudit(currentUser?.id || "system", "Registrou movimentacao de estoque", newMovement.id, "StockMovement", undefined, newMovement);

    reset({ type: initialType });
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Registrar Movimentacao</DialogTitle>
        </DialogHeader>

        <form id="movimentacao-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Movimentacao *</label>
              <Select onValueChange={(value) => setValue("type", value)} value={selectedType}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entrada">Entrada</SelectItem>
                  <SelectItem value="Saída">Saida</SelectItem>
                  <SelectItem value="Ajuste">Ajuste</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <span className="text-xs text-red-500">{errors.type.message as string}</span>}
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Material *</label>
              <Combobox
                options={materialOptions}
                onChange={(value) => setValue("materialId", value)}
                placeholder="Buscar material..."
                command={{ emptyMessage: "Material nao encontrado" }}
              />
              {selectedMaterial && (
                <p className="text-xs text-slate-500">Saldo fisico: {selectedMaterial.physicalBalance} | reservado: {selectedMaterial.reservedBalance} | disponivel: {getAvailableStock(selectedMaterial)}</p>
              )}
              {errors.materialId && <span className="text-xs text-red-500">{errors.materialId.message as string}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{selectedType === "Ajuste" ? "Novo saldo fisico *" : "Quantidade *"}</label>
              <Input type="number" step="0.01" {...register("quantity")} />
              {errors.quantity && <span className="text-xs text-red-500">{errors.quantity.message as string}</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Unidade Organizacional *</label>
              <Select onValueChange={(value) => setValue("unitId", value)} value={watch("unitId")}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {units.map((unit: any) => <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.unitId && <span className="text-xs text-red-500">{errors.unitId.message as string}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Local / Armazem</label>
              <Select onValueChange={(value) => setValue("locationId", value)} value={watch("locationId")}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {locations.map((location: any) => <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Setor solicitante / destino</label>
              <Input {...register("sector")} placeholder="Ex: Manutencao" />
            </div>
          </div>

          {selectedType === "Entrada" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fornecedor</label>
                <Input {...register("providerId")} placeholder="Nome do fornecedor" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nota fiscal / pedido</label>
                <Input {...register("invoice")} />
              </div>
            </div>
          )}

          {selectedType === "Saída" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tecnico / retirante</label>
                <Select onValueChange={(value) => setValue("technicianId", value)} value={watch("technicianId")}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {users.map((user: any) => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ordem de servico</label>
                <Select onValueChange={(value) => setValue("workOrderId", value)} value={watch("workOrderId")}>
                  <SelectTrigger><SelectValue placeholder="Selecione a OS de destino" /></SelectTrigger>
                  <SelectContent>
                    {orders.map((order: WorkOrder) => (
                      <SelectItem key={order.id} value={order.id}>{order.number} - {order.technicalDescription}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Observacoes / justificativa</label>
            <Input {...register("observations")} placeholder="Detalhes da movimentacao" />
            {errors.observations && <span className="text-xs text-red-500">{errors.observations.message as string}</span>}
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="create" type="submit" form="movimentacao-form">Confirmar Movimentacao</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
