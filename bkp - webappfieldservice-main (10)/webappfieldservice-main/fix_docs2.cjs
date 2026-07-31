const fs = require('fs');
let content = fs.readFileSync('src/pages/Documentos.tsx', 'utf8');

const toRemove = `
        <div className="w-full md:w-48">
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="Todos">Todos os Status</option>
            <option value="Vigente">Vigentes</option>
            <option value="Atenção">Atenção</option>
            <option value="Crítico">Crítico</option>
            <option value="Vencido">Vencidos</option>
          </Select>
        </div>
      </div>
      <Card>
`;
content = content.replace(toRemove, '      <Card>\n');
content = content.replace(/<\/div>\n\s+<div className="w-full md:w-48">/, ""); // clean up if needed.

// Better yet, just remove lines 211-219
const lines = content.split('\n');
const fixedLines = [];
let inBadBlock = false;
for (let i=0; i<lines.length; i++) {
  if (lines[i].includes('<div className="w-full md:w-48">') && lines[i+1].includes('Select value={statusFilter}')) {
    inBadBlock = true;
  }
  if (!inBadBlock) {
    fixedLines.push(lines[i]);
  }
  if (inBadBlock && lines[i].includes('</div>') && lines[i-1].includes('</Select>')) {
    inBadBlock = false;
    // skip the extra </div>
    i++;
  }
}

fs.writeFileSync('src/pages/Documentos.tsx', fixedLines.join('\n'));
