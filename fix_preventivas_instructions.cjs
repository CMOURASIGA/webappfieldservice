const fs = require('fs');
let content = fs.readFileSync('src/pages/Preventivas.tsx', 'utf8');

content = content.replace(
  /\(plan\.instructions \|\| ""\)/g,
  '""'
);

fs.writeFileSync('src/pages/Preventivas.tsx', content);
