const fs = require('fs');
let content = fs.readFileSync('src/pages/Estoque.tsx', 'utf8');
content = content.replace(
  /<Button variant="secondary" className="flex items-center gap-2">\s*<PackageOpen className="w-4 h-4" \/>\s*Fila de Solicitações\s*<\/Button>/,
  '<Link to="/estoque/fila">\n            <Button variant="secondary" className="flex items-center gap-2">\n              <PackageOpen className="w-4 h-4" />\n              Fila de Solicitações\n            </Button>\n          </Link>'
);
fs.writeFileSync('src/pages/Estoque.tsx', content);
