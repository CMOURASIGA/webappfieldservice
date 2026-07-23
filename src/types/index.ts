export type Role = "Solicitante" | "Operador GSI" | "Gestor GSI" | "Executor/Técnico" | "Executor/Técnico" | "Administrador";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  unitId?: string;
  active: boolean;
}

export interface Unit {
  id: string;
  name: string;
  sigla: string;
  city: string;
  active: boolean;
}

export interface Location {
  id: string;
  unitId: string;
  sector?: string;
  type: string;
  name: string;
  code: string;
  description?: string;
  area?: string;
  floor?: string;
  environment?: string;
  active: boolean;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  category: string;
  unitId: string;
  sector?: string;
  locationId: string;
  manufacturer?: string;
  model?: string;
  patrimonyNumber?: string;
  criticality: "Baixa" | "Média" | "Alta";
  status: "Ativo" | "Inativo" | "Em manutenção";
  observations?: string;
  active: boolean;
}

export type RequestStatus = "Rascunho" | "Aberta" | "Em triagem" | "Aguardando informação" | "Aguardando informação" | "Aprovada" | "Rejeitada" | "Convertida em ordem";
export type Priority = "Baixa" | "Média" | "Média" | "Alta" | "Urgente";

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  description?: string;
  dataUrl?: string;
}

export interface Request {
  id: string;
  protocol: string;
  solicitanteId: string;
  assetId?: string;
  unitId: string;
  sector?: string;
  locationId: string;
  categoryId: string;
  title: string;
  description: string;
  suggestedPriority: Priority;
  status: RequestStatus;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  resolution?: string;
  active: boolean;
}

export type WorkOrderStatus = "Nova" | "Em planejamento" | "Planejada" | "Atribuída" | "Atribuída" | "Aguardando estoque" | "Aguardando material" | "Material liberado" | "Programada" | "Em execução" | "Em execução" | "Pausada" | "Aguardando terceiro" | "Em validação" | "Em validação" | "Concluída" | "Concluída" | "Cancelada" | "Reaberta";

export interface OSMaterial {
  id: string;
  materialId?: string; // Se preenchido, é um material cadastrado no estoque
  description: string; // Nome ou descrição sugerida
  type?: string;
  unitPrice?: number;
  quantity: number;
  previousBalance?: number;
  newBalance?: number;
  total?: number;
  
  // Novos campos de integração com estoque
  classification?: "Obrigatório" | "Obrigatório" | "Recomendado" | "Contingencial" | "Terceiro" | "Não estocável" | "Não estocável" | "Eventual";
  availability?: "Disponível" | "Disponível" | "Parcialmente disponível" | "Parcialmente disponível" | "Indisponível" | "Indisponível" | "Aguardando validação" | "Aguardando validação" | "Reservado" | "Liberado" | "Retirado" | "Consumido" | "Cancelado";
  isUnregistered?: boolean;
  justification?: string;
  quantityUsed?: number;
  quantityReturned?: number;
  quantityLost?: number;
}

export interface WorkOrder {
  plannedStart?: string;
  plannedEnd?: string;
  estimatedDurationMinutes?: number;
  additionalTechnicianIds?: string[];
  scheduleStatus?: ScheduleStatus;
  isProvisional?: boolean;
  scheduleNotes?: string;
  id: string;
  number: string;
  requestId?: string;
  preventivePlanId?: string;
  unitId: string;
  sector?: string;
  locationId: string;
  assetId?: string;
  type: string;
  categoryId: string;
  priority: Priority;
  responsibleId?: string;
  providerId?: string;
  technicalDescription: string;
  plannedDate?: string;
  deadline?: string;
  status: WorkOrderStatus;
  checklist: ChecklistItem[];
  materials?: OSMaterial[];
  supplyStatus?: SupplyStatus;
  observations: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  resolution?: string;
  active: boolean;
}

export interface ChecklistItem {
  id: string;
  description: string;
  required: boolean;
  result?: "Conforme" | "Não conforme" | "Não conforme" | "Não se aplica" | "Não se aplica" | null;
  observations?: string;
  evidence?: string;
  correctiveRequestId?: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  active: boolean;
  items: Omit<ChecklistItem, "result" | "observations" | "evidence">[];
}

export interface PreventivePlan {
  id: string;
  code: string;
  unitId: string;
  sector?: string;
  locationId?: string;
  assetId?: string;
  type: string;
  categoryId: string;
  description: string;
  periodicity: string;
  lastExecution?: string;
  startDate?: string;
  nextExecution: string;
  responsibleId?: string;
  providerId?: string;
  templateId?: string;
  checklist: ChecklistItem[];
  status: "Ativo" | "Inativo";
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  resolution?: string;
  active: boolean;
}

export type DocumentStatus = "Vigente" | "Atenção" | "Atenção" | "Crítico" | "Crítico" | "Vencido" | "Sem validade definida";

export interface DocumentVersion {
  id: string;
  version: string;
  date: string;
  observations: string;
  userId?: string;
  attachmentId?: string;
}

export interface Document {
  id: string;
  type: string;
  title: string;
  unitId: string;
  sector?: string;
  locationId?: string;
  assetId?: string;
  issuer: string;
  number: string;
  issueDate?: string;
  expirationDate?: string;
  responsibleId?: string;
  observations?: string;
  status: DocumentStatus;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  resolution?: string;
  active: boolean;
  periodicity?: string;
  regulatoryBody?: string;
  requiresART?: boolean;
  versions?: DocumentVersion[];
  alertDaysAttention?: number;
  alertDaysCritical?: number;
}

export interface Provider {
  type?: "Interno" | "Externo";
  id: string;
  name: string;
  document?: string;
  contactName: string;
  phone: string;
  email: string;
  specialty: string;
  unitId?: string;
  status: "Ativo" | "Inativo";
  observations?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  resolution?: string;
  active: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityId?: string;
  entityType?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
}

export interface Category {
  id: string;
  name: string;
  type: "Serviço" | "Documento" | "Preventiva" | "Demanda";
  active: boolean;
}

export type SupplyStatus = "Não informado" | "Não informado" | "Em planejamento" | "Aguardando análise" | "Aguardando análise" | "Parcialmente disponível" | "Parcialmente disponível" | "Indisponível" | "Indisponível" | "Reservado" | "Liberado" | "Retirado" | "Finalizado";
export type StockMaterialStatus = "Normal" | "Atenção" | "Atenção" | "Crítico" | "Crítico" | "Sem saldo" | "Inativo";

export interface StockMaterial {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  unitId: string;
  sector?: string;
  locationId?: string;
  physicalBalance: number;
  reservedBalance: number;
  availableBalance: number;
  minStock: number;
  idealStock?: number;
  status: StockMaterialStatus;
  manufacturer?: string;
  model?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  resolution?: string;
}

export interface StockMovement {
  id: string;
  type: "Entrada" | "Saída" | "Saída" | "Reserva" | "Liberação" | "Liberação" | "Devolução" | "Devolução" | "Descarte" | "Ajuste";
  materialId: string;
  quantity: number;
  previousBalance?: number;
  newBalance?: number;
  workOrderId?: string;
  assetId?: string;
  locationId?: string;
  unitId: string;
  sector?: string;
  userId: string; // Quem registrou
  technicianId?: string; // Quem retirou/devolveu
  providerId?: string;
  invoice?: string;
  orderNumber?: string;
  observations?: string;
  date: string;
}

export interface StockRequest {
  id: string;
  protocol?: string;
  workOrderId?: string;
  materialId?: string; // Se for solicitação de saldo insuficiente
  suggestedDescription?: string; // Se for não cadastrado
  isUnregistered: boolean;
  quantity: number;
  previousBalance?: number;
  newBalance?: number;
  estimatedUnit?: string;
  justification?: string;
  priority: Priority;
  requesterId: string;
  unitId?: string;
  sector?: string;
  assetId?: string;
  locationId?: string;
  neededDate?: string;
  status: "Aguardando análise" | "Aguardando análise" | "Associado a existente" | "Aprovado para novo cadastro" | "Aguardando recebimento" | "Recebido" | "Rejeitado" | "Cancelado";
  resolutionMaterialId?: string; // Material final associado
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  resolution?: string;
}

export type ScheduleStatus = "Não programada" | "Não programada" | "Programação sugerida" | "Programação sugerida" | "Programada" | "Confirmada pelo técnico" | "Confirmada pelo técnico" | "Reprogramação necessária" | "Reprogramação necessária" | "Cancelada" | "Concluída" | "Concluída";

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

export type UnavailabilityType = "Férias" | "Férias" | "Afastamento" | "Folga" | "Treinamento" | "Reunião" | "Reunião" | "Serviço externo" | "Serviço externo" | "Bloqueio administrativo" | "Outro";

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



