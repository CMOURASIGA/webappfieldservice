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
import { StockRequest } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

const schema = z.object({
  materialId: z.string().optional(), // Can be empty if unregistered
  suggestedDescription: z.string().optional(),
  quantity: z.coerce.number().min(0.1, "Quantidade inválida"),
  estimatedUnit: z.string().optional(),
  priority: z.enum(["Baixa", "Média", "Alta", "Urgente"]),
  neededDate: z.string().optional(),
  unitId: z.string().min(1, "Unidade organizacional é obrigatória"),
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
}

export const NovaSolicitacaoModal = ({ open, onOpenChange, onSuccess }: Props) => {
  const { currentUser } = useAuth();
  const [isUnregistered, setIsUnregistered] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: "Média",
    }
  });

  const materials = storageService.get("gsi_stock_materials") || [];
  const units = storageService.get("gsi_units") || [];
  const locations = storageService.get("gsi_locations") || [];
  const assets = storageService.get("gsi_assets") || [];

  const materialOptions = materials.filter((m: any) => m.active).map((m: any) => ({
    value: m.id,
    label: `${m.code} - ${m.name}`
  }));

  const onSubmit = (data: any) => {
    if (!isUnregistered && !data.materialId) {
      alert("Selecione um material ou marque como não cadastrado.");
      return;
    }
    if (isUnregistered && !data.suggestedDescription) {
      alert("Informe a descrição do material não cadastrado.");
      return;
    }

    const requests = storageService.get("gsi_stock_requests") || [];
    
    const newReq: StockRequest = {
      id: "sreq-" + Date.now(),
      protocol: "REQ-" + Math.floor(Math.random() * 10000),
      isUnregistered,
      materialId: isUnregistered ? undefined : data.materialId,
      suggestedDescription: isUnregistered ? data.suggestedDescription : undefined,
      quantity: data.quantity,
      estimatedUnit: data.estimatedUnit,
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
      updatedAt: new Date().toISOString()
    };

    storageService.set("gsi_stock_requests", [...requests, newReq]);
    
    reset();
    setIsUnregistered(false);
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Material</DialogTitle>
        </DialogHeader>
        
        <form id="solicitacao-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="flex items-center gap-2 mb-2">
            <input 
              type="checkbox" 
              id="unregistered" 
              checked={isUnregistered} 
              onChange={(e) => setIsUnregistered(e.target.checked)} 
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="unregistered" className="text-sm text-slate-700">Material não cadastrado no sistema</label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {!isUnregistered ? (
              <div className="space-y-2 flex flex-col col-span-2 sm:col-span-1">
                <label className="text-sm font-medium">Material *</label>
                <Combobox 
                  options={materialOptions} 
                  onChange={(val) => setValue("materialId", val)} 
                  placeholder="Buscar material..." 
                  command={{ emptyMessage: "Nenhum material encontrado" }}
                />
                {errors.materialId && <span className="text-xs text-red-500">{errors.materialId.message as string}</span>}
              </div>
            ) : (
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <label className="text-sm font-medium">Descrição Sugerida *</label>
                <Input {...register("suggestedDescription")} placeholder="Ex: Motor trifásico 220V..." />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantidade *</label>
              <div className="flex gap-2">
                <Input type="number" step="0.01" {...register("quantity")} className="flex-1" />
                {isUnregistered && (
                  <Input {...register("estimatedUnit")} placeholder="UN, PC..." className="w-20" title="Unidade sugerida" />
                )}
              </div>
              {errors.quantity && <span className="text-xs text-red-500">{errors.quantity.message as string}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Setor Solicitante</label>
              <Input {...register("sector")} placeholder="Ex: Almoxarifado, Elétrica..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade *</label>
              <Select onValueChange={(val) => setValue("priority", val)} defaultValue="Média">
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
              <label className="text-sm font-medium">Data Necessária</label>
              <Input type="date" {...register("neededDate")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ordem de Serviço Vinculada</label>
              <Input {...register("workOrderId")} placeholder="OS (Opcional)" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ativo Vinculado</label>
              <Select onValueChange={(val) => setValue("assetId", val)}>
                <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>
                  {assets.map((a: any) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Justificativa da Necessidade</label>
            <Input {...register("justification")} placeholder="Descreva o motivo desta solicitação..." />
          </div>
        </form>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="create" type="submit" form="solicitacao-form">Enviar Solicitação</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
