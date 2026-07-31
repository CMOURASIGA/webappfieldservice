const fs = require('fs');
let content = fs.readFileSync('src/pages/Agenda.tsx', 'utf8');

content = content.replace(/className="p-2"\s+(onClick=\{[^}]+\})\s+className="([^"]+)"/g, '$1 className="p-2 $2"');

fs.writeFileSync('src/pages/Agenda.tsx', content);
