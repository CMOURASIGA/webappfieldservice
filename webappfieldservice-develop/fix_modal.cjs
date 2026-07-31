const fs = require('fs');
let content = fs.readFileSync('src/pages/preventivas/NovoPlanoModal.tsx', 'utf8');

content = content.replace(
  'command={{ emptyMessage: "Ativo não encontrado"\n              />',
  'command={{ emptyMessage: "Ativo não encontrado" }}\n              />'
);

fs.writeFileSync('src/pages/preventivas/NovoPlanoModal.tsx', content);
