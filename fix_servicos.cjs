const fs = require('fs');
let content = fs.readFileSync('src/pages/Servicos.tsx', 'utf8');

if (!content.includes('CardFooterActions')) {
  content = content.replace(
    'import { Card, CardContent } from "../components/ui/Card";',
    'import { Card, CardContent, CardFooter } from "../components/ui/Card";\nimport { CardFooterActions } from "../components/ui/CardFooterActions";'
  );
}

content = content.replace(
  /<div className="pt-4 border-t border-slate-100 flex gap-2">\s*<Button variant="outline" className="flex-1" onClick=\{\(\) => navigate\(\`\/servicos\/\$\{req\.id\}\`\)\}>\s*Abrir\s*<\/Button>\s*\{req\.status !== "Convertida em ordem" && \(\s*<Button variant="default" className="flex-1" onClick=\{\(\) => navigate\("\/ordens\/nova"\)\}>\s*Gerar OS\s*<\/Button>\s*\)\}\s*<\/div>/g,
  `<CardFooter className="pt-0 pb-4 px-4 border-t border-slate-100 mt-3 pt-3">
                <CardFooterActions
                  viewLink={\`/servicos/\${req.id}\`}
                  viewLabel="Abrir"
                >
                  {req.status !== "Convertida em ordem" && (
                    <Button variant="default" size="sm" onClick={() => navigate("/ordens/nova")}>
                      Gerar OS
                    </Button>
                  )}
                </CardFooterActions>
              </CardFooter>`
);

fs.writeFileSync('src/pages/Servicos.tsx', content);
