const fs = require('fs');
let content = fs.readFileSync('src/pages/Estoque.tsx', 'utf8');

// I need to use open instead of onClose, wait! The actual components exported from
// NovoMaterialModal.tsx, MovimentacaoModal.tsx, NovaSolicitacaoModal.tsx are:
// export const NovoMaterialModal = ({ open, onOpenChange, onSuccess }: Props)
content = content.replace(
  /\{showNovoMaterial && \([\s\S]*?\}\)/g,
  '<NovoMaterialModal open={showNovoMaterial} onOpenChange={setShowNovoMaterial} onSuccess={loadData} />'
);

content = content.replace(
  /\{showMovimentacao && \([\s\S]*?\}\)/g,
  '<MovimentacaoModal initialType={movimentacaoType} open={showMovimentacao} onOpenChange={setShowMovimentacao} onSuccess={loadData} />'
);

content = content.replace(
  /\{showSolicitacao && \([\s\S]*?\}\)/g,
  '<NovaSolicitacaoModal open={showSolicitacao} onOpenChange={setShowSolicitacao} onSuccess={loadData} />'
);

// wait, the previous script might have already replaced them and messed up or missed because of the regex.
// let's do a hard replace
const modalsStr = `      <NovoMaterialModal open={showNovoMaterial} onOpenChange={setShowNovoMaterial} onSuccess={loadData} />
      <MovimentacaoModal initialType={movimentacaoType} open={showMovimentacao} onOpenChange={setShowMovimentacao} onSuccess={loadData} />
      <NovaSolicitacaoModal open={showSolicitacao} onOpenChange={setShowSolicitacao} onSuccess={loadData} />
    </div>
  );
};`;

// replace everything after the closing div of the grid
content = content.replace(/<\/div>\s*\{showNovoMaterial[^]*?\}\s*<\/div>\s*\);\s*};\s*$/g, "</div>\n" + modalsStr);

// if it's already there but with onClose
content = content.replace(/<NovoMaterialModal onClose=\{[\s\S]*?\} \/>/g, '<NovoMaterialModal open={showNovoMaterial} onOpenChange={setShowNovoMaterial} onSuccess={loadData} />');
content = content.replace(/<MovimentacaoModal\s*type=\{movimentacaoType\}\s*onClose=\{[\s\S]*?\}\s*\/>/g, '<MovimentacaoModal initialType={movimentacaoType} open={showMovimentacao} onOpenChange={setShowMovimentacao} onSuccess={loadData} />');
content = content.replace(/<NovaSolicitacaoModal onClose=\{[\s\S]*?\} \/>/g, '<NovaSolicitacaoModal open={showSolicitacao} onOpenChange={setShowSolicitacao} onSuccess={loadData} />');

fs.writeFileSync('src/pages/Estoque.tsx', content);
