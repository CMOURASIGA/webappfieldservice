const fs = require('fs');
let content = fs.readFileSync('src/pages/DetalheOrdem.tsx', 'utf8');

content = content.replace(/import \{ WorkOrder, Material, /g, 'import { WorkOrder, OSMaterial, ');
content = content.replace(/materials\?: Material\[\]/g, 'materials?: OSMaterial[]');

fs.writeFileSync('src/pages/DetalheOrdem.tsx', content);
