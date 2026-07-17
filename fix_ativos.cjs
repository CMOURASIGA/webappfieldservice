const fs = require('fs');
let content = fs.readFileSync('src/pages/Ativos.tsx', 'utf8');

// Also import Link
content = content.replace(/import \{ useNavigate \} from "react-router-dom";/g, 'import { useNavigate, Link } from "react-router-dom";');

content = content.replace(/<td className="px-6 py-4 text-right space-x-2">/, `<td className="px-6 py-4 text-right space-x-2">
                      <Link to={\`/ativos/\${asset.id}\`} className="text-blue-600 hover:text-blue-700 font-medium text-sm mr-2">Ver</Link>`);

fs.writeFileSync('src/pages/Ativos.tsx', content);
