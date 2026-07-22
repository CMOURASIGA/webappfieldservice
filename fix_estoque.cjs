const fs = require('fs');
let content = fs.readFileSync('src/pages/Estoque.tsx', 'utf8');

// Add import
if (!content.includes('CardFooterActions')) {
  content = content.replace(
    'import { Card, CardContent } from "../components/ui/Card";',
    'import { Card, CardContent, CardFooter } from "../components/ui/Card";\nimport { CardFooterActions } from "../components/ui/CardFooterActions";'
  );
}

// Replace the card footer
content = content.replace(
  /\{\/\* Ações dentro do card \*\/\}\s*<div className="mt-auto flex flex-wrap gap-2 pt-3 border-t border-slate-100">\s*<Button variant="outline" size="sm" className="flex-1 text-xs h-8">Abrir<\/Button>\s*<Button variant="outline" size="sm" className="flex-1 text-xs h-8">Solicitar<\/Button>\s*<\/div>/g,
  `<CardFooter className="pt-0 pb-4 px-4 border-t border-slate-100 mt-3 pt-3">
                  <CardFooterActions
                    onView={() => {}}
                    viewLabel="Abrir"
                  >
                    <Button variant="outline" size="sm" className="text-xs h-8">Solicitar</Button>
                  </CardFooterActions>
                </CardFooter>`
);

fs.writeFileSync('src/pages/Estoque.tsx', content);
