import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { storageService } from "../services/storageService";
import { WorkOrder, Unit, Location, Category, User, Asset, Provider } from "../types";

export const ImprimirOrdem = () => {
  const { id } = useParams();
  
  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    const orders = storageService.get("gsi_work_orders");
    const found = orders.find(o => o.id === id);
    if (found) setOrder(found);

    setUnits(storageService.get("gsi_units"));
    setLocations(storageService.get("gsi_locations"));
    setCategories(storageService.get("gsi_categories"));
    setUsers(storageService.get("gsi_users"));
    setAssets(storageService.get("gsi_assets"));
    setProviders(storageService.get("gsi_providers"));

    // Auto trigger print after a short delay to allow rendering
    setTimeout(() => {
      window.print();
    }, 500);
  }, [id]);

  if (!order) return <div className="p-8">Ordem de Serviço não encontrada.</div>;

  const unit = units.find(u => u.id === order.unitId);
  const location = locations.find(l => l.id === order.locationId);
  const category = categories.find(c => c.id === order.categoryId);
  const user = users.find(u => u.id === order.responsibleId);
  const asset = assets.find(a => a.id === order.assetId);

  return (
    <div className="bg-white text-black p-8 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto border-2 border-black p-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider">Ordem de Serviço</h1>
            <p className="text-sm font-medium mt-1">GSI / CNC</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">{order.number}</h2>
            <p className="text-sm">Data: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="border border-black p-2">
            <span className="font-bold">Unidade:</span> {unit?.name || "N/A"}
          </div>
          <div className="border border-black p-2">
            <span className="font-bold">Local:</span> {location?.name || "N/A"}
          </div>
          <div className="border border-black p-2">
            <span className="font-bold">Categoria:</span> {category?.name || "N/A"}
          </div>
          <div className="border border-black p-2">
            <span className="font-bold">Prioridade:</span> {order.priority}
          </div>
          <div className="border border-black p-2">
            <span className="font-bold">Responsável:</span> {user?.name || "N/A"}
          </div>
          <div className="border border-black p-2">
            <span className="font-bold">Status:</span> {order.status}
          </div>
        </div>

        {/* Ativo */}
        {asset && (
          <div className="border border-black p-3 mb-6">
            <h3 className="font-bold border-b border-black pb-1 mb-2">Dados do Ativo</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div><span className="font-semibold">Código:</span> {asset.code}</div>
              <div className="col-span-2"><span className="font-semibold">Nome:</span> {asset.name}</div>
            </div>
          </div>
        )}

        {/* Descrição */}
        <div className="border border-black p-3 mb-6">
          <h3 className="font-bold border-b border-black pb-1 mb-2">Descrição Técnica</h3>
          <p className="text-sm whitespace-pre-wrap">{order.technicalDescription}</p>
        </div>

        {/* Materiais */}
        <div className="border border-black p-0 mb-6">
          <h3 className="font-bold border-b border-black p-2 bg-gray-100">Materiais Necessários / Peças</h3>
          {order.materials && order.materials.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-black">
                  <th className="p-2 border-r border-black">Descrição</th>
                  <th className="p-2 border-r border-black">Tipo</th>
                  <th className="p-2 border-r border-black text-center">Quant.</th>
                </tr>
              </thead>
              <tbody>
                {order.materials.map((m, i) => (
                  <tr key={i} className="border-b border-black last:border-b-0">
                    <td className="p-2 border-r border-black">{m.description}</td>
                    <td className="p-2 border-r border-black">{m.type || "-"}</td>
                    <td className="p-2 border-r border-black text-center">{m.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm p-3">Nenhum material listado.</p>
          )}
        </div>

        {/* Assinaturas */}
        <div className="mt-16 grid grid-cols-2 gap-8 text-center text-sm pt-8">
          <div>
            <div className="border-t border-black pt-2 mx-8">
              Assinatura do Técnico/Responsável
            </div>
          </div>
          <div>
            <div className="border-t border-black pt-2 mx-8">
              Assinatura do Solicitante/Validador
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};