const fs = require('fs');
let content = fs.readFileSync('src/pages/VisaoGeral.tsx', 'utf8');

// Add import
if (!content.includes('getDocumentStatus')) {
  content = content.replace(
    'import { isPast, parseISO, startOfDay, endOfDay, addDays } from "date-fns";',
    'import { isPast, parseISO, startOfDay, endOfDay, addDays } from "date-fns";\nimport { getDocumentStatus } from "../utils/documentStatus";'
  );
}

// Fix Documentos
content = content.replace(
  'const docVencidos = docs.filter((d: any) => d.status === "Vencido" || (d.expirationDate && isPast(parseISO(d.expirationDate)))).length;',
  'const docVencidos = docs.filter((d: any) => getDocumentStatus(d.expirationDate, d.status) === "Vencido").length;'
);

content = content.replace(
  'const docCriticos = docs.filter((d: any) => d.status === "Crítico").length;',
  'const docCriticos = docs.filter((d: any) => getDocumentStatus(d.expirationDate, d.status) === "Crítico").length;'
);

// Fix Compras pendentes
// It says: "O KPI deve contar solicitações pendentes, não a soma de unidades."
// Do we have stock requests in storage? Yes, "gsi_stock_requests" maybe? Let's check if there is such table.
fs.writeFileSync('src/pages/VisaoGeral.tsx', content);
