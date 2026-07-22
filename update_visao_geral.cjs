const fs = require('fs');
let content = fs.readFileSync('src/pages/VisaoGeral.tsx', 'utf8');

content = content.replace('link="/preventivas"', 'link="/preventivas?status=Atrasada"');
content = content.replace('link="/ordens"', 'link="/ordens?status=Atrasadas"');
content = content.replace('title="OS Faltando Material" value={metrics.osAguardandoMaterial} icon={Package} colorClass="text-amber-600" link="/ordens"', 'title="OS Faltando Material" value={metrics.osAguardandoMaterial} icon={Package} colorClass="text-amber-600" link="/ordens?status=Aguardando+material"');
content = content.replace('title="Sem Responsável" value={metrics.servicosSemResponsavel} icon={UserX} colorClass="text-brand-600" link="/ordens"', 'title="Sem Responsável" value={metrics.servicosSemResponsavel} icon={UserX} colorClass="text-brand-600" link="/ordens?status=Sem+Responsável"');
content = content.replace('title="Reposição Necessária" value={metrics.reposicaoNecessaria} icon={ShoppingCart} colorClass="text-orange-600" link="/estoque"', 'title="Reposição Necessária" value={metrics.reposicaoNecessaria} icon={ShoppingCart} colorClass="text-orange-600" link="/estoque?status=Reposição+Necessária"');
content = content.replace('link="/documentos"', 'link="/documentos?status=Vencido"');
content = content.replace('title="Documentos Críticos" value={metrics.docCriticos} icon={AlertTriangle} colorClass="text-red-600" link="/documentos"', 'title="Documentos Críticos" value={metrics.docCriticos} icon={AlertTriangle} colorClass="text-red-600" link="/documentos?status=Crítico"');

// also fix decisions
content = content.replace('link: "/ordens" }', 'link: "/ordens?status=Sem+Responsável" }');
content = content.replace('link: "/ordens" }', 'link: "/ordens?status=Aguardando+material" }'); // check if there are two
content = content.replace('link: "/documentos" }', 'link: "/documentos?status=Crítico" }');

fs.writeFileSync('src/pages/VisaoGeral.tsx', content);
