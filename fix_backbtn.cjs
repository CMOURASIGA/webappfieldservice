const fs = require('fs');
let content = fs.readFileSync('src/components/ui/BackButton.tsx', 'utf8');
content = content.replace('className="mr-4" title="Voltar"', 'title="Voltar"');
fs.writeFileSync('src/components/ui/BackButton.tsx', content);
