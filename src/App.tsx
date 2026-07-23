import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MainLayout } from "./layouts/MainLayout";
import { Agenda } from "./pages/Agenda";
import { Admin } from "./pages/Admin";
import { Alertas } from "./pages/Alertas";
import { Ativos } from "./pages/Ativos";
import { Auditoria } from "./pages/Auditoria";
import { DetalheAtivo } from "./pages/DetalheAtivo";
import { DetalheDocumento } from "./pages/DetalheDocumento";
import { DetalheLocal } from "./pages/DetalheLocal";
import { DetalheOrdem } from "./pages/DetalheOrdem";
import { DetalhePreventiva } from "./pages/DetalhePreventiva";
import { DetalheServico } from "./pages/DetalheServico";
import { DetalheT\u00E9cnico as DetalhePrestador } from "./pages/DetalhePrestador";
import { Documentos } from "./pages/Documentos";
import { EditarDocumento } from "./pages/EditarDocumento";
import { EditarPreventiva } from "./pages/EditarPreventiva";
import { EditarT\u00E9cnico as EditarPrestador } from "./pages/EditarPrestador";
import { Estoque } from "./pages/Estoque";
import { FilaEstoque } from "./pages/FilaEstoque";
import { GestaoServicosDashboard } from "./pages/GestaoServicosDashboard";
import { ImprimirOrdem } from "./pages/ImprimirOrdem";
import { Locais } from "./pages/Locais";
import { MovimentacoesHistorico } from "./pages/estoque/MovimentacoesHistorico";
import { NovaMovimentacaoEstoque } from "./pages/estoque/NovaMovimentacaoEstoque";
import { NovaSolicitacaoEstoque } from "./pages/estoque/NovaSolicitacaoEstoque";
import { NovaOrdem } from "./pages/NovaOrdem";
import { NovaPreventiva } from "./pages/NovaPreventiva";
import { NovoDocumento } from "./pages/NovoDocumento";
import { NovoServico } from "./pages/NovoServico";
import { NovoT\u00E9cnico as NovoPrestador } from "./pages/NovoPrestador";
import { Ordens } from "./pages/Ordens";
import { Preventivas } from "./pages/Preventivas";
import { Relatorios } from "./pages/Relatorios";
import { Servicos } from "./pages/Servicos";
import { T\u00E9cnicos as Prestadores } from "./pages/Prestadores";
import { VisaoGeral } from "./pages/VisaoGeral";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/ordens/:id/imprimir" element={<ImprimirOrdem />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<VisaoGeral />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="alertas" element={<Alertas />} />
            <Route path="servicos" element={<GestaoServicosDashboard />} />
            <Route path="servicos/corretivas" element={<Servicos />} />
            <Route path="servicos/nova" element={<NovoServico />} />
            <Route path="servicos/:id" element={<DetalheServico />} />

            <Route path="ordens" element={<Ordens />} />
            <Route path="ordens/nova" element={<NovaOrdem />} />
            <Route path="ordens/:id" element={<DetalheOrdem />} />

            <Route path="preventivas" element={<Preventivas />} />
            <Route path="preventivas/nova" element={<NovaPreventiva />} />
            <Route path="preventivas/:id" element={<DetalhePreventiva />} />
            <Route path="preventivas/:id/editar" element={<EditarPreventiva />} />

            <Route path="estoque" element={<Estoque />} />
            <Route path="estoque/movimentacoes/nova" element={<NovaMovimentacaoEstoque />} />
            <Route path="estoque/movimentacoes" element={<MovimentacoesHistorico />} />
            <Route path="estoque/solicitacoes/nova" element={<NovaSolicitacaoEstoque />} />
            <Route path="estoque/fila" element={<FilaEstoque />} />

            <Route path="ativos" element={<Ativos />} />
            <Route path="ativos/:id" element={<DetalheAtivo />} />
            <Route path="locais" element={<Locais />} />
            <Route path="locais/:id" element={<DetalheLocal />} />

            <Route path="documentos" element={<Documentos />} />
            <Route path="documentos/novo" element={<NovoDocumento />} />
            <Route path="documentos/:id" element={<DetalheDocumento />} />
            <Route path="documentos/:id/editar" element={<EditarDocumento />} />

            <Route path="prestadores" element={<Prestadores />} />
            <Route path="prestadores/novo" element={<NovoPrestador />} />
            <Route path="prestadores/:id/editar" element={<EditarPrestador />} />
            <Route path="prestadores/:id" element={<DetalhePrestador />} />

            <Route path="relatorios" element={<Relatorios />} />
            <Route path="admin" element={<Admin />} />
            <Route path="auditoria" element={<Auditoria />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
