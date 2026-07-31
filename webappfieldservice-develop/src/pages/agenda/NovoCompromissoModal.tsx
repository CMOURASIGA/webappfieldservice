import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Checkbox,
} from "@cnc-ti/layout-basic";
import { storageService } from "../../services/storageService";
import { TechnicianUnavailability } from "../../types";

const schema = z.object({
  technicianId: z.string().min(1, "Técnico obrigatório"),
  reason: z.string().min(1, "Motivo obrigatório"),
  startDate: z.string().min(1, "Data de início obrigatória"),
  endDate: z.string().min(1, "Data de término obrigatória"),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.string().optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const NovoCompromissoModal = ({ open, onOpenChange, onSuccess }: Props) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      isRecurring: false,
      recurrencePattern: "weekly",
    }
  });

  const users = storageService.get("gsi_users") || [];
  const isRecurring = watch("isRecurring");

  const onSubmit = (data: any) => {
    const unavailabilities = storageService.get("gsi_technician_unavailabilities") || [];
    
    const newEntry: TechnicianUnavailability = {
      id: "unav-" + Date.now(),
      technicianId: data.technicianId,
      type: "Outro", reason: data.reason,
      startAt: data.startDate,
      endAt: data.endDate,
      allDay: false,
      createdBy: "Sistema",
      createdAt: new Date().toISOString(),
    };

    // A real implementation would generate multiple unavailabilities or store recurrence rules
    if (data.isRecurring) {
      newEntry.reason = `${data.reason} (Recorrente - ${data.recurrencePattern})`;
    }

    storageService.set("gsi_technician_unavailabilities", [...unavailabilities, newEntry]);
    
    reset();
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Compromisso / Indisponibilidade</DialogTitle>
        </DialogHeader>
        
        <form id="compromisso-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Técnico / Equipe *</label>
            <Select onValueChange={(val) => setValue("technicianId", val)}>
              <SelectTrigger><SelectValue placeholder="Selecione o técnico" /></SelectTrigger>
              <SelectContent>
                {users.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Motivo (Treinamento, Férias, Reunião) *</label>
            <Input {...register("reason")} placeholder="Ex: Reunião de Alinhamento" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Início *</label>
              <Input type="datetime-local" {...register("startDate")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Término *</label>
              <Input type="datetime-local" {...register("endDate")} />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input 
              type="checkbox" 
              id="isRecurring" 
              {...register("isRecurring")}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="isRecurring" className="text-sm font-medium">Compromisso Recorrente</label>
          </div>

          {isRecurring && (
            <div className="space-y-2 bg-slate-50 p-4 rounded-md border border-slate-200">
              <label className="text-sm font-medium">Padrão de Recorrência</label>
              <Select onValueChange={(val) => setValue("recurrencePattern", val)} defaultValue="weekly">
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                  <SelectItem value="monthly">Mensalmente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

        </form>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="create" type="submit" form="compromisso-form">Salvar Compromisso</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
