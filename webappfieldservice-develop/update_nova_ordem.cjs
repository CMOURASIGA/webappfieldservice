const fs = require('fs');
let content = fs.readFileSync('src/pages/NovaOrdem.tsx', 'utf8');

if (!content.includes('useLocation')) {
  content = content.replace(
    'import { useNavigate } from "react-router-dom";',
    'import { useNavigate, useLocation } from "react-router-dom";'
  );

  content = content.replace(
    'const navigate = useNavigate();',
    'const navigate = useNavigate();\n  const location = useLocation();\n  const sourceState = location.state as any;'
  );

  content = content.replace(
    'defaultValues: {',
    'defaultValues: {\n      unitId: sourceState?.unitId || "",\n      locationId: sourceState?.locationId || "",\n      categoryId: sourceState?.categoryId || "",\n      assetId: sourceState?.assetId || "",\n      priority: sourceState?.priority || "Média",\n      description: sourceState?.description || "",\n      source: sourceState?.source || "Avulsa",'
  );

  fs.writeFileSync('src/pages/NovaOrdem.tsx', content);
}
