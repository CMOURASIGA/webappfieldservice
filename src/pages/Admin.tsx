import React, { useState, useEffect } from "react";
import { storageService } from "../services/storageService";
import { Category } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";

export const Admin = () => {
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState<any>("Serviço");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    setCategories(storageService.get("gsi_categories"));
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
      <div className="page-title-panel">
        <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Administração e Configurações</h1>
        <p className="text-sm text-slate-500">Gestão das categorias operacionais disponíveis no sistema.</p>
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
    </div>
  );
};
