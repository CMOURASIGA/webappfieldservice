const fs = require('fs');
let content = fs.readFileSync('src/services/storageService.ts', 'utf8');

content = content.replace(/gsi_audit_log: AuditLog\[\];\n\}/, 
`gsi_audit_log: AuditLog[];
  gsi_stock_materials: any[];
  gsi_stock_movements: any[];
  gsi_stock_requests: any[];
}`);

content = content.replace(/case "gsi_audit_log":\n\s+return \[\] as any;/, 
`case "gsi_audit_log":
        return [] as any;
      case "gsi_stock_materials":
        return [] as any;
      case "gsi_stock_movements":
        return [] as any;
      case "gsi_stock_requests":
        return [] as any;`);

fs.writeFileSync('src/services/storageService.ts', content);
