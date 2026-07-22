const fs = require('fs');
let content = fs.readFileSync('src/components/ui/CardFooterActions.tsx', 'utf8');

// add editLink
content = content.replace(
  '  onEdit?: () => void;',
  '  onEdit?: () => void;\n  editLink?: string;'
);

// modify onEdit rendering
content = content.replace(
  /\{onEdit && \([\s\S]*?<Button[\s\S]*?onClick=\{onEdit\}[\s\S]*?title=\{editLabel\}[\s\S]*?aria-label=\{editLabel\}[\s\S]*?>[\s\S]*?<Pencil className="w-4 h-4" \/>[\s\S]*?<\/Button>[\s\S]*?\)\}/,
  `{(onEdit || editLink) && (
        editLink ? (
          <Link to={editLink}>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-8 h-8 rounded p-0 text-slate-500 hover:text-slate-700"
              title={editLabel}
              aria-label={editLabel}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </Link>
        ) : (
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-8 h-8 rounded p-0 text-slate-500 hover:text-slate-700"
            onClick={onEdit}
            title={editLabel}
            aria-label={editLabel}
          >
            <Pencil className="w-4 h-4" />
          </Button>
        )
      )}`
);

fs.writeFileSync('src/components/ui/CardFooterActions.tsx', content);

// Now fix Prestadores.tsx to use editLink
let prestadores = fs.readFileSync('src/pages/Prestadores.tsx', 'utf8');
prestadores = prestadores.replace(
  'onEdit={canEdit ? () => window.location.href = `/prestadores/${provider.id}/editar` : undefined}',
  'editLink={canEdit ? `/prestadores/${provider.id}/editar` : undefined}'
);
fs.writeFileSync('src/pages/Prestadores.tsx', prestadores);
