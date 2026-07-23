import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Provider, Unit } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";
import { OperationalPageHeader } from "../components/ui/OperationalPage";

const specialties = [
  "Climatização", "Elétrica", "Civil", "Hidráulica", "Elevadores",
  "Combate a incêndio", "Geradores", "Controle de acesso", "Limpeza técnica", "Manutenção geral"
];

export const EditarTécnico = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [provider, setProvider] = useState<Provider | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    document: "",
    contactName: "",
    phone: "",
    email: "",
    specialty: "",
    unitId: "",
    status: "Ativo" as "Ativo" | "Inativo",
    type: "Externo" as "Interno" | "Externo",
    observations: "",
  });

  useEffect(() => {
    setUnits(storageService.get("gsi_units").filter(u => u.active));
    const providers = storageService.get("gsi_providers");
    const found = providers.find(p => p.id === id);
    if (found) {
      setProvider(found);
      setFormData({
        name: found.name,
        document: found.document || "",
        contactName: found.contactName,
        phone: found.phone,
        email: found.email,
        specialty: found.specialty,
        unitId: found.unitId || "todas",
        status: found.status,
        type: found.type || "Externo",
        observations: found.observations || "",
      });
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !provider) return;

    const providers = storageService.get("gsi_providers");
    const idx = providers.findIndex(p => p.id === provider.id);
    if (idx !== -1) {
      providers[idx] = {
        ...provider,
        name: formData.name,
        document: formData.document,
        contactName: formData.contactName,
        phone: formData.phone,
        email: formData.email,
        specialty: formData.specialty,
        unitId: formData.unitId === "todas" ? undefined : formData.unitId,
        status: formData.status,
        type: formData.type,
        observations: formData.observations,
        updatedAt: new Date().toISOString(),
      };
      
      storageService.set("gsi_providers", providers);
      storageService.logAudit(currentUser.id, "Técnico Atualizado", provider.id, "Provider");
    }

    navigate("/prestadores");
  };

  if (!provider) return <div className="p-6">Técnico não encontrado.</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <OperationalPageHeader
        title="Editar Técnico"
        description="Atualize as informações do fornecedor."
        backTo="/prestadores"
      />

      <Card>
        <CardHeader>
          <CardTitle>Informações do Técnico</CardTitle>
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
                label="Tipo"
                required
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as "Interno" | "Externo" })}
                options={[
                  { value: "Externo", label: "Externo (Terceirizado)" },
                  { value: "Interno", label: "Interno (Funcionário)" },
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
                Salvar Alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
