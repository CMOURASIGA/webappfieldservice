import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MainLayout } from "./layouts/MainLayout";
import { Estoque } from "./pages/Estoque";
import { FilaEstoque } from "./pages/FilaEstoque";
import { VisaoGeral } from "./pages/VisaoGeral";
import { Demandas } from "./pages/Demandas";
import { NovaDemanda } from "./pages/NovaDemanda";
import { DetalheDemanda } from "./pages/DetalheDemanda";
import { Ordens } from "./pages/Ordens";
import { NovaOrdem } from "./pages/NovaOrdem";
import { DetalheOrdem } from "./pages/DetalheOrdem";
import { Documentos } from "./pages/Documentos";
import { NovoDocumento } from "./pages/NovoDocumento";
import { DetalheDocumento } from "./pages/DetalheDocumento";
import { EditarDocumento } from "./pages/EditarDocumento";
import { Ativos } from "./pages/Ativos";
import { DetalheLocal } from "./pages/DetalheLocal";
import { DetalheAtivo } from "./pages/DetalheAtivo";
import { Preventivas } from "./pages/Preventivas";
import { NovaPreventiva } from "./pages/NovaPreventiva";
import { Prestadores } from "./pages/Prestadores";
import { NovoPrestador } from "./pages/NovoPrestador";
import { EditarPrestador } from "./pages/EditarPrestador";
import { DetalhePrestador } from "./pages/DetalhePrestador";
import { Admin } from "./pages/Admin";
import { Auditoria } from "./pages/Auditoria";
import { Agenda } from "./pages/Agenda";
import { ImprimirOrdem } from "./pages/ImprimirOrdem";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/ordens/:id/imprimir" element={<ImprimirOrdem />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<VisaoGeral />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="demandas" element={<Demandas />} />
            <Route path="demandas/nova" element={<NovaDemanda />} />
            <Route path="demandas/:id" element={<DetalheDemanda />} />
            
            <Route path="ordens" element={<Ordens />} />
            <Route path="ordens/nova" element={<NovaOrdem />} />
            <Route path="ordens/:id" element={<DetalheOrdem />} />

            <Route path="preventivas" element={<Preventivas />} />
            <Route path="preventivas/nova" element={<NovaPreventiva />} />
            <Route path="estoque" element={<Estoque />} />
            <Route path="estoque/fila" element={<FilaEstoque />} />
            <Route path="ativos" element={<Ativos />} />
            <Route path="ativos/:id" element={<DetalheAtivo />} />
            <Route path="locais/:id" element={<DetalheLocal />} />
            <Route path="documentos" element={<Documentos />} />
            <Route path="documentos/novo" element={<NovoDocumento />} />
            <Route path="documentos/:id" element={<DetalheDocumento />} />
            <Route path="documentos/:id/editar" element={<EditarDocumento />} />
            <Route path="admin" element={<Admin />} />
            <Route path="auditoria" element={<Auditoria />} />
            
            <Route path="prestadores" element={<Prestadores />} />
            <Route path="prestadores/novo" element={<NovoPrestador />} />
            <Route path="prestadores/:id/editar" element={<EditarPrestador />} />
            <Route path="prestadores/:id" element={<DetalhePrestador />} />
            
            {/* Fallbacks for now */}
            <Route path="relatorios" element={<div className="p-6">Relatórios (Em breve)</div>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}





