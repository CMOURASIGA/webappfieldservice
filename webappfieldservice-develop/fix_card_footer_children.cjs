const fs = require('fs');
let content = fs.readFileSync('src/components/ui/CardFooterActions.tsx', 'utf8');

if (!content.includes('children?: React.ReactNode;')) {
  content = content.replace(
    'printLabel?: string;',
    'printLabel?: string;\n  children?: React.ReactNode;'
  );

  content = content.replace(
    'printLabel = "Imprimir",',
    'printLabel = "Imprimir",\n  children,'
  );

  content = content.replace(
    '<div className="mr-auto">\n        {renderViewButton()}\n      </div>',
    '<div className="mr-auto">\n        {renderViewButton()}\n      </div>\n      {children}'
  );

  fs.writeFileSync('src/components/ui/CardFooterActions.tsx', content);
}
