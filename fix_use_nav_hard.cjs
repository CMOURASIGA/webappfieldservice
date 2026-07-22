const fs = require('fs');

const files = [
  'src/pages/DetalheAtivo.tsx',
  'src/pages/DetalheLocal.tsx',
  'src/pages/FilaEstoque.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import \{ (.*) \} from "react-router-dom";/, (match, p1) => {
    if (!p1.includes('useNavigate')) {
      return `import { ${p1}, useNavigate } from "react-router-dom";`;
    }
    return match;
  });
  fs.writeFileSync(file, content);
});
