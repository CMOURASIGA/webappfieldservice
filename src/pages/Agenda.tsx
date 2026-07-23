import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { storageService } from "../services/storageService";
import { WorkOrder, PreventivePlan, Document, User, Unit, TechnicianWorkSchedule, TechnicianUnavailability, Provider } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { Input } from "../components/ui/Input";
import { 
  Calendar as CalendarIcon, ClipboardList, AlertTriangle, FileText, 
  ChevronLeft, ChevronRight, List as ListIcon, CalendarDays, 
  Users, CalendarClock, Clock, X, Search 
} from "lucide-react";
import { 
  format, isValid, parseISO, isPast, isToday, addDays, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, 
  subDays, setHours, setMinutes, parse, formatISO
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { NovoCompromissoModal } from "./agenda/NovoCompromissoModal";
import { OperationalPageHeader } from "../components/ui/OperationalPage";

type ViewMode = "Semana" | "Dia" | "Lista" | "Equipe";

export const Agenda = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>("Semana");
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [schedules, setSchedules] = useState<TechnicianWorkSchedule[]>([]);
  const [unavailabilities, setUnavailabilities] = useState<TechnicianUnavailability[]>([]);
  
  const [unitFilter, setUnitFilter] = useState("");
  const [technicianFilter, setTechnicianFilter] = useState("");
  
  const [showUnscheduled, setShowUnscheduled] = useState(false);
  const [schedulingOrder, setSchedulingOrder] = useState<WorkOrder | null>(null);
  const [showCompromisso, setShowCompromisso] = useState(false);

  // Modal State
  const [modalDate, setModalDate] = useState("");
  const [modalStartTime, setModalStartTime] = useState("");
  const [modalDuration, setModalDuration] = useState("");
  const [modalTechId, setModalTechId] = useState("");
  
  const [showUnavailModal, setShowUnavailModal] = useState(false);
  const [unavailTechId, setUnavailTechId] = useState("");
  const [unavailType, setUnavailType] = useState<any>("Férias");
  const [unavailStartDate, setUnavailStartDate] = useState("");
  const [unavailEndDate, setUnavailEndDate] = useState("");
  const [unavailReason, setUnavailReason] = useState("");

  const refreshData = () => {
    setOrders(storageService.get("gsi_work_orders"));
    setUsers(storageService.get("gsi_users"));
    setProviders(storageService.get("gsi_providers"));
    setUnits(storageService.get("gsi_units"));
    setSchedules(storageService.get("gsi_technician_schedules"));
    setUnavailabilities(storageService.get("gsi_technician_unavailabilities"));
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    const periodo = searchParams.get("periodo");
    const selectedDate = searchParams.get("data");
    if (periodo === "dia" && selectedDate) {
      const parsedDate = parseISO(selectedDate);
      if (isValid(parsedDate)) setCurrentDate(parsedDate);
      setViewMode("Dia");
    } else if (periodo === "hoje") {
      setCurrentDate(new Date());
      setViewMode("Dia");
    } else if (periodo === "semana") {
      setCurrentDate(new Date());
      setViewMode("Semana");
    }
  }, [searchParams]);

  const technicians = users.filter(u => u.role === "Executor/Técnico" || u.role === "Administrador");
  const executors = [
    ...technicians.map(t => ({ id: t.id, name: t.name, type: "Técnico", source: "user" })),
    ...providers.filter(p => p.active).map(p => ({ id: p.id, name: p.name, type: p.type || "Externo", source: "provider" }))
  ];

  const startHour = 7;
  const endHour = 20;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = viewMode === "Dia" ? [currentDate] : eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });

  const handlePrev = () => {
    if (viewMode === "Semana" || viewMode === "Equipe") setCurrentDate(subDays(currentDate, 7));
    else if (viewMode === "Dia") setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === "Semana" || viewMode === "Equipe") setCurrentDate(addDays(currentDate, 7));
    else if (viewMode === "Dia") setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => setCurrentDate(new Date());

  const getUnscheduledOrders = () => {
    return orders.filter(o => 
      !o.plannedStart || 
      o.scheduleStatus === "Não programada" || 
      !o.scheduleStatus
    ).filter(o => {
      if (unitFilter && o.unitId !== unitFilter) return false;
      return true;
    });
  };

  const getScheduledOrders = () => {
    return orders.filter(o => o.plannedStart && o.plannedEnd).filter(o => {
      if (unitFilter && o.unitId !== unitFilter) return false;
      if (technicianFilter && !o.additionalTechnicianIds?.includes(technicianFilter) && o.responsibleId !== technicianFilter && o.providerId !== technicianFilter) return false;
      return true;
    });
  };

  const handleDrop = (e: React.DragEvent, date: Date, hour: number) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData("orderId");
    if (!orderId) return;
    
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    setSchedulingOrder(order);
    setModalDate(format(date, 'yyyy-MM-dd'));
    setModalStartTime(`${hour.toString().padStart(2, '0')}:00`);
    setModalDuration(order.estimatedDurationMinutes ? order.estimatedDurationMinutes.toString() : "60");
    setModalTechId(technicianFilter || order.responsibleId || order.providerId || "");
  };

  const handleSaveUnavail = () => {
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
    storageService.logAudit("system", `Registrou indisponibilidade para técnico ${unavailTechId}`);
    setShowUnavailModal(false);
    refreshData();
  };

  const handleSaveSchedule = () => {
    if (!schedulingOrder || !modalDate || !modalStartTime || !modalDuration || !modalTechId) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const startDateTime = parse(`${modalDate} ${modalStartTime}`, 'yyyy-MM-dd HH:mm', new Date());
    const durationMins = parseInt(modalDuration, 10);
    const endDateTime = new Date(startDateTime.getTime() + durationMins * 60000);

    // Conflitos básicos
    const isConflict = orders.some(o => 
      o.id !== schedulingOrder.id &&
      o.plannedStart && o.plannedEnd &&
      (o.responsibleId === modalTechId || o.providerId === modalTechId) &&
      new Date(o.plannedStart) < endDateTime &&
      new Date(o.plannedEnd) > startDateTime
    );

    if (isConflict) {
      if (!window.confirm("Atenção: O técnico selecionado já possui uma atividade ou indisponibilidade neste horário. Deseja programar mesmo assim?")) {
        return;
      }
    }

    const updatedOrders = orders.map(o => {
      if (o.id === schedulingOrder.id) {
        return {
          ...o,
          responsibleId: executors.find(e => e.id === modalTechId)?.source === "user" ? modalTechId : undefined,
          providerId: executors.find(e => e.id === modalTechId)?.source === "provider" ? modalTechId : undefined,
          plannedStart: formatISO(startDateTime),
          plannedEnd: formatISO(endDateTime),
          estimatedDurationMinutes: durationMins,
          scheduleStatus: "Programada" as const
        };
      }
      return o;
    });

    storageService.set("gsi_work_orders", updatedOrders);
    storageService.logAudit("system", `Programou OS ${schedulingOrder.number}`);
    setSchedulingOrder(null);
    refreshData();
  };

  const renderAgendaWeek = () => {
    const scheduled = getScheduledOrders();
    
    return (
      <div className="agenda-grid flex h-[calc(100vh-250px)] flex-col border-2 border-slate-500">
        {/* Header Days */}
        <div className="flex border-b-2 border-slate-300 bg-slate-100">
          <div className="w-16 flex-shrink-0 border-r-2 border-slate-500"></div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className={`flex-1 border-r-2 border-slate-500 py-2 text-center last:border-r-0 ${isToday(day) ? 'bg-brand-100' : ''}`}>
              <div className="text-xs text-slate-500 uppercase">{format(day, 'EEE', { locale: ptBR })}</div>
              <div className={`text-lg font-medium ${isToday(day) ? 'text-brand-700' : 'text-slate-800'}`}>
                {format(day, 'dd')}
              </div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="relative">
            {hours.map(hour => (
              <div key={hour} className="flex min-h-[60px] border-b-2 border-slate-400 last:border-b-0">
                <div className="w-16 flex-shrink-0 border-r-2 border-slate-500 bg-slate-100 py-2 text-center text-xs font-semibold text-slate-600">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {weekDays.map(day => (
                  <div 
                    key={`${day.toISOString()}-${hour}`} 
                    className={`relative flex-1 border-r-2 border-slate-500 transition-colors last:border-r-0 ${isToday(day) ? 'bg-brand-50/50' : ''}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, day, hour)}
                  >
                    {/* Render OS Cards that start in this hour and day */}
                    {scheduled.filter(o => {
                      const start = parseISO(o.plannedStart!);
                      return isSameDay(start, day) && start.getHours() === hour;
                    }).map(o => {
                      const start = parseISO(o.plannedStart!);
                      const end = parseISO(o.plannedEnd!);
                      const durationInMinutes = (end.getTime() - start.getTime()) / 60000;
                      const topOffset = (start.getMinutes() / 60) * 100;
                      const heightPercentage = (durationInMinutes / 60) * 100;

                      return (
                        <div 
                          key={o.id}
                          className="absolute left-1 right-1 bg-brand-100 border border-brand-300 rounded p-1 shadow-sm overflow-hidden text-xs z-10 cursor-pointer hover:ring-2 hover:ring-brand-400 transition-all"
                          style={{ top: `${topOffset}%`, height: `${Math.max(heightPercentage, 30)}px` }}
                          title={`${o.number} - ${o.technicalDescription}`}
                          onClick={() => {
                            setSchedulingOrder(o);
                            setModalDate(format(start, 'yyyy-MM-dd'));
                            setModalStartTime(format(start, 'HH:mm'));
                            setModalDuration(durationInMinutes.toString());
                            setModalTechId(o.responsibleId || o.providerId || "");
                          }}
                        >
                          <div className="font-semibold text-brand-800">{o.number}</div>
                          <div className="text-brand-600 truncate">{o.technicalDescription}</div>
                          <div className="text-brand-500 text-[10px] mt-0.5">
                            {executors.find(e => e.id === (o.responsibleId || o.providerId))?.name || "Sem responsável"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAgendaList = () => {
    const scheduled = getScheduledOrders().sort((a, b) => new Date(a.plannedStart!).getTime() - new Date(b.plannedStart!).getTime());
    
    return (
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 border-b border-slate-200">Data/Hora</th>
                <th className="px-6 py-4 border-b border-slate-200">Ordem / Serviço</th>
                <th className="px-6 py-4 border-b border-slate-200">Responsável</th>
                <th className="px-6 py-4 border-b border-slate-200">Unidade</th>
                <th className="px-6 py-4 border-b border-slate-200">Status Programação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {scheduled.map(o => (
                <tr key={o.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => {
                  setSchedulingOrder(o);
                  const start = parseISO(o.plannedStart!);
                  setModalDate(format(start, 'yyyy-MM-dd'));
                  setModalStartTime(format(start, 'HH:mm'));
                  setModalDuration(o.estimatedDurationMinutes?.toString() || "60");
                  setModalTechId(o.responsibleId || o.providerId || "");
                }}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{format(parseISO(o.plannedStart!), "dd/MM/yyyy", { locale: ptBR })}</div>
                    <div className="text-slate-500 text-xs">{format(parseISO(o.plannedStart!), "HH:mm")} - {format(parseISO(o.plannedEnd!), "HH:mm")}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{o.number}</div>
                    <div className="text-slate-500 text-xs truncate max-w-[250px]">{o.technicalDescription}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {executors.find(e => e.id === (o.responsibleId || o.providerId))?.name || "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {units.find(u => u.id === o.unitId)?.sigla || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="default">{o.scheduleStatus}</Badge>
                  </td>
                </tr>
              ))}
              {scheduled.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma atividade programada para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    );
  };

  const renderAgendaTeam = () => {
    return (
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-slate-800">Capacidade Semanal da Equipe</h3>
            <p className="text-slate-500 text-sm">Controle de ocupação e horas disponíveis.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {executors.filter(t => !technicianFilter || t.id === technicianFilter).map(t => {
            // Calcular horas programadas nesta semana
            const scheduledTime = getScheduledOrders().filter(o => o.responsibleId === t.id || o.providerId === t.id).reduce((acc, curr) => {
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
            let occBg = "bg-green-100";
            if (occupancy > 70) {
              occColor = "text-amber-600";
              occBg = "bg-amber-100";
            }
            if (occupancy > 90) {
              occColor = "text-red-600";
              occBg = "bg-red-100";
            }

            return (
              <Card key={t.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 truncate" title={t.name}>{t.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{t.type}</p>
                    </div>
                    <Badge variant="default" className="text-[10px]">
                      {t.source === "provider" ? "Externo" : "Interno"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm mt-4 flex-1">
                    <div>
                      <span className="block text-xs text-slate-500 mb-0.5">Programadas</span>
                      <span className="font-medium text-slate-700">{scheduledHours}h</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 mb-0.5">Ausência</span>
                      <span className="font-medium text-red-500">{unavailHours}h</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 mb-0.5">Capacidade</span>
                      <span className="font-medium text-slate-700">{capacityAvailable}h</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 mb-0.5">Ocupação</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${occColor}`}>{occupancy.toFixed(0)}%</span>
                        {occupancy > 100 && <span className="text-[9px] bg-red-100 text-red-700 px-1 py-0.5 rounded uppercase font-bold">Sobrecarga</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                    <div 
                      className={`h-full ${occColor.replace('text-', 'bg-')}`} 
                      style={{ width: `${Math.min(100, occupancy)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <OperationalPageHeader
        title="Agenda Semanal"
        description="Gestão e programação da equipe técnica."
        backTo="/"
        actions={
          <>
          <Button variant={viewMode === "Semana" ? "primary" : "secondary"} onClick={() => setViewMode("Semana")}>
            <CalendarDays className="w-4 h-4 mr-2" /> Semana
          </Button>
          <Button variant={viewMode === "Dia" ? "primary" : "secondary"} onClick={() => setViewMode("Dia")}>
            <CalendarIcon className="w-4 h-4 mr-2" /> Dia
          </Button>
          <Button variant={viewMode === "Lista" ? "primary" : "secondary"} onClick={() => setViewMode("Lista")}>
            <ListIcon className="w-4 h-4 mr-2" /> Lista
          </Button>
          <Button variant={viewMode === "Equipe" ? "primary" : "secondary"} onClick={() => setViewMode("Equipe")}>
            <Users className="w-4 h-4 mr-2" /> Equipe
          </Button>
          <Button variant="secondary" className="border-brand-200 text-brand-700 bg-brand-50" onClick={() => setShowUnavailModal(true)}>
            + Ausência/Folga
          </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-300 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handlePrev}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 font-medium text-slate-700" onClick={handleToday}>
            Hoje
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-slate-800 font-semibold px-2">
          {viewMode === "Semana" || viewMode === "Equipe" ? (
            `${format(currentWeekStart, "dd MMM", { locale: ptBR })} - ${format(currentWeekEnd, "dd MMM yyyy", { locale: ptBR })}`
          ) : (
            format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
          )}
        </div>

        <div className="flex-1"></div>

        <Select className="w-48" value={unitFilter} onChange={e => setUnitFilter(e.target.value)}>
          <option value="">Todas as Unidades</option>
          {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </Select>

        <Select className="w-48" value={technicianFilter} onChange={e => setTechnicianFilter(e.target.value)}>
          <option value="">Todos os Técnicos</option>
          {executors.map(t => <option key={t.id} value={t.id}>{t.name} ({t.type})</option>)}
        </Select>

        <Button 
          variant={showUnscheduled ? "primary" : "secondary"} 
          className="relative"
          onClick={() => setShowUnscheduled(!showUnscheduled)}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Não Programadas
          {getUnscheduledOrders().length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              {getUnscheduledOrders().length}
            </span>
          )}
        </Button>
      </div>

      <div className="flex gap-6 relative">
        <div className="flex-1 min-w-0 transition-all duration-300">
          {viewMode === "Semana" && renderAgendaWeek()}
          {viewMode === "Dia" && renderAgendaWeek()} {/* Simplified dia by just changing dates would work, but week view is responsive enough if we just adjust weekDays */}
          {viewMode === "Lista" && renderAgendaList()}
          {viewMode === "Equipe" && renderAgendaTeam()}
        </div>

        {/* Unscheduled Sidebar */}
        {showUnscheduled && (
          <div className="h-[calc(100vh-250px)] w-80 flex-shrink-0 overflow-y-auto rounded-lg border border-slate-300 bg-slate-50 p-4 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Aguardando Programação</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowUnscheduled(false)} className="p-2 h-6 w-6">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {getUnscheduledOrders().map(o => (
                <div 
                  key={o.id} 
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("orderId", o.id);
                  }}
                  className="bg-white p-3 rounded border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-brand-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-brand-700">{o.number}</span>
                    <Badge variant="default" className="text-[10px]">{o.priority}</Badge>
                  </div>
                  <p className="text-sm text-slate-700 font-medium line-clamp-2 mb-2">{o.technicalDescription}</p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-500">{units.find(u => u.id === o.unitId)?.sigla}</span>
                    <Button size="sm" variant="secondary" className="h-6 text-xs px-2" onClick={() => {
                      setSchedulingOrder(o);
                      setModalDate(format(currentDate, 'yyyy-MM-dd'));
                      setModalStartTime("08:00");
                      setModalDuration("60");
                      setModalTechId(o.responsibleId || o.providerId || "");
                    }}>
                      Programar
                    </Button>
                  </div>
                </div>
              ))}

              {getUnscheduledOrders().length === 0 && (
                <div className="text-center p-6 text-slate-500 text-sm bg-white rounded border border-dashed border-slate-300">
                  Nenhuma OS pendente de programação.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Unavailability Modal */}
      {showUnavailModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
              <CardTitle>Registrar Ausência/Folga</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowUnavailModal(false)} className="p-2 h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Responsável</label>
                <Select value={unavailTechId} onChange={e => setUnavailTechId(e.target.value)}>
                  <option value="">Selecione um responsável...</option>
                  {executors.map(t => <option key={t.id} value={t.id}>{t.name} ({t.type})</option>)}
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
                <Button variant="secondary" onClick={() => setShowUnavailModal(false)}>Cancelar</Button>
                <Button onClick={handleSaveUnavail}>Salvar Registro</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scheduling Modal */}
      {schedulingOrder && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
              <CardTitle>Programar Atividade</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSchedulingOrder(null)} className="p-2 h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">OS</p>
                <p className="font-semibold text-slate-800">{schedulingOrder.number} - {schedulingOrder.technicalDescription}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Responsável pela OS</label>
                <Select value={modalTechId} onChange={e => setModalTechId(e.target.value)}>
                  <option value="">Selecione um responsável...</option>
                  {executors.map(t => <option key={t.id} value={t.id}>{t.name} ({t.type})</option>)}
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
                <Button variant="secondary" onClick={() => setSchedulingOrder(null)}>Cancelar</Button>
                <Button onClick={handleSaveSchedule}>Confirmar Programação</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
