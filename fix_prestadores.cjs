const fs = require('fs');

let content = fs.readFileSync('src/pages/Prestadores.tsx', 'utf8');

// Add imports
if (!content.includes('CardFooterActions')) {
  content = content.replace(
    'import { Card, CardContent } from "../components/ui/Card";',
    'import { Card, CardContent, CardFooter } from "../components/ui/Card";\nimport { CardFooterActions } from "../components/ui/CardFooterActions";'
  );
}

// Replace the div
content = content.replace(
  /<div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-2">[\s\S]*?<Link to={`\/prestadores\/\$\{provider\.id\}`}>[\s\S]*?<Button variant="secondary" size="sm">Ver Detalhes<\/Button>[\s\S]*?<\/Link>[\s\S]*?\{canEdit && \([\s\S]*?<Link to={`\/prestadores\/\$\{provider\.id\}\/editar`}>[\s\S]*?<Button variant="secondary" size="sm">Editar<\/Button>[\s\S]*?<\/Link>[\s\S]*?\)\}[\s\S]*?\{canToggle && \([\s\S]*?<Button[\s\S]*?onClick=\{\(\) => handleToggleStatus\(provider\.id, provider\.status\)\}[\s\S]*?\{provider\.status === "Ativo" \? "Inativar" : "Reativar"\}[\s\S]*?<\/Button>[\s\S]*?\)\}[\s\S]*?<\/div>/g,
  `<CardFooter className="pt-0 pb-5 px-5">
                      <CardFooterActions
                        viewLink={\`/prestadores/\${provider.id}\`}
                        viewLabel="Ver detalhes"
                        onEdit={canEdit ? () => window.location.href = \`/prestadores/\${provider.id}/editar\` : undefined}
                        editLabel="Editar prestador"
                        onDelete={canToggle ? () => handleToggleStatus(provider.id, provider.status) : undefined}
                        deleteLabel={provider.status === "Ativo" ? "Inativar prestador" : "Reativar prestador"}
                        isDeactivate={true}
                      />
                    </CardFooter>`
);

// We need to use `useNavigate` instead of `window.location.href` for better React routing if possible, but let's check what `Prestadores.tsx` has.
fs.writeFileSync('src/pages/Prestadores.tsx', content);
