const fs = require('fs');
let content = fs.readFileSync('src/components/ui/Select.tsx', 'utf8');

content = content.replace(/<option value="" disabled>Selecione...<\/option>/, '{!children && <option value="" disabled>Selecione...</option>}');

fs.writeFileSync('src/components/ui/Select.tsx', content);
