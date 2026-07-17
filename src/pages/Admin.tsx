import React, { useState } from "react";
import { storageService } from "../services/storageService";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export const Admin = () => {
  const [importData, setImportData] = useState("");
  const [message, setMessage] = useState("");

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
