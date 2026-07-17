const fs = require('fs');
let content = fs.readFileSync('src/pages/Documentos.tsx', 'utf8');

const filterVars = `
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [unitFilter, setUnitFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [responsibleFilter, setResponsibleFilter] = useState("");
  const [bodyFilter, setBodyFilter] = useState("");
  
  const [users, setUsers] = useState<any[]>([]);
  
  useEffect(() => {
    setUsers(storageService.get("gsi_users") || []);
  }, []);
`;

content = content.replace(/const \[statusFilter, setStatusFilter\] = useState\("Todos"\);/, filterVars);

const filterLogic = `
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = ((doc.title || "").toString().toLowerCase()).includes(search.toLowerCase()) || 
                          ((doc.number || "").toString().toLowerCase()).includes(search.toLowerCase()) ||
                          ((doc.regulatoryBody || "").toString().toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "Todos" || doc.status === statusFilter;
    const matchesUnit = !unitFilter || doc.unitId === unitFilter;
    const matchesType = !typeFilter || doc.type === typeFilter;
    const matchesResponsible = !responsibleFilter || doc.responsibleId === responsibleFilter;
    const matchesBody = !bodyFilter || (doc.regulatoryBody || doc.issuer) === bodyFilter;
    
    return matchesSearch && matchesStatus && matchesUnit && matchesType && matchesResponsible && matchesBody;
  });
  
  const allTypes = Array.from(new Set(documents.map(d => d.type).filter(Boolean)));
  const allBodies = Array.from(new Set(documents.map(d => d.regulatoryBody || d.issuer).filter(Boolean)));
`;

content = content.replace(/const filteredDocs = documents\.filter\(doc => \{[\s\S]*?\}\);/, filterLogic);

const filterUI = `
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Input 
                placeholder="Buscar por título, número ou órgão..." 
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="Todos">Todos os Status</option>
              <option value="Vigente">Vigentes</option>
              <option value="Atenção">Atenção</option>
              <option value="Crítico">Crítico</option>
              <option value="Vencido">Vencidos</option>
            </Select>
            <Select value={unitFilter} onChange={e => setUnitFilter(e.target.value)}>
              <option value="">Todas as Unidades</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
            <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">Qualquer tipo</option>
              {allTypes.map(t => <option key={t as string} value={t as string}>{t as string}</option>)}
            </Select>
            <Select value={bodyFilter} onChange={e => setBodyFilter(e.target.value)}>
              <option value="">Qualquer Órgão/Emissor</option>
              {allBodies.map(b => <option key={b as string} value={b as string}>{b as string}</option>)}
            </Select>
            <Select value={responsibleFilter} onChange={e => setResponsibleFilter(e.target.value)}>
              <option value="">Qualquer Responsável</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
          </div>
        </CardContent>
      </Card>
`;

content = content.replace(/<div className="flex flex-col md:flex-row gap-4 mb-4">[\s\S]*?<\/div>/, filterUI);

fs.writeFileSync('src/pages/Documentos.tsx', content);
