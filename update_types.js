const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');

const newInterface = `
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
  
  // New Regulatory Fields
  periodicity?: string; // Anual, Semestral, etc
  regulatoryBody?: string;
  requiresART?: boolean;
  versions?: DocumentVersion[];
  alertDaysAttention?: number; // dias antes para entrar em Atenção
  alertDaysCritical?: number; // dias antes para entrar em Crítico
}
`;

content = content.replace(/export interface Document \{[\s\S]*?active: boolean;\n\}/, newInterface.trim());
fs.writeFileSync('src/types/index.ts', content);
