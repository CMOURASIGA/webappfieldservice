import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { OperationalPageHeader } from "../../components/ui/OperationalPage";
import { TabbedFormCard } from "../../components/ui/TabbedFormCard";
import { useAuth } from "../../contexts/AuthContext";
import { storageService } from "../../services/storageService";
import { StockRequest } from "../../types";
import { getAvailableStock } from "../../utils/stock";

export const NovaSolicitacaoEstoque = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const initialMaterialId = searchParams.get("materialId") || "";

  const [unregistered, setUnregistered] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    materialId: initialMaterialId,
    suggestedDescription: "",
    quantity: "",
    estimatedUnit: "",
    priority: "M\u00E9dia",
    neededDate: "",
    unitId: "",
    sector: "",
    locationId: "",
    assetId: "",
    workOrderId: "",
    justification: "",
  });

  const materials = storageService.get("gsi_stock_materials") || [];
  const units = storageService.get("gsi_units") || [];
  const locations = storageService.get("gsi_locations") || [];
  const assets = storageService.get("gsi_assets") || [];
  const orders = storageService.get("gsi_work_orders") || [];
  const selected = materials.find((item: any) => item.id === data.materialId);

  useEffect(() => {
    if (selected && !unregistered) {
      setData((current) => ({
        ...current,
        unitId: selected.unitId || "",
        locationId: selected.locationId || "",
        estimatedUnit: selected.unit || "",
      }));
    }
  }, [selected, unregistered]);

  const setField = (field: keyof typeof data, value: string) =>
    setData((current) => ({ ...current, [field]: value }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const quantity = Number(data.quantity);

    if (!quantity || quantity <= 0 || !data.unitId) {
      setError("Informe quantidade e unidade organizacional.");
      return;
    }

    if (!unregistered && !data.materialId) {
      setError("Selecione um material cadastrado ou marque a solicitacao como nao cadastrada.");
      return;
    }

    if (unregistered && !data.suggestedDescription.trim()) {
      setError("Informe a descricao do material nao cadastrado.");
      return;
    }

    const material = selected;
    const request: StockRequest = {
      id: `sreq-${Date.now()}`,
      protocol: `REQ-${Math.floor(Math.random() * 100000)}`,
      isUnregistered: unregistered,
      materialId: unregistered ? undefined : data.materialId,
      suggestedDescription: unregistered ? data.suggestedDescription.trim() : undefined,
      quantity,
      previousBalance: material?.physicalBalance,
      newBalance: material ? Number(material.physicalBalance || 0) + quantity : undefined,
      estimatedUnit: data.estimatedUnit || material?.unit,
      priority: data.priority as any,
      neededDate: data.neededDate || undefined,
      unitId: data.unitId,
      sector: data.sector || undefined,
      locationId: data.locationId || undefined,
      assetId: data.assetId || undefined,
      workOrderId: data.workOrderId || undefined,
      justification: data.justification || undefined,
      requesterId: currentUser?.id || "usr-1",
      status: "Aguardando an\u00E1lise",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageService.set("gsi_stock_requests", [...(storageService.get("gsi_stock_requests") || []), request]);
    storageService.logAudit(currentUser?.id || "system", "Criou solicitacao de estoque", request.id, "StockRequest", undefined, request);
    navigate("/estoque/fila", { state: { message: `Solicitacao ${request.protocol} criada com sucesso.` } });
  };

  const formSectionTitleClass = "text-base font-semibold text-slate-900";
  const formSectionDescriptionClass = "mt-1 text-sm text-slate-600";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <OperationalPageHeader
        title="Solicitar Material"
        description="Registre uma necessidade de material, vinculando a OS e ao ativo quando aplicavel."
        backTo="/estoque"
      />

      <form onSubmit={submit}>
        <TabbedFormCard
          submitLabel="Salvar"
          tabs={[
            {
              value: "material",
              label: "Material",
              content: (
                <div className="space-y-7 p-6">
                  <div>
                    <h2 className={formSectionTitleClass}>Definicao do item</h2>
                    <p className={formSectionDescriptionClass}>Informe se a solicitacao e para um item ja cadastrado ou para um material ainda nao registrado.</p>
                  </div>

                  <label className="flex w-fit items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                    <input type="checkbox" checked={unregistered} onChange={(event) => setUnregistered(event.target.checked)} />
                    Material nao cadastrado
                  </label>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {unregistered ? (
                      <Input
                        label="Descricao sugerida"
                        required
                        value={data.suggestedDescription}
                        onChange={(event) => setField("suggestedDescription", event.target.value)}
                        placeholder="Ex.: Motor trifasico 220V"
                      />
                    ) : (
                      <div className="md:col-span-2">
                        <Select
                          label="Material"
                          required
                          value={data.materialId}
                          onChange={(event) => setField("materialId", event.target.value)}
                          options={[{ value: "", label: "Selecione o material" }, ...materials.filter((item: any) => item.active !== false).map((item: any) => ({ value: item.id, label: `${item.code} - ${item.name}` }))]}
                        />
                        {selected && (
                          <p className="mt-2 rounded-md border border-blue-300 bg-blue-50 p-2 text-xs text-blue-950">
                            Saldo disponivel: {getAvailableStock(selected)}
                          </p>
                        )}
                      </div>
                    )}

                    <Input label="Quantidade" required type="number" min="0.01" step="0.01" value={data.quantity} onChange={(event) => setField("quantity", event.target.value)} />
                    <Input label="Unidade de medida" value={data.estimatedUnit} onChange={(event) => setField("estimatedUnit", event.target.value)} placeholder="UN, PC, CX" />
                    <Select label="Prioridade" value={data.priority} onChange={(event) => setField("priority", event.target.value)} options={[["Baixa", "Baixa"], ["M\u00E9dia", "Media"], ["Alta", "Alta"], ["Urgente", "Urgente"]].map(([value, label]) => ({ value, label }))} />
                    <Input label="Data necessaria" type="date" value={data.neededDate} onChange={(event) => setField("neededDate", event.target.value)} />
                  </div>
                </div>
              ),
            },
            {
              value: "vinculos",
              label: "Vinculos",
              content: (
                <div className="space-y-7 p-6">
                  <div>
                    <h2 className={formSectionTitleClass}>Contexto operacional</h2>
                    <p className={formSectionDescriptionClass}>Associe a solicitacao a unidade, local, ativo ou ordem de servico quando necessario.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Select label="Unidade organizacional" required value={data.unitId} onChange={(event) => setField("unitId", event.target.value)} options={[{ value: "", label: "Selecione" }, ...units.map((item: any) => ({ value: item.id, label: item.name }))]} />
                    <Input label="Setor solicitante" value={data.sector} onChange={(event) => setField("sector", event.target.value)} placeholder="Ex.: Manutencao" />
                    <Select label="Local" value={data.locationId} onChange={(event) => setField("locationId", event.target.value)} options={[{ value: "", label: "Nao informado" }, ...locations.map((item: any) => ({ value: item.id, label: item.name }))]} />
                    <Select label="Ativo vinculado" value={data.assetId} onChange={(event) => setField("assetId", event.target.value)} options={[{ value: "", label: "Nao vinculado" }, ...assets.map((item: any) => ({ value: item.id, label: `${item.code} - ${item.name}` }))]} />
                    <div className="md:col-span-2">
                      <Select label="Ordem de Servico vinculada" value={data.workOrderId} onChange={(event) => setField("workOrderId", event.target.value)} options={[{ value: "", label: "Nao vinculada" }, ...orders.map((item: any) => ({ value: item.id, label: item.number }))]} />
                    </div>
                  </div>
                </div>
              ),
            },
            {
              value: "justificativa",
              label: "Justificativa",
              content: (
                <div className="space-y-7 p-6">
                  <div>
                    <h2 className={formSectionTitleClass}>Motivo da necessidade</h2>
                    <p className={formSectionDescriptionClass}>Explique a razao da solicitacao para facilitar analise, compra e atendimento.</p>
                  </div>

                  <Textarea
                    label="Justificativa da necessidade"
                    value={data.justification}
                    onChange={(event) => setField("justification", event.target.value)}
                    placeholder="Descreva o motivo da solicitacao."
                  />

                  {error && <p className="rounded-md border-2 border-red-400 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
                </div>
              ),
            },
          ]}
        />
      </form>
    </div>
  );
};
