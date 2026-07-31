const fs = require('fs');
let content = fs.readFileSync('src/pages/Documentos.tsx', 'utf8');

content = content.replace(/!doc\.fileUrl/g, '!(doc.attachments && doc.attachments.length > 0)');

fs.writeFileSync('src/pages/Documentos.tsx', content);
