const fs = require('fs');
let code = fs.readFileSync('src/pages/Documentos.tsx', 'utf8');

code = code.replace(/import \{ Button \} from "\.\.\/components\/ui\/Button";/, 'import { Button, PageHeader, PageHeaderTitle, PageHeaderTitleContent, PageHeaderActionsContainer } from "@cnc-ti/layout-basic";');

const oldHeader = `<div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => navigate("/documentos/novo")} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Documento
        </Button>
      </div>

      <div>
        <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Documentos Regulatórios</h1>
        <p className="text-sm text-slate-500">Gestão de licenças, laudos, ARTs e certificados.</p>
      </div>`;

const newHeader = `<PageHeader>
        <PageHeaderTitleContent>
          <PageHeaderTitle>Documentação Regulatória</PageHeaderTitle>
          <p className="text-sm text-slate-500">Gestão de licenças, laudos, ARTs e certificados.</p>
        </PageHeaderTitleContent>
        <PageHeaderActionsContainer>
          <Button variant="create" className="gap-2" onClick={() => navigate("/documentos/novo")}><Plus className="w-4 h-4" /> Novo Documento</Button>
        </PageHeaderActionsContainer>
      </PageHeader>
      
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Button variant="outline" className="gap-2"><Calendar className="w-4 h-4" /> Registrar renovação</Button>
        <Button variant="outline" className="gap-2"><FileText className="w-4 h-4" /> Anexar arquivo</Button>
        <Button variant="outline" className="gap-2"><Calendar className="w-4 h-4" /> Consultar vencimentos</Button>
        <Button variant="outline" className="gap-2"><Search className="w-4 h-4" /> Buscar documento</Button>
      </div>`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('src/pages/Documentos.tsx', code);
