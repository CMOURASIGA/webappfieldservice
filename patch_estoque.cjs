const fs = require('fs');
let code = fs.readFileSync('src/pages/Estoque.tsx', 'utf8');

// Replace imports
code = code.replace(/import \{ Button \} from "\.\.\/components\/ui\/Button";/, 'import { Button, PageHeader, PageHeaderTitle, PageHeaderTitleContent, PageHeaderActionsContainer } from "@cnc-ti/layout-basic";');

// Replace header
const oldHeader = `<div className="flex flex-wrap items-center gap-3">
        <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Material</Button>
        <Button variant="outline" className="gap-2"><ArrowRightLeft className="w-4 h-4" /> Registrar Entrada/Saída</Button>
        <Button variant="outline" className="gap-2"><PackageOpen className="w-4 h-4" /> Solicitar Material</Button>
        <Button variant="outline" className="gap-2" onClick={() => navigate("/estoque/fila")}><ShoppingCart className="w-4 h-4" /> Solicitações</Button>
      </div>

      <div>
        <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Materiais e Estoque</h1>
        <p className="text-sm text-slate-500">Gestão central de itens para manutenção.</p>
      </div>`;

const newHeader = `<PageHeader>
        <PageHeaderTitleContent>
          <PageHeaderTitle>Gestão de Estoque</PageHeaderTitle>
          <p className="text-sm text-slate-500">Controle materiais, movimentações e necessidades de reposição.</p>
        </PageHeaderTitleContent>
        <PageHeaderActionsContainer>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/estoque/fila")}><ShoppingCart className="w-4 h-4" /> Solicitações</Button>
          <Button variant="create" className="gap-2"><Plus className="w-4 h-4" /> Novo Material</Button>
        </PageHeaderActionsContainer>
      </PageHeader>
      
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Button variant="outline" className="gap-2"><ArrowRightLeft className="w-4 h-4" /> Registrar Entrada</Button>
        <Button variant="outline" className="gap-2"><ArrowRightLeft className="w-4 h-4" /> Registrar Saída</Button>
        <Button variant="outline" className="gap-2"><PackageOpen className="w-4 h-4" /> Solicitar Material</Button>
        <Button variant="outline" className="gap-2"><Search className="w-4 h-4" /> Consultar Movimentações</Button>
      </div>`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('src/pages/Estoque.tsx', code);
