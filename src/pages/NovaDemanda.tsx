import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Unit, Location, Category, Request, Priority } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";

export const NovaDemanda = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    unitId: currentUser?.unitId || "",
    locationId: "",
    categoryId: "",
    title: "",
    description: "",
    priority: "Média" as Priority,
  });

  useEffect(() => {
    setUnits(storageService.get("gsi_units").filter(u => u.active));
    setLocations(storageService.get("gsi_locations").filter(l => l.active));
    setCategories(storageService.get("gsi_categories").filter(c => c.type === "Demanda" && c.active));
  }, []);

  const filteredLocations = locations.filter(l => l.unitId === formData.unitId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newRequest: Request = {
      id: crypto.randomUUID(),
      protocol: `DEM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      solicitanteId: currentUser.id,
      unitId: formData.unitId,
      locationId: formData.locationId,
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
    
    storageService.logAudit(currentUser.id, "Demanda Criada", newRequest.id, "Request");

    navigate("/demandas");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Nova Demanda</h1>
        <p className="text-sm text-slate-500">Registre uma nova solicitação de serviço.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Unidade"
                required
                value={formData.unitId}
                onChange={e => setFormData({ ...formData, unitId: e.target.value, locationId: "" })}
                options={units.map(u => ({ value: u.id, label: u.name }))}
              />
              <Select
                label="Local/Ambiente"
                required
                value={formData.locationId}
                onChange={e => setFormData({ ...formData, locationId: e.target.value })}
                options={filteredLocations.map(l => ({ value: l.id, label: l.name }))}
                disabled={!formData.unitId}
              />
              <Select
                label="Categoria"
                required
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                options={categories.map(c => ({ value: c.id, label: c.name }))}
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
            </div>

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

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button type="button" variant="secondary" onClick={() => navigate("/demandas")}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Demanda
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
