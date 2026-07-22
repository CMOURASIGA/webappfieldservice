const fs = require('fs');
let content = fs.readFileSync('src/pages/Ordens.tsx', 'utf8');

if (!content.includes('CardFooterActions')) {
  content = content.replace(
    'import { Card, CardContent } from "../components/ui/Card";',
    'import { Card, CardContent, CardFooter } from "../components/ui/Card";\nimport { CardFooterActions } from "../components/ui/CardFooterActions";'
  );
}

content = content.replace(
  /<div className="flex items-center justify-between border-t border-slate-100 pt-3">\s*<span className=\{\`px-2 py-1 text-xs font-medium rounded-full \$\{getPriorityColor\(order\.priority\)\}\`\}>\s*\{order\.priority\}\s*<\/span>\s*<Button variant="outline" size="sm" onClick=\{\(\) => navigate\(\`\/ordens\/\$\{order\.id\}\`\)\}>\s*Abrir OS\s*<\/Button>\s*<\/div>/g,
  `<CardFooter className="pt-0 pb-4 px-4 border-t border-slate-100 mt-3 pt-3">
                    <div className="flex w-full items-center justify-between">
                      <span className={\`px-2 py-1 text-xs font-medium rounded-full \${getPriorityColor(order.priority)}\`}>
                        {order.priority}
                      </span>
                      <CardFooterActions
                        viewLink={\`/ordens/\${order.id}\`}
                        viewLabel="Abrir OS"
                      />
                    </div>
                  </CardFooter>`
);

fs.writeFileSync('src/pages/Ordens.tsx', content);
