const fs = require('fs');
let content = fs.readFileSync('src/pages/Preventivas.tsx', 'utf8');

content = content.replace(
  /newOrders\.push\(newOrder\);/g,
  'newOrders.push(newOrder as any);'
);

fs.writeFileSync('src/pages/Preventivas.tsx', content);
