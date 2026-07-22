const fs = require('fs');

function fixStatus(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/status: "Ativo"(?: as const)?,/g, 'status: "Ativo" as "Ativo" | "Inativo",');
  fs.writeFileSync(file, content);
}

fixStatus('src/pages/EditarPrestador.tsx');
fixStatus('src/pages/NovoPrestador.tsx');

