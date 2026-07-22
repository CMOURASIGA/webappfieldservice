const fs = require('fs');
let content = fs.readFileSync('src/pages/Documentos.tsx', 'utf8');

if (!content.includes('CardFooterActions')) {
  content = content.replace(
    'import { Card, CardContent } from "../components/ui/Card";',
    'import { Card, CardContent, CardFooter } from "../components/ui/Card";\nimport { CardFooterActions } from "../components/ui/CardFooterActions";'
  );
}

content = content.replace(
  /<div className="flex gap-2 pt-3 border-t border-slate-100">\s*<Button variant="outline" size="sm" className="flex-1" onClick=\{\(\) => navigate\(\`\/documentos\/\$\{doc\.id\}\`\)\}>Abrir<\/Button>\s*<\/div>/g,
  `<CardFooter className="pt-0 pb-4 px-4 border-t border-slate-100 mt-3 pt-3">
                  <CardFooterActions
                    viewLink={\`/documentos/\${doc.id}\`}
                    viewLabel="Abrir"
                  />
                </CardFooter>`
);

fs.writeFileSync('src/pages/Documentos.tsx', content);
