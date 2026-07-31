const fs = require('fs');
let content = fs.readFileSync('src/pages/VisaoGeral.tsx', 'utf8');

// Fix preventivas
content = content.replace('link="/preventivas?status=Atrasada"', 'link="/preventivas?status=Atrasadas"');

// Fix ordens
content = content.replace('link="/ordens?status=Aguardando+material"', 'link="/ordens?status=Falta+Material"');
content = content.replace('link="/ordens?status=Sem+Responsável"', 'link="/ordens?status=Sem+Responsavel"');

// Fix decisions
content = content.replace('link: "/ordens?status=Sem+Responsável"', 'link: "/ordens?status=Sem+Responsavel"');
content = content.replace('link: "/ordens?status=Aguardando+material"', 'link: "/ordens?status=Falta+Material"');
content = content.replace('link: "/documentos?status=Crítico"', 'link: "/documentos?status=Críticos"');

// Fix estoque
content = content.replace('link="/estoque?status=Reposição+Necessária"', 'link="/estoque?status=Reposição"');

// Fix documentos
content = content.replace('link="/documentos?status=Vencido"', 'link="/documentos?status=Vencidos"');
content = content.replace('link="/documentos?status=Crítico"', 'link="/documentos?status=Críticos"');

fs.writeFileSync('src/pages/VisaoGeral.tsx', content);
