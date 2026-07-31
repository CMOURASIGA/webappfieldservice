const fs = require('fs');
let code = fs.readFileSync('src/pages/Estoque.tsx', 'utf8');

if (!code.includes('NovaSolicitacaoModal')) {
  code = code.replace(/import \{ MovimentacaoModal \} from "\.\/estoque\/MovimentacaoModal";/, 'import { MovimentacaoModal } from "./estoque/MovimentacaoModal";\nimport { NovaSolicitacaoModal } from "./estoque/NovaSolicitacaoModal";');
  
  code = code.replace(/const \[showMovimentacao, setShowMovimentacao\] = useState\(false\);/, 'const [showMovimentacao, setShowMovimentacao] = useState(false);\n  const [showSolicitacao, setShowSolicitacao] = useState(false);');
  
  code = code.replace(/<Button variant="outline" className="gap-2"><PackageOpen className="w-4 h-4" \/> Solicitar Material<\/Button>/, '<Button variant="outline" className="gap-2" onClick={() => setShowSolicitacao(true)}><PackageOpen className="w-4 h-4" /> Solicitar Material</Button>');

  code = code.replace(/<MovimentacaoModal open=\{showMovimentacao\} onOpenChange=\{setShowMovimentacao\} onSuccess=\{loadData\} initialType=\{movimentacaoType\} \/>/, '<MovimentacaoModal open={showMovimentacao} onOpenChange={setShowMovimentacao} onSuccess={loadData} initialType={movimentacaoType} />\n      <NovaSolicitacaoModal open={showSolicitacao} onOpenChange={setShowSolicitacao} onSuccess={loadData} />');
  
  fs.writeFileSync('src/pages/Estoque.tsx', code);
}
