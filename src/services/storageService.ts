import { Unit, Location, Asset, User, Request, WorkOrder, PreventivePlan, Document, Provider, AuditLog, Category, ChecklistTemplate, MaintenanceExecution, StockMovement } from "../types";

// A nova versão repõe cenários compatíveis com os fluxos atuais sem apagar dados locais.
const VERSION = "1.9.0";

interface DB {
  gsi_data_version: { version: string };
  gsi_units: Unit[];
  gsi_locations: Location[];
  gsi_assets: Asset[];
  gsi_users: User[];
  gsi_requests: Request[];
  gsi_work_orders: WorkOrder[];
  gsi_preventive_plans: PreventivePlan[];
  gsi_documents: Document[];
  gsi_providers: Provider[];
  gsi_categories: Category[];
  gsi_checklist_templates: ChecklistTemplate[];
  gsi_audit_log: AuditLog[];
  gsi_maintenance_executions: MaintenanceExecution[];
  gsi_stock_materials: any[];
  gsi_stock_movements: any[];
  gsi_stock_requests: any[];
  gsi_technician_schedules: any[];
  gsi_technician_unavailabilities: any[];
}

export const storageService = {
  get<K extends keyof DB>(key: K): DB[K] {
    const data = localStorage.getItem(key);
    if (!data) return this.getDefaults(key);
    try {
      return JSON.parse(data);
    } catch {
      return this.getDefaults(key);
    }
  },

  set<K extends keyof DB>(key: K, value: DB[K]) {
    localStorage.setItem(key, JSON.stringify(value));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("gsi-storage-updated", { detail: { key } }));
    }
  },

  getDefaults<K extends keyof DB>(key: K): DB[K] {
    if (key === "gsi_data_version") return { version: VERSION } as any;
    return [] as any;
  },

  
  seed() {
    const versionData = localStorage.getItem("gsi_data_version");
    if (!versionData) {
      this.restoreDefaults();
    } else {
      try {
        const v = JSON.parse(versionData);
        if (v.version !== VERSION) {
          this.migrateDefaults();
        }
      } catch {
        this.restoreDefaults();
      }
    }
  },


  /**
   * Enriquece a massa existente sem excluir registros criados durante a
   * demonstração. A restauração completa é reservada ao primeiro acesso.
   */
  migrateDefaults() {
    this.restoreDefaults();
    return;

    const situationByStatus: Record<string, WorkOrder["operationalSituation"]> = {
      "Nova": "Nova", "Planejada": "Planejamento", "Em planejamento": "Planejamento",
      "Aguardando estoque": "Planejamento", "Aguardando material": "Planejamento",
      "Programada": "Programada", "Em execução": "Em execução",
      "Em validação": "Validação", "Concluída": "Concluída",
    };
    this.set("gsi_work_orders", this.get("gsi_work_orders").map((order) => ({
      ...order,
      assetIds: order.assetIds?.length ? order.assetIds : (order.assetId ? [order.assetId] : []),
      operationalSituation: order.operationalSituation || situationByStatus[order.status] || "Nova",
    })));

    const documentValues: Record<string, number> = { "doc-1": 1840, "doc-2": 3200, "doc-3": 2750, "doc-4": 28800, "doc-5": 480 };
    this.set("gsi_documents", this.get("gsi_documents").map((document) => ({
      ...document,
      value: document.value ?? documentValues[document.id] ?? 0,
      versions: document.versions || [],
      attachments: document.attachments || [],
    })));

    const expectedByPeriodicity: Record<string, number> = { mensal: 12, trimestral: 4, semestral: 2, anual: 1 };
    this.set("gsi_preventive_plans", this.get("gsi_preventive_plans").map((plan) => {
      const next = plan.nextExecution ? new Date(plan.nextExecution).getTime() : NaN;
      const days = Number.isNaN(next) ? null : Math.ceil((next - Date.now()) / 86400000);
      return {
        ...plan,
        assetIds: plan.assetIds?.length ? plan.assetIds : (plan.assetId ? [plan.assetId] : []),
        expectedWorkOrders: plan.expectedWorkOrders ?? expectedByPeriodicity[plan.periodicity?.toLowerCase()] ?? 1,
        alertDaysAttention: plan.alertDaysAttention ?? 30,
        alertDaysCritical: plan.alertDaysCritical ?? 10,
        scheduleStatus: plan.scheduleStatus || (days === null ? "Sem data" : days < 0 ? "Atrasada" : days <= (plan.alertDaysAttention ?? 30) ? "Próxima" : "Em dia"),
      };
    }));
    this.set("gsi_data_version", { version: VERSION });
  },

  restoreDefaults() {
    localStorage.clear();
    this.set("gsi_data_version", { version: VERSION });

    const isoFromNow = (daysOffset: number, hour = 9, minute = 0) => {
      const date = new Date();
      date.setHours(hour, minute, 0, 0);
      date.setDate(date.getDate() + daysOffset);
      return date.toISOString();
    };

    const units: Unit[] = [
      { id: "u-df", name: "Sede - Brasília", sigla: "DF", city: "Brasília", active: true },
      { id: "u-rj", name: "Regional - Rio de Janeiro", sigla: "RJ", city: "Rio de Janeiro", active: true },
      { id: "u-sp", name: "Escritório - São Paulo", sigla: "SP", city: "São Paulo", active: true },
      { id: "u-ba", name: "Regional - Salvador", sigla: "BA", city: "Salvador", active: true },
      { id: "u-mg", name: "Escritório - Belo Horizonte", sigla: "MG", city: "Belo Horizonte", active: true },
    ];
    this.set("gsi_units", units);

    const users: User[] = [
      { id: "usr-1", name: "Ana Silva (Solicitante)", email: "ana.silva@cnc.br", role: "Solicitante", unitId: "u-df", active: true },
      { id: "usr-2", name: "Carlos Mendes (Op GSI)", email: "carlos.mendes@cnc.br", role: "Operador GSI", unitId: "u-df", active: true },
      { id: "usr-3", name: "Mariana Costa (Gestor GSI)", email: "mariana.costa@cnc.br", role: "Gestor GSI", active: true },
      { id: "usr-4", name: "João Pereira (Técnico DF)", email: "joao.pereira@cnc.br", role: "Executor/Técnico", unitId: "u-df", active: true },
      { id: "usr-6", name: "Roberto Alves (Técnico RJ)", email: "roberto.alves@cnc.br", role: "Executor/Técnico", unitId: "u-rj", active: true },
      { id: "usr-7", name: "Luciana Lima (Solicitante SP)", email: "luciana.lima@cnc.br", role: "Solicitante", unitId: "u-sp", active: true },
      { id: "usr-8", name: "Fernanda Rocha (Solicitante RJ)", email: "fernanda.rocha@cnc.br", role: "Solicitante", unitId: "u-rj", active: true },
      { id: "usr-9", name: "Paulo Teixeira (Solicitante BA)", email: "paulo.teixeira@cnc.br", role: "Solicitante", unitId: "u-ba", active: true },
      { id: "usr-10", name: "Bruna Nogueira (Op GSI SP)", email: "bruna.nogueira@cnc.br", role: "Operador GSI", unitId: "u-sp", active: true },
      { id: "usr-11", name: "Mateus Cardoso (Técnico SP)", email: "mateus.cardoso@cnc.br", role: "Executor/Técnico", unitId: "u-sp", active: true },
      { id: "usr-12", name: "Rafael Santos (Técnico BA)", email: "rafael.santos@cnc.br", role: "Executor/Técnico", unitId: "u-ba", active: true },
      { id: "usr-13", name: "Helena Prado (Gestora Operacional)", email: "helena.prado@cnc.br", role: "Gestor GSI", unitId: "u-mg", active: true },
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
      { id: "loc-7", unitId: "u-sp", type: "Ambiente", name: "Coworking Central", code: "SP-COW-01", floor: "Andar anico", active: true },
      { id: "loc-8", unitId: "u-sp", type: "Ambiente", name: "CPD Paulista", code: "SP-CPD-01", floor: "1º Andar", active: true },
      { id: "loc-9", unitId: "u-sp", type: "Ambiente", name: "Sala de Treinamento", code: "SP-TRN-01", floor: "2º Andar", active: true },
      { id: "loc-10", unitId: "u-rj", type: "Ambiente", name: "Sala Técnica Elétrica", code: "RJ-ELT-01", floor: "Subsolo", active: true },
      { id: "loc-11", unitId: "u-ba", type: "Ambiente", name: "Recepção Salvador", code: "BA-REC-01", floor: "Térreo", active: true },
      { id: "loc-12", unitId: "u-ba", type: "Ambiente", name: "Sala de Bombas", code: "BA-BMB-01", floor: "Subsolo", active: true },
      { id: "loc-13", unitId: "u-mg", type: "Ambiente", name: "Escritório Administrativo", code: "MG-ADM-01", floor: "5º Andar", active: true },
      { id: "loc-14", unitId: "u-mg", type: "Ambiente", name: "Hall Elevadores", code: "MG-ELE-01", floor: "Térreo", active: true },
    ];
    this.set("gsi_locations", locations);

    const categories: Category[] = [
      { id: "cat-1", name: "Climatização", type: "Serviço", active: true },
      { id: "cat-2", name: "Elétrica", type: "Serviço", active: true },
      { id: "cat-3", name: "Civil", type: "Serviço", active: true },
      { id: "cat-4", name: "Hidráulica", type: "Serviço", active: true },
      { id: "cat-5", name: "Mobiliário", type: "Serviço", active: true },
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
      { id: "ast-4", code: "HD-DF-001", name: "Bomba D\'água Recalque B1", category: "cat-4", unitId: "u-df", locationId: "loc-2", manufacturer: "Schneider", criticality: "Alta", status: "Em manutenção", active: true },
      { id: "ast-5", code: "AC-RJ-001", name: "Ar Condicionado Central Auditório", category: "cat-1", unitId: "u-rj", locationId: "loc-3", manufacturer: "Trane", criticality: "Alta", status: "Ativo", active: true },
      { id: "ast-6", code: "EL-RJ-001", name: "QDL Pavimento Diretoria", category: "cat-2", unitId: "u-rj", locationId: "loc-10", manufacturer: "WEG", criticality: "Alta", status: "Ativo", active: true },
      { id: "ast-7", code: "AC-SP-001", name: "VRF Coworking Central", category: "cat-1", unitId: "u-sp", locationId: "loc-7", manufacturer: "Daikin", criticality: "Alta", status: "Ativo", active: true },
      { id: "ast-8", code: "TI-SP-001", name: "Rack de Rede CPD", category: "cat-2", unitId: "u-sp", locationId: "loc-8", manufacturer: "Furukawa", criticality: "Alta", status: "Ativo", active: true },
      { id: "ast-9", code: "MOB-SP-001", name: "Cadeiras Sala Treinamento", category: "cat-5", unitId: "u-sp", locationId: "loc-9", manufacturer: "Flexform", criticality: "Baixa", status: "Ativo", active: true },
      { id: "ast-10", code: "HD-BA-001", name: "Conjunto Motobomba Pressurização", category: "cat-4", unitId: "u-ba", locationId: "loc-12", manufacturer: "KSB", criticality: "Alta", status: "Ativo", active: true },
      { id: "ast-11", code: "AC-BA-001", name: "Split Recepção Salvador", category: "cat-1", unitId: "u-ba", locationId: "loc-11", manufacturer: "Springer Midea", criticality: "Média", status: "Ativo", active: true },
      { id: "ast-12", code: "EL-MG-001", name: "Painel Iluminação Térreo", category: "cat-2", unitId: "u-mg", locationId: "loc-13", manufacturer: "Schneider", criticality: "Média", status: "Ativo", active: true },
      { id: "ast-13", code: "ELV-MG-001", name: "Elevador Social Torre A", category: "cat-3", unitId: "u-mg", locationId: "loc-14", manufacturer: "Atlas Schindler", criticality: "Alta", status: "Ativo", active: true },
      { id: "ast-14", code: "HD-DF-002", name: "Reservatório Superior DF", category: "cat-4", unitId: "u-df", locationId: "loc-2", manufacturer: "Fortlev", criticality: "Alta", status: "Ativo", active: true },
      { id: "ast-15", code: "AC-RJ-002", name: "Split Sala Diretoria RJ", category: "cat-1", unitId: "u-rj", locationId: "loc-6", manufacturer: "LG", criticality: "Média", status: "Ativo", active: true },
    ];
    assets.push(
      { id: "ast-16", code: "EL-SP-002", name: "QDL Sala Treinamento", category: "cat-2", unitId: "u-sp", locationId: "loc-9", manufacturer: "Schneider", criticality: "Média", status: "Ativo", active: true },
      { id: "ast-17", code: "AC-SP-002", name: "Split Sala Treinamento", category: "cat-1", unitId: "u-sp", locationId: "loc-9", manufacturer: "Midea", criticality: "Média", status: "Ativo", active: true },
      { id: "ast-18", code: "HD-SP-001", name: "Bebedouro Pressurizado Paulista", category: "cat-4", unitId: "u-sp", locationId: "loc-7", manufacturer: "IbbL", criticality: "Baixa", status: "Ativo", active: true },
      { id: "ast-19", code: "AC-DF-003", name: "Cassete Hall Executivo", category: "cat-1", unitId: "u-df", locationId: "loc-1", manufacturer: "Daikin", criticality: "Alta", status: "Ativo", active: true },
      { id: "ast-20", code: "CIV-DF-001", name: "Marquise Recepção DF", category: "cat-3", unitId: "u-df", locationId: "loc-1", manufacturer: "Estrutura Civil", criticality: "Alta", status: "Ativo", active: true },
      { id: "ast-21", code: "EL-RJ-002", name: "Painel Bombas Incêndio RJ", category: "cat-2", unitId: "u-rj", locationId: "loc-10", manufacturer: "WEG", criticality: "Alta", status: "Ativo", active: true },
      { id: "ast-22", code: "HD-BA-002", name: "Reservatório Inferior BA", category: "cat-4", unitId: "u-ba", locationId: "loc-12", manufacturer: "Fortlev", criticality: "Alta", status: "Ativo", active: true },
      { id: "ast-23", code: "ELV-MG-002", name: "Elevador Serviço Torre A", category: "cat-3", unitId: "u-mg", locationId: "loc-14", manufacturer: "Otis", criticality: "Alta", status: "Ativo", active: true },
      { id: "ast-24", code: "AC-MG-001", name: "Split Escritório Administrativo MG", category: "cat-1", unitId: "u-mg", locationId: "loc-13", manufacturer: "Samsung", criticality: "Média", status: "Ativo", active: true },
      { id: "ast-25", code: "MOB-DF-001", name: "Poltronas Recepção DF", category: "cat-5", unitId: "u-df", locationId: "loc-1", manufacturer: "Cavaletti", criticality: "Baixa", status: "Ativo", active: true },
    );
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
      },
      {
        id: "req-5",
        protocol: "DEM-2026-0005",
        solicitanteId: "usr-8",
        unitId: "u-rj",
        locationId: "loc-10",
        categoryId: "cat-2",
        title: "Cheiro de queimado no QDL",
        description: "A equipe percebeu cheiro de aquecimento no quadro de distribuição do pavimento da diretoria.",
        suggestedPriority: "Urgente",
        status: "Aprovada",
        attachments: [],
        createdAt: new Date(Date.now() - 5400000).toISOString(),
        updatedAt: new Date(Date.now() - 5000000).toISOString(),
        active: true
      },
      {
        id: "req-6",
        protocol: "DEM-2026-0006",
        solicitanteId: "usr-7",
        unitId: "u-sp",
        locationId: "loc-8",
        categoryId: "cat-2",
        title: "Oscilação no rack do CPD",
        description: "Os switches do rack principal apresentaram reinício após oscilação de energia.",
        suggestedPriority: "Alta",
        status: "Convertida em ordem",
        attachments: [],
        createdAt: new Date(Date.now() - 20000000).toISOString(),
        updatedAt: new Date(Date.now() - 18000000).toISOString(),
        active: true
      },
      {
        id: "req-7",
        protocol: "DEM-2026-0007",
        solicitanteId: "usr-9",
        unitId: "u-ba",
        locationId: "loc-12",
        categoryId: "cat-4",
        title: "Baixa pressão de água",
        description: "O conjunto motobomba está com intermitência e a pressão caiu no início da manhã.",
        suggestedPriority: "Alta",
        status: "Aberta",
        attachments: [],
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        active: true
      },
      {
        id: "req-8",
        protocol: "DEM-2026-0008",
        solicitanteId: "usr-1",
        unitId: "u-df",
        locationId: "loc-2",
        categoryId: "cat-1",
        title: "Vazamento na casa de máquinas",
        description: "Há vazamento próximo ao Chiller A e a área técnica precisa de inspeção imediata.",
        suggestedPriority: "Urgente",
        status: "Em triagem",
        attachments: [],
        createdAt: new Date(Date.now() - 2800000).toISOString(),
        updatedAt: new Date(Date.now() - 1400000).toISOString(),
        active: true
      },
      {
        id: "req-9",
        protocol: "DEM-2026-0009",
        solicitanteId: "usr-8",
        unitId: "u-rj",
        locationId: "loc-3",
        categoryId: "cat-5",
        title: "Poltronas danificadas no auditório",
        description: "Três poltronas estão com braços soltos e espuma aparente.",
        suggestedPriority: "Baixa",
        status: "Aberta",
        attachments: [],
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        active: true
      }
    ];
    requests.push(
      { id: "req-10", protocol: "DEM-2026-0010", solicitanteId: "usr-7", unitId: "u-sp", locationId: "loc-9", categoryId: "cat-1", title: "Ar não refrigera na sala de treinamento", description: "O split da sala de treinamento está ligado, mas não reduz a temperatura.", suggestedPriority: "Alta", status: "Aberta", attachments: [], createdAt: isoFromNow(-3, 10), updatedAt: isoFromNow(-3, 11), active: true },
      { id: "req-11", protocol: "DEM-2026-0011", solicitanteId: "usr-1", unitId: "u-df", locationId: "loc-2", categoryId: "cat-4", title: "Nível baixo no reservatório superior", description: "A boia não está acionando corretamente e o reservatório não completa o enchimento.", suggestedPriority: "Alta", status: "Aprovada", attachments: [], createdAt: isoFromNow(-2, 8), updatedAt: isoFromNow(-2, 9), active: true },
      { id: "req-12", protocol: "DEM-2026-0012", solicitanteId: "usr-8", unitId: "u-rj", locationId: "loc-3", categoryId: "cat-1", title: "Auditório com temperatura alta", description: "Mesmo com o sistema ligado, a climatização do auditório não atinge conforto térmico.", suggestedPriority: "Média", status: "Convertida em ordem", attachments: [], createdAt: isoFromNow(-8, 14), updatedAt: isoFromNow(-8, 15), active: true },
      { id: "req-13", protocol: "DEM-2026-0013", solicitanteId: "usr-9", unitId: "u-ba", locationId: "loc-11", categoryId: "cat-1", title: "Condensadora com ruído anormal", description: "O equipamento externo da recepção Salvador apresentou ruído acima do padrão.", suggestedPriority: "Média", status: "Em triagem", attachments: [], createdAt: isoFromNow(-1, 16), updatedAt: isoFromNow(-1, 17), active: true },
      { id: "req-14", protocol: "DEM-2026-0014", solicitanteId: "usr-10", unitId: "u-sp", locationId: "loc-8", categoryId: "cat-2", title: "Rack sem autonomia após queda", description: "O rack principal perdeu alimentação sem sustentação mínima após queda curta.", suggestedPriority: "Urgente", status: "Aberta", attachments: [], createdAt: isoFromNow(-1, 9), updatedAt: isoFromNow(-1, 9, ), active: true },
      { id: "req-15", protocol: "DEM-2026-0015", solicitanteId: "usr-13", unitId: "u-mg", locationId: "loc-14", categoryId: "cat-3", title: "Porta do elevador desalinhada", description: "A porta do elevador social apresenta fechamento irregular no térreo.", suggestedPriority: "Alta", status: "Aprovada", attachments: [], createdAt: isoFromNow(-6, 13), updatedAt: isoFromNow(-6, 14), active: true },
      { id: "req-16", protocol: "DEM-2026-0016", solicitanteId: "usr-1", unitId: "u-df", locationId: "loc-1", categoryId: "cat-5", title: "Poltrona rasgada na recepção", description: "Uma poltrona da recepção principal está com rasgo no assento.", suggestedPriority: "Baixa", status: "Aberta", attachments: [], createdAt: isoFromNow(-12, 10), updatedAt: isoFromNow(-12, 11), active: true },
      { id: "req-17", protocol: "DEM-2026-0017", solicitanteId: "usr-8", unitId: "u-rj", locationId: "loc-6", categoryId: "cat-1", title: "Split diretoria sem drenagem", description: "O split da diretoria apresentou gotejamento interno.", suggestedPriority: "Média", status: "Convertida em ordem", attachments: [], createdAt: isoFromNow(-4, 15), updatedAt: isoFromNow(-4, 16), active: true },
      { id: "req-18", protocol: "DEM-2026-0018", solicitanteId: "usr-9", unitId: "u-ba", locationId: "loc-12", categoryId: "cat-4", title: "Bomba opera com aquecimento", description: "O corpo da motobomba está aquecendo acima do normal em operação contínua.", suggestedPriority: "Alta", status: "Aguardando informação", attachments: [], createdAt: isoFromNow(-7, 9), updatedAt: isoFromNow(-7, 11), active: true },
      { id: "req-19", protocol: "DEM-2026-0019", solicitanteId: "usr-10", unitId: "u-sp", locationId: "loc-7", categoryId: "cat-5", title: "Cadeiras faltando rodízio", description: "Diversas cadeiras do coworking estão com desgaste de rodízio.", suggestedPriority: "Baixa", status: "Aberta", attachments: [], createdAt: isoFromNow(-15, 10), updatedAt: isoFromNow(-15, 11), active: true },
      { id: "req-20", protocol: "DEM-2026-0020", solicitanteId: "usr-13", unitId: "u-mg", locationId: "loc-13", categoryId: "cat-1", title: "Split escritório com alarme", description: "A evaporadora do escritório administrativo exibe alarme recorrente.", suggestedPriority: "Média", status: "Aprovada", attachments: [], createdAt: isoFromNow(-5, 8), updatedAt: isoFromNow(-5, 9), active: true },
    );
    this.set("gsi_requests", requests);

    const materials = [
          { id: "mat-1", code: "MAT-001", name: "Lâmpada LED 40W Tubular", description: "Lâmpada tubular LED branca T8 120cm", category: "Elétrica", unit: "UN", unitId: "u-df", locationId: "loc-2", physicalBalance: 48, reservedBalance: 2, availableBalance: 46, minStock: 20, idealStock: 100, unitPrice: 18.9, status: "Normal", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "mat-2", code: "MAT-002", name: "Parafuso Sextavado M8", description: "Parafuso sextavado zincado", category: "Ferragem", unit: "CX", unitId: "u-df", locationId: "loc-2", physicalBalance: 5, reservedBalance: 0, availableBalance: 5, minStock: 10, idealStock: 30, unitPrice: 45, status: "Crítico", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "mat-3", code: "MAT-003", name: "Filtro Ar Condicionado G4", description: "Filtro manta G4 para split/fancoil", category: "Climatização", unit: "M2", unitId: "u-df", locationId: "loc-2", physicalBalance: 0, reservedBalance: 0, availableBalance: 0, minStock: 5, idealStock: 15, unitPrice: 32, status: "Sem saldo", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "mat-4", code: "MAT-004", name: "Fita Isolante 3M", description: "Fita isolante preta antichama 20m", category: "Elétrica", unit: "RL", unitId: "u-df", locationId: "loc-2", physicalBalance: 12, reservedBalance: 0, availableBalance: 12, minStock: 10, idealStock: 25, unitPrice: 16.5, status: "Atenção", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "mat-5", code: "MAT-005", name: "Torneira Pia Cozinha Bica Móvel", description: "Torneira de bancada cromada bica alta", category: "Hidráulica", unit: "UN", unitId: "u-df", locationId: "loc-2", physicalBalance: 2, reservedBalance: 0, availableBalance: 2, minStock: 3, idealStock: 5, unitPrice: 185, status: "Crítico", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "mat-6", code: "MAT-006", name: "Tubo PVC Esgoto 50mm", description: "Tubo PVC esgoto barra 6m", category: "Hidráulica", unit: "BR", unitId: "u-df", locationId: "loc-2", physicalBalance: 20, reservedBalance: 0, availableBalance: 20, minStock: 5, idealStock: 20, unitPrice: 68, status: "Normal", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "mat-7", code: "MAT-007", name: "Disjuntor Tripolar 100A", description: "Disjuntor caixa moldada 100A", category: "Elétrica", unit: "UN", unitId: "u-rj", locationId: "loc-10", physicalBalance: 3, reservedBalance: 1, availableBalance: 2, minStock: 2, idealStock: 6, unitPrice: 420, status: "Atenção", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "mat-8", code: "MAT-008", name: "Contator 32A", description: "Contator tripolar 32A 220V", category: "Elétrica", unit: "UN", unitId: "u-sp", locationId: "loc-8", physicalBalance: 1, reservedBalance: 0, availableBalance: 1, minStock: 2, idealStock: 5, unitPrice: 210, status: "Crítico", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "mat-9", code: "MAT-009", name: "Rolamento Ventilador 6203", description: "Rolamento blindado para motor ventilador", category: "Climatização", unit: "UN", unitId: "u-rj", locationId: "loc-3", physicalBalance: 6, reservedBalance: 0, availableBalance: 6, minStock: 2, idealStock: 8, unitPrice: 38, status: "Normal", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "mat-10", code: "MAT-010", name: "Boia elétrica 220V", description: "Boia para reservatório superior", category: "Hidráulica", unit: "UN", unitId: "u-df", locationId: "loc-2", physicalBalance: 0, reservedBalance: 0, availableBalance: 0, minStock: 2, idealStock: 4, unitPrice: 95, status: "Sem saldo", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "mat-11", code: "MAT-011", name: "Poltrona auditório reclinável", description: "Conjunto para substituição de assento", category: "Mobiliário", unit: "UN", unitId: "u-rj", locationId: "loc-3", physicalBalance: 1, reservedBalance: 0, availableBalance: 1, minStock: 2, idealStock: 5, unitPrice: 890, status: "Crítico", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "mat-12", code: "MAT-012", name: "Filtro secador linha liquida", description: "Filtro secador 3/8 para climatização", category: "Climatização", unit: "UN", unitId: "u-ba", locationId: "loc-12", physicalBalance: 9, reservedBalance: 1, availableBalance: 8, minStock: 3, idealStock: 10, unitPrice: 57, status: "Normal", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];
    materials.push(
      { id: "mat-13", code: "MAT-013", name: "Sensor de temperatura NTC", description: "Sensor NTC para evaporadora", category: "Climatização", unit: "UN", unitId: "u-sp", locationId: "loc-9", physicalBalance: 14, reservedBalance: 2, availableBalance: 12, minStock: 4, idealStock: 15, unitPrice: 24, status: "Normal", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "mat-14", code: "MAT-014", name: "Capacitor 35+5 uF", description: "Capacitor duplo condensadora", category: "Climatização", unit: "UN", unitId: "u-rj", locationId: "loc-6", physicalBalance: 4, reservedBalance: 0, availableBalance: 4, minStock: 3, idealStock: 8, unitPrice: 42, status: "Atenção", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "mat-15", code: "MAT-015", name: "Rodízio cadeira 50 mm", description: "Kit de rodízio para cadeira escritório", category: "Mobiliário", unit: "UN", unitId: "u-sp", locationId: "loc-7", physicalBalance: 40, reservedBalance: 6, availableBalance: 34, minStock: 12, idealStock: 50, unitPrice: 8.5, status: "Normal", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "mat-16", code: "MAT-016", name: "Braço poltrona recepção", description: "Reposição braço poltrona recepção", category: "Mobiliário", unit: "UN", unitId: "u-df", locationId: "loc-1", physicalBalance: 3, reservedBalance: 0, availableBalance: 3, minStock: 2, idealStock: 6, unitPrice: 120, status: "Atenção", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "mat-17", code: "MAT-017", name: "Cabos UTP Cat6", description: "Caixa cabo UTP Cat6", category: "Elétrica", unit: "CX", unitId: "u-sp", locationId: "loc-8", physicalBalance: 7, reservedBalance: 1, availableBalance: 6, minStock: 3, idealStock: 10, unitPrice: 690, status: "Normal", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "mat-18", code: "MAT-018", name: "Flange reservatório 60 mm", description: "Flange PVC reservatório", category: "Hidráulica", unit: "UN", unitId: "u-ba", locationId: "loc-12", physicalBalance: 1, reservedBalance: 0, availableBalance: 1, minStock: 2, idealStock: 5, unitPrice: 65, status: "Crítico", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "mat-19", code: "MAT-019", name: "Lubrificante guia elevador", description: "Lubrificante técnico para guias", category: "Civil", unit: "LT", unitId: "u-mg", locationId: "loc-14", physicalBalance: 5, reservedBalance: 1, availableBalance: 4, minStock: 2, idealStock: 6, unitPrice: 74, status: "Normal", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "mat-20", code: "MAT-020", name: "Fecho porta elevador", description: "Fecho mecânico para porta pavimento", category: "Civil", unit: "UN", unitId: "u-mg", locationId: "loc-14", physicalBalance: 0, reservedBalance: 0, availableBalance: 0, minStock: 1, idealStock: 3, unitPrice: 540, status: "Sem saldo", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    );
    this.set("gsi_stock_materials", materials as any);

    const stockMovements: StockMovement[] = [
      { id: "mov-demo-1", type: "Entrada", materialId: "mat-1", quantity: 50, previousBalance: 0, newBalance: 50, unitId: "u-df", locationId: "loc-2", sector: "Almoxarifado", userId: "usr-2", invoice: "NF-2026-1001", observations: "Recebimento mensal de lâmpadas LED.", date: new Date(Date.now() - 86400000 * 20).toISOString() },
      { id: "mov-demo-2", type: "Saída", materialId: "mat-1", quantity: 2, previousBalance: 50, newBalance: 48, workOrderId: "os-1", unitId: "u-df", locationId: "loc-1", sector: "Recepção", userId: "usr-2", technicianId: "usr-4", observations: "Aplicação na OS de correção da recepção.", date: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: "mov-demo-3", type: "Saída", materialId: "mat-5", quantity: 1, previousBalance: 3, newBalance: 2, workOrderId: "os-6", unitId: "u-df", locationId: "loc-5", sector: "Copa", userId: "usr-2", technicianId: "usr-4", observations: "Material consumido na troca de torneira.", date: new Date(Date.now() - 86400000 * 7).toISOString() },
      { id: "mov-demo-4", type: "Ajuste", materialId: "mat-2", quantity: 5, previousBalance: 10, newBalance: 5, unitId: "u-df", locationId: "loc-2", sector: "Almoxarifado", userId: "usr-2", observations: "Conferência física identificou divergência de inventário.", date: new Date(Date.now() - 86400000 * 2).toISOString() },
    ];
    this.set("gsi_stock_movements", stockMovements as any);

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
      },
      {
        id: "sreq-3",
        workOrderId: "os-7",
        materialId: "mat-7",
        isUnregistered: false,
        quantity: 2,
        priority: "Alta",
        requesterId: "usr-6",
        assetId: "ast-6",
        locationId: "loc-10",
        status: "Aguardando recebimento",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: "sreq-4",
        workOrderId: "os-8",
        materialId: "mat-8",
        isUnregistered: false,
        quantity: 1,
        priority: "Urgente",
        requesterId: "usr-11",
        assetId: "ast-8",
        locationId: "loc-8",
        status: "Aguardando análise",
        createdAt: new Date(Date.now() - 5400000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "sreq-5",
        workOrderId: "os-9",
        materialId: "mat-10",
        isUnregistered: false,
        quantity: 1,
        priority: "Alta",
        requesterId: "usr-4",
        assetId: "ast-14",
        locationId: "loc-2",
        status: "Aguardando análise",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: "sreq-6",
        workOrderId: "os-10",
        isUnregistered: true,
        suggestedDescription: "Braço de poltrona auditório linha premium",
        quantity: 3,
        estimatedUnit: "UN",
        justification: "Modelo específico do auditório principal sem equivalente cadastrado.",
        priority: "Média",
        requesterId: "usr-6",
        locationId: "loc-3",
        status: "Associado a existente",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ];
    stockRequests.push(
      { id: "sreq-7", workOrderId: "os-15", materialId: "mat-13", isUnregistered: false, quantity: 2, priority: "Média", requesterId: "usr-11", assetId: "ast-17", locationId: "loc-9", status: "Aguardando análise", createdAt: isoFromNow(-3, 11), updatedAt: isoFromNow(-3, 12) },
      { id: "sreq-8", workOrderId: "os-16", materialId: "mat-18", isUnregistered: false, quantity: 2, priority: "Alta", requesterId: "usr-12", assetId: "ast-22", locationId: "loc-12", status: "Aguardando análise", createdAt: isoFromNow(-6, 10), updatedAt: isoFromNow(-6, 10) },
      { id: "sreq-9", workOrderId: "os-17", materialId: "mat-20", isUnregistered: false, quantity: 1, priority: "Alta", requesterId: "usr-13", assetId: "ast-23", locationId: "loc-14", status: "Aguardando recebimento", createdAt: isoFromNow(-7, 9), updatedAt: isoFromNow(-5, 16) },
      { id: "sreq-10", workOrderId: "os-18", isUnregistered: true, suggestedDescription: "Placa de comando elevador torre A", quantity: 1, estimatedUnit: "UN", justification: "Componente específico sem cadastro prévio.", priority: "Urgente", requesterId: "usr-13", locationId: "loc-14", status: "Aprovado para novo cadastro", createdAt: isoFromNow(-9, 15), updatedAt: isoFromNow(-8, 8) },
      { id: "sreq-11", workOrderId: "os-19", materialId: "mat-16", isUnregistered: false, quantity: 1, priority: "Baixa", requesterId: "usr-4", assetId: "ast-25", locationId: "loc-1", status: "Associado a existente", createdAt: isoFromNow(-10, 13), updatedAt: isoFromNow(-9, 9) },
      { id: "sreq-12", workOrderId: "os-20", materialId: "mat-14", isUnregistered: false, quantity: 2, priority: "Média", requesterId: "usr-6", assetId: "ast-15", locationId: "loc-6", status: "Aguardando análise", createdAt: isoFromNow(-4, 9), updatedAt: isoFromNow(-4, 9) },
    );
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
        operationalSituation: "Em execução",
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
        operationalSituation: "Planejamento",
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
        operationalSituation: "Planejamento",
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
        operationalSituation: "Planejamento",
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
        operationalSituation: "Programada",
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
        operationalSituation: "Concluída",
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
      },
      {
        id: "os-7",
        number: "OS-2026-0007",
        requestId: "req-5",
        unitId: "u-rj",
        locationId: "loc-10",
        assetId: "ast-6",
        assetIds: ["ast-6"],
        type: "Corretiva",
        categoryId: "cat-2",
        priority: "Urgente",
        technicalDescription: "Inspecionar aquecimento e odor no quadro de distribuição da diretoria.",
        status: "Aguardando material",
        operationalSituation: "Planejamento",
        responsibleId: "usr-6",
        checklist: [],
        materials: [{ id: "omat-7", materialId: "mat-7", description: "Disjuntor Tripolar 100A", type: "UN", quantity: 2, classification: "Obrigatório", availability: "Parcialmente disponível", isUnregistered: false }] as any,
        observations: "Necessário substituir dois disjuntores após inspeção termográfica preliminar.",
        attachments: [],
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        active: true
      },
      {
        id: "os-8",
        number: "OS-2026-0008",
        requestId: "req-6",
        unitId: "u-sp",
        locationId: "loc-8",
        assetId: "ast-8",
        assetIds: ["ast-8"],
        type: "Corretiva",
        categoryId: "cat-2",
        priority: "Alta",
        technicalDescription: "Estabilizar rack do CPD e substituir componentes de proteção.",
        status: "Aguardando material",
        operationalSituation: "Planejamento",
        responsibleId: "usr-11",
        checklist: [],
        materials: [{ id: "omat-8", materialId: "mat-8", description: "Contator 32A", type: "UN", quantity: 1, classification: "Obrigatório", availability: "Indisponível", isUnregistered: false }] as any,
        observations: "A oscilação foi percebida após pico de energia no início da tarde.",
        attachments: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "os-9",
        number: "OS-2026-0009",
        unitId: "u-df",
        locationId: "loc-2",
        assetId: "ast-14",
        assetIds: ["ast-14", "ast-4"],
        type: "Corretiva",
        categoryId: "cat-4",
        priority: "Alta",
        technicalDescription: "Normalizar boia do reservatório superior e revisar conjunto de recalque.",
        status: "Aguardando material",
        operationalSituation: "Planejamento",
        responsibleId: "usr-4",
        checklist: [],
        materials: [{ id: "omat-9", materialId: "mat-10", description: "Boia elétrica 220V", type: "UN", quantity: 1, classification: "Obrigatório", availability: "Indisponível", isUnregistered: false }] as any,
        observations: "Ocorrência intermitente com risco de desabastecimento parcial nos sanitários.",
        attachments: [],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "os-10",
        number: "OS-2026-0010",
        requestId: "req-9",
        unitId: "u-rj",
        locationId: "loc-3",
        type: "Corretiva",
        categoryId: "cat-5",
        priority: "Média",
        technicalDescription: "Reparar poltronas danificadas do auditório principal.",
        status: "Aguardando estoque",
        operationalSituation: "Planejamento",
        responsibleId: "usr-6",
        checklist: [],
        materials: [{ id: "omat-10", description: "Braço de poltrona auditório linha premium", quantity: 3, classification: "Obrigatório", availability: "Aguardando validação", isUnregistered: true, justification: "Modelo específico do auditório principal." }] as any,
        observations: "Atendimento planejado para antes do próximo evento institucional.",
        attachments: [],
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        active: true
      },
      {
        id: "os-11",
        number: "OS-2026-0011",
        requestId: "req-7",
        unitId: "u-ba",
        locationId: "loc-12",
        assetId: "ast-10",
        assetIds: ["ast-10", "ast-11"],
        type: "Corretiva",
        categoryId: "cat-4",
        priority: "Alta",
        technicalDescription: "Avaliar baixa pressão do sistema hidráulico e revisar motobomba de pressurização.",
        status: "Programada",
        operationalSituation: "Programada",
        responsibleId: "usr-12",
        checklist: [],
        materials: [{ id: "omat-11", materialId: "mat-12", description: "Filtro secador linha liquida", type: "UN", quantity: 1, classification: "Recomendado", availability: "Disponível", isUnregistered: false }] as any,
        observations: "Visita técnica já aprovada para o próximo turno da manhã.",
        attachments: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "os-12",
        number: "OS-2026-0012",
        unitId: "u-sp",
        locationId: "loc-9",
        assetId: "ast-9",
        assetIds: ["ast-9"],
        type: "Corretiva",
        categoryId: "cat-5",
        priority: "Baixa",
        technicalDescription: "Reaperto e substituição de rodízios em cadeiras da sala de treinamento.",
        status: "Nova",
        operationalSituation: "Nova",
        checklist: [],
        materials: [],
        observations: "Ordem gerada para acomodar agenda de treinamento do próximo mês.",
        attachments: [],
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        active: true
      },
      {
        id: "os-13",
        number: "OS-2026-0013",
        unitId: "u-mg",
        locationId: "loc-14",
        assetId: "ast-13",
        assetIds: ["ast-13"],
        type: "Preventiva",
        categoryId: "cat-3",
        priority: "Média",
        technicalDescription: "Inspeção contratual do elevador social da Torre A.",
        status: "Em validação",
        operationalSituation: "Validação",
        providerId: "prov-2",
        checklist: [],
        materials: [],
        observations: "Aguardando envio do laudo e fotos pela empresa contratada.",
        attachments: [],
        createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        active: true
      },
      {
        id: "os-14",
        number: "OS-2026-0014",
        unitId: "u-ba",
        locationId: "loc-11",
        assetId: "ast-11",
        assetIds: ["ast-11"],
        type: "Preventiva",
        categoryId: "cat-1",
        priority: "Média",
        technicalDescription: "Higienização e revisão do split da recepção Salvador.",
        status: "Material liberado",
        operationalSituation: "Planejamento",
        responsibleId: "usr-12",
        checklist: [],
        materials: [{ id: "omat-12", materialId: "mat-12", description: "Filtro secador linha liquida", type: "UN", quantity: 1, classification: "Recomendado", availability: "Liberado", isUnregistered: false }] as any,
        observations: "Material já reservado para execução no próximo ciclo.",
        attachments: [],
        createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        active: true
      }
    ];
    orders.push(
      { id: "os-15", number: "OS-2026-0015", requestId: "req-10", unitId: "u-sp", locationId: "loc-9", assetId: "ast-17", assetIds: ["ast-17"], type: "Corretiva", categoryId: "cat-1", priority: "Alta", technicalDescription: "Diagnosticar falha de refrigeração do split da sala de treinamento.", status: "Aguardando material", operationalSituation: "Planejamento", responsibleId: "usr-11", checklist: [], materials: [{ id: "omat-15", materialId: "mat-13", description: "Sensor de temperatura NTC", type: "UN", quantity: 2, classification: "Obrigatório", availability: "Parcialmente disponível", isUnregistered: false }] as any, observations: "Sala com agenda intensa de capacitações na próxima semana.", attachments: [], createdAt: isoFromNow(-3, 10), updatedAt: isoFromNow(-3, 12), active: true },
      { id: "os-16", number: "OS-2026-0016", requestId: "req-11", unitId: "u-df", locationId: "loc-2", assetId: "ast-14", assetIds: ["ast-14"], type: "Corretiva", categoryId: "cat-4", priority: "Alta", technicalDescription: "Substituir componentes de vedação e flange do reservatório superior.", status: "Aguardando material", operationalSituation: "Planejamento", responsibleId: "usr-4", checklist: [], materials: [{ id: "omat-16", materialId: "mat-18", description: "Flange reservatório 60 mm", type: "UN", quantity: 2, classification: "Obrigatório", availability: "Indisponível", isUnregistered: false }] as any, observations: "Risco de perda de pressão e extravasamento intermitente.", attachments: [], createdAt: isoFromNow(-6, 9), updatedAt: isoFromNow(-6, 10), active: true },
      { id: "os-17", number: "OS-2026-0017", requestId: "req-15", unitId: "u-mg", locationId: "loc-14", assetId: "ast-23", assetIds: ["ast-23"], type: "Corretiva", categoryId: "cat-3", priority: "Alta", technicalDescription: "Substituir fecho mecânico da porta do elevador de serviço.", status: "Aguardando material", operationalSituation: "Planejamento", providerId: "prov-2", checklist: [], materials: [{ id: "omat-17", materialId: "mat-20", description: "Fecho porta elevador", type: "UN", quantity: 1, classification: "Obrigatório", availability: "Indisponível", isUnregistered: false }] as any, observations: "Atendimento depende da entrega do componente original.", attachments: [], createdAt: isoFromNow(-7, 8), updatedAt: isoFromNow(-5, 16), active: true },
      { id: "os-18", number: "OS-2026-0018", unitId: "u-mg", locationId: "loc-14", assetId: "ast-13", assetIds: ["ast-13"], type: "Corretiva", categoryId: "cat-3", priority: "Urgente", technicalDescription: "Avaliar falha intermitente da placa de comando do elevador social.", status: "Aguardando estoque", operationalSituation: "Planejamento", providerId: "prov-2", checklist: [], materials: [{ id: "omat-18", description: "Placa de comando elevador torre A", quantity: 1, classification: "Obrigatório", availability: "Aguardando validação", isUnregistered: true, justification: "Componente dedicado do fabricante." }] as any, observations: "Elevador com falha de chamada em horários de pico.", attachments: [], createdAt: isoFromNow(-9, 14), updatedAt: isoFromNow(-8, 8), active: true },
      { id: "os-19", number: "OS-2026-0019", requestId: "req-16", unitId: "u-df", locationId: "loc-1", assetId: "ast-25", assetIds: ["ast-25"], type: "Corretiva", categoryId: "cat-5", priority: "Baixa", technicalDescription: "Trocar braço de poltrona danificada da recepção principal.", status: "Material liberado", operationalSituation: "Planejamento", responsibleId: "usr-4", checklist: [], materials: [{ id: "omat-19", materialId: "mat-16", description: "Braço poltrona recepção", type: "UN", quantity: 1, classification: "Obrigatório", availability: "Liberado", isUnregistered: false }] as any, observations: "Item reservado aguardando encaixe na agenda da equipe de apoio.", attachments: [], createdAt: isoFromNow(-10, 12), updatedAt: isoFromNow(-9, 9), active: true },
      { id: "os-20", number: "OS-2026-0020", requestId: "req-17", unitId: "u-rj", locationId: "loc-6", assetId: "ast-15", assetIds: ["ast-15"], type: "Corretiva", categoryId: "cat-1", priority: "Média", technicalDescription: "Corrigir drenagem e revisar componentes elétricos do split da diretoria.", status: "Aguardando material", operationalSituation: "Planejamento", responsibleId: "usr-6", checklist: [], materials: [{ id: "omat-20", materialId: "mat-14", description: "Capacitor 35+5 uF", type: "UN", quantity: 2, classification: "Recomendado", availability: "Parcialmente disponível", isUnregistered: false }] as any, observations: "Ocorrência intermitente após expediente da diretoria.", attachments: [], createdAt: isoFromNow(-4, 8), updatedAt: isoFromNow(-4, 9), active: true },
      { id: "os-21", number: "OS-2026-0021", unitId: "u-ba", locationId: "loc-11", assetId: "ast-11", assetIds: ["ast-11"], type: "Preventiva", categoryId: "cat-1", priority: "Baixa", technicalDescription: "Limpeza leve do evaporador da recepção e inspeção visual.", status: "Concluída", operationalSituation: "Concluída", responsibleId: "usr-12", checklist: [], materials: [], observations: "Atendimento concluído sem necessidade de peças adicionais.", attachments: [], createdAt: isoFromNow(-20, 8), updatedAt: isoFromNow(-19, 11), completedAt: isoFromNow(-19, 11), active: true },
      { id: "os-22", number: "OS-2026-0022", unitId: "u-sp", locationId: "loc-8", assetId: "ast-8", assetIds: ["ast-8"], type: "Corretiva", categoryId: "cat-2", priority: "Urgente", technicalDescription: "Restabelecer estabilidade elétrica do rack principal após oscilação.", status: "Em execução", operationalSituation: "Em execução", responsibleId: "usr-11", checklist: [], materials: [], observations: "Equipe em atendimento conjunto com TI local.", attachments: [], createdAt: isoFromNow(-1, 8), updatedAt: isoFromNow(0, 9), plannedStart: isoFromNow(0, 8), plannedEnd: isoFromNow(0, 12), estimatedDurationMinutes: 240, scheduleStatus: "Programada", active: true },
      { id: "os-23", number: "OS-2026-0023", unitId: "u-df", locationId: "loc-1", assetId: "ast-20", assetIds: ["ast-20"], type: "Preditiva", categoryId: "cat-3", priority: "Média", technicalDescription: "Inspeção estrutural complementar da marquise da recepção.", status: "Programada", operationalSituation: "Programada", providerId: "prov-9", checklist: [], materials: [], observations: "Vinculada ao laudo estrutural vencido para atualização do cenário.", attachments: [], createdAt: isoFromNow(-3, 13), updatedAt: isoFromNow(-2, 9), plannedStart: isoFromNow(4, 10), plannedEnd: isoFromNow(4, 15), estimatedDurationMinutes: 300, scheduleStatus: "Programada", active: true },
      { id: "os-24", number: "OS-2026-0024", unitId: "u-mg", locationId: "loc-13", assetId: "ast-24", assetIds: ["ast-24"], type: "Corretiva", categoryId: "cat-1", priority: "Média", technicalDescription: "Atender alarme recorrente do split do escritório administrativo.", status: "Planejada", operationalSituation: "Planejamento", responsibleId: "usr-11", checklist: [], materials: [], observations: "Aguardar janela fora do horário comercial.", attachments: [], createdAt: isoFromNow(-5, 8), updatedAt: isoFromNow(-5, 10), active: true },
      { id: "os-25", number: "OS-2026-0025", unitId: "u-rj", locationId: "loc-10", assetId: "ast-21", assetIds: ["ast-21"], type: "Preventiva", categoryId: "cat-2", priority: "Alta", technicalDescription: "Termografia no painel das bombas de incêndio.", status: "Nova", operationalSituation: "Nova", checklist: [], materials: [], observations: "Geração automática por plano preventivo do mês.", attachments: [], createdAt: isoFromNow(-2, 15), updatedAt: isoFromNow(-2, 15), active: true },
      { id: "os-26", number: "OS-2026-0026", unitId: "u-sp", locationId: "loc-7", assetId: "ast-18", assetIds: ["ast-18"], type: "Corretiva", categoryId: "cat-4", priority: "Baixa", technicalDescription: "Revisar bebedouro pressurizado e eliminar gotejamento na torneira.", status: "Planejada", operationalSituation: "Planejamento", responsibleId: "usr-11", checklist: [], materials: [], observations: "Sem impacto operacional relevante, mas com recorrência de abertura.", attachments: [], createdAt: isoFromNow(-11, 10), updatedAt: isoFromNow(-10, 14), active: true },
    );
    this.set("gsi_work_orders", orders);

    const docs: Document[] = [
      {
        id: "doc-1",
        type: "cat-6",
        title: "Alvará de Funcionamento - DF",
        unitId: "u-df",
        issuer: "Prefeitura GDF",
        regulatoryBody: "Prefeitura do Distrito Federal",
        responsibleId: "usr-3",
        issueDate: new Date(Date.now() - 86400000 * 350).toISOString(),
        periodicity: "Anual",
        scope: "Periódico",
        requiresART: false,
        alertDaysAttention: 45,
        alertDaysCritical: 15,
        number: "ALV-12345/2025",
        status: "Atenção",
        value: 1840,
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
        regulatoryBody: "Corpo de Bombeiros Militar do Distrito Federal",
        responsibleId: "usr-3",
        issueDate: new Date(Date.now() - 86400000 * 115).toISOString(),
        periodicity: "Anual",
        scope: "Periódico",
        requiresART: true,
        alertDaysAttention: 60,
        alertDaysCritical: 20,
        number: "AVCB-8877/2026",
        status: "Vigente",
        value: 3200,
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
        regulatoryBody: "Conselho Regional de Engenharia",
        responsibleId: "usr-2",
        issueDate: new Date(Date.now() - 86400000 * 400).toISOString(),
        periodicity: "Anual",
        scope: "Periódico",
        requiresART: true,
        alertDaysAttention: 30,
        alertDaysCritical: 15,
        number: "LAU-SPDA-RJ-001",
        status: "Crítico",
        value: 2750,
        expirationDate: new Date(Date.now() - 86400000 * 10).toISOString(), // Vencido
        attachments: [],
        createdAt: new Date(Date.now() - 86400000 * 400).toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      }
    ];
    docs.push({ id: "doc-4", type: "Contrato", title: "Contrato de Manutenção de Elevadores", unitId: "u-df", issuer: "Elevadores Capital S/A", regulatoryBody: "Gestão de Contratos CNC", number: "CTR-ELV-2026", issueDate: new Date(Date.now() - 86400000 * 60).toISOString(), expirationDate: new Date(Date.now() + 86400000 * 90).toISOString(), periodicity: "Anual", scope: "Periódico", responsibleId: "usr-3", requiresART: false, alertDaysAttention: 45, alertDaysCritical: 15, status: "Vigente", value: 28800, attachments: [{ id: "att-doc-4", name: "contrato-elevadores-2026.pdf", type: "application/pdf", size: 726016, uploadedAt: new Date(Date.now() - 86400000 * 60).toISOString(), url: "https://exemplo.cnc.br/documentos/contrato-elevadores-2026.pdf" }], versions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), active: true });
    docs.push({ id: "doc-5", type: "Conta recorrente", title: "Renovação mensal de licença de descarte", unitId: "u-rj", issuer: "Prefeitura Municipal", regulatoryBody: "Controle Ambiental", number: "REC-AMB-RJ", periodicity: "Mensal", scope: "Recorrente", recurrenceDay: 5, responsibleId: "usr-2", requiresART: false, alertDaysAttention: 10, alertDaysCritical: 3, status: "Vigente", value: 480, attachments: [{ id: "att-doc-5", name: "licenca-descarte-competencia-atual.pdf", type: "application/pdf", size: 132096, uploadedAt: new Date(Date.now() - 86400000 * 12).toISOString(), url: "https://exemplo.cnc.br/documentos/licenca-descarte-rj.pdf" }], versions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), active: true });
    docs.push({ id: "doc-6", type: "cat-6", title: "Licença Sanitária - SP", unitId: "u-sp", issuer: "Vigilância Sanitária", regulatoryBody: "Prefeitura de São Paulo", responsibleId: "usr-13", issueDate: new Date(Date.now() - 86400000 * 120).toISOString(), periodicity: "Anual", scope: "Periódico", requiresART: false, alertDaysAttention: 45, alertDaysCritical: 15, number: "LIC-SAN-SP-2026", status: "Vigente", value: 930, expirationDate: new Date(Date.now() + 86400000 * 180).toISOString(), attachments: [], versions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), active: true });
    docs.push({ id: "doc-7", type: "cat-7", title: "Laudo de SPDA - DF", unitId: "u-df", issuer: "Engenharia Confiável", regulatoryBody: "CREA-DF", responsibleId: "usr-3", issueDate: new Date(Date.now() - 86400000 * 340).toISOString(), periodicity: "Anual", scope: "Periódico", requiresART: true, alertDaysAttention: 30, alertDaysCritical: 10, number: "LAU-SPDA-DF-002", status: "Atenção", value: 2950, expirationDate: new Date(Date.now() + 86400000 * 18).toISOString(), attachments: [], versions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), active: true });
    docs.push({ id: "doc-8", type: "cat-7", title: "ART de manutenção do Chiller A", unitId: "u-df", issuer: "Clima Técnica Brasília Ltda", regulatoryBody: "CREA-DF", responsibleId: "usr-2", issueDate: new Date(Date.now() - 86400000 * 20).toISOString(), periodicity: "Mensal", scope: "Recorrente", recurrenceDay: 25, requiresART: true, alertDaysAttention: 7, alertDaysCritical: 2, number: "ART-CHILLER-072026", status: "Vigente", value: 620, attachments: [], versions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), active: true });
    docs.push({ id: "doc-9", type: "cat-6", title: "Licença Ambiental Operacional - BA", unitId: "u-ba", issuer: "INEMA", regulatoryBody: "INEMA", responsibleId: "usr-13", issueDate: new Date(Date.now() - 86400000 * 500).toISOString(), periodicity: "Bienal", scope: "Periódico", requiresART: false, alertDaysAttention: 60, alertDaysCritical: 20, number: "LAO-BA-00991", status: "Crítico", value: 4120, expirationDate: new Date(Date.now() + 86400000 * 5).toISOString(), attachments: [], versions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), active: true });
    docs.push({ id: "doc-10", type: "cat-7", title: "Laudo de Elevadores - MG", unitId: "u-mg", issuer: "Elevadores Capital S/A", regulatoryBody: "CREA-MG", responsibleId: "usr-13", issueDate: new Date(Date.now() - 86400000 * 180).toISOString(), periodicity: "Semestral", scope: "Periódico", requiresART: true, alertDaysAttention: 20, alertDaysCritical: 7, number: "LAU-ELV-MG-2026-1", status: "Vigente", value: 2100, expirationDate: new Date(Date.now() + 86400000 * 75).toISOString(), attachments: [], versions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), active: true });
    docs.push({ id: "doc-11", type: "cat-6", title: "Habite-se Torre Administrativa MG", unitId: "u-mg", issuer: "Prefeitura Municipal", regulatoryBody: "Prefeitura de Belo Horizonte", responsibleId: "usr-13", issueDate: new Date(Date.now() - 86400000 * 1200).toISOString(), periodicity: "Único", scope: "Único", requiresART: false, alertDaysAttention: 0, alertDaysCritical: 0, number: "HAB-MG-771", status: "Sem validade definida", value: 0, attachments: [{ id: "att-doc-11", name: "habite-se-mg.pdf", type: "application/pdf", size: 210432, uploadedAt: new Date(Date.now() - 86400000 * 1200).toISOString(), url: "https://exemplo.cnc.br/documentos/habite-se-mg.pdf" }], versions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), active: true });
    docs.push({ id: "doc-12", type: "cat-7", title: "Laudo estrutural marquise recepção DF", unitId: "u-df", issuer: "Engenharia Alfa", regulatoryBody: "CREA-DF", responsibleId: "usr-3", issueDate: new Date(Date.now() - 86400000 * 700).toISOString(), periodicity: "Anual", scope: "Periódico", requiresART: true, alertDaysAttention: 20, alertDaysCritical: 7, number: "EST-DF-044", status: "Vencido", value: 3890, expirationDate: new Date(Date.now() - 86400000 * 30).toISOString(), attachments: [], versions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), active: true });
    docs.push(
      { id: "doc-13", type: "cat-6", title: "Licença de Operação do Gerador DF", unitId: "u-df", issuer: "IBRAM", regulatoryBody: "IBRAM", responsibleId: "usr-3", issueDate: isoFromNow(-420), periodicity: "Anual", scope: "Periódico", requiresART: false, alertDaysAttention: 30, alertDaysCritical: 10, number: "IBR-GER-DF-01", status: "Vigente", value: 1510, expirationDate: isoFromNow(40), attachments: [], versions: [], createdAt: isoFromNow(-400), updatedAt: isoFromNow(-2), active: true },
      { id: "doc-14", type: "cat-7", title: "Laudo de estanqueidade reservatório BA", unitId: "u-ba", issuer: "Bombas Nordeste Servicos", regulatoryBody: "CREA-BA", responsibleId: "usr-13", issueDate: isoFromNow(-190), periodicity: "Semestral", scope: "Periódico", requiresART: true, alertDaysAttention: 20, alertDaysCritical: 7, number: "LAU-EST-BA-01", status: "Atenção", value: 1740, expirationDate: isoFromNow(12), attachments: [], versions: [], createdAt: isoFromNow(-180), updatedAt: isoFromNow(-1), active: true },
      { id: "doc-15", type: "cat-6", title: "AVCB - MG", unitId: "u-mg", issuer: "CBMMG", regulatoryBody: "Corpo de Bombeiros Militar de Minas Gerais", responsibleId: "usr-13", issueDate: isoFromNow(-250), periodicity: "Anual", scope: "Periódico", requiresART: true, alertDaysAttention: 45, alertDaysCritical: 15, number: "AVCB-MG-2026", status: "Vigente", value: 2860, expirationDate: isoFromNow(95), attachments: [], versions: [], createdAt: isoFromNow(-245), updatedAt: isoFromNow(-2), active: true },
      { id: "doc-16", type: "cat-7", title: "Laudo de climatização coworking SP", unitId: "u-sp", issuer: "Frio Paulista Operacoes", regulatoryBody: "CREA-SP", responsibleId: "usr-10", issueDate: isoFromNow(-50), periodicity: "Trimestral", scope: "Periódico", requiresART: true, alertDaysAttention: 10, alertDaysCritical: 3, number: "PMOC-SP-COW-03", status: "Vigente", value: 890, expirationDate: isoFromNow(28), attachments: [], versions: [], createdAt: isoFromNow(-49), updatedAt: isoFromNow(-1), active: true },
      { id: "doc-17", type: "cat-6", title: "Cadastro de tanque auxiliar DF", unitId: "u-df", issuer: "Agência Reguladora", regulatoryBody: "Fiscalização Predial", responsibleId: "usr-2", issueDate: isoFromNow(-800), periodicity: "Único", scope: "Único", requiresART: false, alertDaysAttention: 0, alertDaysCritical: 0, number: "CAD-TQ-DF-09", status: "Sem validade definida", value: 0, attachments: [], versions: [], createdAt: isoFromNow(-790), updatedAt: isoFromNow(-10), active: true },
      { id: "doc-18", type: "cat-7", title: "ART painel CPD SP", unitId: "u-sp", issuer: "Tecno Predial MG", regulatoryBody: "CREA-SP", responsibleId: "usr-10", issueDate: isoFromNow(-15), periodicity: "Mensal", scope: "Recorrente", recurrenceDay: 20, requiresART: true, alertDaysAttention: 5, alertDaysCritical: 2, number: "ART-CPD-SP-072026", status: "Vigente", value: 540, attachments: [], versions: [], createdAt: isoFromNow(-14), updatedAt: isoFromNow(-1), active: true },
    );
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
        startDate: new Date(Date.now() - 86400000 * 62).toISOString(),
        lastExecution: new Date(Date.now() - 86400000 * 32).toISOString(),
        locationId: "loc-2",
        responsibleId: "usr-4",
        providerId: "prov-1",
        estimatedValue: 900,
        expectedWorkOrders: 12,
        alertDaysAttention: 10,
        alertDaysCritical: 3,
        scheduleStatus: "Atrasada",
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
        startDate: new Date(Date.now() - 86400000 * 350).toISOString(),
        lastExecution: new Date(Date.now() - 86400000 * 170).toISOString(),
        locationId: "loc-3",
        responsibleId: "usr-4",
        providerId: "prov-3",
        estimatedValue: 1500,
        expectedWorkOrders: 2,
        alertDaysAttention: 30,
        alertDaysCritical: 10,
        scheduleStatus: "Próxima",
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
        startDate: new Date(Date.now() - 86400000 * 45).toISOString(),
        lastExecution: new Date(Date.now() - 86400000 * 15).toISOString(),
        locationId: "loc-6",
        responsibleId: "usr-4",
        providerId: "prov-1",
        estimatedValue: 750,
        expectedWorkOrders: 12,
        alertDaysAttention: 10,
        alertDaysCritical: 3,
        scheduleStatus: "Próxima",
        nextExecution: new Date(Date.now() + 86400000 * 15).toISOString(), 
        checklist: checklistTemplates[0].items.map(i => ({...i})),
        status: "Ativo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "plan-4",
        code: "PM-EL-02",
        unitId: "u-rj",
        assetId: "ast-6",
        assetIds: ["ast-6"],
        categoryId: "cat-2",
        type: "Preventiva",
        description: "Inspeção bimestral do QDL da diretoria",
        periodicity: "bimestral",
        startDate: new Date(Date.now() - 86400000 * 140).toISOString(),
        lastExecution: new Date(Date.now() - 86400000 * 65).toISOString(),
        locationId: "loc-10",
        responsibleId: "usr-6",
        estimatedValue: 620,
        expectedWorkOrders: 6,
        alertDaysAttention: 12,
        alertDaysCritical: 4,
        scheduleStatus: "Próxima",
        nextExecution: new Date(Date.now() + 86400000 * 8).toISOString(),
        checklist: checklistTemplates[1].items.map(i => ({ ...i })),
        status: "Ativo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "plan-5",
        code: "PM-AC-03",
        unitId: "u-sp",
        assetId: "ast-7",
        assetIds: ["ast-7"],
        categoryId: "cat-1",
        type: "Preventiva",
        description: "PMOC mensal do VRF do coworking",
        periodicity: "mensal",
        startDate: new Date(Date.now() - 86400000 * 90).toISOString(),
        lastExecution: new Date(Date.now() - 86400000 * 28).toISOString(),
        locationId: "loc-7",
        responsibleId: "usr-11",
        providerId: "prov-6",
        estimatedValue: 1150,
        expectedWorkOrders: 12,
        alertDaysAttention: 10,
        alertDaysCritical: 3,
        scheduleStatus: "Próxima",
        nextExecution: new Date(Date.now() + 86400000 * 3).toISOString(),
        checklist: checklistTemplates[0].items.map(i => ({ ...i })),
        status: "Ativo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "plan-6",
        code: "PM-HD-01",
        unitId: "u-ba",
        assetId: "ast-10",
        assetIds: ["ast-10"],
        categoryId: "cat-4",
        type: "Preventiva",
        description: "Inspeção trimestral do conjunto motobomba",
        periodicity: "trimestral",
        startDate: new Date(Date.now() - 86400000 * 220).toISOString(),
        lastExecution: new Date(Date.now() - 86400000 * 100).toISOString(),
        locationId: "loc-12",
        responsibleId: "usr-12",
        providerId: "prov-7",
        estimatedValue: 980,
        expectedWorkOrders: 4,
        alertDaysAttention: 20,
        alertDaysCritical: 7,
        scheduleStatus: "Atrasada",
        nextExecution: new Date(Date.now() - 86400000 * 4).toISOString(),
        checklist: [],
        status: "Ativo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "plan-7",
        code: "PM-ELV-01",
        unitId: "u-mg",
        assetId: "ast-13",
        assetIds: ["ast-13"],
        categoryId: "cat-3",
        type: "Preventiva",
        description: "Manutenção contratual mensal do elevador social",
        periodicity: "mensal",
        startDate: new Date(Date.now() - 86400000 * 365).toISOString(),
        lastExecution: new Date(Date.now() - 86400000 * 31).toISOString(),
        locationId: "loc-14",
        providerId: "prov-2",
        estimatedValue: 2400,
        expectedWorkOrders: 12,
        alertDaysAttention: 7,
        alertDaysCritical: 2,
        scheduleStatus: "Próxima",
        nextExecution: new Date(Date.now() + 86400000 * 1).toISOString(),
        checklist: [],
        status: "Ativo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      }
    ];
    plans.push(
      { id: "plan-8", code: "PM-AC-04", unitId: "u-rj", assetId: "ast-15", assetIds: ["ast-15"], categoryId: "cat-1", type: "Preventiva", description: "PMOC mensal do split da diretoria RJ", periodicity: "mensal", startDate: isoFromNow(-180), lastExecution: isoFromNow(-35), nextExecution: isoFromNow(2), responsibleId: "usr-6", estimatedValue: 430, expectedWorkOrders: 12, alertDaysAttention: 7, alertDaysCritical: 2, scheduleStatus: "Próxima", checklist: checklistTemplates[0].items.map(i => ({ ...i })), status: "Ativo", createdAt: isoFromNow(-180), updatedAt: isoFromNow(-2), active: true },
      { id: "plan-9", code: "PM-EL-03", unitId: "u-sp", assetId: "ast-16", assetIds: ["ast-16"], categoryId: "cat-2", type: "Preventiva", description: "Inspeção trimestral do QDL da sala de treinamento", periodicity: "trimestral", startDate: isoFromNow(-220), lastExecution: isoFromNow(-70), nextExecution: isoFromNow(18), responsibleId: "usr-11", estimatedValue: 520, expectedWorkOrders: 4, alertDaysAttention: 15, alertDaysCritical: 5, scheduleStatus: "Próxima", checklist: checklistTemplates[1].items.map(i => ({ ...i })), status: "Ativo", createdAt: isoFromNow(-220), updatedAt: isoFromNow(-3), active: true },
      { id: "plan-10", code: "PM-HD-02", unitId: "u-df", assetId: "ast-14", assetIds: ["ast-14"], categoryId: "cat-4", type: "Preventiva", description: "Verificação mensal do reservatório superior", periodicity: "mensal", startDate: isoFromNow(-300), lastExecution: isoFromNow(-45), nextExecution: isoFromNow(-1), responsibleId: "usr-4", estimatedValue: 380, expectedWorkOrders: 12, alertDaysAttention: 7, alertDaysCritical: 2, scheduleStatus: "Atrasada", checklist: [], status: "Ativo", createdAt: isoFromNow(-300), updatedAt: isoFromNow(-1), active: true },
      { id: "plan-11", code: "PM-CIV-01", unitId: "u-df", assetId: "ast-20", assetIds: ["ast-20"], categoryId: "cat-3", type: "Preditiva", description: "Inspeção semestral da marquise e fachada de acesso", periodicity: "semestral", startDate: isoFromNow(-420), lastExecution: isoFromNow(-205), nextExecution: isoFromNow(12), providerId: "prov-9", estimatedValue: 2200, expectedWorkOrders: 2, alertDaysAttention: 20, alertDaysCritical: 7, scheduleStatus: "Próxima", checklist: [], status: "Ativo", createdAt: isoFromNow(-420), updatedAt: isoFromNow(-6), active: true },
      { id: "plan-12", code: "PM-MOB-01", unitId: "u-sp", assetId: "ast-9", assetIds: ["ast-9"], categoryId: "cat-5", type: "Preventiva", description: "Rodízio trimestral de inspeção do mobiliário de treinamento", periodicity: "trimestral", startDate: isoFromNow(-180), lastExecution: isoFromNow(-92), nextExecution: isoFromNow(1), responsibleId: "usr-11", estimatedValue: 180, expectedWorkOrders: 4, alertDaysAttention: 10, alertDaysCritical: 3, scheduleStatus: "Próxima", checklist: [], status: "Ativo", createdAt: isoFromNow(-180), updatedAt: isoFromNow(-4), active: true },
    );
    this.set("gsi_preventive_plans", plans);

    const maintenanceExecutions: MaintenanceExecution[] = [
      { id: "exec-demo-1", planId: "plan-1", workOrderId: "os-2", executedAt: new Date(Date.now() - 86400000 * 32).toISOString(), technicianId: "usr-4", status: "Concluída", notes: "Limpeza do condensador, inspeção de pressão e troca parcial de filtro.", durationMinutes: 180, attachments: [], createdAt: new Date(Date.now() - 86400000 * 32).toISOString() },
      { id: "exec-demo-2", planId: "plan-2", workOrderId: "os-5", executedAt: new Date(Date.now() - 86400000 * 170).toISOString(), technicianId: "usr-4", status: "Concluída", notes: "Termografia realizada sem ponto crítico. Reaperto dos barramentos concluído.", durationMinutes: 240, attachments: [], createdAt: new Date(Date.now() - 86400000 * 170).toISOString() },
    ];
    this.set("gsi_maintenance_executions", maintenanceExecutions);

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
      },
      {
        id: "prov-6",
        name: "Frio Paulista Operacoes",
        contactName: "Camila Ferreira",
        phone: "(11) 94444-1111",
        email: "contato@friopaulista.com.br",
        specialty: "Climatização",
        unitId: "u-sp",
        status: "Ativo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "prov-7",
        name: "Bombas Nordeste Servicos",
        contactName: "Ricardo Vieira",
        phone: "(71) 93333-2222",
        email: "operacao@bombasnordeste.com.br",
        specialty: "Hidráulica",
        unitId: "u-ba",
        status: "Ativo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "prov-8",
        name: "Tecno Predial MG",
        contactName: "Gustavo Linhares",
        phone: "(31) 92222-3333",
        email: "contato@tecnopredialmg.com.br",
        specialty: "Elétrica",
        unitId: "u-mg",
        status: "Ativo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "prov-9",
        name: "Estrutural Engenharia Alfa",
        contactName: "Renata Moura",
        phone: "(61) 91111-4444",
        email: "engenharia@estruturalalfa.com.br",
        specialty: "Civil",
        unitId: "u-df",
        status: "Ativo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "prov-10",
        name: "Prime Facilities Integradas",
        contactName: "Eduardo Matos",
        phone: "(21) 98800-5555",
        email: "comercial@primefacilities.com.br",
        specialty: "Manutenção geral",
        unitId: "u-rj",
        status: "Ativo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      }
    ];
    providers.push(
      { id: "prov-11", name: "Otis Minas Operações", contactName: "Sergio Andrade", phone: "(31) 94455-6666", email: "mg@otis.com.br", specialty: "Elevadores", unitId: "u-mg", status: "Ativo", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), active: true },
      { id: "prov-12", name: "Clima Bahia Engenharia", contactName: "Vanessa Reis", phone: "(71) 95566-7777", email: "contato@climabahia.com.br", specialty: "Climatização", unitId: "u-ba", status: "Ativo", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), active: true },
      { id: "prov-13", name: "Infra Predial DF", contactName: "Marcelo Cunha", phone: "(61) 96677-8888", email: "marcelo@infrapredialdf.com.br", specialty: "Hidráulica", unitId: "u-df", status: "Ativo", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), active: true },
      { id: "prov-14", name: "Painéis Seguros RJ", contactName: "Tatiana Lopes", phone: "(21) 97788-9999", email: "contato@paineisrj.com.br", specialty: "Elétrica / Eng. Elétrica", unitId: "u-rj", status: "Ativo", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), active: true },
      { id: "prov-15", name: "Mobiliário Corporativo SP", contactName: "Julio Barreto", phone: "(11) 98899-0001", email: "vendas@mobiliariocorp.com.br", specialty: "Mobiliário", unitId: "u-sp", status: "Ativo", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), active: true },
    );
    this.set("gsi_providers", providers);
    // === INÍCIO MOCK AGENDA E EQUIPE (VISÒO SEMANAL) ===
    const now = new Date();
    const startOfWeekDate = new Date(now);
    const dayOfWeek = now.getDay();
    const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeekDate.setDate(diffToMonday);
    startOfWeekDate.setHours(0,0,0,0);
    
    const monday = new Date(startOfWeekDate);
    const tuesday = new Date(startOfWeekDate); tuesday.setDate(monday.getDate() + 1);
    const wednesday = new Date(startOfWeekDate); wednesday.setDate(monday.getDate() + 2);
    const thursday = new Date(startOfWeekDate); thursday.setDate(monday.getDate() + 3);
    const friday = new Date(startOfWeekDate); friday.setDate(monday.getDate() + 4);

    // Garantir técnicos com nomes claros
    const currentUsers = this.get("gsi_users");
    const tecs = [
      { id: "tec-1", name: "João Silva", email: "joao@gsi.com", role: "Executor/Técnico", active: true },
      { id: "tec-2", name: "Ana Costa", email: "ana@gsi.com", role: "Executor/Técnico", active: true },
      { id: "tec-3", name: "Carlos Souza", email: "carlos@gsi.com", role: "Executor/Técnico", active: true }
    ];
    
    tecs.forEach(t => {
      if (!currentUsers.find(u => u.id === t.id)) currentUsers.push(t);
    });
    this.set("gsi_users", currentUsers);

    // Ordens de Serviço distribuídas na semana atual
    const currentOrders = this.get("gsi_work_orders");
    
    const assignOrderSchedule = (
      index: number,
      day: Date,
      startHour: number,
      startMinute: number,
      endHour: number,
      endMinute: number,
      options: {
        responsibleId?: string;
        providerId?: string;
        scheduleStatus: any;
        scheduleNotes?: string;
      },
    ) => {
      if (!currentOrders[index]) return;
      const start = new Date(day);
      start.setHours(startHour, startMinute, 0, 0);
      const end = new Date(day);
      end.setHours(endHour, endMinute, 0, 0);
      currentOrders[index].responsibleId = options.responsibleId;
      currentOrders[index].providerId = options.providerId;
      currentOrders[index].plannedStart = start.toISOString();
      currentOrders[index].plannedEnd = end.toISOString();
      currentOrders[index].estimatedDurationMinutes = Math.max(30, (end.getTime() - start.getTime()) / 60000);
      currentOrders[index].scheduleStatus = options.scheduleStatus;
      currentOrders[index].scheduleNotes = options.scheduleNotes;
    };

    // Segunda com vários cenários para validar sidebar + rolagem
    assignOrderSchedule(0, monday, 8, 0, 10, 0, {
      responsibleId: "tec-1",
      scheduleStatus: "Programada",
    });
    assignOrderSchedule(1, monday, 10, 30, 12, 0, {
      responsibleId: "tec-2",
      scheduleStatus: "Programada",
    });
    assignOrderSchedule(2, monday, 13, 0, 14, 30, {
      responsibleId: "tec-1",
      scheduleStatus: "Confirmada pelo técnico",
    });
    assignOrderSchedule(3, monday, 15, 0, 17, 0, {
      providerId: "prov-1",
      scheduleStatus: "Reprogramação necessária",
      scheduleNotes: "Falta de material",
    });
    assignOrderSchedule(5, monday, 17, 15, 18, 30, {
      responsibleId: "tec-2",
      scheduleStatus: "Programada",
    });
    assignOrderSchedule(6, monday, 18, 45, 20, 0, {
      providerId: "prov-2",
      scheduleStatus: "Programada",
    });

    // Demais dias continuam com ocorrências para leitura geral da agenda
    assignOrderSchedule(7, tuesday, 9, 0, 11, 30, {
      responsibleId: "tec-2",
      scheduleStatus: "Programada",
    });
    assignOrderSchedule(8, wednesday, 14, 0, 16, 0, {
      responsibleId: "tec-1",
      scheduleStatus: "Confirmada pelo técnico",
    });
    assignOrderSchedule(9, thursday, 10, 0, 15, 0, {
      providerId: "prov-9",
      scheduleStatus: "Programada",
    });

    // Uma OS não programada para manter o cenário lateral da agenda completa
    if (currentOrders[4]) {
      currentOrders[4].plannedStart = undefined;
      currentOrders[4].plannedEnd = undefined;
      currentOrders[4].estimatedDurationMinutes = undefined;
      currentOrders[4].scheduleStatus = "Não programada";
      currentOrders[4].responsibleId = undefined;
      currentOrders[4].providerId = undefined;
    }

    this.set("gsi_work_orders", currentOrders);

    const currentPlans = this.get("gsi_preventive_plans") || [];
    const planSchedules = [
      { index: 0, day: monday, hour: 11, minute: 15 },
      { index: 1, day: monday, hour: 14, minute: 45 },
      { index: 2, day: monday, hour: 16, minute: 30 },
      { index: 3, day: tuesday, hour: 13, minute: 30 },
    ];

    planSchedules.forEach(({ index, day, hour, minute }) => {
      if (!currentPlans[index]) return;
      const nextExecution = new Date(day);
      nextExecution.setHours(hour, minute, 0, 0);
      currentPlans[index].nextExecution = nextExecution.toISOString();
    });

    this.set("gsi_preventive_plans", currentPlans);

    // Indisponibilidades
    const unavails = [
      {
        id: "unav-1",
        technicianId: "tec-3",
        type: "Férias",
        startAt: new Date(monday).toISOString(),
        endAt: new Date(wednesday).toISOString(), // Carlos fora de seg a qua
        allDay: true,
        reason: "Férias regulares",
        createdBy: "usr-5",
        createdAt: new Date().toISOString()
      },
      {
        id: "unav-2",
        technicianId: "tec-2",
        type: "Treinamento",
        startAt: (function(){ const d = new Date(thursday); d.setHours(13,0,0,0); return d.toISOString(); })(),
        endAt: (function(){ const d = new Date(thursday); d.setHours(17,0,0,0); return d.toISOString(); })(),
        allDay: false,
        reason: "Treinamento NR10",
        createdBy: "usr-5",
        createdAt: new Date().toISOString()
      }
    ];
    this.set("gsi_technician_unavailabilities", unavails);

    this.logAudit("usr-5", "Mock data da agenda semanal e equipe gerado com sucesso");
    // === FIM MOCK AGENDA ===
  },
  logAudit(userId: string, action: string, entityId?: string, entityType?: string, oldValue?: any, newValue?: any) {
    const logs = this.get("gsi_audit_log");
    logs.push({
      id: crypto.randomUUID(),
      userId,
      action,
      entityId,
      entityType,
      oldValue,
      newValue,
      timestamp: new Date().toISOString()
    });
    this.set("gsi_audit_log", logs);
  },

  exportJSON() {
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("gsi_")) {
        data[key] = JSON.parse(localStorage.getItem(key) || "[]");
      }
    }
    return JSON.stringify({ version: VERSION, exportedAt: new Date().toISOString(), data });
  },

  importJSON(jsonString: string) {
    const parsed = JSON.parse(jsonString);
    if (!parsed.data) throw new Error("Invalid format");
    localStorage.clear();
    for (const key of Object.keys(parsed.data)) {
      localStorage.setItem(key, JSON.stringify(parsed.data[key]));
    }
  }
};
