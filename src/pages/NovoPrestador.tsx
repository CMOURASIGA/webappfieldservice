import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Provider, Unit } from "../types";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { useAuth } from "../contexts/AuthContext";
import { OperationalPageHeader } from "../components/ui/OperationalPage";
import { TabbedFormCard } from "../components/ui/TabbedFormCard";

const specialties = [
  "Climatizacao",
  "Eletrica",
  "Civil",
  "Hidraulica",
  "Elevadores",
  "Combate a incendio",
  "Geradores",
  "Controle de acesso",
  "Limpeza tecnica",
  "Manutencao geral",
];

export const NovoTecnico = () => {
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
    status: "Ativo" as "Ativo" | "Inativo",
    type: "Externo" as "Interno" | "Externo",
    observations: "",
  });

  useEffect(() => {
    setUnits(storageService.get("gsi_units").filter((item) => item.active));
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
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
      type: formData.type,
      observations: formData.observations,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
    };

    const providers = storageService.get("gsi_providers");
    providers.push(newProvider);
    storageService.set("gsi_providers", providers);
    storageService.logAudit(currentUser.id, "Tecnico Criado", newProvider.id, "Provider");
    navigate("/prestadores");
  };

  const formSectionTitleClass = "text-base font-semibold text-slate-900";
  const formSectionDescriptionClass = "mt-1 text-sm text-slate-600";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <OperationalPageHeader
        title="Novo Tecnico"
        description="Cadastre um novo fornecedor ou profissional."
        backTo="/prestadores"
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
                  <div className="border-b border-slate-200 pb-6">
                    <h2 className={formSectionTitleClass}>Dados do tecnico</h2>
                    <p className={formSectionDescriptionClass}>Identifique o profissional ou fornecedor responsavel pelos atendimentos.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input label="Nome ou razao social" required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
                    <Input label="Documento (CNPJ/CPF) - Opcional" value={formData.document} onChange={(event) => setFormData({ ...formData, document: event.target.value })} />
                    <Input label="Nome do contato" required value={formData.contactName} onChange={(event) => setFormData({ ...formData, contactName: event.target.value })} />
                    <Input label="Telefone" required value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} />
                    <Input label="E-mail" type="email" required value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} />
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
                    Este cadastro sera usado na programacao da agenda, no responsavel da OS e no acompanhamento da execucao.
                  </div>
                </div>
              ),
            },
            {
              value: "atuacao",
              label: "Atuacao",
              content: (
                <div className="space-y-7 p-6">
                  <div className="border-b border-slate-200 pb-6">
                    <h2 className={formSectionTitleClass}>Atuacao e disponibilidade</h2>
                    <p className={formSectionDescriptionClass}>Defina a especialidade e a abrangencia do tecnico.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Select label="Especialidade" required value={formData.specialty} onChange={(event) => setFormData({ ...formData, specialty: event.target.value })} options={specialties.map((item) => ({ value: item, label: item }))} />
                    <Select
                      label="Unidade atendida"
                      required
                      value={formData.unitId}
                      onChange={(event) => setFormData({ ...formData, unitId: event.target.value })}
                      options={[{ value: "", label: "Selecione..." }, { value: "todas", label: "Todas as unidades" }, ...units.map((item) => ({ value: item.id, label: item.name }))]}
                    />
                    <Select
                      label="Tipo"
                      required
                      value={formData.type}
                      onChange={(event) => setFormData({ ...formData, type: event.target.value as "Interno" | "Externo" })}
                      options={[{ value: "Externo", label: "Externo (Terceirizado)" }, { value: "Interno", label: "Interno (Funcionario)" }]}
                    />
                    <Select
                      label="Status"
                      required
                      value={formData.status}
                      onChange={(event) => setFormData({ ...formData, status: event.target.value as "Ativo" | "Inativo" })}
                      options={[{ value: "Ativo", label: "Ativo" }, { value: "Inativo", label: "Inativo" }]}
                    />
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    Se o tecnico atender mais de uma unidade, mantenha a opcao de abrangencia correspondente para nao limitar a alocacao operacional.
                  </div>
                </div>
              ),
            },
            {
              value: "observacoes",
              label: "Observacoes",
              content: (
                <div className="space-y-7 p-6">
                  <div className="border-b border-slate-200 pb-6">
                    <h2 className={formSectionTitleClass}>Informacoes complementares</h2>
                    <p className={formSectionDescriptionClass}>Registre orientacoes ou restricoes para uso interno.</p>
                  </div>
                  <Textarea label="Observacoes" value={formData.observations} onChange={(event) => setFormData({ ...formData, observations: event.target.value })} rows={5} />
                </div>
              ),
            },
          ]}
        />
      </form>
    </div>
  );
};
