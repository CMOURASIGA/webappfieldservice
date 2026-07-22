const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('MovimentacoesHistorico')) {
  code = code.replace(/import \{ Estoque \} from "\.\/pages\/Estoque";/, 'import { Estoque } from "./pages/Estoque";\nimport { MovimentacoesHistorico } from "./pages/estoque/MovimentacoesHistorico";');
  code = code.replace(/<Route path="estoque" element=\{<Estoque \/>} \/>/, '<Route path="estoque" element={<Estoque />} />\n            <Route path="estoque/movimentacoes" element={<MovimentacoesHistorico />} />');
  fs.writeFileSync('src/App.tsx', code);
}
