const fs = require('fs');
let content = fs.readFileSync('src/pages/Agenda.tsx', 'utf8');

content = content.replace(/title: \`OS: \$\{o\.title\}\`,/g, 'title: \`OS: \$\{o.number\}\`,');
fs.writeFileSync('src/pages/Agenda.tsx', content);

let vgContent = fs.readFileSync('src/pages/VisaoGeral.tsx', 'utf8');
vgContent = vgContent.replace(/\|\| r\.status === "Cancelada"/g, ''); // Cancelada is not a RequestStatus
fs.writeFileSync('src/pages/VisaoGeral.tsx', vgContent);
