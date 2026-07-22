const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('GestaoServicosDashboard')) {
  code = code.replace(/import \{ Servicos \} from "\.\/pages\/Servicos";/, 'import { Servicos } from "./pages/Servicos";\nimport { GestaoServicosDashboard } from "./pages/GestaoServicosDashboard";');
  code = code.replace(/<Route path="servicos" element={<Servicos \/>} \/>/, '<Route path="servicos" element={<GestaoServicosDashboard />} />\n            <Route path="servicos/corretivas" element={<Servicos />} />');
  fs.writeFileSync('src/App.tsx', code);
}
