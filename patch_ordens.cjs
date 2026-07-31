const fs = require('fs');
let code = fs.readFileSync('src/pages/Ordens.tsx', 'utf8');

code = code.replace(/import \{ Button \} from "\.\.\/components\/ui\/Button";/, 'import { Button, PageHeader, PageHeaderTitle, PageHeaderTitleContent, PageHeaderActionsContainer } from "@cnc-ti/layout-basic";');

const oldHeader = `<div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => navigate("/ordens/nova")} className="gap-2">
          <Plus className="w-4 h-4" /> Nova OS
        </Button>
        <Button variant="outline" onClick={() => navigate("/agenda")} className="gap-2">
          <Calendar className="w-4 h-4" /> Ver Agenda
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Ordens de Serviço</h1>
          <p className="text-sm text-slate-500">Acompanhamento e execução operacional.</p>
        </div>`;

const newHeader = `<PageHeader>
        <PageHeaderTitleContent>
          <PageHeaderTitle>Ordens de Serviço</PageHeaderTitle>
          <p className="text-sm text-slate-500">Acompanhamento e execução operacional.</p>
        </PageHeaderTitleContent>
        <PageHeaderActionsContainer>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/agenda")}><Calendar className="w-4 h-4" /> Ver Agenda</Button>
          <Button variant="create" className="gap-2" onClick={() => navigate("/ordens/nova")}><Plus className="w-4 h-4" /> Nova OS</Button>
        </PageHeaderActionsContainer>
      </PageHeader>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-4">`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('src/pages/Ordens.tsx', code);
