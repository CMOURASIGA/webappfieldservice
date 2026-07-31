import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MainLayout } from "./layouts/MainLayout";
import { Agenda } from "./pages/Agenda";
import { Admin } from "./pages/Admin";
import { Ativos } from "./pages/Ativos";
import { Auditoria } from "./pages/Auditoria";
import { DetalheAtivo } from "./pages/DetalheAtivo";
import { DetalheDocumento } from "./pages/DetalheDocumento";
import { DetalheLocal } from "./pages/DetalheLocal";
import { DetalheOrdem } from "./pages/DetalheOrdem";
import { DetalhePreventiva } from "./pages/DetalhePreventiva";
import { DetalheServico } from "./pages/DetalheServico";
import * as DetalhePrestadorPage from "./pages/DetalhePrestador";
import { Documentos } from "./pages/Documentos";
import { VerificarDocumentos } from "./pages/VerificarDocumentos";
import { EditarDocumento } from "./pages/EditarDocumento";
import { EditarPreventiva } from "./pages/EditarPreventiva";
import * as EditarPrestadorPage from "./pages/EditarPrestador";
import { Estoque } from "./pages/Estoque";
import { FilaEstoque } from "./pages/FilaEstoque";
import { GestaoServicosDashboard } from "./pages/GestaoServicosDashboard";
import { ImprimirOrdem } from "./pages/ImprimirOrdem";
import { Locais } from "./pages/Locais";
import { MovimentacoesHistorico } from "./pages/estoque/MovimentacoesHistorico";
import { NovaMovimentacaoEstoque } from "./pages/estoque/NovaMovimentacaoEstoque";
import { NovoMaterialEstoque } from "./pages/estoque/NovoMaterialEstoque";
import { NovaSolicitacaoEstoque } from "./pages/estoque/NovaSolicitacaoEstoque";
import { VerificarEstoque } from "./pages/estoque/VerificarEstoque";
import { NovaOrdem } from "./pages/NovaOrdem";
import { NovaPreventiva } from "./pages/NovaPreventiva";
import { NovoAtivo } from "./pages/NovoAtivo";
import { NovoDocumento } from "./pages/NovoDocumento";
import { NovoLocal } from "./pages/NovoLocal";
import { NovoServico } from "./pages/NovoServico";
import { NovoTecnico as NovoPrestador } from "./pages/NovoPrestador";
import { Ordens } from "./pages/Ordens";
import { Preventivas } from "./pages/Preventivas";
import { Servicos } from "./pages/Servicos";
import { Tecnicos as Prestadores } from "./pages/Prestadores";

export default function App() {
  const DetalhePrestador = Object.values(DetalhePrestadorPage)[0] as React.ComponentType;
  const EditarPrestador = Object.values(EditarPrestadorPage)[0] as React.ComponentType;

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/ordens/:id/imprimir" element={<ImprimirOrdem />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/servicos" replace />} />
            <Route path="agenda" element={<Agenda />} />
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
            <Route path="estoque/materiais/novo" element={<NovoMaterialEstoque />} />
            <Route path="estoque/verificar" element={<VerificarEstoque />} />
            <Route path="estoque/movimentacoes/nova" element={<NovaMovimentacaoEstoque />} />
            <Route path="estoque/movimentacoes" element={<MovimentacoesHistorico />} />
            <Route path="estoque/solicitacoes/nova" element={<NovaSolicitacaoEstoque />} />
            <Route path="estoque/fila" element={<FilaEstoque />} />

            <Route path="ativos" element={<Ativos />} />
            <Route path="ativos/novo" element={<NovoAtivo />} />
            <Route path="ativos/:id" element={<DetalheAtivo />} />
            <Route path="locais" element={<Locais />} />
            <Route path="locais/novo" element={<NovoLocal />} />
            <Route path="locais/:id" element={<DetalheLocal />} />

            <Route path="documentos" element={<Documentos />} />
            <Route path="documentos/verificar" element={<VerificarDocumentos />} />
            <Route path="documentos/novo" element={<NovoDocumento />} />
            <Route path="documentos/:id" element={<DetalheDocumento />} />
            <Route path="documentos/:id/editar" element={<EditarDocumento />} />

            <Route path="prestadores" element={<Prestadores />} />
            <Route path="prestadores/novo" element={<NovoPrestador />} />
            <Route path="prestadores/:id/editar" element={<EditarPrestador />} />
            <Route path="prestadores/:id" element={<DetalhePrestador />} />

            <Route path="admin" element={<Admin />} />
            <Route path="auditoria" element={<Auditoria />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
