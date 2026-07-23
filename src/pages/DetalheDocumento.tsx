import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { storageService } from "../services/storageService";
import { Document, Unit, Location, User, DocumentVersion, Attachment } from "../types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Drawer } from "../components/ui/Drawer";
import { Textarea } from "../components/ui/Textarea";
import { format, isValid, parseISO, differenceInDays } from "date-fns";
import { ArrowLeft, FileText, Upload, X, Download, Clock, Pencil, History, ShieldAlert } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../contexts/AuthContext";
import { calcularStatusDocumento } from "../utils/documentStatus";

export const DetalheDocumento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [doc, setDoc] = useState<Document | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [newExpiration, setNewExpiration] = useState("");
  const [newIssue, setNewIssue] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !doc || !currentUser) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newAttachment = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        dataUrl
      };
      
      const allDocs = storageService.get("gsi_documents");
      const idx = allDocs.findIndex(d => d.id === doc.id);
      if (idx !== -1) {
        allDocs[idx].attachments = [...allDocs[idx].attachments, newAttachment];
        storageService.set("gsi_documents", allDocs);
        setDoc(allDocs[idx]);
        storageService.logAudit(currentUser.id, "Upload de Anexo no Documento", doc.id, "Document");
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleDownload = (att: any) => {
    if (!att.dataUrl) {
      alert("Arquivo não possui dados salvos (mock).");
      return;
    }
    const a = document.createElement('a');
    a.href = att.dataUrl;
    a.download = att.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleDeleteAttachment = (attId: string) => {
    if (!confirm("Remover este anexo?")) return;
    const allDocs = storageService.get("gsi_documents");
    const idx = allDocs.findIndex(d => d.id === doc.id);
    if (idx !== -1 && currentUser) {
      allDocs[idx].attachments = allDocs[idx].attachments.filter(a => a.id !== attId);
      storageService.set("gsi_documents", allDocs);
      setDoc(allDocs[idx]);
      storageService.logAudit(currentUser.id, "Removeu Anexo do Documento", doc.id, "Document");
    }
  };
  
  const handleRenew = () => {
    if (!newExpiration || !doc || !currentUser) return;
    
    const allDocs = storageService.get("gsi_documents");
    const idx = allDocs.findIndex(d => d.id === doc.id);
    if (idx !== -1) {
      // Create version from current state
      const oldVersion = {
        id: crypto.randomUUID(),
        version: `Renovação (${(isValid(parseISO(doc.expirationDate || '')) ? format(parseISO(doc.expirationDate || ''), 'dd/MM/yyyy') : 'Sem data')})`,
        date: new Date().toISOString(),
        observations: "Renovação de documento recorrente.",
        userId: currentUser.id
      };
      
      allDocs[idx].versions = [...(allDocs[idx].versions || []), oldVersion];
      allDocs[idx].expirationDate = new Date(newExpiration).toISOString();
      if (newIssue) allDocs[idx].issueDate = new Date(newIssue).toISOString();
      
      storageService.set("gsi_documents", allDocs);
      setDoc(allDocs[idx]);
      storageService.logAudit(currentUser.id, "Renovou Documento", doc.id, "Document");
      setRenewModalOpen(false);
    }
  };

  const handleDeactivate = () => {
    if (!doc) return;

    const docs = storageService.get("gsi_documents");
    const idx = docs.findIndex((item) => item.id === doc.id);
    if (idx === -1) return;

    docs[idx].active = false;
    docs[idx].updatedAt = new Date().toISOString();
    storageService.set("gsi_documents", docs);
    if (currentUser) {
      storageService.logAudit(currentUser.id, "Inativou Documento", doc.id, "Document");
    }
    navigate("/documentos");
  };

  const [newVersion, setNewVersion] = useState({ version: "", observations: "" });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = () => {
    const docs = storageService.get("gsi_documents");
    const found = docs.find(d => d.id === id);
    if (!found) {
      navigate("/documentos");
      return;
    }
    setDoc(found);
    setUnits(storageService.get("gsi_units"));
    setUsers(storageService.get("gsi_users"));
  };

  const getUnitName = (uid: string) => units.find(u => u.id === uid)?.name || "N/A";
  const getUserName = (uid?: string) => users.find(u => u.id === uid)?.name || "Não atribuído";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Vigente": return <Badge variant="success">{status}</Badge>;
      case "Atenção": return <Badge variant="warning">{status}</Badge>;
      case "Crítico": return <Badge variant="danger">{status}</Badge>;
      case "Vencido": return <Badge className="bg-red-700 hover:bg-red-800 text-white border-transparent">{status}</Badge>;
      case "Sem validade definida": return <Badge variant="default">{status}</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  const handleAddVersion = () => {
    if (!doc || !newVersion.version) return;
    
    const docs = storageService.get("gsi_documents");
    const idx = docs.findIndex(d => d.id === doc.id);
    if (idx !== -1) {
      const versionObj: DocumentVersion = {
        id: uuidv4(),
        version: newVersion.version,
        date: new Date().toISOString(),
        observations: newVersion.observations,
        userId: currentUser?.id
      };
      
      const updatedVersions = [...(docs[idx].versions || []), versionObj];
      docs[idx].versions = updatedVersions;
      docs[idx].updatedAt = new Date().toISOString();
      
      storageService.set("gsi_documents", docs);
      setDoc(docs[idx]);
    }
    
    setVersionModalOpen(false);
    setNewVersion({ version: "", observations: "" });
  };

  if (!doc) return <div>Carregando...</div>;

  const statusCalculation = calcularStatusDocumento(doc);
  const daysRemaining = statusCalculation.diasRestantes ?? (statusCalculation.diasEmAtraso ? -statusCalculation.diasEmAtraso : null);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="page-title-panel flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button  variant="ghost" className="p-2" onClick={() => navigate(-1)}>
              <ArrowLeft  className="w-5 h-5" />
            </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] font-semibold text-slate-900">{doc.title}</h1>
              {getStatusBadge(statusCalculation.status)}
              {doc.requiresART && <Badge className="bg-blue-100 text-blue-700 border-transparent">ART</Badge>}
            </div>
            <p className="text-sm text-slate-500">{doc.number} • {doc.regulatoryBody || doc.issuer}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/documentos/${doc.id}/editar`}><Button variant="secondary" className="flex items-center gap-2"><Pencil className="w-4 h-4"/> Editar</Button></Link>
          <Button variant="destructive" onClick={handleDeactivate}>Inativar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">Detalhes do Documento</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Tipo</p>
                  <p className="font-medium text-slate-900">{doc.type}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Unidade</p>
                  <p className="font-medium text-slate-900">{getUnitName(doc.unitId)}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Data de Emissão</p>
                  <p className="font-medium text-slate-900">{doc.issueDate ? (isValid(parseISO(doc.issueDate)) ? format(parseISO(doc.issueDate), 'dd/MM/yyyy') : 'Data Inválida') : '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Data de Vencimento</p>
                  <p className="font-medium text-slate-900">{doc.expirationDate ? (isValid(parseISO(doc.expirationDate)) ? format(parseISO(doc.expirationDate), 'dd/MM/yyyy') : 'Data Inválida') : '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Periodicidade</p>
                  <p className="font-medium text-slate-900">{doc.periodicity || 'Único'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Responsável Interno</p>
                  <p className="font-medium text-slate-900">{getUserName(doc.responsibleId)}</p>
                </div>
              </div>

              {doc.observations && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-slate-500 mb-1 text-sm">Observações</p>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">{doc.observations}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2"><History className="w-4 h-4"/> Histórico de Versões</h3>
                <Button variant="secondary" size="sm" onClick={() => setVersionModalOpen(true)}>Adicionar Versão</Button>
              </div>
              
              <div className="space-y-4">
                {(doc.versions || []).length > 0 ? (
                  <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pb-2">
                    {(doc.versions || []).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(v => (
                      <div key={v.id} className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-brand-500 rounded-full -left-[7px] top-1.5 border-2 border-white"></div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-sm text-slate-900">Versão {v.version}</span>
                            <span className="text-xs text-slate-500">{(isValid(parseISO(v.date)) ? format(parseISO(v.date), 'dd/MM/yyyy HH:mm') : 'Data Inválida')}</span>
                          </div>
                          <p className="text-xs text-slate-600">{v.observations}</p>
                          {v.userId && <p className="text-xs text-slate-400 mt-2">Por: {getUserName(v.userId)}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 text-sm text-slate-500 border border-dashed border-slate-300 rounded-lg">
                    Nenhuma versão registrada.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Clock className={`w-8 h-8 ${daysRemaining !== null && daysRemaining < 0 ? 'text-red-600' : 'text-slate-500'}`} />
              </div>
              <h3 className="text-slate-500 text-sm font-medium mb-1">Status de Conformidade</h3>
              
              {daysRemaining !== null ? (
                <>
                  <div className={`text-3xl font-bold mb-2 ${daysRemaining < 0 ? 'text-red-700' : daysRemaining <= (doc.alertDaysCritical || 15) ? 'text-red-600' : daysRemaining <= (doc.alertDaysAttention || 30) ? 'text-amber-600' : 'text-green-600'}`}>
                    {daysRemaining < 0 ? `${-daysRemaining} dias` : `${daysRemaining} dias`}
                  </div>
                  <p className="text-sm font-medium text-slate-700">{daysRemaining < 0 ? 'EM ATRASO' : 'RESTANTES'}</p>
                </>
              ) : (
                <p className="text-lg font-medium text-slate-700">Sem validade definida</p>
              )}

              <div className="mt-6 pt-4 border-t border-slate-100 text-left text-xs text-slate-500 space-y-2">
                <div className="flex justify-between">
                  <span>Alerta Atenção:</span>
                  <span className="font-medium text-amber-600">{doc.alertDaysAttention || 30} dias</span>
                </div>
                <div className="flex justify-between">
                  <span>Alerta Crítico:</span>
                  <span className="font-medium text-red-600">{doc.alertDaysCritical || 15} dias</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2"><Upload className="w-4 h-4"/> Anexos Digitais</h3>
              <div className="space-y-3">
                {doc.attachments.map(att => (
                  <div key={att.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="w-5 h-5 text-brand-600 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-sm font-medium text-slate-900 truncate">{att.name}</p>
                        <p className="text-xs text-slate-500">{(isValid(parseISO(att.uploadedAt)) ? format(parseISO(att.uploadedAt), 'dd/MM/yyyy') : 'Data Inválida')} • {(att.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="p-2 flex-shrink-0 text-brand-600" onClick={() => handleDownload(att)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-2 flex-shrink-0 text-red-600" onClick={() => handleDeleteAttachment(att.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {doc.attachments.length === 0 && (
                  <div className="text-center p-4 text-sm text-slate-500 border border-dashed border-slate-300 rounded-lg">
                    Nenhum arquivo anexado.
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                <Button variant="secondary" className="w-full mt-2" onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2"/> Fazer Upload</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Drawer
        isOpen={versionModalOpen}
        onClose={() => setVersionModalOpen(false)}
        title="Nova Versão do Documento"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Identificador da Versão (Ex: v2.0, 2026/2)</label>
            <input 
              type="text" 
              className="w-full h-10 px-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              value={newVersion.version}
              onChange={e => setNewVersion({...newVersion, version: e.target.value})}
              placeholder="Ex: 2.0"
            />
          </div>
          <Textarea 
            label="Observações da Atualização" 
            placeholder="O que mudou nesta versão?"
            value={newVersion.observations}
            onChange={e => setNewVersion({...newVersion, observations: e.target.value})}
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setVersionModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddVersion} disabled={!newVersion.version.trim()}>Salvar Versão</Button>
          </div>
        </div>
      </Drawer>
    
      <Drawer
        isOpen={renewModalOpen}
        onClose={() => setRenewModalOpen(false)}
        title="Renovar Documento"
      >
        <div className="space-y-4">
          <Input 
            label="Nova Data de Emissão" 
            type="date" 
            value={newIssue}
            onChange={e => setNewIssue(e.target.value)}
          />
          <Input 
            label="Nova Data de Vencimento" 
            type="date" 
            required
            value={newExpiration}
            onChange={e => setNewExpiration(e.target.value)}
          />
          <p className="text-xs text-slate-500">Ao renovar, o vencimento atual será salvo no histórico de versões do documento.</p>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setRenewModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleRenew} disabled={!newExpiration}>Confirmar Renovação</Button>
          </div>
        </div>
      </Drawer>

    </div>
  );
};
