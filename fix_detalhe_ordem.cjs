const fs = require('fs');
let content = fs.readFileSync('src/pages/DetalheOrdem.tsx', 'utf8');

// replace the updateChecklistItem logic
content = content.replace(/const updateChecklistItem = [\s\S]*?const handleAssign =/m, `const updateChecklistItem = (itemId: string, field: "result" | "observations", value: any) => {
    if (!order || !currentUser) return;
    const orders = storageService.get("gsi_work_orders");
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      const cIdx = orders[idx].checklist.findIndex(c => c.id === itemId);
      if (cIdx !== -1) {
        orders[idx].checklist[cIdx] = { ...orders[idx].checklist[cIdx], [field]: value };
        
        // Auto-generate Corretiva if result is "Não conforme" and it doesn't exist yet
        if (field === "result" && value === "Não conforme" && !orders[idx].checklist[cIdx].correctiveRequestId) {
          const itemDescription = orders[idx].checklist[cIdx].description;
          const requests = storageService.get("gsi_requests");
          
          // Generate a simple ID since uuid might not be imported here
          const newId = 'req-' + Math.random().toString(36).substring(2, 15);
          
          const newReq: any = {
            id: newId,
            protocol: \`DEM-NC-\${Math.floor(1000 + Math.random() * 9000)}\`,
            solicitanteId: currentUser.id,
            unitId: order.unitId,
            locationId: order.locationId,
            categoryId: order.categoryId,
            title: \`Não Conformidade: \${itemDescription}\`,
            description: \`Gerado automaticamente via checklist da OS \${order.number}. Item: \${itemDescription}.\`,
            suggestedPriority: "Média",
            status: "Aberta",
            attachments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            active: true
          };
          requests.push(newReq);
          storageService.set("gsi_requests", requests);
          
          orders[idx].checklist[cIdx].correctiveRequestId = newId;
          alert(\`Demanda corretiva gerada automaticamente: \${newReq.protocol}\`);
        }

        storageService.set("gsi_work_orders", orders);
        loadOrder();
      }
    }
  };

  const handleAssign =`);

// Also fix the message in the UI:
content = content.replace(/<p className="text-xs text-red-600 mt-1">\* Uma ordem corretiva será ou foi gerada para este item\.<\/p>/, 
`{item.correctiveRequestId ? (
  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
    * Demanda corretiva gerada. 
    <Link to={\`/demandas/\${item.correctiveRequestId}\`} className="underline hover:text-red-800">Ver Demanda</Link>
  </p>
) : (
  <p className="text-xs text-red-600 mt-1">* Uma demanda corretiva será gerada para este item.</p>
)}`);

fs.writeFileSync('src/pages/DetalheOrdem.tsx', content);
