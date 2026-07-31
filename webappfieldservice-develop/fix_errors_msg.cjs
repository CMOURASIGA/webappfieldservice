const fs = require('fs');
const files = [
  'src/pages/estoque/NovoMaterialModal.tsx',
  'src/pages/estoque/NovaSolicitacaoModal.tsx',
  'src/pages/estoque/MovimentacaoModal.tsx',
  'src/pages/preventivas/NovoPlanoModal.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\{errors\.([a-zA-Z0-9_]+)\.message\}/g, '{errors.$1.message as string}');
    fs.writeFileSync(file, content);
  }
});
