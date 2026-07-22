import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { storageService } from "../../services/storageService";
import { StockMovement, StockMaterial } from "../../types";
import { Card, CardContent } from "../../components/ui/Card";
import { Button, PageHeader, PageHeaderTitle, PageHeaderTitleContent, PageHeaderActionsContainer, Badge, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@cnc-ti/layout-basic";
import { ArrowLeft, Search } from "lucide-react";
import { format, parseISO } from "date-fns";

export const MovimentacoesHistorico = () => {
  const navigate = useNavigate();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [materials, setMaterials] = useState<StockMaterial[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");

  useEffect(() => {
    setMovements((storageService.get("gsi_stock_movements") || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setMaterials(storageService.get("gsi_stock_materials") || []);
    setUsers(storageService.get("gsi_users") || []);
  }, []);

  const getMaterialName = (id: string) => materials.find(m => m.id === id)?.name || id;
  const getUserName = (id: string) => users.find(u => u.id === id)?.name || "Usuário";

  const filtered = movements.filter(m => {
    const matchesSearch = getMaterialName(m.materialId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "Todos" || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <PageHeader>
        <PageHeaderTitleContent>
          <PageHeaderTitle>Histórico de Movimentações</PageHeaderTitle>
          <p className="text-sm text-slate-500">Extrato completo de entradas, saídas e ajustes de inventário.</p>
        </PageHeaderTitleContent>
        <PageHeaderActionsContainer>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/estoque")}><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        </PageHeaderActionsContainer>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por nome do material..." 
            className="pl-9" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="w-full sm:w-64">
          <Select onValueChange={setTypeFilter} defaultValue="Todos">
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos os tipos</SelectItem>
              <SelectItem value="Entrada">Entrada</SelectItem>
              <SelectItem value="Saída">Saída</SelectItem>
              <SelectItem value="Ajuste">Ajuste</SelectItem>
              <SelectItem value="Reserva">Reserva</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(mov => (
          <Card key={mov.id}>
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={mov.type === 'Entrada' ? 'success' : mov.type === 'Saída' ? 'danger' : 'warning'}>
                    {mov.type}
                  </Badge>
                  <span className="text-sm font-semibold text-slate-900">{getMaterialName(mov.materialId)}</span>
                </div>
                <div className="text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Data: {format(parseISO(mov.date), "dd/MM/yyyy HH:mm")}</span>
                  <span>Responsável: {getUserName(mov.userId)}</span>
                  {mov.sector && <span>Setor: {mov.sector}</span>}
                  {mov.workOrderId && <span>OS: {mov.workOrderId}</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-slate-900">
                  {mov.type === "Saída" ? "-" : (mov.type === "Entrada" ? "+" : "")}{mov.quantity}
                </div>
                <div className="text-xs text-slate-500">
                  Saldo: {mov.previousBalance ?? 0} &rarr; {mov.newBalance ?? 0}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500 border border-dashed rounded-lg">
            Nenhuma movimentação encontrada para os filtros selecionados.
          </div>
        )}
      </div>
    </div>
  );
};
