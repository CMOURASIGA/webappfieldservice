const fs = require('fs');
let code = fs.readFileSync('src/pages/Estoque.tsx', 'utf8');

if (!code.includes('MovimentacaoModal')) {
  code = code.replace(/import \{ NovoMaterialModal \} from "\.\/estoque\/NovoMaterialModal";/, 'import { NovoMaterialModal } from "./estoque/NovoMaterialModal";\nimport { MovimentacaoModal } from "./estoque/MovimentacaoModal";');
  
  code = code.replace(/const \[showNovoMaterial, setShowNovoMaterial\] = useState\(false\);/, 'const [showNovoMaterial, setShowNovoMaterial] = useState(false);\n  const [showMovimentacao, setShowMovimentacao] = useState(false);\n  const [movimentacaoType, setMovimentacaoType] = useState<"Entrada" | "Saída" | "Ajuste">("Entrada");');
  
  code = code.replace(/<Button variant="outline" className="gap-2"><ArrowRightLeft className="w-4 h-4" \/> Registrar Entrada<\/Button>/, '<Button variant="outline" className="gap-2" onClick={() => { setMovimentacaoType("Entrada"); setShowMovimentacao(true); }}><ArrowRightLeft className="w-4 h-4" /> Registrar Entrada</Button>');
  
  code = code.replace(/<Button variant="outline" className="gap-2"><ArrowRightLeft className="w-4 h-4" \/> Registrar Saída<\/Button>/, '<Button variant="outline" className="gap-2" onClick={() => { setMovimentacaoType("Saída"); setShowMovimentacao(true); }}><ArrowRightLeft className="w-4 h-4" /> Registrar Saída</Button>');

  code = code.replace(/<NovoMaterialModal open=\{showNovoMaterial\} onOpenChange=\{setShowNovoMaterial\} onSuccess=\{loadData\} \/>/, '<NovoMaterialModal open={showNovoMaterial} onOpenChange={setShowNovoMaterial} onSuccess={loadData} />\n      <MovimentacaoModal open={showMovimentacao} onOpenChange={setShowMovimentacao} onSuccess={loadData} initialType={movimentacaoType} />');
  
  fs.writeFileSync('src/pages/Estoque.tsx', code);
}
