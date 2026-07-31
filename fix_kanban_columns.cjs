const fs = require('fs');
let content = fs.readFileSync('src/pages/Ordens.tsx', 'utf8');

const newColumns = `
  const KANBAN_COLUMNS: WorkOrderStatus[] = [
    "Planejada", // Consideraremos Nova/Em Planejamento aqui
    "Aguardando estoque",
    "Aguardando material",
    "Material liberado",
    "Em execução",
    "Pausada",
    "Em validação",
    "Concluída"
  ];
`;

content = content.replace(/const KANBAN_COLUMNS: WorkOrderStatus\[\] = \["Planejada", "Em execução", "Pausada", "Em validação", "Concluída"\];/, newColumns);

// Fix colOrders filtering to include the new columns properly
const newColOrders = `
            const colOrders = orders.filter(o => {
              if (col === "Planejada") return ["Nova", "Em planejamento", "Planejada", "Atribuída", "Programada"].includes(o.status);
              if (col === "Pausada") return ["Pausada", "Aguardando terceiro"].includes(o.status);
              if (col === "Concluída") return ["Concluída", "Cancelada"].includes(o.status);
              return o.status === col;
            });
`;

content = content.replace(/const colOrders = orders\.filter\(o => o\.status === col \|\| \(col === "Planejada" && o\.status === "Atribuída"\) \|\| \(col === "Pausada" && o\.status === "Aguardando terceiro"\)\);/, newColOrders.trim());

// Also, when dropping into "Planejada", default to "Planejada"
// Wait, handleDrop just uses the target status.

fs.writeFileSync('src/pages/Ordens.tsx', content);
