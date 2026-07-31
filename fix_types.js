const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');

content = content.replace(/requestId\?: string;/, 'requestId?: string;\n  preventivePlanId?: string;');
content = content.replace(/unitId: string;/, 'assetId?: string;\n  unitId: string;');

content = content.replace(/export type RequestStatus = "Aberta" \| "Em andamento" \| "Concluída" \| "Cancelada";/, 'export type RequestStatus = "Aberta" | "Em andamento" | "Concluída" | "Cancelada" | "Aguardando informações" | "Atendida";');
content = content.replace(/export type DocumentStatus = "Vigente" \| "Atenção" \| "Crítico" \| "Vencido" \| "Sem validade definida";/, 'export type DocumentStatus = "Vigente" | "Atenção" | "Crítico" | "Vencido" | "A vencer" | "Sem validade definida";');

fs.writeFileSync('src/types/index.ts', content);
