const fs = require('fs');
let code = fs.readFileSync('src/pages/VisaoGeral.tsx', 'utf8');

if (!code.includes('@cnc-ti/layout-basic')) {
  code = code.replace(/import \{ Card, CardContent, CardHeader, CardTitle \} from "\.\.\/components\/ui\/Card";/, 'import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";\nimport { PageHeader, PageHeaderTitle, PageHeaderTitleContent } from "@cnc-ti/layout-basic";');
}

const oldHeader = `<div>
        <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Visão Geral</h1>
        <p className="text-sm text-slate-500">Monitoramento e alertas críticos da operação.</p>
      </div>`;

const newHeader = `<PageHeader>
        <PageHeaderTitleContent>
          <PageHeaderTitle>Visão Geral</PageHeaderTitle>
          <p className="text-sm text-slate-500">Monitoramento e alertas críticos da operação.</p>
        </PageHeaderTitleContent>
      </PageHeader>`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('src/pages/VisaoGeral.tsx', code);
