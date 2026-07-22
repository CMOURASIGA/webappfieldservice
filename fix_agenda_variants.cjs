const fs = require('fs');
let content = fs.readFileSync('src/pages/Agenda.tsx', 'utf8');

content = content.replace(/variant="(default|outline)"/g, (match, p1) => {
  return p1 === 'default' ? 'variant="primary"' : 'variant="secondary"';
});

// find multiple attributes
content = content.replace(/variant="[^"]*"\s*variant="[^"]*"/g, 'variant="primary"');

fs.writeFileSync('src/pages/Agenda.tsx', content);
