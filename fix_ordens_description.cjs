const fs = require('fs');
let content = fs.readFileSync('src/pages/Ordens.tsx', 'utf8');

content = content.replace(/order\.description/g, 'order.technicalDescription');
content = content.replace(/<Badge variant="outline"/g, '<Badge variant="default"');

fs.writeFileSync('src/pages/Ordens.tsx', content);
