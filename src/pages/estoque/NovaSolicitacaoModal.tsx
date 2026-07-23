import React, { useEffect, useMemo, useState } from "react";
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
import { StockRequest } from "../../types";
import { getAvailableStock } from "../../utils/stock";

const schema = z.object({
  materialId: z.string().optional(),
  suggestedDescription: z.string().optional(),
  quantity: z.coerce.number().min(0.1, "Quantidade invalida"),
  estimatedUnit: z.string().optional(),
  priority: z.enum(["Baixa", "Média", "Alta", "Urgente"]),
  neededDate: z.string().optional(),
  unitId: z.string().min(1, "Unidade organizacional e obrigatoria"),
  sector: z.string().optional(),
  locationId: z.string().optional(),
  assetId: z.string().optional(),
  workOrderId: z.string().optional(),
  justification: z.string().optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialMaterialId?: string;
}

export const NovaSolicitacaoModal = ({ open, onOpenChange, onSuccess, initialMaterialId }: Props) => {
  const { currentUser } = useAuth();
  const [isUnregistered, setIsUnregistered] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: "Média",
    },
  });

  const materials = storageService.get("gsi_stock_materials") || [];
  const units = storageService.get("gsi_units") || [];
  const assets = storageService.get("gsi_assets") || [];
  const locations = storageService.get("gsi_locations") || [];

  const materialOptions = useMemo(
    () =>
      materials
        .filter((material: any) => material.active)
        .map((material: any) => ({
          value: material.id,
          label: `${material.code} - ${material.name}`,
        })),
    [materials],
  );

  const selectedMaterialId = watch("materialId");

  useEffect(() => {
    if (!open) {
      reset({ priority: "Média" });
      setIsUnregistered(false);
      return;
    }

    if (!initialMaterialId) return;

    const selectedMaterial = materials.find((material: any) => material.id === initialMaterialId);
    if (!selectedMaterial) return;

    setIsUnregistered(false);
    setValue("materialId", initialMaterialId);
    setValue("unitId", selectedMaterial.unitId || "");
    setValue("locationId", selectedMaterial.locationId || "");
    setValue("estimatedUnit", selectedMaterial.unit || "");
  }, [initialMaterialId, materials, open, reset, setValue]);

  useEffect(() => {
    if (!selectedMaterialId || isUnregistered) return;

    const selectedMaterial = materials.find((material: any) => material.id === selectedMaterialId);
    if (!selectedMaterial) return;

    setValue("unitId", selectedMaterial.unitId || "");
    setValue("locationId", selectedMaterial.locationId || "");
    setValue("estimatedUnit", selectedMaterial.unit || "");
  }, [isUnregistered, materials, selectedMaterialId, setValue]);

  const onSubmit = (data: any) => {
    if (!isUnregistered && !data.materialId) {
      alert("Selecione um material ou marque como nao cadastrado.");
      return;
    }

    if (isUnregistered && !data.suggestedDescription?.trim()) {
      alert("Informe a descricao do material nao cadastrado.");
      return;
    }

    const requests = storageService.get("gsi_stock_requests") || [];
    const material = data.materialId ? materials.find((item: any) => item.id === data.materialId) : undefined;
    const previousBalance = material ? Number(material.physicalBalance || 0) : undefined;
    const projectedBalance = material ? previousBalance! + Number(data.quantity || 0) : undefined;

    const newRequest: StockRequest = {
      id: `sreq-${Date.now()}`,
      protocol: `REQ-${Math.floor(Math.random() * 100000)}`,
      isUnregistered,
      materialId: isUnregistered ? undefined : data.materialId,
      suggestedDescription: isUnregistered ? data.suggestedDescription?.trim() : undefined,
      quantity: Number(data.quantity),
      previousBalance,
      newBalance: projectedBalance,
      estimatedUnit: data.estimatedUnit || material?.unit,
      priority: data.priority,
      neededDate: data.neededDate,
      unitId: data.unitId,
      sector: data.sector,
      locationId: data.locationId,
      assetId: data.assetId,
      workOrderId: data.workOrderId,
      justification: data.justification,
      requesterId: currentUser?.id || "usr-1",
      status: "Aguardando análise",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageService.set("gsi_stock_requests", [...requests, newRequest]);
    storageService.logAudit(currentUser?.id || "system", "Criou solicitacao de estoque", newRequest.id, "StockRequest", undefined, newRequest);

    reset({ priority: "Média" });
    setIsUnregistered(false);
    onSuccess();
    onOpenChange(false);
  };

  const selectedMaterial = materials.find((material: any) => material.id === selectedMaterialId);
  const currentAvailable = selectedMaterial ? getAvailableStock(selectedMaterial) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Nova Solicitacao de Material</DialogTitle>
        </DialogHeader>

        <form id="solicitacao-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="mb-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="unregistered"
              checked={isUnregistered}
              onChange={(event) => setIsUnregistered(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="unregistered" className="text-sm text-slate-700">Material nao cadastrado no sistema</label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {!isUnregistered ? (
              <div className="col-span-2 flex flex-col space-y-2 sm:col-span-1">
                <label className="text-sm font-medium">Material *</label>
                <Combobox
                  options={materialOptions}
                  onChange={(value) => setValue("materialId", value)}
                  placeholder="Buscar material..."
                  command={{ emptyMessage: "Nenhum material encontrado" }}
                />
                {currentAvailable !== null && (
                  <p className="text-xs text-slate-500">Saldo disponivel atual: <strong>{currentAvailable}</strong></p>
                )}
                {errors.materialId && <span className="text-xs text-red-500">{errors.materialId.message as string}</span>}
              </div>
            ) : (
              <div className="col-span-2 space-y-2 sm:col-span-1">
                <label className="text-sm font-medium">Descricao Sugerida *</label>
                <Input {...register("suggestedDescription")} placeholder="Ex: Motor trifasico 220V" />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantidade *</label>
              <div className="flex gap-2">
                <Input type="number" step="0.01" {...register("quantity")} className="flex-1" />
                <Input {...register("estimatedUnit")} placeholder="UN, PC" className="w-20" title="Unidade" />
              </div>
              {errors.quantity && <span className="text-xs text-red-500">{errors.quantity.message as string}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Setor Solicitante</label>
              <Input {...register("sector")} placeholder="Ex: Almoxarifado, Eletrica" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade *</label>
              <Select onValueChange={(value) => setValue("priority", value)} value={watch("priority") || "Média"}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Necessaria</label>
              <Input type="date" {...register("neededDate")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ordem de Servico Vinculada</label>
              <Input {...register("workOrderId")} placeholder="OS (opcional)" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ativo Vinculado</label>
              <Select onValueChange={(value) => setValue("assetId", value)} value={watch("assetId")}>
                <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>
                  {assets.map((asset: any) => <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Local</label>
              <Select onValueChange={(value) => setValue("locationId", value)} value={watch("locationId")}>
                <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>
                  {locations.map((location: any) => <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Justificativa da Necessidade</label>
              <Input {...register("justification")} placeholder="Descreva o motivo desta solicitacao" />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="create" type="submit" form="solicitacao-form">Enviar Solicitacao</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
