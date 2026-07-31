const fs = require('fs');
let code = fs.readFileSync('src/pages/Preventivas.tsx', 'utf8');

code = code.replace(/import \{ Button \} from "\.\.\/components\/ui\/Button";/, 'import { Button, PageHeader, PageHeaderTitle, PageHeaderTitleContent, PageHeaderActionsContainer } from "@cnc-ti/layout-basic";');

const oldHeader = `<div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => navigate("/preventivas/nova")} className="gap-2">
          <Plus className="w-4 h-4" /> Nova Manutenção Preventiva
        </Button>
      </div>

      <div>
        <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Manutenções Preventivas</h1>
        <p className="text-sm text-slate-500">Gestão de planos e calendários de manutenção.</p>
      </div>`;

const newHeader = `<PageHeader>
        <PageHeaderTitleContent>
          <PageHeaderTitle>Manutenções Preventivas</PageHeaderTitle>
          <p className="text-sm text-slate-500">Gestão de planos e calendários de manutenção.</p>
        </PageHeaderTitleContent>
        <PageHeaderActionsContainer>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/agenda")}><Calendar className="w-4 h-4" /> Ver Agenda</Button>
          <Button variant="create" className="gap-2" onClick={() => navigate("/preventivas/nova")}><Plus className="w-4 h-4" /> Nova Manutenção Preventiva</Button>
        </PageHeaderActionsContainer>
      </PageHeader>`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('src/pages/Preventivas.tsx', code);
