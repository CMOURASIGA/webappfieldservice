import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Unit, Location, Category, Request, Priority, Asset } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Drawer } from "../components/ui/Drawer";
import { useAuth } from "../contexts/AuthContext";
import { FormGrid, OperationalPageHeader } from "../components/ui/OperationalPage";
import { MapPinPlus, Save, X } from "lucide-react";

export const NovoServico = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  const [formData, setFormData] = useState({
    unitId: currentUser?.unitId || "",
    locationId: "",
    categoryId: "",
    assetId: "",
    title: "",
    description: "",
    priority: "Média" as Priority,
  });

  const [isLocationDrawerOpen, setIsLocationDrawerOpen] = useState(false);
  const [newLocationData, setNewLocationData] = useState({ name: "", type: "Ambiente" });

  useEffect(() => {
    setUnits(storageService.get("gsi_units").filter(u => u.active));
    setLocations(storageService.get("gsi_locations").filter(l => l.active));
    setCategories(storageService.get("gsi_categories").filter(c => c.active !== false));
    setAssets(storageService.get("gsi_assets").filter(a => a.status === "Ativo" && a.active));
  }, []);

  const filteredLocations = locations.filter(l => l.unitId === formData.unitId);
  const filteredAssets = assets.filter(a => (!formData.locationId || a.locationId === formData.locationId) && a.unitId === formData.unitId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      attachments: [], // Simulating without attachments for basic flow
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
    };

    const requests = storageService.get("gsi_requests");
    requests.push(newRequest);
    storageService.set("gsi_requests", requests);
    
    storageService.logAudit(currentUser.id, "Serviço Criada", newRequest.id, "Request");

    navigate("/servicos");
  };

  const handleSaveNewLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationData.name || !formData.unitId) return;

    const newLocation: Location = {
      id: crypto.randomUUID(),
      unitId: formData.unitId,
      type: newLocationData.type,
      name: newLocationData.name,
      code: `LOC-${Math.floor(1000 + Math.random() * 9000)}`,
      active: true
    };
    
    const locs = storageService.get("gsi_locations");
    locs.push(newLocation);
    storageService.set("gsi_locations", locs);
    
    setLocations([...locations, newLocation]);
    setFormData({ ...formData, locationId: newLocation.id, assetId: "" });
    setIsLocationDrawerOpen(false);
    setNewLocationData({ name: "", type: "Ambiente" });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <OperationalPageHeader
        title="Nova Manutenção Corretiva"
        description="Registre uma nova manutenção corretiva."
        backTo="/servicos/corretivas"
      />

      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormGrid>
              <Select
                label="Unidade"
                required
                value={formData.unitId}
                onChange={e => setFormData({ ...formData, unitId: e.target.value, locationId: "", assetId: "" })}
                options={units.map(u => ({ value: u.id, label: u.name }))}
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
                  onChange={e => setFormData({ ...formData, locationId: e.target.value, assetId: "" })}
                  options={filteredLocations.map(l => ({ value: l.id, label: l.name }))}
                  disabled={!formData.unitId}
                />
              </div>
              <Select
                label="Categoria"
                required
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                options={categories.map(c => ({ value: c.id, label: c.name }))}
              />
              {true && (
                <>
                  <Select
                    label="Ativo (Opcional)"
                    value={formData.assetId}
                    onChange={e => setFormData({ ...formData, assetId: e.target.value })}
                    options={filteredAssets.map(a => ({ value: a.id, label: `${a.code} - ${a.name}` }))}
                    disabled={!formData.unitId}
                  />
                  <Select
                    label="Prioridade Sugerida"
                    required
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}
                    options={[
                      { value: "Baixa", label: "Baixa" },
                      { value: "Média", label: "Média" },
                      { value: "Alta", label: "Alta" },
                      { value: "Urgente", label: "Urgente" },
                    ]}
                  />
                </>
              )}
            </FormGrid>

            <Input
              label="Título"
              required
              placeholder="Ex: Ar condicionado pingando"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />

            <Textarea
              label="Descrição detalhada"
              required
              placeholder="Descreva o problema ou solicitação..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />

            <div className="operational-form-actions -mx-6 -mb-6">
              <Button type="button" variant="secondary" className="gap-2 border-slate-400" onClick={() => navigate("/servicos/corretivas")}>
                <X className="h-4 w-4" /> Cancelar
              </Button>
              <Button type="submit" className="gap-2 shadow-2">
                <Save className="h-4 w-4" /> Salvar Manutenção
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Drawer
        isOpen={isLocationDrawerOpen}
        onClose={() => setIsLocationDrawerOpen(false)}
        title="Novo Local/Ambiente"
      >
        <form onSubmit={handleSaveNewLocation} className="space-y-4 rounded-lg border border-slate-300 bg-slate-50/70 p-4">
          <Input
            label="Nome do Local"
            required
            value={newLocationData.name}
            onChange={e => setNewLocationData({ ...newLocationData, name: e.target.value })}
            placeholder="Ex: Sala de Reuniões 01"
          />
          <Select
            label="Tipo"
            required
            value={newLocationData.type}
            onChange={e => setNewLocationData({ ...newLocationData, type: e.target.value })}
            options={[
              { value: "Ambiente", label: "Ambiente" },
              { value: "Andar", label: "Andar" },
              { value: "Área Externa", label: "Área Externa" },
              { value: "Edifício", label: "Edifício" }
            ]}
          />
          <div className="operational-form-actions -mx-4 -mb-4">
            <Button type="button" variant="secondary" className="gap-2 border-slate-400" onClick={() => setIsLocationDrawerOpen(false)}><X className="h-4 w-4" /> Cancelar</Button>
            <Button type="submit" className="gap-2 shadow-2"><Save className="h-4 w-4" /> Salvar Local</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
