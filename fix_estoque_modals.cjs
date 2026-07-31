const fs = require('fs');
let content = fs.readFileSync('src/pages/Estoque.tsx', 'utf8');

// Insert modals right before the final </div>
const modals = `
      {showNovoMaterial && (
        <NovoMaterialModal onClose={() => { setShowNovoMaterial(false); loadData(); }} />
      )}
      {showMovimentacao && (
        <MovimentacaoModal 
          type={movimentacaoType} 
          onClose={() => { setShowMovimentacao(false); loadData(); }} 
        />
      )}
      {showSolicitacao && (
        <NovaSolicitacaoModal onClose={() => { setShowSolicitacao(false); loadData(); }} />
      )}
    </div>
  );
};`;

content = content.replace(/<\/div>\s*\);\s*};\s*$/, modals);

fs.writeFileSync('src/pages/Estoque.tsx', content);
