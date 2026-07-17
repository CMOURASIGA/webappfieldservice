import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { storageService } from "../services/storageService";
import { WorkOrder, PreventivePlan, Document } from "../types";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Calendar as CalendarIcon, ClipboardList, AlertTriangle, FileText } from "lucide-react";
import { format, parseISO, isPast, isToday, isTomorrow, addDays, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

type AgendaItem = {
  id: string;
  title: string;
  date: string;
  type: "Ordem" | "Preventiva" | "Documento";
  status: string;
  link: string;
  colorClass: string;
};

export const Agenda = () => {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [filterType, setFilterType] = useState<string>("Todos");

  useEffect(() => {
    const orders = storageService.get("gsi_work_orders");
    const plans = storageService.get("gsi_preventive_plans");
    const docs = storageService.get("gsi_documents");

    const agendaItems: AgendaItem[] = [];

    // Process Orders
    orders.forEach(o => {
      if (o.deadline) {
        let colorClass = "bg-blue-100 text-blue-800"; // Planejada
        if (o.status === "Concluída") colorClass = "bg-green-100 text-green-800";
        else if (o.status === "Cancelada") colorClass = "bg-slate-100 text-slate-800";
        else if (isPast(parseISO(o.deadline))) colorClass = "bg-red-100 text-red-800"; // Vencida
        else if (differenceInDays(parseISO(o.deadline), new Date()) <= 3) colorClass = "bg-amber-100 text-amber-800"; // Próxima

        agendaItems.push({
          id: o.id,
          title: `OS: ${o.title}`,
          date: o.deadline,
          type: "Ordem",
          status: o.status,
          link: `/ordens/${o.id}`,
          colorClass,
        });
      }
    });

    // Process Plans
    plans.forEach(p => {
      if (p.nextExecution) {
        let colorClass = "bg-blue-100 text-blue-800";
        if (isPast(parseISO(p.nextExecution))) colorClass = "bg-red-100 text-red-800";

        agendaItems.push({
          id: p.id,
          title: `Preventiva: ${p.description}`,
          date: p.nextExecution,
          type: "Preventiva",
          status: isPast(parseISO(p.nextExecution)) ? "Atrasada" : "Planejada",
          link: `/preventivas`,
          colorClass,
        });
      }
    });

    // Process Documents
    docs.forEach(d => {
      if (d.expirationDate) {
        let colorClass = "bg-blue-100 text-blue-800";
        if (d.status === "Vencido" || isPast(parseISO(d.expirationDate))) colorClass = "bg-red-100 text-red-800";
        else if (differenceInDays(parseISO(d.expirationDate), new Date()) <= 30) colorClass = "bg-amber-100 text-amber-800";

        agendaItems.push({
          id: d.id,
          title: `Documento: ${d.title}`,
          date: d.expirationDate,
          type: "Documento",
          status: d.status,
          link: `/documentos`,
          colorClass,
        });
      }
    });

    // Sort by date
    agendaItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setItems(agendaItems);
  }, []);

  const filteredItems = items.filter(item => filterType === "Todos" || item.type === filterType);

  // Group by date string (YYYY-MM-DD)
  const groupedItems = filteredItems.reduce((acc, item) => {
    const dateKey = item.date.split("T")[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {} as Record<string, AgendaItem[]>);

  const formatGroupDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Ordem": return <ClipboardList className="w-4 h-4" />;
      case "Preventiva": return <AlertTriangle className="w-4 h-4" />;
      case "Documento": return <FileText className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-1">Agenda Visual</h1>
          <p className="text-sm text-slate-500">Cronograma de manutenções, preventivas e vencimentos.</p>
        </div>
        <div className="flex bg-white rounded-md border border-slate-200 p-1">
          {["Todos", "Ordem", "Preventiva", "Documento"].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                filterType === type ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
            Nenhum evento agendado para o filtro selecionado.
          </div>
        ) : (
          Object.keys(groupedItems).sort().map(dateKey => (
            <div key={dateKey} className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 capitalize flex items-center gap-2 border-b border-slate-200 pb-2">
                <CalendarIcon className="w-4 h-4 text-brand-600" />
                {formatGroupDate(dateKey)}
                <span className="text-xs font-normal text-slate-500 ml-2">
                  {format(parseISO(dateKey), "dd/MM/yyyy")}
                </span>
              </h2>
              <div className="grid gap-3">
                {groupedItems[dateKey].map(item => (
                  <Link key={item.id} to={item.link} className="block">
                    <Card className="hover:border-brand-300 transition-colors">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-md ${item.colorClass}`}>
                            {getTypeIcon(item.type)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{item.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{item.type} • {item.status}</p>
                          </div>
                        </div>
                        <Badge variant="default" className={item.colorClass}>{item.status}</Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
