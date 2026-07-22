const fs = require('fs');
let content = fs.readFileSync('src/services/storageService.ts', 'utf8');

// Increment VERSION
content = content.replace(/const VERSION = "1.3.0";/, 'const VERSION = "1.4.0";');
content = content.replace(/const VERSION = "1.3.1";/, 'const VERSION = "1.4.0";'); // just in case

const injection = `
    // MOCK AGENDA E EQUIPE
    const now = new Date();
    // Reset to start of current hour for stable mock
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);
    const yesterday = new Date(today.getTime() - 86400000);
    const nextWeek = new Date(today.getTime() + 86400000 * 4);
    
    // Atualizar ordens para ter programação
    const currentOrders = this.get("gsi_work_orders");
    if (currentOrders.length > 0) {
      if (currentOrders[0]) {
        currentOrders[0].plannedStart = new Date(today.getTime() + 2 * 3600000).toISOString(); // 10:00
        currentOrders[0].plannedEnd = new Date(today.getTime() + 4 * 3600000).toISOString(); // 12:00
        currentOrders[0].estimatedDurationMinutes = 120;
        currentOrders[0].scheduleStatus = "Programada";
      }
      
      if (currentOrders[3]) {
         currentOrders[3].plannedStart = new Date(tomorrow.getTime() + 1 * 3600000).toISOString(); // 09:00
         currentOrders[3].plannedEnd = new Date(tomorrow.getTime() + 5 * 3600000).toISOString(); // 13:00
         currentOrders[3].estimatedDurationMinutes = 240;
         currentOrders[3].scheduleStatus = "Confirmada pelo técnico";
         currentOrders[3].responsibleId = "usr-4"; 
      }
      
      if (currentOrders[4]) {
         currentOrders[4].plannedStart = new Date(yesterday.getTime() + 6 * 3600000).toISOString(); // 14:00
         currentOrders[4].plannedEnd = new Date(yesterday.getTime() + 8 * 3600000).toISOString(); // 16:00
         currentOrders[4].estimatedDurationMinutes = 120;
         currentOrders[4].scheduleStatus = "Reprogramação necessária";
      }
      
      this.set("gsi_work_orders", currentOrders);
    }
    
    // Unavailabilities
    const unavails = [
      {
        id: "unav-1",
        technicianId: "usr-4",
        type: "Férias",
        startAt: new Date(nextWeek.getTime()).toISOString(),
        endAt: new Date(nextWeek.getTime() + 86400000 * 15).toISOString(),
        allDay: true,
        reason: "Férias regulares",
        createdBy: "usr-5",
        createdAt: new Date().toISOString()
      },
      {
        id: "unav-2",
        technicianId: "usr-6",
        type: "Treinamento",
        startAt: new Date(tomorrow.getTime() + 4 * 3600000).toISOString(),
        endAt: new Date(tomorrow.getTime() + 8 * 3600000).toISOString(),
        allDay: false,
        reason: "Treinamento NR10",
        createdBy: "usr-5",
        createdAt: new Date().toISOString()
      }
    ];
    this.set("gsi_technician_unavailabilities", unavails);

    this.logAudit("usr-5", "Sistema restaurado para dados de demonstração estendidos");
  },`;

content = content.replace(
  /this\.logAudit\("usr-5", "Sistema restaurado para dados de demonstração estendidos"\);\n  \},/,
  injection
);

fs.writeFileSync('src/services/storageService.ts', content);
