import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Provider, Unit } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";

const specialties = [
  "Climatização", "Elétrica", "Civil", "Hidráulica", "Elevadores",
  "Combate a incêndio", "Geradores", "Controle de acesso", "Limpeza técnica", "Manutenção geral"
];

export const NovoPrestador = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    document: "",
    contactName: "",
    phone: "",
    email: "",
    specialty: "",
    unitId: "",
    status: "Ativo" as const,
    observations: "",
  });

  useEffect(() => {
    setUnits(storageService.get("gsi_units").filter(u => u.active));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newProvider: Provider = {
      id: crypto.randomUUID(),
      name: formData.name,
      document: formData.document,
      contactName: formData.contactName,
      phone: formData.phone,
      email: formData.email,
      specialty: formData.specialty,
      unitId: formData.unitId || undefined,
      status: formData.status,
      observations: formData.observations,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
    };

    const providers = storageService.get("gsi_providers");
    providers.push(newProvider);
    storageService.set("gsi_providers", providers);
    
    storageService.logAudit(currentUser.id, "Prestador Criado", newProvider.id, "Provider");

    navigate("/prestadores");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Novo Prestador</h1>
        <p className="text-sm text-slate-500">Cadastre um novo fornecedor ou profissional.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Prestador</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nome ou Razão Social"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Documento (CNPJ/CPF) - Opcional"
                value={formData.document}
                onChange={e => setFormData({ ...formData, document: e.target.value })}
              />
              <Input
                label="Nome do Contato"
                required
                value={formData.contactName}
                onChange={e => setFormData({ ...formData, contactName: e.target.value })}
              />
              <Input
                label="Telefone"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="E-mail"
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
              <Select
                label="Especialidade"
                required
                value={formData.specialty}
                onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                options={specialties.map(s => ({ value: s, label: s }))}
              />
              <Select
                label="Unidade Atendida"
                required
                value={formData.unitId}
                onChange={e => setFormData({ ...formData, unitId: e.target.value })}
                options={[
                  { value: "", label: "Selecione..." },
                  { value: "todas", label: "Todas as Unidades" },
                  ...units.map(u => ({ value: u.id, label: u.name }))
                ]}
              />
              <Select
                label="Status"
                required
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as "Ativo" | "Inativo" })}
                options={[
                  { value: "Ativo", label: "Ativo" },
                  { value: "Inativo", label: "Inativo" },
                ]}
              />
            </div>

            <Textarea
              label="Observações"
              value={formData.observations}
              onChange={e => setFormData({ ...formData, observations: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button type="button" variant="secondary" onClick={() => navigate("/prestadores")}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Prestador
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
