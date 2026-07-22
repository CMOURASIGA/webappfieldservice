const fs = require('fs');
let content = fs.readFileSync('src/pages/Documentos.tsx', 'utf8');

if (!content.includes('searchTerm')) {
  content = content.replace(
    'const [statusFilter, setStatusFilter] = useState(initialstatusFilter);',
    'const [statusFilter, setStatusFilter] = useState(initialstatusFilter);\n  const [searchTerm, setSearchTerm] = useState("");'
  );

  content = content.replace(
    'import { Badge } from "../components/ui/Badge";',
    'import { Badge } from "../components/ui/Badge";\nimport { Input } from "../components/ui/Input";'
  );

  // Update filter logic
  content = content.replace(
    /const filteredDocs = documents\.filter\(d => \{/,
    `const filteredDocs = documents.filter(d => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!d.name.toLowerCase().includes(term) && !d.code?.toLowerCase().includes(term) && !d.organ?.toLowerCase().includes(term)) {
        return false;
      }
    }`
  );

  // Replace buttons
  content = content.replace(
    /<div className="flex flex-wrap items-center gap-3 mb-4">\s*<Button variant="outline" className="gap-2"><Calendar className="w-4 h-4" \/> Registrar renovação<\/Button>\s*<Button variant="outline" className="gap-2"><FileText className="w-4 h-4" \/> Anexar arquivo<\/Button>\s*<Button variant="outline" className="gap-2"><Calendar className="w-4 h-4" \/> Consultar vencimentos<\/Button>\s*<Button variant="outline" className="gap-2"><Search className="w-4 h-4" \/> Buscar documento<\/Button>\s*<\/div>/g,
    `<div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setStatusFilter("Vencidos")}><Calendar className="w-4 h-4" /> Consultar vencimentos</Button>
        </div>
        <div className="w-full md:w-72">
          <Input 
            placeholder="Buscar por nome, código ou órgão..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>`
  );

  fs.writeFileSync('src/pages/Documentos.tsx', content);
}
