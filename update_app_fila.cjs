const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import { FilaEstoque }')) {
    content = content.replace(/import \{ Estoque \} from "\.\/pages\/Estoque";/, 
        'import { Estoque } from "./pages/Estoque";\nimport { FilaEstoque } from "./pages/FilaEstoque";');
        
    content = content.replace(/<Route path="estoque" element=\{<Estoque \/>\} \/>/, 
        '<Route path="estoque" element={<Estoque />} />\n            <Route path="estoque/fila" element={<FilaEstoque />} />');
        
    fs.writeFileSync('src/App.tsx', content);
}
