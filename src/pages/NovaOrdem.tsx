import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Unit, Location, Asset, Category, WorkOrder, Priority, User, Provider } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Drawer } from "../components/ui/Drawer";
import { useAuth } from "../contexts/AuthContext";
import { Request } from "../types";
import { FormGrid, OperationalPageHeader } from "../components/ui/OperationalPage";
import { MapPinPlus, Save, X } from "lucide-react";

export const NovaOrdem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sourceState = location.state as { sourceRequest?: Request } | null;
  const sourceRequest = sourceState?.sourceRequest;
  const { currentUser } = useAuth();
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  const [formData, setFormData] = useState({
    unitId: currentUser?.unitId || "",
    locationId: "",
    assetId: "",
    type: "Corretiva",
    categoryId: "",
    priority: "Média" as Priority,
    responsibleId: "",
    providerId: "",
    technicalDescription: "",
    deadline: "",
  });

  const [isLocationDrawerOpen, setIsLocationDrawerOpen] = useState(false);
  const [newLocationData, setNewLocationData] = useState({ name: "", type: "Ambiente" });

  useEffect(() => {
    setUnits(storageService.get("gsi_units").filter(u => u.active));
    setLocations(storageService.get("gsi_locations").filter(l => l.active));
    setAssets(storageService.get("gsi_assets").filter(a => a.status === "Ativo" && a.active !== false));
    setCategories(storageService.get("gsi_categories").filter(c => c.active));
    setUsers(storageService.get("gsi_users").filter(u => u.active));
    setProviders(storageService.get("gsi_providers").filter(p => p.status === "Ativo" && p.active !== false));
  }, []);

  useEffect(() => {
    if (!sourceRequest) return;
    setFormData((current) => ({
      ...current,
      unitId: sourceRequest.unitId || current.unitId,
      locationId: sourceRequest.locationId || current.locationId,
      assetId: sourceRequest.assetId || current.assetId,
      type: "Corretiva",
      categoryId: sourceRequest.categoryId || current.categoryId,
      priority: sourceRequest.suggestedPriority || current.priority,
      technicalDescription: sourceRequest.description || current.technicalDescription,
    }));
  }, [sourceRequest]);

  const filteredLocations = locations.filter(l => l.unitId === formData.unitId);
  const filteredAssets = assets.filter(a => (!formData.locationId || a.locationId === formData.locationId));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newOs: WorkOrder = {
      id: crypto.randomUUID(),
      number: `OS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      requestId: sourceRequest?.id,
      unitId: formData.unitId,
      locationId: formData.locationId,
      assetId: formData.assetId || undefined,
      type: formData.type,
      categoryId: formData.categoryId,
      priority: formData.priority,
      responsibleId: formData.responsibleId || undefined,
      providerId: formData.providerId || undefined,
      technicalDescription: formData.technicalDescription,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
      status: formData.responsibleId ? "Atribuída" : "Planejada",
      checklist: [],
      observations: "",
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
    };

    const orders = storageService.get("gsi_work_orders");
    orders.push(newOs);
    storageService.set("gsi_work_orders", orders);

    if (sourceRequest) {
      const requests = storageService.get("gsi_requests");
      const requestIndex = requests.findIndex((request) => request.id === sourceRequest.id);
      if (requestIndex !== -1) {
        requests[requestIndex].status = "Convertida em ordem";
        requests[requestIndex].updatedAt = new Date().toISOString();
        storageService.set("gsi_requests", requests);
      }
      storageService.logAudit(currentUser.id, "Manutenção convertida em OS", sourceRequest.id, "Request", sourceRequest.status, "Convertida em ordem");
    }
    
    storageService.logAudit(currentUser.id, "Ordem Criada", newOs.id, "WorkOrder");

    navigate("/ordens");
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
        title={sourceRequest ? `Gerar OS da ${sourceRequest.protocol}` : "Nova Ordem de Serviço"}
        description={sourceRequest ? "Os dados da manutenção foram preenchidos automaticamente. Complete apenas o que estiver faltando." : "Crie uma ordem de serviço manual."}
        backTo={sourceRequest ? `/servicos/${sourceRequest.id}` : "/ordens"}
      />

      {sourceRequest && (
        <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4 text-sm text-blue-900">
          <strong>Origem vinculada:</strong> {sourceRequest.title}. Unidade, local, ativo, categoria, prioridade e descrição foram reaproveitados quando disponíveis.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da OS</CardTitle>
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
                label="Ativo (Opcional)"
                value={formData.assetId}
                onChange={e => setFormData({ ...formData, assetId: e.target.value })}
                options={filteredAssets.map(a => ({ value: a.id, label: `${a.code} - ${a.name}` }))}
              />
              <Select
                label="Categoria"
                required
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                options={categories.map(c => ({ value: c.id, label: c.name }))}
              />
              <Select
                label="Tipo"
                required
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                options={[
                  { value: "Corretiva", label: "Corretiva" },
                  { value: "Preventiva", label: "Preventiva" },
                  { value: "Melhoria", label: "Melhoria" },
                ]}
              />
              <Select
                label="Prioridade"
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
              <Select
                label="Responsável Interno (Opcional)"
                value={formData.responsibleId}
                onChange={e => setFormData({ ...formData, responsibleId: e.target.value })}
                options={users.map(u => ({ value: u.id, label: u.name }))}
              />
              <Select
                label="Prestador Externo (Opcional)"
                value={formData.providerId}
                onChange={e => setFormData({ ...formData, providerId: e.target.value })}
                options={[{ value: "", label: "Nenhum" }, ...providers.map(p => ({ value: p.id, label: `${p.name} (${p.specialty})` }))]}
              />
              <Input
                label="Prazo"
                type="date"
                value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
              />
            </FormGrid>

            <Textarea
              label="Descrição Técnica"
              required
              placeholder="Descreva o que deve ser feito..."
              value={formData.technicalDescription}
              onChange={e => setFormData({ ...formData, technicalDescription: e.target.value })}
            />

            <div className="operational-form-actions -mx-6 -mb-6">
              <Button type="button" variant="secondary" className="gap-2 border-slate-400" onClick={() => navigate(sourceRequest ? `/servicos/${sourceRequest.id}` : "/ordens")}>
                <X className="h-4 w-4" /> Cancelar
              </Button>
              <Button type="submit" className="gap-2 shadow-2">
                <Save className="h-4 w-4" /> Criar OS
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
