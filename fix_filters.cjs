const fs = require('fs');

function addSearchParams(file, filterVar, defaultVal, paramName) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('useSearchParams')) {
    content = content.replace('useNavigate } from "react-router-dom"', 'useNavigate, useSearchParams } from "react-router-dom"');
  }

  const hookStr = `const [searchParams] = useSearchParams();\n  const initial${filterVar} = searchParams.get("${paramName}") || "${defaultVal}";\n  const [${filterVar}, set${filterVar.charAt(0).toUpperCase() + filterVar.slice(1)}] = useState(initial${filterVar});`;
  
  const regex = new RegExp(`const \\\[${filterVar}, set${filterVar.charAt(0).toUpperCase() + filterVar.slice(1)}\\\] = useState(?:<.*?>)?\\(.*?\\);`);
  
  if (regex.test(content)) {
    content = content.replace(regex, hookStr);
  } else {
    console.log("Could not find regex in", file);
  }
  
  fs.writeFileSync(file, content);
}

addSearchParams('src/pages/Preventivas.tsx', 'statusFilter', 'Todos', 'status');
addSearchParams('src/pages/Ordens.tsx', 'statusFilter', 'Todas', 'status');
addSearchParams('src/pages/Estoque.tsx', 'statusFilter', 'Todos', 'status');
addSearchParams('src/pages/Documentos.tsx', 'statusFilter', 'Todos', 'status');

