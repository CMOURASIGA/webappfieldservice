const fs = require('fs');
let content = fs.readFileSync('src/pages/VisaoGeral.tsx', 'utf8');

// Replace mock with actual data
content = content.replace(
  'const materials = (storageService.get("gsi_stock_materials") as any[]) || [];',
  'const materials = (storageService.get("gsi_stock_materials") as any[]) || [];\n    const stockRequests = (storageService.get("gsi_stock_requests") as any[]) || [];'
);

content = content.replace(
  'solicitacoesCompra: 0, // Mock for now',
  'solicitacoesCompra: stockRequests.filter((r: any) => r.status === "Pendente").length,'
);

fs.writeFileSync('src/pages/VisaoGeral.tsx', content);
