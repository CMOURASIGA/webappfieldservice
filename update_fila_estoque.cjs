const fs = require('fs');
let content = fs.readFileSync('src/pages/FilaEstoque.tsx', 'utf8');

const funcs = `
  const handleRegistrarEntrada = (req: StockRequest) => {
    if (confirm("Confirmar o recebimento e reserva de " + req.quantity + " unidades para esta OS?")) {
      const reqs = storageService.get("gsi_stock_requests");
      const idx = reqs.findIndex(r => r.id === req.id);
      if (idx !== -1) {
        reqs[idx].status = "Recebido";
        storageService.set("gsi_stock_requests", reqs);
        
        // Add movement
        const movs = storageService.get("gsi_stock_movements");
        movs.push({
          id: crypto.randomUUID(),
          type: "Entrada",
          materialId: req.materialId || "",
          quantity: req.quantity,
          workOrderId: req.workOrderId,
          unitId: "u-df", // simplify for MVP
          userId: "admin",
          date: new Date().toISOString()
        });
        storageService.set("gsi_stock_movements", movs);
        
        // Update stock
        if (req.materialId) {
          const mats = storageService.get("gsi_stock_materials");
          const mIdx = mats.findIndex(m => m.id === req.materialId);
          if (mIdx !== -1) {
             mats[mIdx].physicalBalance += req.quantity;
             mats[mIdx].reservedBalance += req.quantity;
             storageService.set("gsi_stock_materials", mats);
          }
        }
        
        // Update OS material status
        const ordersDB = storageService.get("gsi_work_orders");
        const oIdx = ordersDB.findIndex(o => o.id === req.workOrderId);
        if (oIdx !== -1 && ordersDB[oIdx].materials) {
           const matIdx = ordersDB[oIdx].materials.findIndex(m => m.materialId === req.materialId || m.description === req.suggestedDescription);
           if (matIdx !== -1) {
              ordersDB[oIdx].materials[matIdx].availability = "Reservado";
           }
           // Optionally move OS status to Material liberado if all are available
           ordersDB[oIdx].status = "Material liberado";
           storageService.set("gsi_work_orders", ordersDB);
        }
        
        loadData();
      }
    }
  };
`;

if (!content.includes('handleRegistrarEntrada')) {
  content = content.replace(/const pendingRequests/, funcs + '\n  const pendingRequests');
  content = content.replace(/<Button size="sm" variant="secondary" className="text-xs py-1 h-7">Registrar Entrada<\/Button>/g, 
                            '<Button size="sm" variant="secondary" onClick={() => handleRegistrarEntrada(req)} className="text-xs py-1 h-7">Registrar Entrada</Button>');
  fs.writeFileSync('src/pages/FilaEstoque.tsx', content);
}
