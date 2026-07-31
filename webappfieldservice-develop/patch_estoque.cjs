const fs = require('fs');
let code = fs.readFileSync('src/pages/Estoque.tsx', 'utf8');

code = code.replace(/<PageHeaderActionsContainer>\s*<Button variant="outline" className="gap-2" onClick=\{\(\) => navigate\("\/estoque\/fila"\)\}>\s*<ShoppingCart className="w-4 h-4" \/>\s*Solicitações\s*<\/Button>\s*<Button variant="create" className="gap-2" onClick=\{\(\) => setShowNovoMaterial\(true\)\}>\s*<Plus className="w-4 h-4" \/>\s*Novo Material\s*<\/Button>\s*<\/PageHeaderActionsContainer>\s*<\/PageHeader>\s*<div className="flex flex-wrap items-center gap-3 mb-4">\s*<Button variant="outline" className="gap-2" onClick=\{\(\) => \{ setMovimentacaoType\("Entrada"\); setShowMovimentacao\(true\); \}\}>\s*<ArrowRightLeft className="w-4 h-4" \/>\s*Registrar Entrada\s*<\/Button>\s*<Button variant="outline" className="gap-2" onClick=\{\(\) => \{ setMovimentacaoType\("Saída"\); setShowMovimentacao\(true\); \}\}>\s*<ArrowRightLeft className="w-4 h-4" \/>\s*Registrar Saída\s*<\/Button>\s*<Button variant="outline" className="gap-2" onClick=\{\(\) => setShowSolicitacao\(true\)\}>\s*<PackageOpen className="w-4 h-4" \/>\s*Solicitar Material\s*<\/Button>\s*<Button variant="outline" className="gap-2" onClick=\{\(\) => navigate\("\/estoque\/movimentacoes"\)\}>\s*<Search className="w-4 h-4" \/>\s*Consultar Movimentações\s*<\/Button>\s*<\/div>/g, 
`<PageHeaderActionsContainer>
          <Button variant="outline" className="gap-2" onClick={() => { setMovimentacaoType("Entrada"); setShowMovimentacao(true); }}><ArrowRightLeft className="w-4 h-4" /> Registrar Entrada</Button>
          <Button variant="outline" className="gap-2" onClick={() => { setMovimentacaoType("Saída"); setShowMovimentacao(true); }}><ArrowRightLeft className="w-4 h-4" /> Registrar Saída</Button>
          <Button variant="outline" className="gap-2" onClick={() => setShowSolicitacao(true)}><PackageOpen className="w-4 h-4" /> Solicitar Material</Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/estoque/movimentacoes")}><Search className="w-4 h-4" /> Consultar Movimentações</Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/estoque/fila")}><ShoppingCart className="w-4 h-4" /> Solicitações</Button>
          <Button variant="create" className="gap-2" onClick={() => setShowNovoMaterial(true)}><Plus className="w-4 h-4" /> Novo Material</Button>
        </PageHeaderActionsContainer>
      </PageHeader>`);

fs.writeFileSync('src/pages/Estoque.tsx', code);
