const fs = require('fs');
let content = fs.readFileSync('src/pages/Documentos.tsx', 'utf8');

content = content.replace(/d\.fileUrl/g, '(d.attachments && d.attachments.length > 0)');

fs.writeFileSync('src/pages/Documentos.tsx', content);
