const fs = require('fs');

let content = fs.readFileSync('src/pages/DetalheOrdem.tsx', 'utf8');

// We need to inject Materials state, Material logic, Attachment logic.

// Add Lucide icons to import
content = content.replace('import { Textarea } from "../components/ui/Textarea";', `import { Textarea } from "../components/ui/Textarea";\nimport { Input } from "../components/ui/Input";\nimport { Paperclip, Plus, Trash2, Printer } from "lucide-react";`);

// Add state to component
const stateInjection = `
  const [newMaterial, setNewMaterial] = useState({ description: "", type: "", quantity: 1, unitPrice: 0 });
  const [uploading, setUploading] = useState(false);

  const handleAddMaterial = () => {
    if (!order || !currentUser) return;
    if (!newMaterial.description) return;
    
    const orders = storageService.get("gsi_work_orders");
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      if (!orders[idx].materials) orders[idx].materials = [];
      orders[idx].materials.push({
        id: crypto.randomUUID(),
        ...newMaterial,
        total: newMaterial.quantity * newMaterial.unitPrice
      });
      storageService.set("gsi_work_orders", orders);
      setNewMaterial({ description: "", type: "", quantity: 1, unitPrice: 0 });
      loadOrder();
    }
  };

  const handleRemoveMaterial = (mId: string) => {
    if (!order || !currentUser) return;
    const orders = storageService.get("gsi_work_orders");
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      orders[idx].materials = orders[idx].materials?.filter(m => m.id !== mId) || [];
      storageService.set("gsi_work_orders", orders);
      loadOrder();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !order || !currentUser) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const orders = storageService.get("gsi_work_orders");
      const idx = orders.findIndex(o => o.id === order.id);
      if (idx !== -1) {
        if (!orders[idx].attachments) orders[idx].attachments = [];
        orders[idx].attachments.push({
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          dataUrl: event.target?.result as string
        });
        storageService.set("gsi_work_orders", orders);
        loadOrder();
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };
`;

content = content.replace('const PAUSE_REASONS = [', stateInjection + '\n  const PAUSE_REASONS = [');

// Add to the render part, before Gestão da OS
const materialsAndAttachments = `
              {/* Materials Section */}
              <div className="pt-4 border-t border-slate-200 mt-6">
                <p className="text-sm font-semibold text-slate-900 mb-3">Materiais Necessários</p>
                {order.materials && order.materials.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {order.materials.map(m => (
                      <div key={m.id} className="flex justify-between items-center p-2 bg-slate-50 border border-slate-200 rounded text-sm">
                        <div>
                          <span className="font-medium text-slate-800">{m.description}</span>
                          <span className="text-slate-500 ml-2">({m.quantity}x - {m.type || "N/A"})</span>
                        </div>
                        {order.status === "Em execução" && (
                          <button onClick={() => handleRemoveMaterial(m.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {order.status === "Em execução" && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end bg-slate-50 p-3 rounded border border-slate-200">
                    <div className="sm:col-span-2">
                      <Input label="Descrição do material" value={newMaterial.description} onChange={e => setNewMaterial({...newMaterial, description: e.target.value})} placeholder="Ex: Parafusos M8" />
                    </div>
                    <div>
                      <Input type="number" label="Quantidade" value={newMaterial.quantity} onChange={e => setNewMaterial({...newMaterial, quantity: Number(e.target.value)})} />
                    </div>
                    <div>
                      <Button onClick={handleAddMaterial} className="w-full" disabled={!newMaterial.description}>Adicionar</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Attachments Section */}
              <div className="pt-4 border-t border-slate-200 mt-6">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-semibold text-slate-900">Anexos / Imagens</p>
                  <div>
                    <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" disabled={uploading} />
                    <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-md">
                      <Paperclip className="w-4 h-4" /> {uploading ? "Enviando..." : "Anexar arquivo"}
                    </label>
                  </div>
                </div>
                {order.attachments && order.attachments.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {order.attachments.map(att => (
                      <div key={att.id} className="border border-slate-200 rounded p-2 flex flex-col items-center justify-center gap-2 bg-slate-50 relative group">
                        {att.type.startsWith("image/") && att.dataUrl ? (
                          <img src={att.dataUrl} alt={att.name} className="w-full h-24 object-cover rounded" />
                        ) : (
                          <div className="w-full h-24 flex items-center justify-center bg-slate-100 rounded text-slate-400">
                            <Paperclip className="w-8 h-8" />
                          </div>
                        )}
                        <p className="text-xs text-slate-600 truncate w-full text-center" title={att.name}>{att.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Nenhum anexo adicionado.</p>
                )}
              </div>
`;

content = content.replace('{/* Adicionar Acompanhamento */}', materialsAndAttachments + '\n              {/* Adicionar Acompanhamento */}');

content = content.replace('<Button variant="secondary" onClick={() => navigate("/ordens")}>Voltar</Button>', '<Button variant="secondary" onClick={() => navigate("/ordens")}>Voltar</Button>\n          <Link to={`/ordens/${order.id}/imprimir`} target="_blank"><Button variant="outline" className="gap-2"><Printer className="w-4 h-4" /> Imprimir</Button></Link>');
content = content.replace('import { useParams, useNavigate } from "react-router-dom";', 'import { useParams, useNavigate, Link } from "react-router-dom";');

fs.writeFileSync('src/pages/DetalheOrdem.tsx', content);
