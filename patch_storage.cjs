const fs = require('fs');
let content = fs.readFileSync('src/services/storageService.ts', 'utf8');

content = content.replace(
  /gsi_stock_requests: any\[\];/,
  `gsi_stock_requests: any[];\n  gsi_technician_schedules: any[];\n  gsi_technician_unavailabilities: any[];`
);

content = content.replace(
  /case "gsi_stock_requests":\s*return \[\] as any;/,
  `case "gsi_stock_requests":\n        return [] as any;\n      case "gsi_technician_schedules":\n        return [] as any;\n      case "gsi_technician_unavailabilities":\n        return [] as any;`
);

fs.writeFileSync('src/services/storageService.ts', content);
