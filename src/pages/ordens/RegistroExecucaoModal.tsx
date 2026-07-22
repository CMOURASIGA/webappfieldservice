import React, { useState } from "react";
import {
 useForm } from "react-hook-form";
import {
 zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {

  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  
} from "@cnc-ti/layout-basic";
import {
 storageService } from "../../services/storageService";
import {
 WorkOrder, PreventivePlan } from "../../types";
import {
 useAuth } from "../../contexts/AuthContext";
import {
 format } from "date-fns";

const schema = z.object({
  status: z.enum(["Concluída", "Pausada", "Cancelada", "Aguardando Peças"]),
  executionNotes: z.string().min(1, "Registro de atividades é obrigatório"),
  executedAt: z.string().min(1, "Data de execução é obrigatória"),
  technicianId: z.string().min(1, "Técnico responsável é obrigatório"),
  durationMinutes: z.coerce.number().min(1, "Duração obrigatória"),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  order?: WorkOrder;
  plan?: PreventivePlan;
}

export const RegistroExecucaoModal = ({ open, onOpenChange, onSuccess, order, plan }: Props) => {
  const { currentUser } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "Concluída",
      executedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      technicianId: currentUser?.id,
    }
  });

  const users = storageService.get("gsi_users") || [];
  const status = watch("status");

  // Mock checklist if plan has templateId or order has checklist
  const [checklist, setChecklist] = useState([
    { id: '1', task: 'Verificação visual externa', done: false, required: true },
    { id: '2', task: 'Limpeza dos componentes', done: false, required: true },
    { id: '3', task: 'Teste de funcionamento', done: false, required: true },
  ]);

  const toggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c));
  };

  const onSubmit = (data: any) => {
    if (status === "Concluída") {
      const pendingRequired = checklist.some(c => c.required && !c.done);
      if (pendingRequired) {
        alert("Todos os itens obrigatórios do checklist devem ser concluídos para finalizar.");
        return;
      }
    }

    if (order) {
      const orders = storageService.get("gsi_work_orders") || [];
      const idx = orders.findIndex((o: any) => o.id === order.id);
      if (idx !== -1) {
        orders[idx].status = data.status;
        orders[idx].completedAt = data.status === "Concluída" ? new Date().toISOString() : undefined;
        orders[idx].resolution = data.executionNotes;
        storageService.set("gsi_work_orders", orders);
      }
    }
    
    if (plan) {
      const plans = storageService.get("gsi_preventive_plans") || [];
      const idx = plans.findIndex((p: any) => p.id === plan.id);
      if (idx !== -1) {
        plans[idx].lastExecution = new Date().toISOString();
        storageService.set("gsi_preventive_plans", plans);
      }
    }

    // A real system would also save execution logs and update metrics

    reset();
    onSuccess();
    onOpenChange(false);
  };

  const entityName = order ? `OS ${order.number}` : plan ? `Plano ${plan.code}` : "Atividade";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registro de Execução - {entityName}</DialogTitle>
        </DialogHeader>
        
        <form id="execucao-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data/Hora da Execução *</label>
              <Input type="datetime-local" {...register("executedAt")} />
              {errors.executedAt && <span className="text-xs text-red-500">{errors.executedAt.message as string}</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duração (minutos) *</label>
              <Input type="number" {...register("durationMinutes")} />
              {errors.durationMinutes && <span className="text-xs text-red-500">{errors.durationMinutes.message as string}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Técnico Responsável *</label>
              <Select onValueChange={(val) => setValue("technicianId", val)} defaultValue={currentUser?.id}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {users.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status Final *</label>
              <Select onValueChange={(val) => setValue("status", val)} defaultValue="Concluída">
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Concluída">Concluída</SelectItem>
                  <SelectItem value="Aguardando Peças">Aguardando Peças</SelectItem>
                  <SelectItem value="Pausada">Pausada</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="font-semibold text-sm text-slate-800">Checklist de Execução</h4>
            <div className="space-y-3">
              {checklist.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <input type="checkbox" 
                    id={`check-${item.id}`} 
                    checked={item.done} 
                    onChange={() => toggleChecklist(item.id)} className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" 
                  />
                  <label htmlFor={`check-${item.id}`} className="text-sm cursor-pointer select-none">
                    {item.task} {item.required && <span className="text-red-500">*</span>}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Atividades Realizadas / Observações *</label>
            <Input {...register("executionNotes")} placeholder="Descreva os serviços executados..." />
            {errors.executionNotes && <span className="text-xs text-red-500">{errors.executionNotes.message as string}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Evidências (Fotos/Documentos)</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors">
              <span className="text-sm">Clique para fazer upload ou arraste os arquivos</span>
            </div>
          </div>

        </form>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="create" type="submit" form="execucao-form">Confirmar Execução</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
