import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@cnc-ti/layout-basic";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { TabbedFormCard } from "../../components/ui/TabbedFormCard";
import { storageService } from "../../services/storageService";
import { StockMaterial } from "../../types";

const schema = z.object({
  code: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  unit: z.string().min(1, "Unidade de medida é obrigatória"),
  unitId: z.string().min(1, "Unidade é obrigatória"),
  locationId: z.string().optional(),
  minStock: z.coerce.number().min(0, "Estoque mínimo inválido"),
  idealStock: z.coerce.number().optional(),
  unitPrice: z.coerce.number().optional(),
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

const unitOptions = [
  { value: "UN", label: "Unidade (UN)" },
  { value: "CX", label: "Caixa (CX)" },
  { value: "PC", label: "Peça (PC)" },
  { value: "M", label: "Metro (M)" },
  { value: "KG", label: "Quilo (KG)" },
  { value: "L", label: "Litro (L)" },
];

export const NovoMaterialModal = ({ open, onOpenChange, onSuccess, material }: Props) => {
  const [units, setUnits] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      name: "",
      category: "",
      unit: "",
      unitId: "",
      locationId: "",
      minStock: 0,
      idealStock: 0,
      unitPrice: 0,
      manufacturer: "",
      model: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    setUnits((storageService.get("gsi_units") || []).filter((item: any) => item.active !== false));
    setLocations((storageService.get("gsi_locations") || []).filter((item: any) => item.active !== false));
    setCategories((storageService.get("gsi_categories") || []).filter((item: any) => item.active !== false));

    if (material) {
      reset({
        code: material.code || "",
        name: material.name || "",
        category: material.category || "",
        unit: material.unit || "",
        unitId: material.unitId || "",
        locationId: material.locationId || "",
        minStock: Number(material.minStock || 0),
        idealStock: Number(material.idealStock || 0),
        unitPrice: Number(material.unitPrice || 0),
        manufacturer: material.manufacturer || "",
        model: material.model || "",
      });
      return;
    }

    reset({
      code: "",
      name: "",
      category: "",
      unit: "",
      unitId: "",
      locationId: "",
      minStock: 0,
      idealStock: 0,
      unitPrice: 0,
      manufacturer: "",
      model: "",
    });
  }, [material, open, reset]);

  const selectedUnitId = watch("unitId");
  const filteredLocations = locations.filter((item) => !selectedUnitId || item.unitId === selectedUnitId);

  const onSubmit = (data: FormData) => {
    const materials = storageService.get("gsi_stock_materials") || [];

    if (materials.some((item: StockMaterial) => item.code === data.code && item.id !== material?.id)) {
      alert("Já existe um material com este código.");
      return;
    }

    const nextMaterial: StockMaterial = {
      ...(material || {}),
      id: material?.id || `mat-${Date.now()}`,
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
      ? materials.map((item: StockMaterial) => (item.id === material.id ? nextMaterial : item))
      : [...materials, nextMaterial];

    storageService.set("gsi_stock_materials", nextMaterials);
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border border-slate-200 bg-white p-6 shadow-2xl sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>{material ? "Editar Material" : "Novo Material"}</DialogTitle>
          <p className="text-sm text-slate-600">
            Informe identificação, estoque e dados complementares do material.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TabbedFormCard
            className="border-0 shadow-none"
            submitLabel="Salvar"
            tabs={[
              {
                value: "identificacao",
                label: "Identificação",
                content: (
                  <>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Dados principais</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        Cadastre o código, nome e classificação básica do material.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <Input label="Código" required {...register("code")} error={errors.code?.message ? String(errors.code.message) : undefined} placeholder="Ex.: MAT-001" />
                      <Input label="Nome" required {...register("name")} error={errors.name?.message ? String(errors.name.message) : undefined} placeholder="Ex.: Lâmpada LED" />
                      <Select
                        label="Categoria"
                        required
                        value={watch("category") || ""}
                        onChange={(event) => setValue("category", event.target.value, { shouldValidate: true })}
                        error={errors.category?.message ? String(errors.category.message) : undefined}
                        options={categories.map((item) => ({ value: item.name, label: item.name }))}
                      />
                      <Select
                        label="Unidade de medida"
                        required
                        value={watch("unit") || ""}
                        onChange={(event) => setValue("unit", event.target.value, { shouldValidate: true })}
                        error={errors.unit?.message ? String(errors.unit.message) : undefined}
                        options={unitOptions}
                      />
                    </div>
                  </>
                ),
              },
              {
                value: "estoque",
                label: "Estoque e localização",
                content: (
                  <>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Reposição e vínculo operacional</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        Defina a unidade, local de armazenamento e níveis mínimos do item.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <Select
                        label="Unidade"
                        required
                        value={watch("unitId") || ""}
                        onChange={(event) => {
                          setValue("unitId", event.target.value, { shouldValidate: true });
                          setValue("locationId", "");
                        }}
                        error={errors.unitId?.message ? String(errors.unitId.message) : undefined}
                        options={units.map((item) => ({ value: item.id, label: item.name }))}
                      />
                      <Select
                        label="Local / almoxarifado"
                        value={watch("locationId") || ""}
                        onChange={(event) => setValue("locationId", event.target.value)}
                        options={filteredLocations.map((item) => ({ value: item.id, label: item.name }))}
                        disabled={!watch("unitId")}
                      />
                      <Input label="Estoque mínimo" required type="number" min="0" {...register("minStock")} error={errors.minStock?.message ? String(errors.minStock.message) : undefined} />
                      <Input label="Estoque ideal" type="number" min="0" {...register("idealStock")} />
                    </div>
                  </>
                ),
              },
              {
                value: "complemento",
                label: "Complemento",
                content: (
                  <>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Dados complementares</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        Complete informações de custo e fabricante quando houver.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <Input label="Valor unitário estimado" type="number" min="0" step="0.01" {...register("unitPrice")} />
                      <div />
                      <Input label="Fabricante" {...register("manufacturer")} />
                      <Input label="Modelo" {...register("model")} />
                    </div>
                  </>
                ),
              },
            ]}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
