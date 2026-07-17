const fs = require('fs');
let content = fs.readFileSync('src/pages/Preventivas.tsx', 'utf8');

// Fix the handleGenerateOrders function
const newHandleGenerateOrders = `const handleGenerateOrders = () => {
    if (!currentUser) return;
    
    let generatedCount = 0;
    const allPlans = storageService.get("gsi_preventive_plans");
    const allOrders = storageService.get("gsi_work_orders");

    const updatedPlans = allPlans.map(plan => {
      // Check if plan is due (nextExecution is today or past)
      // AND check if there isn't already a pending OS for this plan
      const hasPendingOS = allOrders.some(o => o.preventivePlanId === plan.id && o.status !== "Concluída" && o.status !== "Cancelada");
      
      if (!hasPendingOS && plan.active && plan.status === "Ativo" && (isPast(parseISO(plan.nextExecution)) || isToday(parseISO(plan.nextExecution)))) {
        // Create new Work Order
        const newId = crypto.randomUUID ? crypto.randomUUID() : 'os-' + Math.random().toString(36).substring(2, 15);
        const newOrder: any = {
          id: newId,
          preventivePlanId: plan.id, // VÍNCULO IMPORTANTE
          number: \`OS-\${new Date().getFullYear()}-\${Math.floor(1000 + Math.random() * 9000)}\`,
          unitId: plan.unitId,
          locationId: plan.locationId || "",
          assetId: plan.assetId,
          type: "Preventiva",
          categoryId: plan.categoryId,
          priority: "Média", // Default for preventives
          providerId: plan.providerId,
          responsibleId: plan.responsibleId,
          technicalDescription: \`[Gerada via Plano: \${plan.code}] \${plan.description}\`,
          plannedDate: plan.nextExecution,
          deadline: new Date(new Date(plan.nextExecution).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days deadline
          status: "Planejada",
          checklist: plan.checklist.map(c => ({ 
            id: crypto.randomUUID ? crypto.randomUUID() : 'c-' + Math.random().toString(36).substring(2, 15), 
            description: c.description, 
            required: c.required 
          })),
          observations: "",
          attachments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          active: true,
        };
        
        allOrders.push(newOrder);
        storageService.logAudit(currentUser.id, "Ordem Preventiva Gerada", newOrder.id, "WorkOrder");
        generatedCount++;
        
        // NO LONGER UPDATING nextExecution HERE! It will be updated when the OS is completed.
      }
      return plan;
    });

    if (generatedCount > 0) {
      storageService.set("gsi_preventive_plans", updatedPlans); // Even though we didn't change them, just in case
      storageService.set("gsi_work_orders", allOrders);
      alert(\`\${generatedCount} ordem(ns) de serviço gerada(s) com sucesso!\`);
      loadData();
    } else {
      alert("Nenhum plano pendente de geração no momento ou já possuem OS em aberto.");
    }
  };`;

content = content.replace(/const handleGenerateOrders = \(\) => \{[\s\S]*?alert\("Nenhum plano pendente.*?;\n    \}\n  \};/, newHandleGenerateOrders);

fs.writeFileSync('src/pages/Preventivas.tsx', content);
