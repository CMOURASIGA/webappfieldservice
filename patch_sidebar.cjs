const fs = require('fs');
let code = fs.readFileSync('src/layouts/Sidebar.tsx', 'utf8');

const newNavItems = `const navItems = [
  { icon: LayoutDashboard, label: "Visão Geral", href: "/" },
  { icon: Wrench, label: "Gestão de Serviços", href: "/servicos" },
  { icon: PackageSearch, label: "Gestão de Estoque", href: "/estoque" },
  { icon: FileText, label: "Documentação Regulatória", href: "/documentos" },
];

const adminItems = [
  { icon: Settings, label: "Configurações", href: "/admin" },
];`;

code = code.replace(/const navItems = \[[\s\S]*?\];[\s\S]*?const adminItems = \[[\s\S]*?\];/, newNavItems);

fs.writeFileSync('src/layouts/Sidebar.tsx', code);
