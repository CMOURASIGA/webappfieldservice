const fs = require('fs');
let content = fs.readFileSync('src/pages/DetalheDocumento.tsx', 'utf8');

// We need to add state for file upload
const stateAdd = `
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
        version: \`Renovação (\${(isValid(parseISO(doc.expirationDate || '')) ? format(parseISO(doc.expirationDate || ''), 'dd/MM/yyyy') : 'Sem data')})\`,
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
`;

content = content.replace(/const \[versionModalOpen, setVersionModalOpen\] = useState\(false\);/, stateAdd);

const uiAdd = `
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
`;

content = content.replace(/\{doc\.attachments\.map\(att => \([\s\S]*?<\/Button>\n              <\/div>/, uiAdd.trim() + '\n              </div>');

const renewBtn = `
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-white" onClick={() => setRenewModalOpen(true)}>Renovar Documento</Button>
            <Link to={\`/documentos/\${id}/editar\`}>
`;
content = content.replace(/<Link to=\{`\/documentos\/\$\{id\}\/editar`\}>/, renewBtn);

const renewDrawer = `
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
`;

content = content.replace(/<\/div>\n  \);\n\};\n$/, renewDrawer + '\n    </div>\n  );\n};\n');

// Import X
content = content.replace(/import \{.*?Upload.*?\} from "lucide-react";/, (m) => m.replace("Upload", "Upload, X"));


fs.writeFileSync('src/pages/DetalheDocumento.tsx', content);
