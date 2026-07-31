const fs = require('fs');

let content = fs.readFileSync('src/pages/Ativos.tsx', 'utf8');

// Add imports
if (!content.includes('CardFooterActions')) {
  content = content.replace(
    'import { Card, CardContent } from "../components/ui/Card";',
    'import { Card, CardContent, CardFooter } from "../components/ui/Card";\nimport { CardFooterActions } from "../components/ui/CardFooterActions";'
  );
}

// First replace for asset cards
content = content.replace(
  /<div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-2">[\s\S]*?<Link to={`\/ativos\/\$\{asset\.id\}`}>[\s\S]*?<Button variant="secondary" size="sm">Ver Detalhes<\/Button>[\s\S]*?<\/Link>[\s\S]*?<Button variant="secondary" size="sm" onClick=\{\(\) => handleOpenEdit\(asset\)\}>Editar<\/Button>[\s\S]*?<Button variant="secondary" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick=\{\(\) => handleDelete\(asset\.id\)\}>Excluir<\/Button>[\s\S]*?<\/div>/g,
  `<CardFooter className="pt-0 pb-5 px-5">
                    <CardFooterActions
                      viewLink={\`/ativos/\${asset.id}\`}
                      viewLabel="Ver detalhes"
                      onEdit={() => handleOpenEdit(asset)}
                      editLabel="Editar ativo"
                      onDelete={() => handleDelete(asset.id)}
                      deleteLabel="Inativar ativo"
                      isDeactivate={true}
                    />
                  </CardFooter>`
);

// Remove the pt-4 mt-4 from CardFooterActions since we will move it, or just use it.
// Oh wait, my CardFooterActions already has border-t and mt-4. Let's adjust CardFooterActions to remove it and let CardFooter handle it if needed.

// Second replace for location cards
content = content.replace(
  /<div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-2">[\s\S]*?<Link to={`\/locais\/\$\{loc\.id\}`}>[\s\S]*?<Button variant="secondary" size="sm">Ver Detalhes<\/Button>[\s\S]*?<\/Link>[\s\S]*?<Button variant="secondary" size="sm" onClick=\{\(\) => handleOpenEditLocation\(loc\)\}>Editar<\/Button>[\s\S]*?<Button variant="secondary" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick=\{\(\) => handleDeleteLocation\(loc\.id\)\}>Excluir<\/Button>[\s\S]*?<\/div>/g,
  `<CardFooter className="pt-0 pb-5 px-5">
                    <CardFooterActions
                      viewLink={\`/locais/\${loc.id}\`}
                      viewLabel="Ver detalhes"
                      onEdit={() => handleOpenEditLocation(loc)}
                      editLabel="Editar local"
                      onDelete={() => handleDeleteLocation(loc.id)}
                      deleteLabel="Inativar local"
                      isDeactivate={true}
                    />
                  </CardFooter>`
);

fs.writeFileSync('src/pages/Ativos.tsx', content);
