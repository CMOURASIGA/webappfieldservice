const fs = require('fs');

function fixTitle(file) {
  let content = fs.readFileSync(file, 'utf8');

  const titleRegex = /<PageHeaderTitle>([^<]+)<\/PageHeaderTitle>/g;
  content = content.replace(titleRegex, '<PageHeaderTitle title="$1" />');

  fs.writeFileSync(file, content);
}

const files = [
  'src/pages/Ordens.tsx',
  'src/pages/GestaoServicosDashboard.tsx',
  'src/pages/estoque/MovimentacoesHistorico.tsx',
  'src/pages/Estoque.tsx',
  'src/pages/Documentos.tsx',
  'test_cnc.tsx' // This was mentioned in linter error
];

files.forEach(fixTitle);

