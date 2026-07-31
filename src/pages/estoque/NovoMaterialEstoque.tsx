import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import { OperationalPageHeader } from "../../components/ui/OperationalPage";
import { Select } from "../../components/ui/Select";
import { TabbedFormCard } from "../../components/ui/TabbedFormCard";
import { storageService } from "../../services/storageService";
import { StockMaterial } from "../../types";

const unitOptions = [
  { value: "UN", label: "Unidade (UN)" },
  { value: "CX", label: "Caixa (CX)" },
  { value: "PC", label: "Peca (PC)" },
  { value: "M", label: "Metro (M)" },
  { value: "KG", label: "Quilo (KG)" },
  { value: "L", label: "Litro (L)" },
];

export const NovoMaterialEstoque = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    unit: "",
    unitId: "",
    locationId: "",
    minStock: "0",
    idealStock: "0",
    unitPrice: "0",
    manufacturer: "",
    model: "",
  });

  useEffect(() => {
    setUnits((storageService.get("gsi_units") || []).filter((item: any) => item.active !== false));
    setLocations((storageService.get("gsi_locations") || []).filter((item: any) => item.active !== false));
    setCategories((storageService.get("gsi_categories") || []).filter((item: any) => item.active !== false));
  }, []);

  const filteredLocations = locations.filter((item) => !formData.unitId || item.unitId === formData.unitId);

  const setField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.code || !formData.name || !formData.category || !formData.unit || !formData.unitId) {
      alert("Preencha os campos obrigatorios do material.");
      return;
    }

    const materials = storageService.get("gsi_stock_materials") || [];

    if (materials.some((item: StockMaterial) => item.code === formData.code)) {
      alert("Ja existe um material com este codigo.");
      return;
    }

    const newMaterial: StockMaterial = {
      id: `mat-${Date.now()}`,
      code: formData.code,
      name: formData.name,
      category: formData.category,
      unit: formData.unit,
      unitId: formData.unitId,
      locationId: formData.locationId || undefined,
      minStock: Number(formData.minStock || 0),
      idealStock: Number(formData.idealStock || 0),
      unitPrice: Number(formData.unitPrice || 0),
      manufacturer: formData.manufacturer || undefined,
      model: formData.model || undefined,
      physicalBalance: 0,
      reservedBalance: 0,
      availableBalance: 0,
      status: "Normal",
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageService.set("gsi_stock_materials", [...materials, newMaterial]);
    navigate("/estoque");
  };

  const formSectionTitleClass = "text-base font-semibold text-slate-900";
  const formSectionDescriptionClass = "mt-1 text-sm text-slate-600";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <OperationalPageHeader
        title="Novo Material"
        description="Cadastre um novo item para controle operacional do estoque."
        backTo="/estoque"
      />

      <form onSubmit={handleSubmit}>
        <TabbedFormCard
          submitLabel="Salvar"
          tabs={[
            {
              value: "identificacao",
              label: "Identificacao",
              content: (
                <div className="space-y-7 p-6">
                  <div>
                    <h2 className={formSectionTitleClass}>Dados principais</h2>
                    <p className={formSectionDescriptionClass}>
                      Cadastre o codigo, nome e classificacao basica do material.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input label="Codigo" required value={formData.code} onChange={(event) => setField("code", event.target.value)} placeholder="Ex.: MAT-001" />
                    <Input label="Nome" required value={formData.name} onChange={(event) => setField("name", event.target.value)} placeholder="Ex.: Lampada LED" />
                    <Select
                      label="Categoria"
                      required
                      value={formData.category}
                      onChange={(event) => setField("category", event.target.value)}
                      options={categories.map((item) => ({ value: item.name, label: item.name }))}
                    />
                    <Select
                      label="Unidade de medida"
                      required
                      value={formData.unit}
                      onChange={(event) => setField("unit", event.target.value)}
                      options={unitOptions}
                    />
                  </div>
                </div>
              ),
            },
            {
              value: "estoque",
              label: "Estoque e localizacao",
              content: (
                <div className="space-y-7 p-6">
                  <div>
                    <h2 className={formSectionTitleClass}>Reposicao e vinculo operacional</h2>
                    <p className={formSectionDescriptionClass}>
                      Defina a unidade, local de armazenamento e niveis minimos do item.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Select
                      label="Unidade"
                      required
                      value={formData.unitId}
                      onChange={(event) => {
                        setField("unitId", event.target.value);
                        setField("locationId", "");
                      }}
                      options={units.map((item) => ({ value: item.id, label: item.name }))}
                    />
                    <Select
                      label="Local / almoxarifado"
                      value={formData.locationId}
                      onChange={(event) => setField("locationId", event.target.value)}
                      options={filteredLocations.map((item) => ({ value: item.id, label: item.name }))}
                      disabled={!formData.unitId}
                    />
                    <Input label="Estoque minimo" required type="number" min="0" value={formData.minStock} onChange={(event) => setField("minStock", event.target.value)} />
                    <Input label="Estoque ideal" type="number" min="0" value={formData.idealStock} onChange={(event) => setField("idealStock", event.target.value)} />
                  </div>
                </div>
              ),
            },
            {
              value: "complemento",
              label: "Complemento",
              content: (
                <div className="space-y-7 p-6">
                  <div>
                    <h2 className={formSectionTitleClass}>Dados complementares</h2>
                    <p className={formSectionDescriptionClass}>
                      Complete informacoes de custo e fabricante quando houver.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input label="Valor unitario estimado" type="number" min="0" step="0.01" value={formData.unitPrice} onChange={(event) => setField("unitPrice", event.target.value)} />
                    <div />
                    <Input label="Fabricante" value={formData.manufacturer} onChange={(event) => setField("manufacturer", event.target.value)} />
                    <Input label="Modelo" value={formData.model} onChange={(event) => setField("model", event.target.value)} />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </form>
    </div>
  );
};
