const fs = require('fs');
let content = fs.readFileSync('src/pages/Agenda.tsx', 'utf8');

// Add state for Unavailability Modal
content = content.replace(
  /const \[modalTechId, setModalTechId\] = useState\(""\);/,
  `const [modalTechId, setModalTechId] = useState("");
  
  const [showUnavailModal, setShowUnavailModal] = useState(false);
  const [unavailTechId, setUnavailTechId] = useState("");
  const [unavailType, setUnavailType] = useState<any>("Férias");
  const [unavailStartDate, setUnavailStartDate] = useState("");
  const [unavailEndDate, setUnavailEndDate] = useState("");
  const [unavailReason, setUnavailReason] = useState("");`
);

// Add action button in header
content = content.replace(
  /<Button variant=\{viewMode === "Equipe" \? "default" : "outline"\} onClick=\{\(\) => setViewMode\("Equipe"\)\}>\n            <Users className="w-4 h-4 mr-2" \/> Equipe\n          <\/Button>/,
  `<Button variant={viewMode === "Equipe" ? "default" : "outline"} onClick={() => setViewMode("Equipe")}>
            <Users className="w-4 h-4 mr-2" /> Equipe
          </Button>
          <Button variant="outline" className="border-brand-200 text-brand-700 bg-brand-50" onClick={() => setShowUnavailModal(true)}>
            + Ausência/Folga
          </Button>`
);

// Add handleSaveUnavailability
content = content.replace(
  /const handleSaveSchedule = \(\) => \{/,
  `const handleSaveUnavail = () => {
    if (!unavailTechId || !unavailStartDate || !unavailEndDate) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }
    const unavail = {
      id: crypto.randomUUID(),
      technicianId: unavailTechId,
      type: unavailType,
      startAt: new Date(unavailStartDate).toISOString(),
      endAt: new Date(unavailEndDate).toISOString(),
      allDay: true,
      reason: unavailReason,
      createdBy: "system",
      createdAt: new Date().toISOString()
    };
    
    const unavails = storageService.get("gsi_technician_unavailabilities") || [];
    unavails.push(unavail);
    storageService.set("gsi_technician_unavailabilities", unavails);
    storageService.logAudit("system", \`Registrou indisponibilidade para técnico \${unavailTechId}\`);
    setShowUnavailModal(false);
    refreshData();
  };

  const handleSaveSchedule = () => {`
);

// Add Unavailability UI and Team View improvements
content = content.replace(
  /const renderAgendaTeam = \(\) => \{[\s\S]*?return \([\s\S]*?<\/div>\n    \);\n  \};/,
  `const renderAgendaTeam = () => {
    return (
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-slate-800">Capacidade Semanal da Equipe</h3>
            <p className="text-slate-500 text-sm">Controle de ocupação e horas disponíveis.</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200">Técnico</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-center">Horas Programadas</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-center">Horas Ausência</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-center">Capacidade Estimada</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-center">Ocupação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {technicians.filter(t => !technicianFilter || t.id === technicianFilter).map(t => {
                  // Calcular horas programadas nesta semana
                  const scheduledTime = getScheduledOrders().filter(o => o.responsibleId === t.id).reduce((acc, curr) => {
                    return acc + (curr.estimatedDurationMinutes || 0);
                  }, 0);
                  const scheduledHours = (scheduledTime / 60).toFixed(1);

                  // Horas base semana (40h)
                  const baseCapacityHours = 40;
                  
                  // Indisponibilidades nesta semana
                  let unavailHours = 0;
                  unavailabilities.filter(u => u.technicianId === t.id).forEach(u => {
                    const start = new Date(u.startAt);
                    const end = new Date(u.endAt);
                    if (start <= currentWeekEnd && end >= currentWeekStart) {
                       unavailHours += 8; // Simples: cada dia conta 8h
                    }
                  });

                  const capacityAvailable = Math.max(0, baseCapacityHours - unavailHours);
                  const occupancy = capacityAvailable > 0 ? ((scheduledTime / 60) / capacityAvailable) * 100 : 0;
                  
                  let occColor = "text-green-600";
                  if (occupancy > 70) occColor = "text-amber-500";
                  if (occupancy > 90) occColor = "text-red-600";

                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{t.name}</td>
                      <td className="px-6 py-4 text-center text-slate-700">{scheduledHours}h</td>
                      <td className="px-6 py-4 text-center text-red-500">{unavailHours}h</td>
                      <td className="px-6 py-4 text-center text-slate-700">{capacityAvailable}h</td>
                      <td className={\`px-6 py-4 text-center font-bold \${occColor}\`}>
                        {occupancy.toFixed(0)}%
                        {occupancy > 100 && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Sobrecarga</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    );
  };`
);

// Add Unavailability Modal UI
content = content.replace(
  /\{\/\* Scheduling Modal \*\/\}/,
  `{/* Unavailability Modal */}
      {showUnavailModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
              <CardTitle>Registrar Ausência/Folga</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowUnavailModal(false)} className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Técnico</label>
                <Select value={unavailTechId} onChange={e => setUnavailTechId(e.target.value)}>
                  <option value="">Selecione um técnico...</option>
                  {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Indisponibilidade</label>
                <Select value={unavailType} onChange={e => setUnavailType(e.target.value)}>
                  <option value="Férias">Férias</option>
                  <option value="Afastamento">Afastamento/Licença</option>
                  <option value="Folga">Folga</option>
                  <option value="Treinamento">Treinamento</option>
                  <option value="Reunião">Reunião</option>
                  <option value="Serviço externo">Serviço Externo</option>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Início</label>
                  <Input type="date" value={unavailStartDate} onChange={e => setUnavailStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fim</label>
                  <Input type="date" value={unavailEndDate} onChange={e => setUnavailEndDate(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Motivo / Observação</label>
                <Input value={unavailReason} onChange={e => setUnavailReason(e.target.value)} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setShowUnavailModal(false)}>Cancelar</Button>
                <Button onClick={handleSaveUnavail}>Salvar Registro</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scheduling Modal */}`
);

fs.writeFileSync('src/pages/Agenda.tsx', content);
