const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import { Estoque }')) {
    content = content.replace(/import \{ VisaoGeral \} from "\.\/pages\/VisaoGeral";/, 
        'import { Estoque } from "./pages/Estoque";\nimport { VisaoGeral } from "./pages/VisaoGeral";');
        
    content = content.replace(/<Route path="ativos" element=\{<Ativos \/>\} \/>/, 
        '<Route path="estoque" element={<Estoque />} />\n            <Route path="ativos" element={<Ativos />} />');
        
    fs.writeFileSync('src/App.tsx', content);
}
