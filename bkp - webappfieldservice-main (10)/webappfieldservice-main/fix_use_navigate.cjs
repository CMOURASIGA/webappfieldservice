const fs = require('fs');

const files = [
  'src/pages/DetalheAtivo.tsx',
  'src/pages/DetalheLocal.tsx',
  'src/pages/FilaEstoque.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('useNavigate')) {
    content = content.replace(
      'import { useParams } from "react-router-dom";',
      'import { useParams, useNavigate } from "react-router-dom";'
    );
    if (!content.includes('import { useParams')) {
      content = content.replace(
        'import { Link } from "react-router-dom";',
        'import { Link, useNavigate } from "react-router-dom";'
      );
    }
  }
  fs.writeFileSync(file, content);
});
