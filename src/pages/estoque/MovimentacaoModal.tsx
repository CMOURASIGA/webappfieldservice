import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Combobox,
} from "@cnc-ti/layout-basic";
import { storageService } from "../../services/storageService";
import { StockMaterial, StockMovement } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

const schema = z.object({
  type: z.enum(["Entrada", "Saída", "Ajuste"]),
  materialId: z.string().min(1, "Material é obrigatório"),
  quantity: z.coerce.number().min(0.01, "Quantidade deve ser maior que zero"),
  unitId: z.string().min(1, "Unidade organizacional é obrigatória"),
  sector: z.string().optional(),
  locationId: z.string().optional(),
  providerId: z.string().optional(), // For Entrada
  technicianId: z.string().optional(), // For Saída
  workOrderId: z.string().optional(),
  invoice: z.string().optional(),
  observations: z.string().optional(),
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
    }
  });

  const selectedType = watch("type") || initialType;

  const materials = storageService.get("gsi_stock_materials") || [];
  const units = storageService.get("gsi_units") || [];
  const locations = storageService.get("gsi_locations") || [];
  const users = storageService.get("gsi_users") || [];

  const materialOptions = materials.filter((m: any) => m.active).map((m: any) => ({
    value: m.id,
    label: `${m.code} - ${m.name} (${m.physicalBalance} Disp.)`
  }));

  const onSubmit = (data: any) => {
    const allMaterials = storageService.get("gsi_stock_materials") || [];
    const matIndex = allMaterials.findIndex((m: any) => m.id === data.materialId);
    
    if (matIndex === -1) {
      alert("Material não encontrado.");
      return;
    }
    
    const material = allMaterials[matIndex];
    let previousBalance = material.physicalBalance;
    let newBalance = previousBalance;

    if (data.type === "Entrada") {
      newBalance = previousBalance + data.quantity;
    } else if (data.type === "Saída") {
      if (previousBalance < data.quantity) {
        alert("Saldo insuficiente para esta saída.");
        return;
      }
      newBalance = previousBalance - data.quantity;
    } else if (data.type === "Ajuste") {
      newBalance = data.quantity; // Em ajuste, a quantidade informada é o saldo físico final
    }

    // Update material
    material.physicalBalance = newBalance;
    material.availableBalance = newBalance - material.reservedBalance;
    material.updatedAt = new Date().toISOString();
    
    allMaterials[matIndex] = material;
    storageService.set("gsi_stock_materials", allMaterials);

    // Create movement
    const movements = storageService.get("gsi_stock_movements") || [];
    const qty = data.type === "Ajuste" ? Math.abs(newBalance - previousBalance) : data.quantity;
    
    const newMovement: StockMovement = {
      id: "mov-" + Date.now(),
      type: data.type,
      materialId: data.materialId,
      quantity: qty,
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
      date: new Date().toISOString()
    };

    storageService.set("gsi_stock_movements", [...movements, newMovement]);
    
    reset();
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Movimentação</DialogTitle>
        </DialogHeader>
        
        <form id="movimentacao-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Movimentação *</label>
              <Select onValueChange={(val) => setValue("type", val)} defaultValue={initialType}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entrada">Entrada (Recebimento)</SelectItem>
                  <SelectItem value="Saída">Saída (Consumo/Retirada)</SelectItem>
                  <SelectItem value="Ajuste">Ajuste de Inventário</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <span className="text-xs text-red-500">{errors.type.message as string}</span>}
            </div>
            <div className="space-y-2 flex flex-col">
              <label className="text-sm font-medium">Material *</label>
              <Combobox 
                options={materialOptions} 
                onChange={(val) => setValue("materialId", val)} 
                placeholder="Buscar material..." 
                command={{ emptyMessage: "Material não encontrado" }}
              />
              {errors.materialId && <span className="text-xs text-red-500">{errors.materialId.message as string}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {selectedType === "Ajuste" ? "Novo Saldo Físico Real *" : "Quantidade *"}
              </label>
              <Input type="number" step="0.01" {...register("quantity")} />
              {errors.quantity && <span className="text-xs text-red-500">{errors.quantity.message as string}</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Unidade Organizacional *</label>
              <Select onValueChange={(val) => setValue("unitId", val)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {units.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.unitId && <span className="text-xs text-red-500">{errors.unitId.message as string}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Local / Armazém</label>
              <Select onValueChange={(val) => setValue("locationId", val)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {locations.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Setor Solicitante / Destino</label>
              <Input {...register("sector")} placeholder="Ex: Manutenção, Limpeza..." />
            </div>
          </div>

          {selectedType === "Entrada" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fornecedor</label>
                <Input {...register("providerId")} placeholder="Nome do fornecedor" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nota Fiscal / Pedido</label>
                <Input {...register("invoice")} />
              </div>
            </div>
          )}

          {selectedType === "Saída" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Técnico / Retirante</label>
                <Select onValueChange={(val) => setValue("technicianId", val)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {users.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ordem de Serviço (Opcional)</label>
                <Input {...register("workOrderId")} placeholder="Ex: OS-2026-001" />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Observações / Justificativa</label>
            <Input {...register("observations")} placeholder="Detalhes da movimentação..." />
            {selectedType === "Ajuste" && (
              <p className="text-xs text-orange-600 font-medium mt-1">Ajuste de inventário exige justificativa do motivo (ex: quebra, erro de contagem).</p>
            )}
          </div>
        </form>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="create" type="submit" form="movimentacao-form">Confirmar Movimentação</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
