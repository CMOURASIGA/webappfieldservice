const fs = require('fs');
let content = fs.readFileSync('src/pages/DetalheOrdem.tsx', 'utf8');

const newUpdateStatus = `const updateStatus = (newStatus: WorkOrderStatus, logMsg: string) => {
    if (!order || !currentUser) return;
    const orders = storageService.get("gsi_work_orders");
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      const oldStatus = orders[idx].status;
      orders[idx].status = newStatus;
      orders[idx].updatedAt = new Date().toISOString();
      if (comment) {
        orders[idx].observations += \`\\n[\${new Date().toLocaleDateString()} - \${currentUser.name}]: \${comment}\`;
      }
      
      // se foi concluída e tem plano preventivo vinculado, atualizar o plano
      if (newStatus === "Concluída" && orders[idx].preventivePlanId) {
        const plans = storageService.get("gsi_preventive_plans");
        const pIdx = plans.findIndex(p => p.id === orders[idx].preventivePlanId);
        if (pIdx !== -1) {
          const plan = plans[pIdx];
          const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
          const addMonths = (date, months) => {
            const d = new Date(date);
            d.setMonth(d.getMonth() + months);
            return d;
          };
          const addYears = (date, years) => {
            const d = new Date(date);
            d.setFullYear(d.getFullYear() + years);
            return d;
          };
          
          let nextDate = new Date(plan.nextExecution);
          if (plan.periodicity === "diaria") nextDate = addDays(nextDate, 1);
          else if (plan.periodicity === "semanal") nextDate = addDays(nextDate, 7);
          else if (plan.periodicity === "mensal") nextDate = addMonths(nextDate, 1);
          else if (plan.periodicity === "trimestral") nextDate = addMonths(nextDate, 3);
          else if (plan.periodicity === "semestral") nextDate = addMonths(nextDate, 6);
          else if (plan.periodicity === "anual") nextDate = addYears(nextDate, 1);

          plans[pIdx].lastExecution = new Date().toISOString();
          plans[pIdx].nextExecution = nextDate.toISOString();
          plans[pIdx].updatedAt = new Date().toISOString();
          
          storageService.set("gsi_preventive_plans", plans);
        }
      }

      storageService.set("gsi_work_orders", orders);
      storageService.logAudit(currentUser.id, logMsg, order.id, "WorkOrder", oldStatus, newStatus);
      setComment("");
      setPauseReason("");
      setIsPausing(false);
      loadOrder();
    }
  };`;

content = content.replace(/const updateStatus = \([\s\S]*?loadOrder\(\);\n    \}\n  \};/, newUpdateStatus);
fs.writeFileSync('src/pages/DetalheOrdem.tsx', content);
