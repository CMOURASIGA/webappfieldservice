const fs = require('fs');
let content = fs.readFileSync('src/pages/Documentos.tsx', 'utf8');

content = content.replace(/d\.name/g, 'd.title');
content = content.replace(/d\.code/g, 'd.number');
content = content.replace(/d\.organ/g, 'd.issuer');
content = content.replace(/!d\.fileUrl/g, '!(d.attachments && d.attachments.length > 0)');
content = content.replace(/variant="outline"/g, 'variant="default"');

fs.writeFileSync('src/pages/Documentos.tsx', content);
