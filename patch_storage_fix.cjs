const fs = require('fs');
let content = fs.readFileSync('src/services/storageService.ts', 'utf8');

// Increment VERSION to trigger reload again
content = content.replace(/const VERSION = "[\d\.]+";/, 'const VERSION = "1.5.1";');

// Find this.set("gsi_providers", providers);
const splitPoint = content.indexOf('this.set("gsi_providers", providers);');
if (splitPoint !== -1) {
  const afterSplit = content.substring(splitPoint);
  // Find where logAudit starts to keep it
  const logAuditStart = afterSplit.indexOf('logAudit(userId: string');
  
  if (logAuditStart !== -1) {
    const keepStart = content.substring(0, splitPoint + 'this.set("gsi_providers", providers);'.length);
    const keepEnd = '\n  },\n  ' + afterSplit.substring(logAuditStart);
    
    const mockInjection = `
    // === INÍCIO MOCK AGENDA E EQUIPE (VISÃO SEMANAL) ===
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
    
    // OS 1: João - Segunda 08:00 às 10:00
    if(currentOrders[0]) {
      const d = new Date(monday); d.setHours(8, 0, 0, 0);
      const end = new Date(d); end.setHours(10, 0, 0, 0);
      currentOrders[0].responsibleId = "tec-1";
      currentOrders[0].plannedStart = d.toISOString();
      currentOrders[0].plannedEnd = end.toISOString();
      currentOrders[0].estimatedDurationMinutes = 120;
      currentOrders[0].scheduleStatus = "Concluída";
    }

    // OS 2: Ana - Terça 09:00 às 12:00
    if(currentOrders[1]) {
      const d = new Date(tuesday); d.setHours(9, 0, 0, 0);
      const end = new Date(d); end.setHours(12, 0, 0, 0);
      currentOrders[1].responsibleId = "tec-2";
      currentOrders[1].plannedStart = d.toISOString();
      currentOrders[1].plannedEnd = end.toISOString();
      currentOrders[1].estimatedDurationMinutes = 180;
      currentOrders[1].scheduleStatus = "Programada";
    }

    // OS 3: João - Quarta 14:00 às 16:00
    if(currentOrders[2]) {
      const d = new Date(wednesday); d.setHours(14, 0, 0, 0);
      const end = new Date(d); end.setHours(16, 0, 0, 0);
      currentOrders[2].responsibleId = "tec-1";
      currentOrders[2].plannedStart = d.toISOString();
      currentOrders[2].plannedEnd = end.toISOString();
      currentOrders[2].estimatedDurationMinutes = 120;
      currentOrders[2].scheduleStatus = "Confirmada pelo técnico";
    }

    // OS 4: Carlos - Quinta 10:00 às 15:00 (Reprogramação)
    if(currentOrders[3]) {
      const d = new Date(thursday); d.setHours(10, 0, 0, 0);
      const end = new Date(d); end.setHours(15, 0, 0, 0);
      currentOrders[3].responsibleId = "tec-3";
      currentOrders[3].plannedStart = d.toISOString();
      currentOrders[3].plannedEnd = end.toISOString();
      currentOrders[3].estimatedDurationMinutes = 300;
      currentOrders[3].scheduleStatus = "Reprogramação necessária";
      currentOrders[3].scheduleNotes = "Falta de material";
    }

    // OS 5: Não programada (aparecerá na aba lateral 'Não Programadas')
    if(currentOrders[4]) {
      currentOrders[4].plannedStart = undefined;
      currentOrders[4].plannedEnd = undefined;
      currentOrders[4].estimatedDurationMinutes = undefined;
      currentOrders[4].scheduleStatus = "Não programada";
      currentOrders[4].responsibleId = undefined;
    }

    this.set("gsi_work_orders", currentOrders);

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
    // === FIM MOCK AGENDA ===`;

    content = keepStart + mockInjection + keepEnd;
    fs.writeFileSync('src/services/storageService.ts', content);
  }
}
