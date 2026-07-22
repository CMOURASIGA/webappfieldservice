const fs = require('fs');
let content = fs.readFileSync('src/pages/Ordens.tsx', 'utf8');

content = content.replace(/order\.title/g, 'order.description');
content = content.replace(/order\.code/g, 'order.number');

fs.writeFileSync('src/pages/Ordens.tsx', content);
