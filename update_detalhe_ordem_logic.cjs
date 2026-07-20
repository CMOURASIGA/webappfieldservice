const fs = require('fs');
let content = fs.readFileSync('src/pages/DetalheOrdem.tsx', 'utf8');

const newLogic = `
  const handleAddMaterialNew = () => {
    if (!order || !currentUser) return;
    const orders = storageService.get("gsi_work_orders");
    const idx = orders.findIndex(o => o.id === order.id);
    
    if (idx !== -1) {
      if (!orders[idx].materials) orders[idx].materials = [];
      
      if (matMode === "base" && selectedStockMatId) {
        const stockItem = stockMaterials.find(sm => sm.id === selectedStockMatId);
        if (!stockItem) return;
        
        let availability = "Indisponível";
        if (stockItem.availableBalance >= matQuantity) {
          availability = "Disponível";
        } else if (stockItem.availableBalance > 0) {
          availability = "Parcialmente disponível";
        }
        
        orders[idx].materials.push({
          id: crypto.randomUUID(),
          materialId: stockItem.id,
          description: stockItem.name,
          type: stockItem.unit,
          quantity: matQuantity,
          classification: matClass,
          availability: availability as any,
          isUnregistered: false,
        });
        
        if (availability !== "Disponível") {
           const reqs = storageService.get("gsi_stock_requests");
           reqs.push({
             id: crypto.randomUUID(),
             workOrderId: order.id,
             materialId: stockItem.id,
             isUnregistered: false,
             quantity: matQuantity - stockItem.availableBalance > 0 ? matQuantity - stockItem.availableBalance : matQuantity,
             priority: order.priority,
             requesterId: currentUser.id,
             assetId: order.assetId,
             locationId: order.locationId,
             status: "Aguardando análise",
             createdAt: new Date().toISOString(),
             updatedAt: new Date().toISOString()
           });
           storageService.set("gsi_stock_requests", reqs);
        }
      } else if (matMode === "unregistered" && matDescUnreg) {
        const matId = crypto.randomUUID();
        orders[idx].materials.push({
          id: matId,
          description: matDescUnreg,
          quantity: matQuantity,
          classification: matClass,
          availability: "Aguardando validação",
          isUnregistered: true,
          justification: matJustification
        });
        
        const reqs = storageService.get("gsi_stock_requests");
        reqs.push({
          id: crypto.randomUUID(),
          workOrderId: order.id,
          suggestedDescription: matDescUnreg,
          isUnregistered: true,
          quantity: matQuantity,
          justification: matJustification,
          priority: order.priority,
          requesterId: currentUser.id,
          assetId: order.assetId,
          locationId: order.locationId,
          status: "Aguardando análise",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        storageService.set("gsi_stock_requests", reqs);
      }
      
      // Update OS supplyStatus if it was not informed
      if (!orders[idx].supplyStatus) {
         orders[idx].supplyStatus = "Aguardando análise";
      }
      
      storageService.set("gsi_work_orders", orders);
      if (currentUser) {
         storageService.logAudit(currentUser.id, "Adicionou Material", order.id, "WorkOrder");
      }
      setAddingMaterial(false);
      setSelectedStockMatId("");
      setMatDescUnreg("");
      setMatJustification("");
      setMatQuantity(1);
      loadOrder();
    }
  };
`;

content = content.replace(/const handleAddMaterial = \(\) => \{[\s\S]*?loadOrder\(\);\n    \}\n  \};/, newLogic);

fs.writeFileSync('src/pages/DetalheOrdem.tsx', content);
