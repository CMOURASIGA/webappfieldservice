import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MainLayout } from "./layouts/MainLayout";
import { VisaoGeral } from "./pages/VisaoGeral";
import { Demandas } from "./pages/Demandas";
import { NovaDemanda } from "./pages/NovaDemanda";
import { DetalheDemanda } from "./pages/DetalheDemanda";
import { Ordens } from "./pages/Ordens";
import { NovaOrdem } from "./pages/NovaOrdem";
import { DetalheOrdem } from "./pages/DetalheOrdem";
import { Documentos } from "./pages/Documentos";
import { Ativos } from "./pages/Ativos";
import { Preventivas } from "./pages/Preventivas";
import { Admin } from "./pages/Admin";
import { Auditoria } from "./pages/Auditoria";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<VisaoGeral />} />
            <Route path="demandas" element={<Demandas />} />
            <Route path="demandas/nova" element={<NovaDemanda />} />
            <Route path="demandas/:id" element={<DetalheDemanda />} />
            
            <Route path="ordens" element={<Ordens />} />
            <Route path="ordens/nova" element={<NovaOrdem />} />
            <Route path="ordens/:id" element={<DetalheOrdem />} />

            <Route path="preventivas" element={<Preventivas />} />
            <Route path="ativos" element={<Ativos />} />
            <Route path="documentos" element={<Documentos />} />
            <Route path="admin" element={<Admin />} />
            <Route path="auditoria" element={<Auditoria />} />
            
            {/* Fallbacks for now */}
            <Route path="prestadores" element={<div className="p-6">Prestadores (Em breve)</div>} />
            <Route path="relatorios" element={<div className="p-6">Relatórios (Em breve)</div>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}





