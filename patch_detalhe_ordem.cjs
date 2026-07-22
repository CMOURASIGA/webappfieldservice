const fs = require('fs');
let content = fs.readFileSync('src/pages/DetalheOrdem.tsx', 'utf8');

// Inject new state
content = content.replace(
  /const \[uploading, setUploading\] = useState\(false\);/,
  `const [uploading, setUploading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [modalStartTime, setModalStartTime] = useState("");
  const [modalDuration, setModalDuration] = useState("60");
  const [modalTechId, setModalTechId] = useState("");`
);

// Inject Programar button in header
content = content.replace(
  /<Button variant="secondary" onClick=\{\(\) => navigate\("\/ordens"\)\}>Voltar<\/Button>/,
  `<Button variant="secondary" onClick={() => navigate("/ordens")}>Voltar</Button>
          <Button variant="default" onClick={() => setShowScheduleModal(true)}>Programar</Button>`
);

// Inject save schedule function
content = content.replace(
  /const handleStatusChange =/,
  `const handleSaveSchedule = () => {
    if (!modalDate || !modalStartTime || !modalDuration || !modalTechId) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }
    const durationMins = parseInt(modalDuration, 10);
    // basic format for datetime "2026-07-22T08:00:00"
    const startDateTime = new Date(\`\${modalDate}T\${modalStartTime}\`);
    const endDateTime = new Date(startDateTime.getTime() + durationMins * 60000);

    const updatedOrder = {
      ...order,
      responsibleId: modalTechId,
      plannedStart: startDateTime.toISOString(),
      plannedEnd: endDateTime.toISOString(),
      estimatedDurationMinutes: durationMins,
      scheduleStatus: "Programada"
    };

    const orders = storageService.get("gsi_work_orders");
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      orders[idx] = updatedOrder;
      storageService.set("gsi_work_orders", orders);
      storageService.logAudit(currentUser?.id || "system", \`Programou OS \${order.number}\`);
      setOrder(updatedOrder);
      setShowScheduleModal(false);
    }
  };

  const handleStatusChange =`
);

// Inject Schedule Modal UI at the bottom
content = content.replace(
  /<\/div>\n  \);\n\};/,
  `
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
              <CardTitle>Programar Atividade</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowScheduleModal(false)}>X</Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Técnico Principal</label>
                <Select value={modalTechId} onChange={e => setModalTechId(e.target.value)}>
                  <option value="">Selecione um técnico...</option>
                  {users.filter(u => u.role === "Executor/Técnico" || u.role === "Administrador").map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data Planejada</label>
                  <Input type="date" value={modalDate} onChange={e => setModalDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora de Início</label>
                  <Input type="time" value={modalStartTime} onChange={e => setModalStartTime(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duração Estimada (minutos)</label>
                <Select value={modalDuration} onChange={e => setModalDuration(e.target.value)}>
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="120">2 horas</option>
                  <option value="240">4 horas</option>
                  <option value="480">8 horas</option>
                  <option value="1440">2 dias</option>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setShowScheduleModal(false)}>Cancelar</Button>
                <Button onClick={handleSaveSchedule}>Confirmar Programação</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};`
);

// Add display for programming details
content = content.replace(
  /<p className="text-sm font-medium text-slate-500">Unidade<\/p>/,
  `{order.plannedStart && (
                  <div className="md:col-span-2 bg-brand-50 p-3 rounded-md mb-2 border border-brand-100">
                    <p className="text-xs font-medium text-brand-600 mb-1">PROGRAMAÇÃO</p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold text-brand-900">
                        {new Date(order.plannedStart).toLocaleDateString()} das {new Date(order.plannedStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} às {order.plannedEnd ? new Date(order.plannedEnd).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                      </p>
                      <Badge variant="outline" className="bg-white">{order.scheduleStatus || "Programada"}</Badge>
                    </div>
                    {order.estimatedDurationMinutes && <p className="text-xs text-brand-700 mt-1">Duração: {order.estimatedDurationMinutes} min</p>}
                  </div>
                )}
                <p className="text-sm font-medium text-slate-500">Unidade</p>`
);

fs.writeFileSync('src/pages/DetalheOrdem.tsx', content);
