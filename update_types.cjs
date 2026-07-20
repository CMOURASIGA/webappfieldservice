const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');

// Replace old Material
content = content.replace(/export interface Material \{\n  id: string;\n  description: string;\n  type\?: string;\n  unitPrice\?: number;\n  quantity: number;\n  total\?: number;\n\}/, 
`export interface OSMaterial {
  id: string;
  materialId?: string; // Se preenchido, é um material cadastrado no estoque
  description: string; // Nome ou descrição sugerida
  type?: string;
  unitPrice?: number;
  quantity: number;
  total?: number;
  
  // Novos campos de integração com estoque
  classification?: "Obrigatório" | "Recomendado" | "Contingencial" | "Terceiro" | "Não estocável" | "Eventual";
  availability?: "Disponível" | "Parcialmente disponível" | "Indisponível" | "Aguardando validação" | "Reservado" | "Liberado" | "Retirado" | "Consumido" | "Cancelado";
  isUnregistered?: boolean;
  justification?: string;
  quantityUsed?: number;
  quantityReturned?: number;
  quantityLost?: number;
}`);

content = content.replace(/materials\?: Material\[\];/, 'materials?: OSMaterial[];\n  supplyStatus?: SupplyStatus;');

const newTypes = `
export type SupplyStatus = "Não informado" | "Em planejamento" | "Aguardando análise" | "Parcialmente disponível" | "Indisponível" | "Reservado" | "Liberado" | "Retirado" | "Finalizado";
export type StockMaterialStatus = "Normal" | "Atenção" | "Crítico" | "Sem saldo" | "Inativo";

export interface StockMaterial {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  unitId: string;
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
}

export interface StockMovement {
  id: string;
  type: "Entrada" | "Saída" | "Reserva" | "Liberação" | "Devolução" | "Descarte" | "Ajuste";
  materialId: string;
  quantity: number;
  workOrderId?: string;
  assetId?: string;
  locationId?: string;
  unitId: string;
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
  workOrderId: string;
  materialId?: string; // Se for solicitação de saldo insuficiente
  suggestedDescription?: string; // Se for não cadastrado
  isUnregistered: boolean;
  quantity: number;
  estimatedUnit?: string;
  justification?: string;
  priority: Priority;
  requesterId: string;
  assetId?: string;
  locationId?: string;
  neededDate?: string;
  status: "Aguardando análise" | "Associado a existente" | "Aprovado para novo cadastro" | "Aguardando recebimento" | "Recebido" | "Rejeitado" | "Cancelado";
  resolutionMaterialId?: string; // Material final associado
  createdAt: string;
  updatedAt: string;
}
`;

content += newTypes;
fs.writeFileSync('src/types/index.ts', content);
