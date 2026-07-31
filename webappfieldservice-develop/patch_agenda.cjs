const fs = require('fs');
let code = fs.readFileSync('src/pages/Agenda.tsx', 'utf8');

if (!code.includes('NovoCompromissoModal')) {
  code = code.replace(/import \{ ptBR \} from "date-fns\/locale";/, 'import { ptBR } from "date-fns/locale";\nimport { NovoCompromissoModal } from "./agenda/NovoCompromissoModal";');
  
  code = code.replace(/const \[schedulingOrder, setSchedulingOrder\] = useState<WorkOrder \| null>\(null\);/, 'const [schedulingOrder, setSchedulingOrder] = useState<WorkOrder | null>(null);\n  const [showCompromisso, setShowCompromisso] = useState(false);');

  code = code.replace(/<Button variant="outline" className="gap-2">\s*<CalendarIcon className="w-4 h-4" \/>\s*Nova Indisponibilidade\s*<\/Button>/, '<Button variant="outline" className="gap-2" onClick={() => setShowCompromisso(true)}>\n            <CalendarIcon className="w-4 h-4" />\n            Nova Indisponibilidade\n          </Button>');
  
  code = code.replace(/<\/div>\n    <\/div>\n  \);\n\};/, '</div>\n\n      <NovoCompromissoModal open={showCompromisso} onOpenChange={setShowCompromisso} onSuccess={loadData} />\n    </div>\n  );\n};');
  
  fs.writeFileSync('src/pages/Agenda.tsx', code);
}
