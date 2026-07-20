const fs = require('fs');
let content = fs.readFileSync('src/services/storageService.ts', 'utf8');

const defaultMaterials = `
        return [
          {
            id: "mat-1",
            code: "MAT-001",
            name: "Lâmpada LED 40W",
            description: "Lâmpada tubular LED branca",
            category: "Elétrica",
            unit: "UN",
            unitId: "u-df",
            physicalBalance: 50,
            reservedBalance: 10,
            availableBalance: 40,
            minStock: 20,
            idealStock: 100,
            status: "Normal",
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "mat-2",
            code: "MAT-002",
            name: "Parafuso Sextavado M8",
            description: "Parafuso sextavado zincado",
            category: "Ferragem",
            unit: "CX",
            unitId: "u-df",
            physicalBalance: 5,
            reservedBalance: 0,
            availableBalance: 5,
            minStock: 10,
            idealStock: 30,
            status: "Crítico",
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "mat-3",
            code: "MAT-003",
            name: "Filtro Ar Condicionado G4",
            description: "Filtro manta G4",
            category: "Climatização",
            unit: "M2",
            unitId: "u-df",
            physicalBalance: 0,
            reservedBalance: 0,
            availableBalance: 0,
            minStock: 5,
            idealStock: 15,
            status: "Sem saldo",
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ] as any;
`;

content = content.replace(/case "gsi_stock_materials":\n\s+return \[\] as any;/, 
  'case "gsi_stock_materials":' + defaultMaterials);

fs.writeFileSync('src/services/storageService.ts', content);
