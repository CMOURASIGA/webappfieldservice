export type Role = "Solicitante" | "Operador GSI" | "Gestor GSI" | "Executor/Técnico" | "Administrador";

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
  type: string;
  name: string;
  code: string;
  description?: string;
  active: boolean;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  category: string;
  unitId: string;
  locationId: string;
  manufacturer?: string;
  model?: string;
  patrimonyNumber?: string;
  criticality: "Baixa" | "Média" | "Alta";
  status: "Ativo" | "Inativo" | "Em manutenção";
  observations?: string;
  active: boolean;
}

export type RequestStatus = "Rascunho" | "Aberta" | "Em triagem" | "Aguardando informação" | "Aprovada" | "Rejeitada" | "Convertida em ordem";
export type Priority = "Baixa" | "Média" | "Alta" | "Urgente";

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
  unitId: string;
  locationId: string;
  categoryId: string;
  title: string;
  description: string;
  suggestedPriority: Priority;
  status: RequestStatus;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export type WorkOrderStatus = "Planejada" | "Atribuída" | "Em execução" | "Pausada" | "Aguardando terceiro" | "Em validação" | "Concluída" | "Cancelada" | "Reaberta";

export interface Material {
  id: string;
  description: string;
  type?: string;
  unitPrice?: number;
  quantity: number;
  total?: number;
}

export interface WorkOrder {
  id: string;
  number: string;
  requestId?: string;
  unitId: string;
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
  materials?: Material[];
  observations: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface ChecklistItem {
  id: string;
  description: string;
  required: boolean;
  result?: "Conforme" | "Não conforme" | "Não se aplica" | null;
  observations?: string;
  evidence?: string;
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
  locationId?: string;
  assetId?: string;
  type: string;
  categoryId: string;
  description: string;
  periodicity: string;
  lastExecution?: string;
  nextExecution: string;
  responsibleId?: string;
  providerId?: string;
  templateId?: string;
  checklist: ChecklistItem[];
  status: "Ativo" | "Inativo";
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export type DocumentStatus = "Válido" | "A vencer" | "Vencido" | "Sem validade definida";

export interface Document {
  id: string;
  type: string;
  title: string;
  unitId: string;
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
  active: boolean;
}

export interface Provider {
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
  type: "Demanda" | "Serviço" | "Documento" | "Preventiva";
  active: boolean;
}
