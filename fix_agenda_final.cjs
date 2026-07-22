const fs = require('fs');
let content = fs.readFileSync('src/pages/Agenda.tsx', 'utf8');

// For Badge
content = content.replace(/variant=\{t\.source === "provider" \? "secondary" : "default"\}/g, 'variant="default"');

// For Button
content = content.replace(/variant=\{viewMode === "Semana" \? "default" : "outline"\}/g, 'variant={viewMode === "Semana" ? "primary" : "secondary"}');
content = content.replace(/variant=\{viewMode === "Dia" \? "default" : "outline"\}/g, 'variant={viewMode === "Dia" ? "primary" : "secondary"}');
content = content.replace(/variant=\{viewMode === "Lista" \? "default" : "outline"\}/g, 'variant={viewMode === "Lista" ? "primary" : "secondary"}');
content = content.replace(/variant=\{viewMode === "Equipe" \? "default" : "outline"\}/g, 'variant={viewMode === "Equipe" ? "primary" : "secondary"}');

fs.writeFileSync('src/pages/Agenda.tsx', content);
