const fs = require('fs');
let content = fs.readFileSync('src/services/storageService.ts', 'utf8');

// Update version and seed() logic to force a reseed
content = content.replace(/const VERSION = "1.0.0";/, 'const VERSION = "1.1.0";');

const newSeedLogic = `
  seed() {
    const versionData = localStorage.getItem("gsi_data_version");
    if (!versionData) {
      this.restoreDefaults();
    } else {
      try {
        const v = JSON.parse(versionData);
        if (v.version !== VERSION) {
          this.restoreDefaults();
        }
      } catch {
        this.restoreDefaults();
      }
    }
  },
`;

content = content.replace(/seed\(\) \{[\s\S]*?restoreDefaults\(\);\n    \}\n  \},/, newSeedLogic);

// Now update the restoreDefaults body
const newRestoreData = `
    const requests: Request[] = [
      {
        id: "req-1",
        protocol: "DEM-2026-0001",
        solicitanteId: "usr-1",
        unitId: "u-df",
        locationId: "loc-1",
        categoryId: "cat-1",
        title: "Ar condicionado pingando",
        description: "O aparelho da recepção está pingando água no chão.",
        suggestedPriority: "Média",
        status: "Convertida em ordem",
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      }
    ];
    this.set("gsi_requests", requests);

    const materials = [
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
    ];
    this.set("gsi_stock_materials", materials as any);

    const stockRequests = [
      {
        id: "sreq-1",
        workOrderId: "os-2",
        materialId: "mat-3",
        isUnregistered: false,
        quantity: 4,
        priority: "Alta",
        requesterId: "usr-4",
        assetId: "ast-1",
        locationId: "loc-2",
        status: "Aguardando análise",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "sreq-2",
        workOrderId: "os-3",
        isUnregistered: true,
        suggestedDescription: "Válvula Hydra Max 1 1/2",
        quantity: 1,
        estimatedUnit: "UN",
        justification: "Peça específica para reparo do banheiro da diretoria. Não há substituto no estoque atual.",
        priority: "Urgente",
        requesterId: "usr-4",
        locationId: "loc-1",
        status: "Aguardando análise",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    this.set("gsi_stock_requests", stockRequests as any);

    const orders: WorkOrder[] = [
      {
        id: "os-1",
        number: "OS-2026-0001",
        requestId: "req-1",
        unitId: "u-df",
        locationId: "loc-1",
        type: "Corretiva",
        categoryId: "cat-2",
        priority: "Média",
        technicalDescription: "Substituição de lâmpadas queimadas na recepção.",
        status: "Material liberado",
        responsibleId: "usr-4",
        checklist: [],
        materials: [
          {
            id: "omat-1",
            materialId: "mat-1",
            description: "Lâmpada LED 40W",
            type: "UN",
            quantity: 2,
            classification: "Obrigatório",
            availability: "Reservado",
            isUnregistered: false,
          }
        ] as any,
        observations: "Material já separado no estoque.",
        attachments: [],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "os-2",
        number: "OS-2026-0002",
        unitId: "u-df",
        locationId: "loc-2",
        assetId: "ast-1",
        type: "Preventiva",
        categoryId: "cat-1",
        priority: "Alta",
        technicalDescription: "Troca do filtro da condensadora.",
        status: "Aguardando material",
        responsibleId: "usr-4",
        checklist: [],
        materials: [
          {
            id: "omat-2",
            materialId: "mat-3",
            description: "Filtro Ar Condicionado G4",
            type: "M2",
            quantity: 4,
            classification: "Obrigatório",
            availability: "Indisponível",
            isUnregistered: false,
          }
        ] as any,
        observations: "",
        attachments: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "os-3",
        number: "OS-2026-0003",
        unitId: "u-df",
        locationId: "loc-1",
        type: "Corretiva",
        categoryId: "cat-3",
        priority: "Urgente",
        technicalDescription: "Vazamento na válvula do banheiro.",
        status: "Aguardando estoque",
        responsibleId: "usr-4",
        checklist: [],
        materials: [
          {
            id: "omat-3",
            description: "Válvula Hydra Max 1 1/2",
            quantity: 1,
            classification: "Obrigatório",
            availability: "Aguardando validação",
            isUnregistered: true,
            justification: "Peça específica para reparo do banheiro da diretoria. Não há substituto no estoque atual."
          }
        ] as any,
        observations: "",
        attachments: [],
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      }
    ];
    this.set("gsi_work_orders", orders);
`;

content = content.replace(/const requests: Request\[\] = \[[\s\S]*?this\.set\("gsi_work_orders", orders\);/, newRestoreData);

fs.writeFileSync('src/services/storageService.ts', content);
