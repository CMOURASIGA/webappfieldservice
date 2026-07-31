const fs = require('fs');
let content = fs.readFileSync('src/components/ui/CardFooterActions.tsx', 'utf8');

content = content.replace(
  '  onEdit,\n  editLabel = "Editar registro",',
  '  onEdit,\n  editLink,\n  editLabel = "Editar registro",'
);

// We should also replace the editLink condition to be inside the render block
fs.writeFileSync('src/components/ui/CardFooterActions.tsx', content);
