const fs = require('fs');
let code = fs.readFileSync('src/pages/Documentos.tsx', 'utf8');

code = code.replace(/<PageHeaderActionsContainer>\s*<Button variant="create" className="gap-2" onClick=\{\(\) => navigate\("\/documentos\/novo"\)\}>\s*<Plus className="w-4 h-4" \/>\s*Novo Documento\s*<\/Button>\s*<\/PageHeaderActionsContainer>\s*<\/PageHeader>\s*<div className="flex flex-wrap items-center gap-3 mb-4">\s*<Button variant="outline" className="gap-2">\s*<Calendar className="w-4 h-4" \/>\s*Registrar renovação\s*<\/Button>\s*<Button variant="outline" className="gap-2">\s*<FileText className="w-4 h-4" \/>\s*Anexar arquivo\s*<\/Button>\s*<Button variant="outline" className="gap-2">\s*<Calendar className="w-4 h-4" \/>\s*Consultar vencimentos\s*<\/Button>\s*<\/div>/g, 
`<PageHeaderActionsContainer>
          <Button variant="outline" className="gap-2"><Calendar className="w-4 h-4" /> Registrar renovação</Button>
          <Button variant="outline" className="gap-2"><FileText className="w-4 h-4" /> Anexar arquivo</Button>
          <Button variant="outline" className="gap-2"><Calendar className="w-4 h-4" /> Consultar vencimentos</Button>
          <Button variant="create" className="gap-2" onClick={() => navigate("/documentos/novo")}><Plus className="w-4 h-4" /> Novo Documento</Button>
        </PageHeaderActionsContainer>
      </PageHeader>`);

fs.writeFileSync('src/pages/Documentos.tsx', code);
