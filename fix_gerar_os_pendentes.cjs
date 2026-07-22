const fs = require('fs');
let content = fs.readFileSync('src/pages/Preventivas.tsx', 'utf8');

if (!content.includes('const handleGerarOSPendentes = () => {')) {
  // We need to add uuid if it's not imported
  if (!content.includes('v4 as uuidv4')) {
    content = content.replace(
      'import { format, isValid, parseISO } from "date-fns";',
      'import { format, isValid, parseISO } from "date-fns";\nimport { v4 as uuidv4 } from "uuid";'
    );
  }

  const func = `
  const handleGerarOSPendentes = () => {
    const allPlans = storageService.get("gsi_preventive_plans") || [];
    const allOrders = storageService.get("gsi_work_orders") || [];
    
    // Find a plan that needs an OS and doesn't have an active one
    let createdOsCount = 0;
    let newOrders = [...allOrders];
    
    for (const plan of allPlans) {
      if (plan.status !== "Ativo") continue;
      
      const status = getStatus(getComputedNextExecution(plan));
      if (status === "Atrasada" || status === "Próxima") {
        // Check if it already has an open OS for this plan
        const hasOpenOs = allOrders.some((o: any) => o.source === "Preventiva" && o.status !== "Concluída" && o.status !== "Cancelada" && o.unitId === plan.unitId && o.assetId === plan.assetId);
        
        if (!hasOpenOs) {
          const year = new Date().getFullYear();
          const nextNumber = newOrders.filter((o: any) => o.number.includes(year.toString())).length + 1;
          const number = \`OS-\${year}-\${nextNumber.toString().padStart(4, '0')}\`;
          
          const newOrder = {
            id: uuidv4(),
            number,
            unitId: plan.unitId,
            locationId: plan.locationId || "",
            categoryId: plan.categoryId,
            assetId: plan.assetId || "",
            priority: "Média",
            description: plan.description,
            technicalDescription: "Manutenção Preventiva gerada automaticamente.\\n" + (plan.instructions || ""),
            source: "Preventiva",
            status: "Aguardando atendimento",
            createdAt: new Date().toISOString(),
            createdBy: "Sistema",
            materials: [],
          };
          
          newOrders.push(newOrder);
          createdOsCount++;
        }
      }
    }
    
    if (createdOsCount > 0) {
      storageService.set("gsi_work_orders", newOrders);
      alert(\`OS criada com sucesso. Foram geradas \${createdOsCount} ordens de serviço.\`);
    } else {
      alert("Nenhuma manutenção pendente sem OS foi encontrada.");
    }
  };
  `;

  content = content.replace(
    'const filteredPlans = plans.filter(p => {',
    func + '\n  const filteredPlans = plans.filter(p => {'
  );

  content = content.replace(
    'onClick={() => alert(\'Rotina manual executada\')}',
    'onClick={handleGerarOSPendentes}'
  );

  fs.writeFileSync('src/pages/Preventivas.tsx', content);
}
