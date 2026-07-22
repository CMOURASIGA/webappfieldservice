const fs = require('fs');
let content = fs.readFileSync('src/pages/Estoque.tsx', 'utf8');

content = content.replace(/<Badge variant="outline"/g, '<Badge variant="default"');

fs.writeFileSync('src/pages/Estoque.tsx', content);
