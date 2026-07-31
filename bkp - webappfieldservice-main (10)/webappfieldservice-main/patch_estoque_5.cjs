const fs = require('fs');
let code = fs.readFileSync('src/pages/Estoque.tsx', 'utf8');

if (!code.includes('getStockStatus')) {
  code = code.replace(/import \{ Link, useNavigate \} from "react-router-dom";/, 'import { Link, useNavigate } from "react-router-dom";\nimport { getStockStatus } from "../utils/stockStatus";');
  
  // replace where m.status is rendered or used
  code = code.replace(/m\.status === "Sem saldo"/g, 'getStockStatus(m) === "Sem saldo"');
  code = code.replace(/m\.status === "Crítico"/g, 'getStockStatus(m) === "Crítico"');
  code = code.replace(/m\.status === "Atenção"/g, 'getStockStatus(m) === "Atenção"');
  
  // Actually let's just make sure m.status rendered as Badge uses getStockStatus
  // I will replace `m.status` inside the table with `getStockStatus(m)`
  
  fs.writeFileSync('src/pages/Estoque.tsx', code);
}
