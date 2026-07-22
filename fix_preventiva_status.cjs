const fs = require('fs');
let content = fs.readFileSync('src/pages/DetalhePreventiva.tsx', 'utf8');

content = content.replace(
  /{ \.\.\.p, status: 'Inativo' }/g,
  "{ ...p, status: 'Inativo' as 'Ativo' | 'Inativo' }"
);

fs.writeFileSync('src/pages/DetalhePreventiva.tsx', content);
