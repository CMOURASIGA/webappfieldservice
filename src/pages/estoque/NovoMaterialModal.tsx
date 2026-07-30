import React, { useEffect } from "react";
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
} from "@cnc-ti/layout-basic";
import { storageService } from "../../services/storageService";
import { StockMaterial } from "../../types";
import { TabsComponent } from "../../components/ui/TabsComponent";

const schema = z.object({
  code: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  unit: z.string().min(1, "Unidade de medida é obrigatória"),
  unitId: z.string().min(1, "Unidade organizacional é obrigatória"),
  locationId: z.string().optional(),
  minStock: z.coerce.number().min(0),
  idealStock: z.coerce.number().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  material?: StockMaterial;
}

export const NovoMaterialModal = ({ open, onOpenChange, onSuccess, material }: Props) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      minStock: 0,
    }
  });

  const units = storageService.get("gsi_units") || [];
  const locations = storageService.get("gsi_locations") || [];
  const categories = storageService.get("gsi_categories") || [];

  useEffect(() => {
    if (!open) return;
    if (material) {
      reset({ ...material });
    } else {
      reset({ minStock: 0, idealStock: 0, unitPrice: 0 });
    }
  }, [material, open, reset]);

  const onSubmit = (data: any) => {
    const materials = storageService.get("gsi_stock_materials") || [];
    
    // Check if code already exists
    if (materials.some(m => m.code === data.code && m.id !== material?.id)) {
      alert("Já existe um material com este código.");
      return;
    }

    const newMaterial: StockMaterial = {
      ...(material || {}),
      id: material?.id || "mat-" + Date.now(),
      ...data,
      physicalBalance: material?.physicalBalance ?? 0,
      reservedBalance: material?.reservedBalance ?? 0,
      availableBalance: material?.availableBalance ?? 0,
      status: material?.status || "Normal",
      active: material?.active ?? true,
      createdAt: material?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextMaterials = material
      ? materials.map((item) => item.id === material.id ? newMaterial : item)
      : [...materials, newMaterial];
    storageService.set("gsi_stock_materials", nextMaterials);
    reset();
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border border-slate-200 bg-white p-6 shadow-2xl sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>{material ? "Editar Material" : "Novo Material"}</DialogTitle>
          <p className="text-sm text-slate-600">Informe os dados de identificação, local de estoque e níveis de reposição do material.</p>
        </DialogHeader>
        
        <form id="novo-material-form" onSubmit={handleSubmit(onSubmit)} className="py-3">
          <TabsComponent items={[
            { value: "identificacao", title: "Identificação", children: <div className="grid grid-cols-1 gap-x-5 gap-y-5 p-4 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-2">
              <label className="text-sm font-semibold text-slate-800">Código *</label>
              <Input {...register("code")} placeholder="Ex: MAT-001" />
              {errors.code && <span className="text-xs text-red-500">{errors.code.message as string}</span>}
          </div>
          <div className="flex min-w-0 flex-col gap-2">
              <label className="text-sm font-semibold text-slate-800">Nome *</label>
              <Input {...register("name")} placeholder="Ex: Lâmpada LED" />
              {errors.name && <span className="text-xs text-red-500">{errors.name.message as string}</span>}
          </div>

          <div className="flex min-w-0 flex-col gap-2">
              <label className="text-sm font-semibold text-slate-800">Categoria *</label>
              <Select onValueChange={(val) => setValue("category", val)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.category && <span className="text-xs text-red-500">{errors.category.message as string}</span>}
          </div>
          <div className="flex min-w-0 flex-col gap-2">
              <label className="text-sm font-semibold text-slate-800">Unidade de medida *</label>
              <Select onValueChange={(val) => setValue("unit", val)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UN">Unidade (UN)</SelectItem>
                  <SelectItem value="CX">Caixa (CX)</SelectItem>
                  <SelectItem value="PC">Peça (PC)</SelectItem>
                  <SelectItem value="M">Metro (M)</SelectItem>
                  <SelectItem value="KG">Quilo (KG)</SelectItem>
                  <SelectItem value="L">Litro (L)</SelectItem>
                </SelectContent>
              </Select>
              {errors.unit && <span className="text-xs text-red-500">{errors.unit.message as string}</span>}
          </div>

          </div> },
            { value: "estoque", title: "Estoque e localização", children: <div className="grid grid-cols-1 gap-x-5 gap-y-5 p-4 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-2">
              <label className="text-sm font-semibold text-slate-800">Unidade organizacional *</label>
              <Select onValueChange={(val) => setValue("unitId", val)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {units.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.unitId && <span className="text-xs text-red-500">{errors.unitId.message as string}</span>}
          </div>
          <div className="flex min-w-0 flex-col gap-2">
              <label className="text-sm font-semibold text-slate-800">Local / almoxarifado</label>
              <Select onValueChange={(val) => setValue("locationId", val)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
          </div>

          <div className="flex min-w-0 flex-col gap-2">
              <label className="text-sm font-semibold text-slate-800">Estoque mínimo *</label>
              <Input type="number" {...register("minStock")} />
              {errors.minStock && <span className="text-xs text-red-500">{errors.minStock.message as string}</span>}
          </div>
          <div className="flex min-w-0 flex-col gap-2">
              <label className="text-sm font-semibold text-slate-800">Estoque ideal</label>
              <Input type="number" {...register("idealStock")} />
          </div>

          </div> },
            { value: "complemento", title: "Complemento", children: <div className="grid grid-cols-1 gap-x-5 gap-y-5 p-4 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-800">Valor unitário estimado</label>
            <Input type="number" min="0" step="0.01" {...register("unitPrice")} placeholder="0,00" />
          </div>
          
          <div className="flex min-w-0 flex-col gap-2">
              <label className="text-sm font-semibold text-slate-800">Fabricante</label>
              <Input {...register("manufacturer")} />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
              <label className="text-sm font-semibold text-slate-800">Modelo</label>
              <Input {...register("model")} />
          </div></div> },
          ]} />
        </form>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="create" type="submit" form="novo-material-form">{material ? "Salvar alterações" : "Salvar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
