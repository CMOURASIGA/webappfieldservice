const fs = require('fs');
let code = fs.readFileSync('src/pages/Estoque.tsx', 'utf8');

code = code.replace(
  /const disponivel = mat.physicalBalance - mat.reservedBalance;\s+const reposicao = disponivel <= mat.minStock;/,
  `const disponivel = mat.physicalBalance - mat.reservedBalance;\n          const status = getStockStatus(mat);`
);

code = code.replace(
  /\{reposicao && <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 whitespace-nowrap">Reposição<\/Badge>\}/,
  `{status !== "Normal" && (
                    <Badge variant="outline" className={
                      status === "Sem saldo" ? "bg-red-50 text-red-700 border-red-200" :
                      status === "Crítico" ? "bg-orange-50 text-orange-700 border-orange-200" :
                      "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }>
                      {status}
                    </Badge>
                  )}`
);

fs.writeFileSync('src/pages/Estoque.tsx', code);
