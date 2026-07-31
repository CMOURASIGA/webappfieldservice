const fs = require('fs');
let content = fs.readFileSync('src/pages/Servicos.tsx', 'utf8');
content = content.replace(
  /navigate\("\/ordens\/nova", \{ state: \{ source: "Solicitação", description: req.description, unitId: req.unitId, locationId: req.locationId, categoryId: req.categoryId, priority: req.suggestedPriority, sourceId: req.id \} \}\)/g,
  'navigate("/ordens/nova")'
);
fs.writeFileSync('src/pages/Servicos.tsx', content);
