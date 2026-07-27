import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Document, Unit, Location, User } from "../types";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { ArrowLeft, Upload, FileText } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toAttachment = (file: File) => new Promise<any>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, type: file.type, size: file.size, uploadedAt: new Date().toISOString(), dataUrl: reader.result as string });
    reader.readAsDataURL(file);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="page-title-panel flex items-center gap-4">
        <Button  variant="ghost" className="p-2" onClick={() => navigate(-1)}>
              <ArrowLeft  className="w-5 h-5" />
            </Button>
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900">Novo Documento</h1>
          <p className="text-sm text-slate-500">Cadastre um novo alvará, licença ou laudo.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Título do Documento *" name="title" value={formData.title} onChange={handleChange} required />
              <Select label="Tipo *" name="type" value={formData.type} onChange={handleChange} required>
                <option value="Alvará">Alvará</option>
                <option value="Licença">Licença</option>
                <option value="Laudo">Laudo</option>
                <option value="Certificado">Certificado</option>
                <option value="Plano">Plano (PMOC, PPRA)</option>
                <option value="Outros">Outros</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Número/Identificação *" name="number" value={formData.number} onChange={handleChange} required />
              <Input label="Órgão Regulador / Emissor *" name="regulatoryBody" value={formData.regulatoryBody} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Valor do documento (R$)" name="value" type="number" min="0" step="0.01" value={formData.value || ""} onChange={handleChange} />
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Anexos do documento</label>
                <input className="block w-full rounded-md border-2 border-slate-300 bg-white p-2 text-sm" type="file" multiple onChange={(event) => setPendingFiles(Array.from(event.target.files || []))} />
                {pendingFiles.length > 0 && <p className="mt-2 text-xs text-slate-600">{pendingFiles.length} arquivo(s) serão anexados ao salvar.</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select label="Unidade *" name="unitId" value={formData.unitId} onChange={handleChange} required>
                <option value="">Selecione...</option>
                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </Select>
              <Select label="Local/Área (Opcional)" name="locationId" value={formData.locationId} onChange={handleChange}>
                <option value="">Geral da Unidade</option>
                {locations.filter(l => l.unitId === formData.unitId).map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input label="Data de Emissão" name="issueDate" type="date" value={formData.issueDate} onChange={handleChange} />
              <Input label="Data de Vencimento" name="expirationDate" type="date" value={formData.expirationDate} onChange={handleChange} />
              <Select label="Periodicidade" name="periodicity" value={formData.periodicity} onChange={handleChange}>
                <option value="Único">Único</option>
                <option value="Mensal">Mensal</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
                <option value="Bienal">Bienal</option>
                <option value="Quinquenal">Quinquenal</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select label="Regra de acompanhamento" name="scope" value={formData.scope} onChange={handleChange}>
                <option value="Único">Vencimento único</option>
                <option value="Periódico">Documento periódico</option>
                <option value="Recorrente">Compromisso recorrente mensal</option>
              </Select>
              {formData.scope === "Recorrente" && <Input label="Dia de vencimento mensal" name="recurrenceDay" type="number" min="1" max="28" value={formData.recurrenceDay} onChange={handleChange} />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select label="Responsável" name="responsibleId" value={formData.responsibleId} onChange={handleChange}>
                <option value="">Selecione...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </Select>
              <div className="flex items-center gap-2 pt-8">
                <input type="checkbox" id="requiresART" name="requiresART" checked={formData.requiresART} onChange={handleChange} className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500" />
                <label htmlFor="requiresART" className="text-sm font-medium text-slate-700">Requer ART (Anotação de Responsabilidade Técnica)</label>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">Configuração de Alertas</h3>
              <p className="text-xs text-slate-500">Defina com quantos dias de antecedência o sistema deve alertar sobre o vencimento.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Dias para Status 'Atenção'" name="alertDaysAttention" type="number" value={formData.alertDaysAttention} onChange={handleChange} min="1" />
                <Input label="Dias para Status 'Crítico'" name="alertDaysCritical" type="number" value={formData.alertDaysCritical} onChange={handleChange} min="1" />
              </div>
            </div>

            <Textarea label="Observações" name="observations" value={formData.observations} onChange={handleChange} rows={3} />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button type="button" variant="secondary" onClick={() => navigate("/documentos")}>Cancelar</Button>
              <Button type="submit">Salvar Documento</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
