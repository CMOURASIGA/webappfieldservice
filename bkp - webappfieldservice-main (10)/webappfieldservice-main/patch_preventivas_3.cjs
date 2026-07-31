const fs = require('fs');
let code = fs.readFileSync('src/pages/Preventivas.tsx', 'utf8');

if (!code.includes('NovoPlanoModal')) {
  code = code.replace(/import \{ Plus, Settings \} from "lucide-react";/, 'import { Plus, Settings } from "lucide-react";\nimport { NovoPlanoModal } from "./preventivas/NovoPlanoModal";');
  
  code = code.replace(/const loadData = \(\) => \{/, 'const [showNovoPlano, setShowNovoPlano] = useState(false);\n\n  const loadData = () => {');
  
  if (!code.includes('loadData')) {
     code = code.replace(/const getUnitName =/, 'const [showNovoPlano, setShowNovoPlano] = useState(false);\n  const loadData = () => {\n    setPlans(storageService.get("gsi_preventive_plans") || []);\n  };\n  const getUnitName =');
  }

  code = code.replace(/<Button variant="create" className="gap-2"><Plus className="w-4 h-4" \/> Novo Plano<\/Button>/, '<Button variant="create" className="gap-2" onClick={() => setShowNovoPlano(true)}><Plus className="w-4 h-4" /> Novo Plano</Button>');
  
  code = code.replace(/<\/div>\n    <\/div>\n  \);\n\};/, '</div>\n\n      <NovoPlanoModal open={showNovoPlano} onOpenChange={setShowNovoPlano} onSuccess={loadData} />\n    </div>\n  );\n};');
  
  fs.writeFileSync('src/pages/Preventivas.tsx', code);
}
