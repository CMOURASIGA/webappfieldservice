const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');

const newTypes = `
export type ScheduleStatus = "Não programada" | "Programação sugerida" | "Programada" | "Confirmada pelo técnico" | "Reprogramação necessária" | "Cancelada" | "Concluída";

export interface TechnicianWorkSchedule {
  id: string;
  technicianId: string;
  weekday: number; // 0-6 (Sun-Sat)
  startTime: string;
  breakStart?: string;
  breakEnd?: string;
  endTime: string;
  capacityMinutes: number;
  active: boolean;
}

export type UnavailabilityType = "Férias" | "Afastamento" | "Folga" | "Treinamento" | "Reunião" | "Serviço externo" | "Bloqueio administrativo" | "Outro";

export interface TechnicianUnavailability {
  id: string;
  technicianId: string;
  type: UnavailabilityType;
  startAt: string;
  endAt: string;
  allDay: boolean;
  recurrenceRule?: string;
  reason?: string;
  createdBy: string;
  createdAt: string;
}
`;

content += newTypes;

// Update WorkOrder
content = content.replace(
  /export interface WorkOrder \{/,
  `export interface WorkOrder {
  plannedStart?: string;
  plannedEnd?: string;
  estimatedDurationMinutes?: number;
  additionalTechnicianIds?: string[];
  scheduleStatus?: ScheduleStatus;
  isProvisional?: boolean;
  scheduleNotes?: string;`
);

fs.writeFileSync('src/types/index.ts', content);
