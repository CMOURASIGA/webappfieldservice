const fs = require('fs');
let content = fs.readFileSync('src/pages/agenda/NovoCompromissoModal.tsx', 'utf8');

content = content.replace(
  'endAt: data.endDate,',
  'endAt: data.endDate,\n      allDay: false,\n      createdBy: "Sistema",\n      createdAt: new Date().toISOString(),'
);

fs.writeFileSync('src/pages/agenda/NovoCompromissoModal.tsx', content);
