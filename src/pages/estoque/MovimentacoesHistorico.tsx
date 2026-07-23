import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
  Badge,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cnc-ti/layout-basic";
import { Card, CardContent } from "../../components/ui/Card";
import { storageService } from "../../services/storageService";
import { StockMaterial, StockMovement } from "../../types";
import { OperationalPageHeader } from "../../components/ui/OperationalPage";

export const MovimentacoesHistorico = () => {
  const [searchParams] = useSearchParams();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [materials, setMaterials] = useState<StockMaterial[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const materialIdFilter = searchParams.get("materialId");

  useEffect(() => {
    const allMovements = (storageService.get("gsi_stock_movements") || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const allMaterials = storageService.get("gsi_stock_materials") || [];

    setMovements(allMovements);
    setMaterials(allMaterials);
    setUsers(storageService.get("gsi_users") || []);

    const materialId = searchParams.get("materialId");
    if (materialId) {
      const selectedMaterial = allMaterials.find((material: any) => material.id === materialId);
      if (selectedMaterial) {
        setSearchTerm(selectedMaterial.name);
      }
    }
  }, [searchParams]);

  const getMaterialName = (id: string) => materials.find((material) => material.id === id)?.name || id;
  const getUserName = (id: string) => users.find((user) => user.id === id)?.name || "Usuário";

  const filtered = movements.filter((movement) => {
    const matchesMaterial = !materialIdFilter || movement.materialId === materialIdFilter;
    const matchesSearch = getMaterialName(movement.materialId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "Todos" || movement.type === typeFilter;
    return matchesMaterial && matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <OperationalPageHeader
        title="Histórico de Movimentações"
        description="Extrato completo de entradas, saídas e ajustes de inventário."
        backTo="/estoque"
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Buscar por nome do material..." className="pl-9" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
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
        {filtered.map((movement) => (
          <Card key={movement.id}>
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={movement.type === "Entrada" ? "success" : movement.type === "Saída" ? "danger" : "warning"}>
                    {movement.type}
                  </Badge>
                  <span className="text-sm font-semibold text-slate-900">{getMaterialName(movement.materialId)}</span>
                </div>
                <div className="text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Data: {format(parseISO(movement.date), "dd/MM/yyyy HH:mm")}</span>
                  <span>Responsavel: {getUserName(movement.userId)}</span>
                  {movement.sector && <span>Setor: {movement.sector}</span>}
                  {movement.workOrderId && (
                    <Link className="font-semibold text-brand-700 underline-offset-2 hover:underline" to={`/ordens/${movement.workOrderId}`}>
                      Destino: {storageService.get("gsi_work_orders").find((order) => order.id === movement.workOrderId)?.number || movement.workOrderId}
                    </Link>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-slate-900">
                  {movement.type === "Saída" ? "-" : movement.type === "Entrada" ? "+" : ""}
                  {movement.quantity}
                </div>
                <div className="text-xs text-slate-500">
                  Saldo: {movement.previousBalance ?? 0} {"->"} {movement.newBalance ?? 0}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500 border border-dashed rounded-lg">
            Nenhuma movimentacao encontrada para os filtros selecionados.
          </div>
        )}
      </div>
    </div>
  );
};
