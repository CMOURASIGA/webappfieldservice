const fs = require('fs');
let content = fs.readFileSync('src/pages/Ativos.tsx', 'utf8');

if (!content.includes('react-router-dom')) {
  content = content.replace('import React', 'import { Link } from "react-router-dom";\nimport React');
}

fs.writeFileSync('src/pages/Ativos.tsx', content);
