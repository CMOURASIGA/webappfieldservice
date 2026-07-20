const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');

content = content.replace(/export type WorkOrderStatus = "Planejada" \| "Atribuída" \| "Em execução" \| "Pausada" \| "Aguardando terceiro" \| "Em validação" \| "Concluída" \| "Cancelada" \| "Reaberta";/,
'export type WorkOrderStatus = "Nova" | "Em planejamento" | "Planejada" | "Atribuída" | "Aguardando estoque" | "Aguardando material" | "Material liberado" | "Programada" | "Em execução" | "Pausada" | "Aguardando terceiro" | "Em validação" | "Concluída" | "Cancelada" | "Reaberta";');

fs.writeFileSync('src/types/index.ts', content);
