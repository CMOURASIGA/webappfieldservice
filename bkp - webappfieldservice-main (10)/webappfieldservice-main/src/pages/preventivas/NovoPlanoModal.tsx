import React from "react";
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
import { PreventivePlan } from "../../types";

const schema = z.object({
  code: z.string().min(1, "Código obrigatório"),
  description: z.string().min(1, "Descrição obrigatória"),
  unitId: z.string().min(1, "Unidade obrigatória"),
  assetId: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.string().optional(),
  periodicity: z.enum(["Diária", "Semanal", "Quinzenal", "Mensal", "Trimestral", "Semestral", "Anual"]),
  startDate: z.string().min(1, "Data de início obrigatória"),
  providerId: z.string().optional(),
  templateId: z.string().optional(), // Checklist template
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const NovoPlanoModal = ({ open, onOpenChange, onSuccess }: Props) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      periodicity: "Mensal"
    }
  });

  const units = storageService.get("gsi_units") || [];
  const assets = storageService.get("gsi_assets") || [];
  const providers = storageService.get("gsi_providers") || [];
  const templates = storageService.get("gsi_checklist_templates") || [];

  const assetOptions = assets.map(a => ({ value: a.id, label: `${a.code} - ${a.name}` }));

  const onSubmit = (data: any) => {
    const plans = storageService.get("gsi_preventive_plans") || [];
    
    const newPlan: PreventivePlan = {
      id: "prev-" + Date.now(),
      ...data,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nextExecution: data.startDate, // will be re-calculated dynamically
    };

    storageService.set("gsi_preventive_plans", [...plans, newPlan]);
    
    reset();
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Plano de Manutenção</DialogTitle>
        </DialogHeader>
        
        <form id="novo-plano-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Código *</label>
              <Input {...register("code")} placeholder="Ex: PM-001" />
              {errors.code && <span className="text-xs text-red-500">{errors.code.message as string}</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Periodicidade *</label>
              <Select onValueChange={(val) => setValue("periodicity", val)} defaultValue="Mensal">
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Diária">Diária</SelectItem>
                  <SelectItem value="Semanal">Semanal</SelectItem>
                  <SelectItem value="Quinzenal">Quinzenal</SelectItem>
                  <SelectItem value="Mensal">Mensal</SelectItem>
                  <SelectItem value="Trimestral">Trimestral</SelectItem>
                  <SelectItem value="Semestral">Semestral</SelectItem>
                  <SelectItem value="Anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição *</label>
            <Input {...register("description")} placeholder="Ex: Manutenção Preventiva do Ar Condicionado" />
            {errors.description && <span className="text-xs text-red-500">{errors.description.message as string}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Unidade *</label>
              <Select onValueChange={(val) => setValue("unitId", val)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {units.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.unitId && <span className="text-xs text-red-500">{errors.unitId.message as string}</span>}
            </div>
            <div className="space-y-2 flex flex-col">
              <label className="text-sm font-medium">Ativo Vinculado (Opcional)</label>
              <Combobox 
                options={assetOptions} 
                onChange={(val) => setValue("assetId", val)} 
                placeholder="Buscar ativo..." 
                command={{ emptyMessage: "Ativo não encontrado" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial do Plano *</label>
              <Input type="date" {...register("startDate")} />
              {errors.startDate && <span className="text-xs text-red-500">{errors.startDate.message as string}</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Checklist Associado</label>
              <Select onValueChange={(val) => setValue("templateId", val)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {templates.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fornecedor Responsável (Opcional)</label>
              <Select onValueChange={(val) => setValue("providerId", val)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {providers.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria / Tipo</label>
              <Input {...register("type")} placeholder="Ex: Climatização" />
            </div>
          </div>
        </form>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="create" type="submit" form="novo-plano-form">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
