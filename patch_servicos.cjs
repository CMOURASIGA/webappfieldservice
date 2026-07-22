const fs = require('fs');
let code = fs.readFileSync('src/pages/Servicos.tsx', 'utf8');

code = code.replace(/import \{ Button \} from "\.\.\/components\/ui\/Button";/, 'import { Button, PageHeader, PageHeaderTitle, PageHeaderTitleContent, PageHeaderActionsContainer } from "@cnc-ti/layout-basic";');

const oldHeader = `<div className="flex flex-wrap items-center gap-3">
        <Button className="gap-2" onClick={() => navigate("/servicos/nova")}><Plus className="w-4 h-4" /> Nova Manutenção</Button>
      </div>

      <div>
        <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Manutenção Corretiva</h1>
        <p className="text-sm text-slate-500">Gestão e acompanhamento de solicitações e necessidades.</p>
      </div>`;

const newHeader = `<PageHeader>
        <PageHeaderTitleContent>
          <PageHeaderTitle>Gestão de Serviços</PageHeaderTitle>
          <p className="text-sm text-slate-500">Central operacional de serviços, ordens e inspeções.</p>
        </PageHeaderTitleContent>
        <PageHeaderActionsContainer>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/agenda")}><Calendar className="w-4 h-4" /> Ver Agenda</Button>
          <Button variant="create" className="gap-2" onClick={() => navigate("/servicos/nova")}><Plus className="w-4 h-4" /> Novo Serviço</Button>
        </PageHeaderActionsContainer>
      </PageHeader>
      
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Button variant="outline" className="gap-2" onClick={() => navigate("/preventivas/nova")}><Plus className="w-4 h-4" /> Nova Preventiva</Button>
        <Button variant="outline" className="gap-2" onClick={() => navigate("/servicos/nova")}><Plus className="w-4 h-4" /> Nova Corretiva</Button>
        <Button variant="outline" className="gap-2"><Plus className="w-4 h-4" /> Nova Inspeção</Button>
        <Button variant="outline" className="gap-2" onClick={() => navigate("/ordens/nova")}><Plus className="w-4 h-4" /> Nova OS</Button>
        <Button variant="outline" className="gap-2"><Search className="w-4 h-4" /> Buscar</Button>
      </div>`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('src/pages/Servicos.tsx', code);
