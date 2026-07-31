const fs = require('fs');
let content = fs.readFileSync('src/pages/Estoque.tsx', 'utf8');

const replacement = `
      <NovoMaterialModal open={showNovoMaterial} onOpenChange={setShowNovoMaterial} onSuccess={loadData} />
      <MovimentacaoModal initialType={movimentacaoType} open={showMovimentacao} onOpenChange={setShowMovimentacao} onSuccess={loadData} />
      <NovaSolicitacaoModal open={showSolicitacao} onOpenChange={setShowSolicitacao} onSuccess={loadData} />
    </div>
  );
};
`;

content = content.replace(/\{showNovoMaterial && \([\s\S]*?\}\)/, '');
content = content.replace(/\{showMovimentacao && \([\s\S]*?\}\)/, '');
content = content.replace(/\{showSolicitacao && \([\s\S]*?\}\)/, '');
content = content.replace(/<\/div>\s*\);\s*};\s*$/, replacement);

fs.writeFileSync('src/pages/Estoque.tsx', content);
