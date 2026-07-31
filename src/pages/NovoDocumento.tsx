import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { FileText, Upload, X } from "lucide-react";
import { storageService } from "../services/storageService";
import { Document, Location, Unit, User } from "../types";
import { Input } from "../components/ui/Input";
import { OperationalPageHeader } from "../components/ui/OperationalPage";
import { Select } from "../components/ui/Select";
import { TabbedFormCard } from "../components/ui/TabbedFormCard";
import { Textarea } from "../components/ui/Textarea";
import { Button } from "../components/ui/Button";

export const NovoDocumento = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<Partial<Document>>({
    title: "",
    type: "Alvará",
    number: "",
    issuer: "",
    regulatoryBody: "",
    unitId: "",
    locationId: "",
    responsibleId: "",
    issueDate: "",
    expirationDate: "",
    periodicity: "Anual",
    scope: "Periódico",
    recurrenceDay: 5,
    requiresART: false,
    alertDaysAttention: 30,
    alertDaysCritical: 15,
    observations: "",
    value: 0,
  });

  useEffect(() => {
    setUnits(storageService.get("gsi_units"));
    setLocations(storageService.get("gsi_locations"));
    setUsers(storageService.get("gsi_users"));
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;

    if (type === "checkbox") {
      const checked = (event.target as HTMLInputElement).checked;
      setFormData((current) => ({ ...current, [name]: checked }));
      return;
    }

    if (type === "number") {
      setFormData((current) => ({ ...current, [name]: parseFloat(value) || 0 }));
      return;
    }

    setFormData((current) => ({ ...current, [name]: value }));
  };

  const toAttachment = (file: File) =>
    new Promise<any>((resolve) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve({
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          dataUrl: reader.result as string,
        });
      reader.readAsDataURL(file);
    });

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPendingFiles((current) => [...current, ...files]);
    event.target.value = "";
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const newDoc: Document = {
      ...(formData as any),
      id: uuidv4(),
      status: "Vigente",
      attachments: await Promise.all(pendingFiles.map(toAttachment)),
      versions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
    };

    const docs = storageService.get("gsi_documents");
    docs.push(newDoc);
    storageService.set("gsi_documents", docs);

    navigate("/documentos");
  };

  const filteredLocations = locations.filter((location) => location.unitId === formData.unitId);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <OperationalPageHeader
        title="Novo Documento"
        description="Cadastre um novo alvará, licença, laudo, ART ou certificado."
        backTo="/documentos"
      />

      <form onSubmit={handleSubmit}>
        <TabbedFormCard
          submitLabel="Salvar"
          tabs={[
            {
              value: "identificacao",
              label: "Identificação",
              content: (
                <>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Dados principais do documento</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Informe título, tipo, número e órgão regulador do cadastro.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input
                      label="Título do documento"
                      required
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                    />
                    <Select
                      label="Tipo"
                      required
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      options={[
                        { value: "Alvará", label: "Alvará" },
                        { value: "Licença", label: "Licença" },
                        { value: "Laudo", label: "Laudo" },
                        { value: "Certificado", label: "Certificado" },
                        { value: "Plano", label: "Plano (PMOC, PPRA)" },
                        { value: "Outros", label: "Outros" },
                      ]}
                    />
                    <Input
                      label="Número / identificação"
                      required
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                    />
                    <Input
                      label="Órgão regulador / emissor"
                      required
                      name="regulatoryBody"
                      value={formData.regulatoryBody}
                      onChange={handleChange}
                    />
                    <Input
                      label="Emissor"
                      name="issuer"
                      value={formData.issuer}
                      onChange={handleChange}
                    />
                    <Input
                      label="Valor do documento (R$)"
                      name="value"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.value || ""}
                      onChange={handleChange}
                    />
                  </div>
                </>
              ),
            },
            {
              value: "abrangencia",
              label: "Abrangência e vigência",
              content: (
                <>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Vínculo operacional e datas</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Defina unidade, local, responsável e a lógica de vigência do documento.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Select
                      label="Unidade"
                      required
                      name="unitId"
                      value={formData.unitId}
                      onChange={handleChange}
                      options={units.map((item) => ({ value: item.id, label: item.name }))}
                    />
                    <Select
                      label="Local / área"
                      name="locationId"
                      value={formData.locationId}
                      onChange={handleChange}
                      options={filteredLocations.map((item) => ({ value: item.id, label: item.name }))}
                      disabled={!formData.unitId}
                    />
                    <Select
                      label="Responsável"
                      name="responsibleId"
                      value={formData.responsibleId}
                      onChange={handleChange}
                      options={users.map((item) => ({ value: item.id, label: item.name }))}
                    />
                    <Select
                      label="Periodicidade"
                      name="periodicity"
                      value={formData.periodicity}
                      onChange={handleChange}
                      options={[
                        { value: "Único", label: "Único" },
                        { value: "Mensal", label: "Mensal" },
                        { value: "Semestral", label: "Semestral" },
                        { value: "Anual", label: "Anual" },
                        { value: "Bienal", label: "Bienal" },
                        { value: "Quinquenal", label: "Quinquenal" },
                      ]}
                    />
                    <Input
                      label="Data de emissão"
                      name="issueDate"
                      type="date"
                      value={formData.issueDate}
                      onChange={handleChange}
                    />
                    <Input
                      label="Data de vencimento"
                      name="expirationDate"
                      type="date"
                      value={formData.expirationDate}
                      onChange={handleChange}
                    />
                    <Select
                      label="Regra de acompanhamento"
                      name="scope"
                      value={formData.scope}
                      onChange={handleChange}
                      options={[
                        { value: "Único", label: "Vencimento único" },
                        { value: "Periódico", label: "Documento periódico" },
                        { value: "Recorrente", label: "Compromisso recorrente mensal" },
                      ]}
                    />
                    {formData.scope === "Recorrente" ? (
                      <Input
                        label="Dia de vencimento mensal"
                        name="recurrenceDay"
                        type="number"
                        min="1"
                        max="28"
                        value={formData.recurrenceDay}
                        onChange={handleChange}
                      />
                    ) : (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">
                        Use a regra de acompanhamento para controlar alertas de vencimento e recorrência.
                      </div>
                    )}
                  </div>
                </>
              ),
            },
            {
              value: "alertas-anexos",
              label: "Alertas e anexos",
              content: (
                <>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Alertas e evidências</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Configure janelas de alerta, observações e vincule os anexos do documento.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input
                      label="Dias para status Atenção"
                      name="alertDaysAttention"
                      type="number"
                      min="1"
                      value={formData.alertDaysAttention}
                      onChange={handleChange}
                    />
                    <Input
                      label="Dias para status Crítico"
                      name="alertDaysCritical"
                      type="number"
                      min="1"
                      value={formData.alertDaysCritical}
                      onChange={handleChange}
                    />
                  </div>

                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      name="requiresART"
                      checked={Boolean(formData.requiresART)}
                      onChange={handleChange}
                    />
                    Requer ART (Anotação de Responsabilidade Técnica)
                  </label>

                  <Textarea
                    label="Observações"
                    name="observations"
                    value={formData.observations}
                    onChange={handleChange}
                    rows={4}
                  />

                  <div>
                    <label className="mb-2 block text-[13px] font-semibold text-slate-700">Anexos do documento</label>
                    <input
                      id="document-attachments"
                      className="sr-only"
                      type="file"
                      multiple
                      onChange={handleFilesSelected}
                    />
                    <label
                      htmlFor="document-attachments"
                      className="flex min-h-24 cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed border-brand-300 bg-brand-50/40 px-4 py-5 text-center transition-colors hover:border-brand-500 hover:bg-brand-50"
                    >
                      <Upload className="h-5 w-5 shrink-0 text-brand-600" />
                      <span>
                        <span className="block text-sm font-semibold text-brand-700">Selecionar arquivos</span>
                        <span className="mt-0.5 block text-xs text-slate-600">
                          Clique aqui para anexar documentos, imagens ou PDFs.
                        </span>
                      </span>
                    </label>
                    {pendingFiles.length > 0 && (
                      <ul className="mt-3 space-y-2" aria-label="Arquivos selecionados">
                        {pendingFiles.map((file, index) => (
                          <li
                            key={`${file.name}-${file.size}-${index}`}
                            className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2"
                          >
                            <FileText className="h-4 w-4 shrink-0 text-brand-600" />
                            <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{file.name}</span>
                            <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                            <button
                              type="button"
                              onClick={() => removePendingFile(index)}
                              className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                              aria-label={`Remover ${file.name}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-2 text-xs text-slate-500">
                      Os arquivos serão vinculados ao documento ao salvar o cadastro.
                    </p>
                  </div>
                </>
              ),
            },
          ]}
        />
      </form>
    </div>
  );
};
