import React, { useState, useEffect } from "react";
import { storageService } from "../services/storageService";
import { Category } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";

export const Admin = () => {
  const [importData, setImportData] = useState("");
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState<any>("Demanda");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    setCategories(storageService.get("gsi_categories"));
  };

  const handleExport = () => {
    try {
      const data = storageService.exportJSON();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gsi-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage("Exportação realizada com sucesso.");
    } catch (e) {
      setMessage("Erro ao exportar dados.");
    }
  };

  const handleImport = () => {
    if (!importData) {
      setMessage("Cole os dados JSON primeiro.");
      return;
    }
    try {
      storageService.importJSON(importData);
      setMessage("Importação concluída. Recarregue a página.");
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      setMessage("Erro ao importar dados. Verifique o formato JSON.");
    }
  };

  const handleRestore = () => {
    if (confirm("Tem certeza que deseja restaurar os dados de demonstração? TODOS os dados atuais serão perdidos.")) {
      storageService.restoreDefaults();
      setMessage("Dados restaurados. Recarregue a página.");
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const allCats = storageService.get("gsi_categories");
    const newCat: Category = {
      id: crypto.randomUUID(),
      name: newCatName.trim(),
      type: newCatType,
      active: true,
    };
    allCats.push(newCat);
    storageService.set("gsi_categories", allCats);
    loadCategories();
    setNewCatName("");
    setMessage("Categoria adicionada com sucesso.");
  };

  const handleToggleCategory = (id: string, currentStatus: boolean) => {
    const allCats = storageService.get("gsi_categories");
    const idx = allCats.findIndex(c => c.id === id);
    if (idx !== -1) {
      allCats[idx].active = !currentStatus;
      storageService.set("gsi_categories", allCats);
      loadCategories();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Administração e Configurações</h1>
        <p className="text-sm text-slate-500">Gerenciamento de dados e parâmetros do sistema.</p>
      </div>

      {message && (
        <div className="p-4 bg-blue-50 text-blue-800 rounded-md border border-blue-200 font-medium text-sm">
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Categorias do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCategory} className="flex gap-4 items-end mb-6">
            <div className="flex-1">
              <Input 
                label="Nome da Categoria" 
                value={newCatName} 
                onChange={e => setNewCatName(e.target.value)} 
                placeholder="Ex: Alvenaria"
              />
            </div>
            <div className="w-[200px]">
              <Select 
                label="Tipo" 
                value={newCatType} 
                onChange={e => setNewCatType(e.target.value)}
                options={[
                  { value: "Demanda", label: "Demanda" },
                  { value: "Serviço", label: "Serviço" },
                  { value: "Preventiva", label: "Preventiva" },
                  { value: "Documento", label: "Documento" },
                ]}
              />
            </div>
            <Button type="submit" disabled={!newCatName.trim()}>Adicionar</Button>
          </form>

          <div className="border border-slate-200 rounded-md overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 border-b border-slate-200 font-medium">Nome</th>
                  <th className="px-4 py-3 border-b border-slate-200 font-medium">Tipo</th>
                  <th className="px-4 py-3 border-b border-slate-200 font-medium w-[100px]">Status</th>
                  <th className="px-4 py-3 border-b border-slate-200 font-medium w-[100px] text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900">{cat.name}</td>
                    <td className="px-4 py-3 text-slate-600">{cat.type}</td>
                    <td className="px-4 py-3">
                      {cat.active ? <Badge variant="success">Ativo</Badge> : <Badge variant="default">Inativo</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleToggleCategory(cat.id, cat.active)}
                        className={`text-xs font-medium ${cat.active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                      >
                        {cat.active ? 'Desativar' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Exportar e Restaurar Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Faça backup dos dados atuais em um arquivo JSON para segurança ou transferência, ou restaure o sistema para o conjunto de dados inicial de demonstração.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleExport}>Exportar Backup (JSON)</Button>
              <Button variant="destructive" onClick={handleRestore}>Restaurar Demo</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Importar Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Cole o conteúdo de um backup JSON previamente exportado para sobrescrever os dados atuais. Cuidado: esta ação é irreversível.
            </p>
            <textarea
              className="w-full min-h-[120px] p-3 text-xs font-mono border border-slate-300 rounded-md bg-slate-50 focus:border-blue-700 outline-none"
              placeholder='{"version": "1.0.0", "data": {...}}'
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
            />
            <Button onClick={handleImport}>Importar Dados</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
