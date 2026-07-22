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
} from "@cnc-ti/layout-basic";
import { storageService } from "../../services/storageService";
import { StockMaterial } from "../../types";

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
}

export const NovoMaterialModal = ({ open, onOpenChange, onSuccess }: Props) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      minStock: 0,
    }
  });

  const units = storageService.get("gsi_units") || [];
  const locations = storageService.get("gsi_locations") || [];
  const categories = storageService.get("gsi_categories") || [];

  const onSubmit = (data: any) => {
    const materials = storageService.get("gsi_stock_materials") || [];
    
    // Check if code already exists
    if (materials.some(m => m.code === data.code)) {
      alert("Já existe um material com este código.");
      return;
    }

    const newMaterial: StockMaterial = {
      id: "mat-" + Date.now(),
      ...data,
      physicalBalance: 0,
      reservedBalance: 0,
      availableBalance: 0,
      status: "Normal",
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageService.set("gsi_stock_materials", [...materials, newMaterial]);
    reset();
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Material</DialogTitle>
        </DialogHeader>
        
        <form id="novo-material-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Código *</label>
              <Input {...register("code")} placeholder="Ex: MAT-001" />
              {errors.code && <span className="text-xs text-red-500">{errors.code.message}</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome *</label>
              <Input {...register("name")} placeholder="Ex: Lâmpada LED" />
              {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria *</label>
              <Select onValueChange={(val) => setValue("category", val)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.category && <span className="text-xs text-red-500">{errors.category.message}</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Unidade de Medida *</label>
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
              {errors.unit && <span className="text-xs text-red-500">{errors.unit.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Unidade Organizacional *</label>
              <Select onValueChange={(val) => setValue("unitId", val)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {units.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.unitId && <span className="text-xs text-red-500">{errors.unitId.message}</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Local (Almoxarifado)</label>
              <Select onValueChange={(val) => setValue("locationId", val)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estoque Mínimo *</label>
              <Input type="number" {...register("minStock")} />
              {errors.minStock && <span className="text-xs text-red-500">{errors.minStock.message}</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estoque Ideal</label>
              <Input type="number" {...register("idealStock")} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fabricante</label>
              <Input {...register("manufacturer")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Modelo</label>
              <Input {...register("model")} />
            </div>
          </div>
        </form>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="create" type="submit" form="novo-material-form">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
