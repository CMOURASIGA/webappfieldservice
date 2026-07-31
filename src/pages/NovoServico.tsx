import React, { useEffect, useState } from "react";
import { MapPinPlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Asset, Category, Location, Priority, Request, Unit } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Drawer } from "../components/ui/Drawer";
import { useAuth } from "../contexts/AuthContext";
import { OperationalPageHeader } from "../components/ui/OperationalPage";
import { TabbedFormCard } from "../components/ui/TabbedFormCard";

export const NovoServico = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLocationDrawerOpen, setIsLocationDrawerOpen] = useState(false);
  const [newLocationData, setNewLocationData] = useState({ name: "", type: "Ambiente" });

  const [formData, setFormData] = useState({
    unitId: currentUser?.unitId || "",
    locationId: "",
    categoryId: "",
    assetId: "",
    title: "",
    description: "",
    priority: "Media" as Priority,
  });

  useEffect(() => {
    setUnits(storageService.get("gsi_units").filter((item) => item.active));
    setLocations(storageService.get("gsi_locations").filter((item) => item.active));
    setCategories(storageService.get("gsi_categories").filter((item) => item.active !== false));
    setAssets(storageService.get("gsi_assets").filter((item) => item.status === "Ativo" && item.active));
  }, []);

  const filteredLocations = locations.filter((item) => item.unitId === formData.unitId);
  const filteredAssets = assets.filter((item) => (!formData.locationId || item.locationId === formData.locationId) && item.unitId === formData.unitId);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser) return;

    const newRequest: Request = {
      id: crypto.randomUUID(),
      protocol: `DEM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      solicitanteId: currentUser.id,
      unitId: formData.unitId,
      locationId: formData.locationId,
      assetId: formData.assetId || undefined,
      categoryId: formData.categoryId,
      title: formData.title,
      description: formData.description,
      suggestedPriority: formData.priority,
      status: "Aberta",
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
    };

    const requests = storageService.get("gsi_requests");
    requests.push(newRequest);
    storageService.set("gsi_requests", requests);
    storageService.logAudit(currentUser.id, "Servico Criado", newRequest.id, "Request");
    navigate("/servicos/corretivas");
  };

  const handleSaveNewLocation = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newLocationData.name || !formData.unitId) return;

    const newLocation: Location = {
      id: crypto.randomUUID(),
      unitId: formData.unitId,
      type: newLocationData.type,
      name: newLocationData.name,
      code: `LOC-${Math.floor(1000 + Math.random() * 9000)}`,
      active: true,
    };

    const allLocations = storageService.get("gsi_locations");
    allLocations.push(newLocation);
    storageService.set("gsi_locations", allLocations);

    setLocations((current) => [...current, newLocation]);
    setFormData({ ...formData, locationId: newLocation.id, assetId: "" });
    setIsLocationDrawerOpen(false);
    setNewLocationData({ name: "", type: "Ambiente" });
  };

  const formSectionTitleClass = "text-base font-semibold text-slate-900";
  const formSectionDescriptionClass = "mt-1 text-sm text-slate-600";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <OperationalPageHeader
        title="Nova Manutencao Corretiva"
        description="Registre uma nova manutencao corretiva."
        backTo="/servicos/corretivas"
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
                    <h2 className={formSectionTitleClass}>Local e classificacao</h2>
                    <p className={formSectionDescriptionClass}>Informe onde ocorreu a necessidade e como ela deve ser classificada.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Select
                      label="Unidade"
                      required
                      value={formData.unitId}
                      onChange={(event) => setFormData({ ...formData, unitId: event.target.value, locationId: "", assetId: "" })}
                      options={units.map((item) => ({ value: item.id, label: item.name }))}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700">Local/Ambiente</label>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-8 gap-1 px-2"
                          disabled={!formData.unitId}
                          onClick={() => setIsLocationDrawerOpen(true)}
                        >
                          <MapPinPlus className="h-4 w-4" /> Novo local
                        </Button>
                      </div>
                      <Select
                        required
                        value={formData.locationId}
                        onChange={(event) => setFormData({ ...formData, locationId: event.target.value, assetId: "" })}
                        options={filteredLocations.map((item) => ({ value: item.id, label: item.name }))}
                        disabled={!formData.unitId}
                      />
                    </div>
                    <Select
                      label="Categoria"
                      required
                      value={formData.categoryId}
                      onChange={(event) => setFormData({ ...formData, categoryId: event.target.value })}
                      options={categories.map((item) => ({ value: item.id, label: item.name }))}
                    />
                    <Select
                      label="Ativo (Opcional)"
                      value={formData.assetId}
                      onChange={(event) => setFormData({ ...formData, assetId: event.target.value })}
                      options={filteredAssets.map((item) => ({ value: item.id, label: `${item.code} - ${item.name}` }))}
                      disabled={!formData.unitId}
                    />
                    <Select
                      label="Prioridade sugerida"
                      required
                      value={formData.priority}
                      onChange={(event) => setFormData({ ...formData, priority: event.target.value as Priority })}
                      options={[
                        { value: "Baixa", label: "Baixa" },
                        { value: "Media", label: "Media" },
                        { value: "Alta", label: "Alta" },
                        { value: "Urgente", label: "Urgente" },
                      ]}
                    />
                  </div>
                </div>
              ),
            },
            {
              value: "solicitacao",
              label: "Detalhes da solicitacao",
              content: (
                <div className="space-y-7 p-6">
                  <div>
                    <h2 className={formSectionTitleClass}>Descricao da manutencao</h2>
                    <p className={formSectionDescriptionClass}>Registre as informacoes que orientarao o atendimento.</p>
                  </div>
                  <Input
                    label="Titulo"
                    required
                    placeholder="Ex.: Ar condicionado pingando"
                    value={formData.title}
                    onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                  />
                  <Textarea
                    label="Descricao detalhada"
                    required
                    placeholder="Descreva o problema ou solicitacao..."
                    value={formData.description}
                    onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  />
                </div>
              ),
            },
          ]}
        />
      </form>

      <Drawer isOpen={isLocationDrawerOpen} onClose={() => setIsLocationDrawerOpen(false)} title="Novo Local/Ambiente">
        <form onSubmit={handleSaveNewLocation} className="space-y-4 rounded-lg border border-slate-300 bg-slate-50/70 p-4">
          <Input
            label="Nome do local"
            required
            value={newLocationData.name}
            onChange={(event) => setNewLocationData({ ...newLocationData, name: event.target.value })}
            placeholder="Ex.: Sala de reunioes 01"
          />
          <Select
            label="Tipo"
            required
            value={newLocationData.type}
            onChange={(event) => setNewLocationData({ ...newLocationData, type: event.target.value })}
            options={[
              { value: "Ambiente", label: "Ambiente" },
              { value: "Andar", label: "Andar" },
              { value: "Area Externa", label: "Area Externa" },
              { value: "Edificio", label: "Edificio" },
            ]}
          />
          <div className="operational-form-actions -mx-4 -mb-4">
            <Button type="button" variant="secondary" className="gap-2 border-slate-400" onClick={() => setIsLocationDrawerOpen(false)}>
              <X className="h-4 w-4" /> Cancelar
            </Button>
            <Button type="submit" className="save-action-button">Salvar</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
