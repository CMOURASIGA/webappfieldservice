import React, { useState, useEffect } from "react";
import { storageService } from "../services/storageService";
import { StockRequest, WorkOrder, User } from "../types";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ArrowLeft, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const FilaEstoque = () => {
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const loadData = () => {
    setRequests(storageService.get("gsi_stock_requests"));
    setOrders(storageService.get("gsi_work_orders"));
    setUsers(storageService.get("gsi_users"));
  };

  useEffect(() => {
    loadData();
  }, []);

  const getOrderName = (id: string) => {
    const o = orders.find(x => x.id === id);
    return o ? `${o.number} - ${o.type}` : "OS Desconhecida";
  };
  
  const getUserName = (id: string) => users.find(u => u.id === id)?.name || id;

  
  const handleRegistrarEntrada = (req: StockRequest) => {
    if (confirm("Confirmar o recebimento e reserva de " + req.quantity + " unidades para esta OS?")) {
      const reqs = storageService.get("gsi_stock_requests");
      const idx = reqs.findIndex(r => r.id === req.id);
      if (idx !== -1) {
        reqs[idx].status = "Recebido";
        storageService.set("gsi_stock_requests", reqs);
        
        // Add movement
        const movs = storageService.get("gsi_stock_movements");
        movs.push({
          id: crypto.randomUUID(),
          type: "Entrada",
          materialId: req.materialId || "",
          quantity: req.quantity,
          workOrderId: req.workOrderId,
          unitId: "u-df", // simplify for MVP
          userId: "admin",
          date: new Date().toISOString()
        });
        storageService.set("gsi_stock_movements", movs);
        
        // Update stock
        if (req.materialId) {
          const mats = storageService.get("gsi_stock_materials");
          const mIdx = mats.findIndex(m => m.id === req.materialId);
          if (mIdx !== -1) {
             mats[mIdx].physicalBalance += req.quantity;
             mats[mIdx].reservedBalance += req.quantity;
             storageService.set("gsi_stock_materials", mats);
          }
        }
        
        // Update OS material status
        const ordersDB = storageService.get("gsi_work_orders");
        const oIdx = ordersDB.findIndex(o => o.id === req.workOrderId);
        if (oIdx !== -1 && ordersDB[oIdx].materials) {
           const matIdx = ordersDB[oIdx].materials.findIndex(m => m.materialId === req.materialId || m.description === req.suggestedDescription);
           if (matIdx !== -1) {
              ordersDB[oIdx].materials[matIdx].availability = "Reservado";
           }
           // Optionally move OS status to Material liberado if all are available
           ordersDB[oIdx].status = "Material liberado";
           storageService.set("gsi_work_orders", ordersDB);
        }
        
        loadData();
      }
    }
  };

  const pendingRequests = requests.filter(r => r.status === "Aguardando análise");
  const unregRequests = pendingRequests.filter(r => r.isUnregistered);
  const registeredRequests = pendingRequests.filter(r => !r.isUnregistered);

  const renderRequest = (req: StockRequest) => (
    <div key={req.id} className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-800 text-base">
              {req.isUnregistered ? req.suggestedDescription : "Material ID: " + req.materialId}
            </h3>
            {req.isUnregistered && <Badge variant="default" className="bg-purple-100 text-purple-700">Não cadastrado</Badge>}
            <Badge variant="default" className="bg-slate-100 text-slate-700">{req.priority}</Badge>
          </div>
          <p className="text-sm text-brand-600 font-medium">
            <Link to={`/ordens/${req.workOrderId}`} className="hover:underline">{getOrderName(req.workOrderId)}</Link>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1">Qtd Solicitada</p>
          <p className="font-bold text-lg text-slate-800">{req.quantity} {req.estimatedUnit || ""}</p>
        </div>
      </div>
      
      {req.justification && (
        <div className="bg-slate-50 p-2 rounded text-sm text-slate-600 mb-3 border border-slate-100">
          <span className="font-medium">Justificativa: </span>{req.justification}
        </div>
      )}
      
      <div className="flex justify-between items-center text-xs text-slate-500">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Solicitado em: {new Date(req.createdAt).toLocaleDateString()}</span>
          <span>Por: {getUserName(req.requesterId)}</span>
        </div>
        <div className="flex gap-2">
          {req.isUnregistered ? (
             <Button size="sm" variant="secondary" className="text-xs py-1 h-7">Cadastrar/Associar</Button>
          ) : (
             <Button size="sm" variant="secondary" onClick={() => handleRegistrarEntrada(req)} className="text-xs py-1 h-7">Registrar Entrada</Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/estoque">
          <Button variant="ghost" className="p-2 h-9 w-9"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Fila de Solicitações</h1>
          <p className="text-sm text-slate-500">Gestão de materiais pendentes ou não cadastrados.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-purple-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
                Não Cadastrados ({unregRequests.length})
              </h2>
            </div>
            <div className="space-y-3">
              {unregRequests.length > 0 ? (
                unregRequests.map(renderRequest)
              ) : (
                <p className="text-sm text-slate-500 text-center py-6">Nenhuma solicitação pendente.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-orange-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <Clock className="w-4 h-4" />
                </div>
                Saldo Insuficiente ({registeredRequests.length})
              </h2>
            </div>
            <div className="space-y-3">
              {registeredRequests.length > 0 ? (
                registeredRequests.map(renderRequest)
              ) : (
                <p className="text-sm text-slate-500 text-center py-6">Nenhum material pendente de reposição.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
