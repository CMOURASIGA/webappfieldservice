import { Unit, Location, Asset, User, Request, WorkOrder, PreventivePlan, Document, Provider, AuditLog, Category, ChecklistTemplate } from "../types";

const VERSION = "1.0.0";

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
  },

  getDefaults<K extends keyof DB>(key: K): DB[K] {
    if (key === "gsi_data_version") return { version: VERSION } as any;
    return [] as any;
  },

  seed() {
    // Only seed if version is not present
    if (!localStorage.getItem("gsi_data_version")) {
      this.restoreDefaults();
    }
  },

  restoreDefaults() {
    localStorage.clear();
    this.set("gsi_data_version", { version: VERSION });

    const units: Unit[] = [
      { id: "u-df", name: "Brasília", sigla: "DF", city: "Brasília", active: true },
      { id: "u-rj", name: "Rio de Janeiro", sigla: "RJ", city: "Rio de Janeiro", active: true },
    ];
    this.set("gsi_units", units);

    const users: User[] = [
      { id: "usr-1", name: "Ana (Solicitante)", email: "ana@cnc.br", role: "Solicitante", unitId: "u-df", active: true },
      { id: "usr-2", name: "Carlos (Op GSI)", email: "carlos@cnc.br", role: "Operador GSI", unitId: "u-df", active: true },
      { id: "usr-3", name: "Mariana (Gestor GSI)", email: "mariana@cnc.br", role: "Gestor GSI", active: true },
      { id: "usr-4", name: "João (Técnico)", email: "joao@cnc.br", role: "Executor/Técnico", unitId: "u-df", active: true },
      { id: "usr-5", name: "Admin (Admin)", email: "admin@cnc.br", role: "Administrador", active: true },
    ];
    this.set("gsi_users", users);

    const locations: Location[] = [
      { id: "loc-1", unitId: "u-df", type: "Ambiente", name: "Recepção Principal", code: "DF-REC-01", active: true },
      { id: "loc-2", unitId: "u-df", type: "Ambiente", name: "Sala Técnica Ar", code: "DF-TEC-01", active: true },
      { id: "loc-3", unitId: "u-rj", type: "Ambiente", name: "Auditório", code: "RJ-AUD-01", active: true },
    ];
    this.set("gsi_locations", locations);

    const categories: Category[] = [
      { id: "cat-1", name: "Climatização", type: "Demanda", active: true },
      { id: "cat-2", name: "Elétrica", type: "Demanda", active: true },
      { id: "cat-3", name: "Civil", type: "Demanda", active: true },
      { id: "cat-4", name: "Alvará", type: "Documento", active: true },
    ];
    this.set("gsi_categories", categories);

    const checklistTemplates: ChecklistTemplate[] = [
      {
        id: "chk-1",
        name: "Checklist de ar-condicionado",
        categoryId: "cat-1",
        description: "Inspeção preventiva padrão",
        active: true,
        items: [
          { id: "ci-1", description: "Verificar filtros", required: true },
          { id: "ci-2", description: "Verificar nível de gás", required: true },
          { id: "ci-3", description: "Limpeza da condensadora", required: false },
        ]
      }
    ];
    this.set("gsi_checklist_templates", checklistTemplates);

    const assets: Asset[] = [
      { id: "ast-1", code: "AC-DF-001", name: "Ar Condicionado Central", category: "cat-1", unitId: "u-df", locationId: "loc-2", criticality: "Alta", status: "Ativo", active: true },
      { id: "ast-2", code: "EL-DF-001", name: "Quadro Elétrico Térreo", category: "cat-2", unitId: "u-df", locationId: "loc-1", criticality: "Alta", status: "Ativo", active: true },
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
        description: "O aparelho da recepção está pingando água no chão.",
        suggestedPriority: "Média",
        status: "Aberta",
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      }
    ];
    this.set("gsi_requests", requests);

    // Some pre-existing orders
    const orders: WorkOrder[] = [
      {
        id: "os-1",
        number: "OS-2026-0001",
        unitId: "u-df",
        locationId: "loc-2",
        assetId: "ast-1",
        type: "Corretiva",
        categoryId: "cat-1",
        priority: "Alta",
        technicalDescription: "Verificar vazamento no compressor.",
        status: "Em execução",
        responsibleId: "usr-4",
        checklist: [],
        observations: "",
        attachments: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      }
    ];
    this.set("gsi_work_orders", orders);

    const docs: Document[] = [
      {
        id: "doc-1",
        type: "cat-4",
        title: "Alvará de Funcionamento - DF",
        unitId: "u-df",
        issuer: "Prefeitura",
        number: "ALV-123",
        status: "A vencer",
        expirationDate: new Date(Date.now() + 86400000 * 15).toISOString(),
        attachments: [],
        createdAt: new Date().toISOString(),
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
        description: "Limpeza de filtros e verificação de gás",
        periodicity: "mensal",
        nextExecution: new Date(Date.now() + 86400000 * 5).toISOString(),
        checklist: [{ id: "c1", description: "Limpar filtros", required: false }],
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
        name: "Clima Técnica Brasília",
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
        name: "Elevadores Capital",
        contactName: "Maria Souza",
        phone: "(61) 98888-2222",
        email: "atendimento@elevadorescapital.com.br",
        specialty: "Elevadores",
        status: "Ativo", // undefined unitId means "Todas"
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      },
      {
        id: "prov-3",
        name: "Soluções Elétricas RJ",
        contactName: "Carlos Pereira",
        phone: "(21) 97777-3333",
        email: "contato@eletricarj.com.br",
        specialty: "Elétrica",
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
      }
    ];
    this.set("gsi_providers", providers);

    this.logAudit("usr-5", "Sistema restaurado para padrões");
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
