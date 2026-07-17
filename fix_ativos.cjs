const fs = require('fs');
let content = fs.readFileSync('src/pages/Ativos.tsx', 'utf8');

const tabState = `
  const [activeTab, setActiveTab] = useState<"ativos" | "locais">("ativos");
  const [isLocationDrawerOpen, setIsLocationDrawerOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locationFormData, setLocationFormData] = useState<Partial<Location>>({});
`;
content = content.replace(/const \[isDrawerOpen, setIsDrawerOpen\] = useState\(false\);/, 'const [isDrawerOpen, setIsDrawerOpen] = useState(false);\n' + tabState);

const locationFuncs = `
  const handleOpenNewLocation = () => {
    setEditingLocation(null);
    setLocationFormData({ active: true, type: "Sala", unitId: units[0]?.id || "" });
    setIsLocationDrawerOpen(true);
  };

  const handleOpenEditLocation = (loc: Location) => {
    setEditingLocation(loc);
    setLocationFormData(loc);
    setIsLocationDrawerOpen(true);
  };

  const handleDeleteLocation = (id: string) => {
    if (confirm("Tem certeza que deseja inativar este local?")) {
      const allLocs = storageService.get("gsi_locations");
      const idx = allLocs.findIndex(l => l.id === id);
      if (idx !== -1) {
        allLocs[idx].active = false;
        storageService.set("gsi_locations", allLocs);
        if (currentUser) {
          storageService.logAudit(currentUser.id, "Inativou Local", id, "Location");
        }
        loadData();
      }
    }
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const allLocs = storageService.get("gsi_locations");
    if (editingLocation) {
      const idx = allLocs.findIndex(l => l.id === editingLocation.id);
      if (idx !== -1) {
        allLocs[idx] = { ...allLocs[idx], ...locationFormData } as Location;
      }
      if (currentUser) storageService.logAudit(currentUser.id, "Editou Local", editingLocation.id, "Location");
    } else {
      const newLoc: Location = {
        ...(locationFormData as Location),
        id: crypto.randomUUID(),
        active: true
      };
      allLocs.push(newLoc);
      if (currentUser) storageService.logAudit(currentUser.id, "Criou Local", newLoc.id, "Location");
    }
    storageService.set("gsi_locations", allLocs);
    loadData();
    setIsLocationDrawerOpen(false);
  };
`;
content = content.replace(/const handleOpenNew = \(\) => \{/, locationFuncs + '\n  const handleOpenNew = () => {');

const headerAdd = `
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Ativos e Locais</h1>
          <p className="text-sm text-slate-500">Gestão do patrimônio predial.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "ativos" ? (
            <Button onClick={handleOpenNew}>+ Novo Ativo</Button>
          ) : (
            <Button onClick={handleOpenNewLocation}>+ Novo Local</Button>
          )}
        </div>
      </div>
      
      <div className="flex border-b border-slate-200">
        <button
          className={\`px-4 py-2 text-sm font-medium border-b-2 \${activeTab === 'ativos' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
          onClick={() => setActiveTab('ativos')}
        >
          Ativos
        </button>
        <button
          className={\`px-4 py-2 text-sm font-medium border-b-2 \${activeTab === 'locais' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
          onClick={() => setActiveTab('locais')}
        >
          Locais
        </button>
      </div>
`;
content = content.replace(/<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">[\s\S]*?<\/Button>\n      <\/div>/, headerAdd);

const listCond = `
      {activeTab === "ativos" ? (
      <Card>
`;
content = content.replace(/<Card>/, listCond);

const locationTabEnd = `
      </Card>
      ) : (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200">Código</th>
                  <th className="px-6 py-4 border-b border-slate-200">Nome / Tipo</th>
                  <th className="px-6 py-4 border-b border-slate-200">Unidade</th>
                  <th className="px-6 py-4 border-b border-slate-200">Estrutura</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {locations.filter(l => l.active !== false).map(loc => (
                  <tr key={loc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{loc.code}</td>
                    <td className="px-6 py-4 text-slate-900 flex flex-col">
                      <span>{loc.name}</span>
                      <span className="text-xs text-slate-400">{loc.type}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{getUnitName(loc.unitId)}</td>
                    <td className="px-6 py-4 text-slate-600 text-xs flex flex-col gap-0.5">
                      {loc.area && <span>Área: {loc.area}</span>}
                      {loc.floor && <span>Pavimento: {loc.floor}</span>}
                      {loc.environment && <span>Ambiente: {loc.environment}</span>}
                      {!loc.area && !loc.floor && !loc.environment && "-"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link to={\`/locais/\${loc.id}\`} className="text-blue-600 hover:text-blue-700 font-medium text-sm mr-2">Ver</Link>
                      <button 
                        onClick={() => handleOpenEditLocation(loc)}
                        className="text-brand-600 hover:text-brand-700 font-medium text-sm"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteLocation(loc.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {locations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Nenhum local cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      )}
`;

content = content.replace(/<\/Card>\n      <Drawer/, locationTabEnd + '\n      <Drawer');

const locationDrawer = `
      <Drawer
        isOpen={isLocationDrawerOpen}
        onClose={() => setIsLocationDrawerOpen(false)}
        title={editingLocation ? "Editar Local" : "Novo Local"}
      >
        <form onSubmit={handleSaveLocation} className="space-y-4">
          <Input
            label="Código do Local"
            required
            value={locationFormData.code || ""}
            onChange={e => setLocationFormData({ ...locationFormData, code: e.target.value })}
          />
          <Input
            label="Nome do Local"
            required
            value={locationFormData.name || ""}
            onChange={e => setLocationFormData({ ...locationFormData, name: e.target.value })}
            placeholder="Ex: Sala 101"
          />
          <Select
            label="Unidade"
            required
            value={locationFormData.unitId || ""}
            onChange={e => setLocationFormData({ ...locationFormData, unitId: e.target.value })}
            options={units.map(u => ({ value: u.id, label: u.name }))}
          />
          <Select
            label="Tipo"
            required
            value={locationFormData.type || ""}
            onChange={e => setLocationFormData({ ...locationFormData, type: e.target.value })}
            options={[
              { value: "Edifício", label: "Edifício" },
              { value: "Andar/Pavimento", label: "Andar/Pavimento" },
              { value: "Sala", label: "Sala" },
              { value: "Área Externa", label: "Área Externa" },
              { value: "Galpão", label: "Galpão" },
            ]}
          />
          <Input
            label="Área"
            value={locationFormData.area || ""}
            onChange={e => setLocationFormData({ ...locationFormData, area: e.target.value })}
            placeholder="Ex: Bloco A"
          />
          <Input
            label="Pavimento"
            value={locationFormData.floor || ""}
            onChange={e => setLocationFormData({ ...locationFormData, floor: e.target.value })}
            placeholder="Ex: Térreo"
          />
          <Input
            label="Ambiente"
            value={locationFormData.environment || ""}
            onChange={e => setLocationFormData({ ...locationFormData, environment: e.target.value })}
            placeholder="Ex: Recepção"
          />
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsLocationDrawerOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar Local</Button>
          </div>
        </form>
      </Drawer>
`;

content = content.replace(/<\/Drawer>\n    <\/div>\n  \);\n\};/, '</Drawer>\n' + locationDrawer + '\n    </div>\n  );\n};\n');

fs.writeFileSync('src/pages/Ativos.tsx', content);
