const fs = require('fs');
let content = fs.readFileSync('src/services/storageService.ts', 'utf8');

// Update version to force a reload
content = content.replace(/const VERSION = ".*";/, 'const VERSION = "1.3.0";');

// the goal is to replace everything inside `restoreDefaults() {` and `}` with new mock data.
// We can use a regex or just substring.
const restoreStart = content.indexOf('restoreDefaults() {');
const logAuditStart = content.indexOf('logAudit(userId: string');

if (restoreStart === -1 || logAuditStart === -1) {
    console.error("Could not find restoreDefaults or logAudit");
    process.exit(1);
}

const beforeRestore = content.substring(0, restoreStart);
const afterRestore = content.substring(logAuditStart);

const newRestoreBody = `restoreDefaults() {
    localStorage.clear();
    this.set("gsi_data_version", { version: VERSION });

    const units: Unit[] = [
      { id: "u-df", name: "Sede - Brasília", sigla: "DF", city: "Brasília", active: true },
      { id: "u-rj", name: "Regional - Rio de Janeiro", sigla: "RJ", city: "Rio de Janeiro", active: true },
      { id: "u-sp", name: "Escritório - São Paulo", sigla: "SP", city: "São Paulo", active: true },
    ];
    this.set("gsi_units", units);

    const users: User[] = [
      { id: "usr-1", name: "Ana Silva (Solicitante)", email: "ana.silva@cnc.br", role: "Solicitante", unitId: "u-df", active: true },
      { id: "usr-2", name: "Carlos Mendes (Op GSI)", email: "carlos.mendes@cnc.br", role: "Operador GSI", unitId: "u-df", active: true },
      { id: "usr-3", name: "Mariana Costa (Gestor GSI)", email: "mariana.costa@cnc.br", role: "Gestor GSI", active: true },
      { id: "usr-4", name: "João Pereira (Técnico DF)", email: "joao.pereira@cnc.br", role: "Executor/Técnico", unitId: "u-df", active: true },
      { id: "usr-6", name: "Roberto Alves (Técnico RJ)", email: "roberto.alves@cnc.br", role: "Executor/Técnico", unitId: "u-rj", active: true },
      { id: "usr-7", name: "Luciana Lima (Solicitante SP)", email: "luciana.lima@cnc.br", role: "Solicitante", unitId: "u-sp", active: true },
      { id: "usr-5", name: "Admin (Admin)", email: "admin@cnc.br", role: "Administrador", active: true },
    ];
    this.set("gsi_users", users);

    const locations: Location[] = [
      { id: "loc-1", unitId: "u-df", type: "Ambiente", name: "Recepção Principal", code: "DF-REC-01", floor: "Térreo", active: true },
      { id: "loc-2", unitId: "u-df", type: "Ambiente", name: "Sala Técnica Ar", code: "DF-TEC-01", floor: "Cobertura", active: true },
      { id: "loc-4", unitId: "u-df", type: "Ambiente", name: "Sala de Reuniões 1", code: "DF-SAL-01", floor: "1º Andar", active: true },
      { id: "loc-5", unitId: "u-df", type: "Ambiente", name: "Copa 2º Andar", code: "DF-COP-02", floor: "2º Andar", active: true },
      { id: "loc-3", unitId: "u-rj", type: "Ambiente", name: "Auditório Principal", code: "RJ-AUD-01", floor: "Térreo", active: true },
      { id: "loc-6", unitId: "u-rj", type: "Ambiente", name: "Diretoria", code: "RJ-DIR-01", floor: "3º Andar", active: true },
      { id: "loc-7", unitId: "u-sp", type: "Ambiente", name: "Coworking Central", code: "SP-COW-01", floor: "Andar Único", active: true },
    ];
    this.set("gsi_locations", locations);

    const categories: Category[] = [
      { id: "cat-1", name: "Climatização", type: "Demanda", active: true },
      { id: "cat-2", name: "Elétrica", type: "Demanda", active: true },
      { id: "cat-3", name: "Civil", type: "Demanda", active: true },
      { id: "cat-4", name: "Hidráulica", type: "Demanda", active: true },
      { id: "cat-5", name: "Mobiliário", type: "Demanda", active: true },
      { id: "cat-6", name: "Alvará e Licenças", type: "Documento", active: true },
      { id: "cat-7", name: "Laudos Técnicos", type: "Documento", active: true },
    ];
    this.set("gsi_categories", categories);

    const checklistTemplates: ChecklistTemplate[] = [
      {
        id: "chk-1",
        name: "Checklist de Ar-Condicionado (Mensal)",
        categoryId: "cat-1",
        description: "Inspeção preventiva padrão para aparelhos de ar-condicionado e condensadoras.",
        active: true,
        items: [
          { id: "ci-1", description: "Verificar e limpar filtros de ar", required: true },
          { id: "ci-2", description: "Verificar pressão do gás refrigerante", required: true },
          { id: "ci-3", description: "Verificar estado do isolamento térmico", required: false },
          { id: "ci-4", description: "Limpeza da condensadora", required: true },
          { id: "ci-5", description: "Medir corrente elétrica do compressor", required: false },
        ]
      },
      {
        id: "chk-2",
        name: "Checklist de Quadro Elétrico (Semestral)",
        categoryId: "cat-2",
        description: "Reaperto e termografia em quadros elétricos de baixa tensão.",
        active: true,
        items: [
          { id: "ci-6", description: "Inspecionar estado físico dos disjuntores e cabos", required: true },
          { id: "ci-7", description: "Realizar reaperto das conexões (Torque)", required: true },
          { id: "ci-8", description: "Limpeza interna do quadro a seco", required: true },
          { id: "ci-9", description: "Medição de temperatura (Termografia)", required: false },
        ]
      }
    ];
    this.set("gsi_checklist_templates", checklistTemplates);

    const assets: Asset[] = [
      { id: "ast-1", code: "AC-DF-001", name: "Ar Condicionado Central Chiller A", category: "cat-1", unitId: "u-df", locationId: "loc-2", manufacturer: "Carrier", model: "30XW", criticality: "Alta", status: "Ativo", active: true },
      { id: "ast-2", code: "EL-DF-001", name: "Quadro Elétrico Térreo (QGBT)", category: "cat-2", unitId: "u-df", locationId: "loc-1", manufacturer: "Siemens", criticality: "Alta", status: "Ativo", active: true },
      { id: "ast-3", code: "AC-DF-002", name: "Split 18.000 BTUs Reuniões", category: "cat-1", unitId: "u-df", locationId: "loc-4", manufacturer: "LG", model: "Dual Inverter", criticality: "Média", status: "Ativo", active: true },
      { id: "ast-4", code: "HD-DF-001", name: "Bomba D\\'água Recalque B1", category: "cat-4", unitId: "u-df", locationId: "loc-2", manufacturer: "Schneider", criticality: "Alta", status: "Em manutenção", active: true },
      { id: "ast-5", code: "AC-RJ-001", name: "Ar Condicionado Central Auditório", category: "cat-1", unitId: "u-rj", locationId: "loc-3", manufacturer: "Trane", criticality: "Alta", status: "Ativo", active: true },
    ];
    this.set("gsi_assets", assets);

    const requests: Request[] = [
      {
        id: "req-1",
        protocol: "DEM-2026-0001",
        solicitanteId: "usr-1",
        unitId: "u-df",
        locationId: "loc-1",
        categoryId: "cat-1",
        title: "Ar condicionado pingando",
        description: "O aparelho da recepção principal está pingando água no chão próximo ao sofá.",
        suggestedPriority: "Média",
        status: "Convertida em ordem",
        attachments: [],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 170000000).toISOString(),
        active: true
      },
      {
        id: "req-2",
        protocol: "DEM-2026-0002",
        solicitanteId: "usr-1",
        unitId: "u-df",
        locationId: "loc-5",
        categoryId: "cat-4",
        title: "Vazamento pia da copa",
        description: "A torneira da copa do 2º andar não fecha direito e está vazando muita água.",
        suggestedPriority: "Alta",
        status: "Aberta",
        attachments: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "req-3",
        protocol: "DEM-2026-0003",
        solicitanteId: "usr-7",
        unitId: "u-sp",
        locationId: "loc-7",
        categoryId: "cat-2",
        title: "Tomadas sem energia",
        description: "Metade das mesas do coworking estão sem energia nas tomadas. Os computadores estão descarregando.",
        suggestedPriority: "Urgente",
        status: "Em triagem",
        attachments: [],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "req-4",
        protocol: "DEM-2026-0004",
        solicitanteId: "usr-1",
        unitId: "u-df",
        locationId: "loc-4",
        categoryId: "cat-5",
        title: "Cadeira quebrada",
        description: "A cadeira da ponta na sala de reuniões 1 está com a rodinha quebrada e pende para o lado.",
        suggestedPriority: "Baixa",
        status: "Aguardando informação",
        attachments: [],
        createdAt: new Date(Date.now() - 10000000).toISOString(),
        updatedAt: new Date(Date.now() - 2000000).toISOString(),
        active: true
      }
    ];
    this.set("gsi_requests", requests);

    const materials = [
          { id: "mat-1", code: "MAT-001", name: "Lâmpada LED 40W Tubular", description: "Lâmpada tubular LED branca T8 120cm", category: "Elétrica", unit: "UN", unitId: "u-df", physicalBalance: 48, reservedBalance: 2, availableBalance: 46, minStock: 20, idealStock: 100, status: "Normal", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "mat-2", code: "MAT-002", name: "Parafuso Sextavado M8", description: "Parafuso sextavado zincado", category: "Ferragem", unit: "CX", unitId: "u-df", physicalBalance: 5, reservedBalance: 0, availableBalance: 5, minStock: 10, idealStock: 30, status: "Crítico", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "mat-3", code: "MAT-003", name: "Filtro Ar Condicionado G4", description: "Filtro manta G4 para split/fancoil", category: "Climatização", unit: "M2", unitId: "u-df", physicalBalance: 0, reservedBalance: 0, availableBalance: 0, minStock: 5, idealStock: 15, status: "Sem saldo", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "mat-4", code: "MAT-004", name: "Fita Isolante 3M", description: "Fita isolante preta antichama 20m", category: "Elétrica", unit: "RL", unitId: "u-df", physicalBalance: 12, reservedBalance: 0, availableBalance: 12, minStock: 10, idealStock: 25, status: "Atenção", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "mat-5", code: "MAT-005", name: "Torneira Pia Cozinha Bica Móvel", description: "Torneira de bancada cromada bica alta", category: "Hidráulica", unit: "UN", unitId: "u-df", physicalBalance: 2, reservedBalance: 0, availableBalance: 2, minStock: 3, idealStock: 5, status: "Crítico", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "mat-6", code: "MAT-006", name: "Tubo PVC Esgoto 50mm", description: "Tubo PVC esgoto barra 6m", category: "Hidráulica", unit: "BR", unitId: "u-df", physicalBalance: 20, reservedBalance: 0, availableBalance: 20, minStock: 5, idealStock: 20, status: "Normal", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
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
        categoryId: "cat-1",
        priority: "Média",
        technicalDescription: "Desobstruir dreno do split da recepção principal.",
        status: "Em execução",
        responsibleId: "usr-4",
        checklist: [],
        materials: [
          {
            id: "omat-1",
            materialId: "mat-6",
            description: "Tubo PVC Esgoto 50mm",
            type: "BR",
            quantity: 1,
            classification: "Obrigatório",
            availability: "Disponível",
            isUnregistered: false,
          }
        ] as any,
        observations: "Dreno estava obstruído com lodo. Necessário adaptar nova tubulação de caída.",
        attachments: [],
        createdAt: new Date(Date.now() - 170000000).toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "os-2",
        number: "OS-2026-0002",
        unitId: "u-df",
        locationId: "loc-2",
        assetId: "ast-1",
        preventivePlanId: "plan-1",
        type: "Preventiva",
        categoryId: "cat-1",
        priority: "Alta",
        technicalDescription: "Manutenção mensal preventiva do Chiller A.",
        status: "Aguardando material",
        responsibleId: "usr-4",
        checklist: [
          { id: "ci-1", description: "Verificar e limpar filtros de ar", required: true, result: "Não se aplica" },
          { id: "ci-2", description: "Verificar pressão do gás refrigerante", required: true, result: null }
        ],
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
        observations: "Necessário trocar os filtros G4, mas estoque zerado.",
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
        categoryId: "cat-4",
        priority: "Urgente",
        technicalDescription: "Substituir válvula de descarga da recepção.",
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
            justification: "Peça específica para reparo. Sem estoque."
          }
        ] as any,
        observations: "",
        attachments: [],
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "os-4",
        number: "OS-2026-0004",
        unitId: "u-rj",
        locationId: "loc-6",
        assetId: "ast-5",
        type: "Corretiva",
        categoryId: "cat-1",
        priority: "Alta",
        technicalDescription: "Verificar ruído no ventilador do AC do Auditório",
        status: "Planejada",
        responsibleId: "usr-6",
        checklist: [],
        materials: [],
        observations: "Ordem gerada direto pelo gestor após ronda diária.",
        attachments: [],
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "os-5",
        number: "OS-2026-0005",
        unitId: "u-df",
        locationId: "loc-2",
        assetId: "ast-2",
        type: "Preventiva",
        categoryId: "cat-2",
        priority: "Média",
        technicalDescription: "Manutenção semestral do QGBT. Reaperto e limpeza.",
        status: "Programada",
        responsibleId: "usr-4",
        providerId: "prov-3",
        deadline: new Date(Date.now() + 259200000).toISOString(),
        checklist: [],
        materials: [],
        observations: "Aguardando janela de desligamento de energia programada para sábado de manhã.",
        attachments: [],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "os-6",
        number: "OS-2026-0006",
        unitId: "u-df",
        locationId: "loc-5",
        type: "Corretiva",
        categoryId: "cat-4",
        priority: "Média",
        technicalDescription: "Troca da torneira da copa",
        status: "Concluída",
        responsibleId: "usr-4",
        checklist: [],
        materials: [
            {
                id: "omat-6",
                materialId: "mat-5",
                description: "Torneira Pia Cozinha Bica Móvel",
                type: "UN",
                quantity: 1,
                classification: "Obrigatório",
                availability: "Consumido",
                isUnregistered: false,
            }
        ] as any,
        observations: "Torneira substituída e testada.",
        attachments: [],
        createdAt: new Date(Date.now() - 864000000).toISOString(),
        updatedAt: new Date(Date.now() - 600000000).toISOString(),
        active: true
      }
    ];
    this.set("gsi_work_orders", orders);

    const docs: Document[] = [
      {
        id: "doc-1",
        type: "cat-6",
        title: "Alvará de Funcionamento - DF",
        unitId: "u-df",
        issuer: "Prefeitura GDF",
        number: "ALV-12345/2025",
        status: "A vencer",
        expirationDate: new Date(Date.now() + 86400000 * 15).toISOString(),
        attachments: [],
        createdAt: new Date(Date.now() - 86400000 * 300).toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "doc-2",
        type: "cat-6",
        title: "Auto de Vistoria do Corpo de Bombeiros (AVCB) - DF",
        unitId: "u-df",
        issuer: "CBMDF",
        number: "AVCB-8877/2026",
        status: "Vigente",
        expirationDate: new Date(Date.now() + 86400000 * 250).toISOString(),
        attachments: [],
        createdAt: new Date(Date.now() - 86400000 * 100).toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "doc-3",
        type: "cat-7",
        title: "Laudo de SPDA - RJ",
        unitId: "u-rj",
        issuer: "Engenharia Externa Ltda",
        number: "LAU-SPDA-RJ-001",
        status: "Crítico",
        expirationDate: new Date(Date.now() - 86400000 * 10).toISOString(), // Vencido
        attachments: [],
        createdAt: new Date(Date.now() - 86400000 * 400).toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      }
    ];
    this.set("gsi_documents", docs);

    const plans: PreventivePlan[] = [
      {
        id: "plan-1",
        code: "PM-AC-01",
        unitId: "u-df",
        assetId: "ast-1",
        categoryId: "cat-1",
        type: "Preventiva",
        description: "Manutenção Mensal PMOC - Chiller A",
        periodicity: "mensal",
        nextExecution: new Date(Date.now() - 86400000 * 2).toISOString(), // Atrasado e gerou a OS-2
        checklist: checklistTemplates[0].items.map(i => ({...i})),
        status: "Ativo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "plan-2",
        code: "PM-EL-01",
        unitId: "u-df",
        assetId: "ast-2",
        categoryId: "cat-2",
        type: "Preventiva",
        description: "Termografia e Reaperto Semestral QGBT",
        periodicity: "semestral",
        nextExecution: new Date(Date.now() + 86400000 * 30).toISOString(), 
        checklist: checklistTemplates[1].items.map(i => ({...i})),
        status: "Ativo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "plan-3",
        code: "PM-AC-02",
        unitId: "u-rj",
        assetId: "ast-5",
        categoryId: "cat-1",
        type: "Preventiva",
        description: "Manutenção Mensal PMOC - AC Auditório",
        periodicity: "mensal",
        nextExecution: new Date(Date.now() + 86400000 * 15).toISOString(), 
        checklist: checklistTemplates[0].items.map(i => ({...i})),
        status: "Ativo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      }
    ];
    this.set("gsi_preventive_plans", plans);

    const providers: Provider[] = [
      {
        id: "prov-1",
        name: "Clima Técnica Brasília Ltda",
        contactName: "João Silva",
        phone: "(61) 99999-1111",
        email: "contato@climatecnica.com.br",
        specialty: "Climatização",
        unitId: "u-df",
        status: "Ativo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "prov-2",
        name: "Elevadores Capital S/A",
        contactName: "Maria Souza",
        phone: "(61) 98888-2222",
        email: "atendimento@elevadorescapital.com.br",
        specialty: "Elevadores",
        status: "Ativo", 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "prov-3",
        name: "Soluções Elétricas e Laudos RJ",
        contactName: "Carlos Pereira",
        phone: "(21) 97777-3333",
        email: "contato@eletricarj.com.br",
        specialty: "Elétrica / Eng. Elétrica",
        unitId: "u-rj",
        status: "Ativo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "prov-4",
        name: "Manutenção Predial Alfa",
        contactName: "Ana Paula",
        phone: "(61) 96666-4444",
        email: "alfa@manutencao.com.br",
        specialty: "Civil",
        unitId: "u-df",
        status: "Inativo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "prov-5",
        name: "Fortaleza Hidráulica",
        contactName: "José Ramos",
        phone: "(11) 95555-5555",
        email: "contato@fortalezahidraulica.com.br",
        specialty: "Hidráulica",
        unitId: "u-sp",
        status: "Ativo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      }
    ];
    this.set("gsi_providers", providers);

    this.logAudit("usr-5", "Sistema restaurado para dados de demonstração estendidos");
  }
`;

content = beforeRestore + newRestoreBody + afterRestore;

fs.writeFileSync('src/services/storageService.ts', content);
