import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Location, Unit } from "../types";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { OperationalPageHeader } from "../components/ui/OperationalPage";
import { TabbedFormCard } from "../components/ui/TabbedFormCard";
import { useAuth } from "../contexts/AuthContext";

export const NovoLocal = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [formData, setFormData] = useState<Partial<Location>>({
    code: `LOC-${Math.floor(1000 + Math.random() * 9000)}`,
    name: "",
    unitId: currentUser?.unitId || "",
    type: "Sala",
    area: "",
    floor: "",
    environment: "",
    active: true,
  });

  useEffect(() => {
    setUnits(storageService.get("gsi_units").filter((item) => item.active));
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser) return;

    const allLocations = storageService.get("gsi_locations");
    const newLocation: Location = {
      ...(formData as Location),
      id: crypto.randomUUID(),
      active: true,
    };

    allLocations.push(newLocation);
    storageService.set("gsi_locations", allLocations);
    storageService.logAudit(currentUser.id, "Criou Local", newLocation.id, "Location");
    navigate("/locais");
  };

  const formSectionTitleClass = "text-base font-semibold text-slate-900";
  const formSectionDescriptionClass = "mt-1 text-sm text-slate-600";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <OperationalPageHeader
        title="Novo Local"
        description="Cadastre um novo ambiente operacional."
        backTo="/locais"
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
                    <h2 className={formSectionTitleClass}>Identificacao do local</h2>
                    <p className={formSectionDescriptionClass}>Informe a unidade, o tipo e o nome do ambiente.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input label="Codigo do local" required value={formData.code || ""} onChange={(event) => setFormData({ ...formData, code: event.target.value })} />
                    <Input label="Nome do local" required value={formData.name || ""} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="Ex.: Sala 101" />
                    <Select
                      label="Unidade"
                      required
                      value={formData.unitId || ""}
                      onChange={(event) => setFormData({ ...formData, unitId: event.target.value })}
                      options={units.map((item) => ({ value: item.id, label: item.name }))}
                    />
                    <Select
                      label="Tipo"
                      required
                      value={formData.type || ""}
                      onChange={(event) => setFormData({ ...formData, type: event.target.value })}
                      options={[
                        { value: "Edificio", label: "Edificio" },
                        { value: "Andar/Pavimento", label: "Andar/Pavimento" },
                        { value: "Sala", label: "Sala" },
                        { value: "Area Externa", label: "Area Externa" },
                        { value: "Galpao", label: "Galpao" },
                      ]}
                    />
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
                    O local cadastrado passa a alimentar ativos, ordens de servico, agenda e filtros operacionais do modulo.
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
                    <h2 className={formSectionTitleClass}>Detalhamento do ambiente</h2>
                    <p className={formSectionDescriptionClass}>Preencha as informacoes de area, pavimento e ambiente quando aplicavel.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input label="Area" value={formData.area || ""} onChange={(event) => setFormData({ ...formData, area: event.target.value })} placeholder="Ex.: Bloco A" />
                    <Input label="Pavimento" value={formData.floor || ""} onChange={(event) => setFormData({ ...formData, floor: event.target.value })} placeholder="Ex.: Terreo" />
                    <Input label="Ambiente" value={formData.environment || ""} onChange={(event) => setFormData({ ...formData, environment: event.target.value })} placeholder="Ex.: Recepcao" />
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    Use os complementos para diferenciar ambientes semelhantes e melhorar a busca durante a abertura e programacao das OS.
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
