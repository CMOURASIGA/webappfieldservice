import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Asset, Location, Unit } from "../types";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { OperationalPageHeader } from "../components/ui/OperationalPage";
import { TabbedFormCard } from "../components/ui/TabbedFormCard";
import { useAuth } from "../contexts/AuthContext";

export const NovoAtivo = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState<Partial<Asset>>({
    code: `ATV-${Math.floor(1000 + Math.random() * 9000)}`,
    name: "",
    category: "",
    unitId: currentUser?.unitId || "",
    locationId: "",
    manufacturer: "",
    model: "",
    patrimonyNumber: "",
    criticality: "Baixa",
    status: "Ativo",
    observations: "",
  });

  useEffect(() => {
    setUnits(storageService.get("gsi_units").filter((item) => item.active));
    setLocations(storageService.get("gsi_locations").filter((item) => item.active));
  }, []);

  const filteredLocations = locations.filter((item) => item.unitId === formData.unitId);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser) return;

    const allAssets = storageService.get("gsi_assets");
    const newAsset: Asset = {
      ...(formData as Asset),
      id: crypto.randomUUID(),
      active: true,
    };

    allAssets.push(newAsset);
    storageService.set("gsi_assets", allAssets);
    storageService.logAudit(currentUser.id, "Criou Ativo", newAsset.id, "Asset");
    navigate("/ativos");
  };

  const formSectionTitleClass = "text-base font-semibold text-slate-900";
  const formSectionDescriptionClass = "mt-1 text-sm text-slate-600";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <OperationalPageHeader
        title="Novo Ativo"
        description="Cadastre um novo ativo vinculado a operacao."
        backTo="/ativos"
      />

      <form onSubmit={handleSubmit}>
        <TabbedFormCard
          submitLabel="Salvar"
          tabs={[
            {
              value: "dados-gerais",
              label: "Dados gerais",
              content: (
                <div className="space-y-7 p-6">
                  <div className="border-b border-slate-200 pb-6">
                    <h2 className={formSectionTitleClass}>Identificacao do ativo</h2>
                    <p className={formSectionDescriptionClass}>Informe os dados principais do equipamento e seu vinculo operacional.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input label="Codigo do ativo" required value={formData.code || ""} onChange={(event) => setFormData({ ...formData, code: event.target.value })} />
                    <Input label="Nome do ativo" required value={formData.name || ""} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="Ex.: Ar-condicionado Split" />
                    <Select
                      label="Categoria"
                      required
                      value={formData.category || ""}
                      onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                      options={[
                        { value: "Climatizacao", label: "Climatizacao" },
                        { value: "Eletrica", label: "Eletrica" },
                        { value: "Hidraulica", label: "Hidraulica" },
                        { value: "Mobiliario", label: "Mobiliario" },
                        { value: "TI / Equipamentos", label: "TI / Equipamentos" },
                      ]}
                    />
                    <Select
                      label="Unidade"
                      required
                      value={formData.unitId || ""}
                      onChange={(event) => setFormData({ ...formData, unitId: event.target.value, locationId: "" })}
                      options={units.map((item) => ({ value: item.id, label: item.name }))}
                    />
                    <Select
                      label="Local"
                      required
                      value={formData.locationId || ""}
                      onChange={(event) => setFormData({ ...formData, locationId: event.target.value })}
                      options={filteredLocations.map((item) => ({ value: item.id, label: item.name }))}
                      disabled={!formData.unitId}
                    />
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
                    O ativo ja nasce vinculado a unidade e local corretos para aparecer nas OS, preventivas e filtros operacionais.
                  </div>
                </div>
              ),
            },
            {
              value: "classificacao",
              label: "Classificacao",
              content: (
                <div className="space-y-7 p-6">
                  <div className="border-b border-slate-200 pb-6">
                    <h2 className={formSectionTitleClass}>Dados tecnicos e controle</h2>
                    <p className={formSectionDescriptionClass}>Complete os dados de fabricante, patrimonio e criticidade do ativo.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input label="Fabricante" value={formData.manufacturer || ""} onChange={(event) => setFormData({ ...formData, manufacturer: event.target.value })} />
                    <Input label="Modelo" value={formData.model || ""} onChange={(event) => setFormData({ ...formData, model: event.target.value })} />
                    <Input label="Numero de patrimonio" value={formData.patrimonyNumber || ""} onChange={(event) => setFormData({ ...formData, patrimonyNumber: event.target.value })} />
                    <Select
                      label="Criticidade"
                      required
                      value={formData.criticality || "Baixa"}
                      onChange={(event) => setFormData({ ...formData, criticality: event.target.value as Asset["criticality"] })}
                      options={[
                        { value: "Baixa", label: "Baixa" },
                        { value: "M\u00E9dia", label: "Media" },
                        { value: "Alta", label: "Alta" },
                      ]}
                    />
                    <Select
                      label="Status"
                      required
                      value={formData.status || "Ativo"}
                      onChange={(event) => setFormData({ ...formData, status: event.target.value as Asset["status"] })}
                      options={[
                        { value: "Ativo", label: "Ativo" },
                        { value: "Inativo", label: "Inativo" },
                        { value: "Em manuten\u00E7\u00E3o", label: "Em manutencao" },
                      ]}
                    />
                  </div>
                </div>
              ),
            },
            {
              value: "complementos",
              label: "Complementos",
              content: (
                <div className="space-y-7 p-6">
                  <div className="border-b border-slate-200 pb-6">
                    <h2 className={formSectionTitleClass}>Informacoes complementares</h2>
                    <p className={formSectionDescriptionClass}>Registre observacoes que facilitem manutencao, programacao e tomada de decisao.</p>
                  </div>
                  <Textarea label="Observacoes" value={formData.observations || ""} onChange={(event) => setFormData({ ...formData, observations: event.target.value })} rows={5} />
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    Use este campo para informar restricoes de acesso, condicoes do equipamento, risco operacional ou dependencias conhecidas.
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
