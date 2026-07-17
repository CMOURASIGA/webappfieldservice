import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { storageService } from "../services/storageService";
import { WorkOrder, Unit, Location, Category, User, Asset, WorkOrderStatus } from "../types";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../contexts/AuthContext";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";

export const DetalheOrdem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  // Action states
  const [assignUser, setAssignUser] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    loadOrder();
    setUnits(storageService.get("gsi_units"));
    setLocations(storageService.get("gsi_locations"));
    setCategories(storageService.get("gsi_categories"));
    setUsers(storageService.get("gsi_users"));
    setAssets(storageService.get("gsi_assets"));
  }, [id]);

  const loadOrder = () => {
    const orders = storageService.get("gsi_work_orders");
    const found = orders.find(o => o.id === id);
    if (found) setOrder(found);
  };

  const updateStatus = (newStatus: WorkOrderStatus, logMsg: string) => {
    if (!order || !currentUser) return;
    const orders = storageService.get("gsi_work_orders");
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      const oldStatus = orders[idx].status;
      orders[idx].status = newStatus;
      orders[idx].updatedAt = new Date().toISOString();
      if (comment) {
        orders[idx].observations += `\n[${new Date().toLocaleDateString()} - ${currentUser.name}]: ${comment}`;
      }
      storageService.set("gsi_work_orders", orders);
      storageService.logAudit(currentUser.id, logMsg, order.id, "WorkOrder", oldStatus, newStatus);
      setComment("");
      loadOrder();
    }
  };

  const handleAssign = () => {
    if (!order || !currentUser || !assignUser) return;
    const orders = storageService.get("gsi_work_orders");
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      orders[idx].responsibleId = assignUser;
      orders[idx].status = "Atribuída";
      orders[idx].updatedAt = new Date().toISOString();
      storageService.set("gsi_work_orders", orders);
      storageService.logAudit(currentUser.id, "Atribuída OS", order.id, "WorkOrder", "", assignUser);
      loadOrder();
    }
  };

  if (!order) return <div className="p-6">Ordem de Serviço não encontrada.</div>;

  const getUnitName = (uid: string) => units.find(u => u.id === uid)?.name || "N/A";
  const getLocationName = (lid: string) => locations.find(l => l.id === lid)?.name || "N/A";
  const getCategoryName = (cid: string) => categories.find(c => c.id === cid)?.name || "N/A";
  const getUserName = (uid?: string) => users.find(u => u.id === uid)?.name || "Não atribuído";
  const getAssetCode = (aid?: string) => assets.find(a => a.id === aid)?.code || "Nenhum";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">OS: {order.number}</h1>
          <p className="text-sm text-slate-500">Detalhes e execução da ordem.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/ordens")}>Voltar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Informações Técnicas</CardTitle>
                <Badge variant={order.status === 'Concluída' ? 'success' : order.status === 'Em execução' ? 'info' : 'warning'}>
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Unidade</p>
                  <p className="text-sm">{getUnitName(order.unitId)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Local</p>
                  <p className="text-sm">{getLocationName(order.locationId)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Categoria</p>
                  <p className="text-sm">{getCategoryName(order.categoryId)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Ativo</p>
                  <p className="text-sm">{getAssetCode(order.assetId)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Descrição</p>
                <div className="bg-slate-50 p-3 rounded border border-slate-100 text-sm whitespace-pre-wrap">
                  {order.technicalDescription}
                </div>
              </div>
              
              {order.observations && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Histórico de Observações</p>
                  <div className="bg-slate-50 p-3 rounded border border-slate-100 text-sm whitespace-pre-wrap font-mono text-xs">
                    {order.observations}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão da OS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Responsável Atual</p>
                <p className="text-sm font-medium">{getUserName(order.responsibleId)}</p>
              </div>

              {/* Atribuição - Gestores/Operadores */}
              {(currentUser?.role === "Gestor GSI" || currentUser?.role === "Operador GSI" || currentUser?.role === "Administrador") && (order.status === "Planejada" || order.status === "Atribuída") && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <Select
                    options={users.filter(u => u.role === "Executor/Técnico").map(u => ({ value: u.id, label: u.name }))}
                    value={assignUser}
                    onChange={(e) => setAssignUser(e.target.value)}
                  />
                  <Button className="w-full" onClick={handleAssign} disabled={!assignUser}>Atribuir Técnico</Button>
                </div>
              )}

              {/* Execução - Técnicos */}
              {(currentUser?.role === "Executor/Técnico" && order.responsibleId === currentUser.id) && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  {order.status === "Atribuída" && (
                    <Button className="w-full bg-blue-600" onClick={() => updateStatus("Em execução", "Iniciou execução")}>Iniciar Serviço</Button>
                  )}
                  {order.status === "Em execução" && (
                    <>
                      <Textarea placeholder="Observações de conclusão..." value={comment} onChange={e => setComment(e.target.value)} />
                      <Button className="w-full bg-amber-600" onClick={() => updateStatus("Pausada", "Pausou serviço")}>Pausar</Button>
                      <Button className="w-full bg-green-600" onClick={() => updateStatus("Em validação", "Enviou para validação")}>Concluir Tecnicamente</Button>
                    </>
                  )}
                </div>
              )}

              {/* Validação - Gestores */}
              {(currentUser?.role === "Gestor GSI" || currentUser?.role === "Administrador") && order.status === "Em validação" && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <Textarea placeholder="Comentário de validação..." value={comment} onChange={e => setComment(e.target.value)} />
                  <Button className="w-full bg-green-700" onClick={() => updateStatus("Concluída", "Validou e encerrou")}>Aprovar e Encerrar</Button>
                  <Button className="w-full" variant="destructive" onClick={() => updateStatus("Em execução", "Rejeitou validação")}>Reprovar (Voltar para Execução)</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
