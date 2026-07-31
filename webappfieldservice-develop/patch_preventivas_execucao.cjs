const fs = require('fs');
let code = fs.readFileSync('src/pages/Preventivas.tsx', 'utf8');

if (!code.includes('RegistroExecucaoModal')) {
  code = code.replace(/import \{ NovoPlanoModal \} from "\.\/preventivas\/NovoPlanoModal";/, 'import { NovoPlanoModal } from "./preventivas/NovoPlanoModal";\nimport { RegistroExecucaoModal } from "./ordens/RegistroExecucaoModal";');
  
  code = code.replace(/const \[showNovoPlano, setShowNovoPlano\] = useState\(false\);/, 'const [showNovoPlano, setShowNovoPlano] = useState(false);\n  const [showExecucao, setShowExecucao] = useState(false);\n  const [selectedPlan, setSelectedPlan] = useState<PreventivePlan | undefined>(undefined);');

  code = code.replace(/<Button variant="outline" size="sm" className="flex-1 text-xs h-8">Executar<\/Button>/, '<Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => { setSelectedPlan(plan); setShowExecucao(true); }}>Executar</Button>');
  
  code = code.replace(/<NovoPlanoModal open=\{showNovoPlano\} onOpenChange=\{setShowNovoPlano\} onSuccess=\{loadData\} \/>/, '<NovoPlanoModal open={showNovoPlano} onOpenChange={setShowNovoPlano} onSuccess={loadData} />\n      {selectedPlan && <RegistroExecucaoModal open={showExecucao} onOpenChange={setShowExecucao} onSuccess={loadData} plan={selectedPlan} />}');
  
  fs.writeFileSync('src/pages/Preventivas.tsx', code);
}
