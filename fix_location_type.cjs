const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');

content = content.replace(/description\?: string;/, 'description?: string;\n  area?: string;\n  floor?: string;\n  environment?: string;');

fs.writeFileSync('src/types/index.ts', content);
