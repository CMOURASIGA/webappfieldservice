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
          <PageHeaderTitle title="Gestão de Serviços" />
          <p className="text-sm text-slate-500">Central operacional de serviços, ordens, ativos e técnicos.</p>
        </PageHeaderTitleContent>
        <PageHeaderActionsContainer>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/servicos/nova")}><Plus className="w-4 h-4" /> Nova Corretiva</Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/preventivas/nova")}><Plus className="w-4 h-4" /> Nova Preventiva</Button>
          <Button variant="create" className="gap-2" onClick={() => navigate("/ordens/nova")}><Plus className="w-4 h-4" /> Nova OS</Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/agenda")}><Calendar className="w-4 h-4" /> Agenda</Button>
        </PageHeaderActionsContainer>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:border-brand-300 hover:shadow-sm transition-all cursor-pointer" onClick={() => navigate("/servicos/corretivas")}>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-semibold"><Inbox className="w-5 h-5 text-brand-600" /> Corretivas</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Gerencie solicitações e necessidades pontuais.</p>
          </CardContent>
        </Card>

        <Card className="hover:border-brand-300 hover:shadow-sm transition-all cursor-pointer" onClick={() => navigate("/ordens")}>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-semibold"><ClipboardList className="w-5 h-5 text-brand-600" /> Ordens de Serviço</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Acompanhamento e execução de OS.</p>
          </CardContent>
        </Card>

        <Card className="hover:border-brand-300 hover:shadow-sm transition-all cursor-pointer" onClick={() => navigate("/preventivas")}>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-semibold"><CalendarClock className="w-5 h-5 text-brand-600" /> Preventivas</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Gestão de planos e calendários recorrentes.</p>
          </CardContent>
        </Card>
        
        <Card className="hover:border-brand-300 hover:shadow-sm transition-all cursor-pointer" onClick={() => navigate("/ativos")}>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-semibold"><Building2 className="w-5 h-5 text-brand-600" /> Ativos</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Cadastro e acompanhamento de equipamentos.</p>
          </CardContent>
        </Card>
        
        <Card className="hover:border-brand-300 hover:shadow-sm transition-all cursor-pointer" onClick={() => navigate("/locais")}>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-semibold"><MapPin className="w-5 h-5 text-brand-600" /> Locais</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Cadastro de prédios, andares e salas.</p>
          </CardContent>
        </Card>
        
        <Card className="hover:border-brand-300 hover:shadow-sm transition-all cursor-pointer" onClick={() => navigate("/prestadores")}>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-semibold"><Users className="w-5 h-5 text-brand-600" /> Técnicos</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Equipe interna e empresas terceirizadas.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
