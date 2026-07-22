const fs = require('fs');

const files = [
  'src/pages/Ordens.tsx',
  'src/pages/Ativos.tsx',
  'src/pages/Prestadores.tsx',
  'src/pages/Servicos.tsx',
  'src/pages/Estoque.tsx',
  'src/pages/Preventivas.tsx',
  'src/pages/Documentos.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Regex to match <CardFooter>...</CardFooter>\s*</CardContent>
  const pattern = /(<CardFooter[\s\S]*?<\/CardFooter>)\s*<\/CardContent>/g;
  content = content.replace(pattern, '</CardContent>\n                $1');
  
  fs.writeFileSync(file, content);
});
