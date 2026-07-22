const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Update Terminology and group into the requested sections in the document
content = content.replace(
  /<nav className="p-4 space-y-1 overflow-y-auto h-\[calc\(100vh-64px\)\]">[\s\S]*?<\/nav>/,
  `<nav className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-64px)]">
        
        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Visão Geral</h3>
          <div className="space-y-1">
            <NavLink to="/" className={({ isActive }) => \`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors \${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}\`}>
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </NavLink>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Gestão de Serviços</h3>
          <div className="space-y-1">
            <NavLink to="/agenda" className={({ isActive }) => \`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors \${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}\`}>
              <CalendarDays className="w-5 h-5" />
              Agenda Operacional
            </NavLink>
            <NavLink to="/ordens" className={({ isActive }) => \`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors \${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}\`}>
              <Wrench className="w-5 h-5" />
              Ordens de Serviço (OS)
            </NavLink>
            <NavLink to="/demandas" className={({ isActive }) => \`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors \${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}\`}>
              <ClipboardList className="w-5 h-5" />
              Serviços (Demandas)
            </NavLink>
            <NavLink to="/preventivas" className={({ isActive }) => \`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors \${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}\`}>
              <CalendarClock className="w-5 h-5" />
              Planos Preventivos
            </NavLink>
            <NavLink to="/ativos" className={({ isActive }) => \`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors \${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}\`}>
              <Server className="w-5 h-5" />
              Ativos e Locais
            </NavLink>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Gestão de Estoque</h3>
          <div className="space-y-1">
            <NavLink to="/estoque" className={({ isActive }) => \`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors \${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}\`}>
              <Package className="w-5 h-5" />
              Materiais
            </NavLink>
            <NavLink to="/estoque/fila" className={({ isActive }) => \`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors \${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}\`}>
              <ShoppingCart className="w-5 h-5" />
              Solicitações
            </NavLink>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Doc. Regulatória</h3>
          <div className="space-y-1">
            <NavLink to="/documentos" className={({ isActive }) => \`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors \${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}\`}>
              <FileText className="w-5 h-5" />
              Documentos
            </NavLink>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Configurações</h3>
          <div className="space-y-1">
            <NavLink to="/configuracoes" className={({ isActive }) => \`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors \${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}\`}>
              <Settings className="w-5 h-5" />
              Gerais
            </NavLink>
          </div>
        </div>

      </nav>`
);

fs.writeFileSync('src/components/Sidebar.tsx', content);
