const fs = require('fs');

// Servicos.tsx
let servicos = fs.readFileSync('src/pages/Servicos.tsx', 'utf8');
servicos = servicos.replace(
  'navigate("/ordens/nova")',
  'navigate("/ordens/nova", { state: { source: "Solicitação", description: req.description, unitId: req.unitId, locationId: req.locationId, categoryId: req.categoryId, priority: req.suggestedPriority, sourceId: req.id } })'
);
fs.writeFileSync('src/pages/Servicos.tsx', servicos);

// DetalhePreventiva.tsx
let preventiva = fs.readFileSync('src/pages/DetalhePreventiva.tsx', 'utf8');
preventiva = preventiva.replace(
  'navigate("/ordens/nova")',
  'navigate("/ordens/nova", { state: { source: "Preventiva", description: plan.description, unitId: plan.unitId, locationId: plan.locationId || "", categoryId: plan.categoryId, assetId: plan.assetId || "", priority: "Alta", sourceId: plan.id } })'
);
fs.writeFileSync('src/pages/DetalhePreventiva.tsx', preventiva);

// DetalheServico.tsx might also have it
let detalheServico = fs.readFileSync('src/pages/DetalheServico.tsx', 'utf8');
if (detalheServico.includes('navigate("/ordens/nova")')) {
  detalheServico = detalheServico.replace(
    /navigate\("\/ordens\/nova"\)/g,
    'navigate("/ordens/nova", { state: { source: "Solicitação", description: req.description, unitId: req.unitId, locationId: req.locationId, categoryId: req.categoryId, priority: req.suggestedPriority, sourceId: req.id } })'
  );
  fs.writeFileSync('src/pages/DetalheServico.tsx', detalheServico);
}

