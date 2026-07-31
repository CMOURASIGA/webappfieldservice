const fs = require('fs');
let content = fs.readFileSync('src/pages/Preventivas.tsx', 'utf8');

content = content.replace(/plan\.title/g, 'plan.description');
// plan also has `code`. Does it exist? It does (in the error log, the type has `code`).

fs.writeFileSync('src/pages/Preventivas.tsx', content);
