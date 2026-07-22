import React from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, PageHeaderTitle, PageHeaderTitleContent, PageHeaderActionsContainer, Button, Card, CardContent, CardHeader} from "@cnc-ti/layout-basic";
import { Calendar, Plus, Inbox, ClipboardList, CalendarClock, Building2, Users, MapPin, Search } from "lucide-react";

export const GestaoServicosDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader>
        <PageHeaderTitleContent>
          <PageHeaderTitle>Gestão de Serviços</PageHeaderTitle>
          <p className="text-sm text-slate-500">Central operacional de serviços, ordens, ativos e técnicos.</p>
        </PageHeaderTitleContent>
        <PageHeaderActionsContainer>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/agenda")}><Calendar className="w-4 h-4" /> Ver Agenda</Button>
          <Button variant="create" className="gap-2" onClick={() => navigate("/ordens/nova")}><Plus className="w-4 h-4" /> Nova Ordem de Serviço</Button>
        </PageHeaderActionsContainer>
      </PageHeader>
      
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button variant="outline" className="gap-2" onClick={() => navigate("/servicos/corretivas")}><Inbox className="w-4 h-4" /> Manutenções Corretivas</Button>
        <Button variant="outline" className="gap-2" onClick={() => navigate("/ordens")}><ClipboardList className="w-4 h-4" /> Ordens de Serviço</Button>
        <Button variant="outline" className="gap-2" onClick={() => navigate("/preventivas")}><CalendarClock className="w-4 h-4" /> Manutenções Preventivas</Button>
        <Button variant="outline" className="gap-2" onClick={() => navigate("/ativos")}><Building2 className="w-4 h-4" /> Ativos</Button>
        <Button variant="outline" className="gap-2" onClick={() => navigate("/locais")}><MapPin className="w-4 h-4" /> Locais</Button>
        <Button variant="outline" className="gap-2" onClick={() => navigate("/prestadores")}><Users className="w-4 h-4" /> Técnicos</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/servicos/corretivas")}>
          <CardHeader>
            <h3 className="flex items-center gap-2"><Inbox className="w-5 h-5 text-brand-600" /> Manutenções Corretivas</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Gerencie as solicitações e necessidades pontuais que chegam das unidades.</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/ordens")}>
          <CardHeader>
            <h3 className="flex items-center gap-2"><ClipboardList className="w-5 h-5 text-brand-600" /> Ordens de Serviço</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Acompanhamento e execução operacional das atividades de manutenção.</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/preventivas")}>
          <CardHeader>
            <h3 className="flex items-center gap-2"><CalendarClock className="w-5 h-5 text-brand-600" /> Manutenções Preventivas</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Gestão de planos, checklists e calendário de manutenções recorrentes.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
