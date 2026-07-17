import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Unit, Location, Asset, Category, WorkOrder, Priority, User, Provider } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";

export const NovaOrdem = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    setUnits(storageService.get("gsi_units").filter(u => u.active));
    setLocations(storageService.get("gsi_locations").filter(l => l.active));
    setAssets(storageService.get("gsi_assets").filter(a => a.active));
    setCategories(storageService.get("gsi_categories").filter(c => c.active));
    setUsers(storageService.get("gsi_users").filter(u => u.active));
    setProviders(storageService.get("gsi_providers").filter(p => p.active));
  }, []);

  const filteredLocations = locations.filter(l => l.unitId === formData.unitId);
  const filteredAssets = assets.filter(a => (!formData.locationId || a.locationId === formData.locationId));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newOs: WorkOrder = {
      id: crypto.randomUUID(),
      number: `OS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
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
    
    storageService.logAudit(currentUser.id, "Ordem Criada", newOs.id, "WorkOrder");

    navigate("/ordens");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Nova Ordem de Serviço</h1>
        <p className="text-sm text-slate-500">Crie uma OS manual não vinculada a demandas.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da OS</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Unidade"
                required
                value={formData.unitId}
                onChange={e => setFormData({ ...formData, unitId: e.target.value, locationId: "", assetId: "" })}
                options={units.map(u => ({ value: u.id, label: u.name }))}
              />
              <Select
                label="Local/Ambiente"
                required
                value={formData.locationId}
                onChange={e => setFormData({ ...formData, locationId: e.target.value, assetId: "" })}
                options={filteredLocations.map(l => ({ value: l.id, label: l.name }))}
                disabled={!formData.unitId}
              />
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
                label="Responsável (Opcional)"
                value={formData.responsibleId}
                onChange={e => setFormData({ ...formData, responsibleId: e.target.value })}
                options={users.map(u => ({ value: u.id, label: u.name }))}
              />
              <Input
                label="Prazo"
                type="date"
                value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>

            <Textarea
              label="Descrição Técnica"
              required
              placeholder="Descreva o que deve ser feito..."
              value={formData.technicalDescription}
              onChange={e => setFormData({ ...formData, technicalDescription: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button type="button" variant="secondary" onClick={() => navigate("/ordens")}>
                Cancelar
              </Button>
              <Button type="submit">
                Criar OS
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
