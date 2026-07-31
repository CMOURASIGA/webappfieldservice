const fs = require('fs');
let code = fs.readFileSync('src/pages/Estoque.tsx', 'utf8');

if (!code.includes('NovoMaterialModal')) {
  code = code.replace(/import \{ Link, useNavigate \} from "react-router-dom";/, 'import { Link, useNavigate } from "react-router-dom";\nimport { NovoMaterialModal } from "./estoque/NovoMaterialModal";');
  
  code = code.replace(/const loadData = \(\) => \{/, 'const [showNovoMaterial, setShowNovoMaterial] = useState(false);\n\n  const loadData = () => {');
  
  code = code.replace(/<Button variant="create" className="gap-2"><Plus className="w-4 h-4" \/> Novo Material<\/Button>/, '<Button variant="create" className="gap-2" onClick={() => setShowNovoMaterial(true)}><Plus className="w-4 h-4" /> Novo Material</Button>');
  
  code = code.replace(/<\/div>\n    <\/div>\n  \);\n\};/, '</div>\n\n      <NovoMaterialModal open={showNovoMaterial} onOpenChange={setShowNovoMaterial} onSuccess={loadData} />\n    </div>\n  );\n};');
  
  fs.writeFileSync('src/pages/Estoque.tsx', code);
}
