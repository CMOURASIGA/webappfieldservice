const fs = require('fs');
let content = fs.readFileSync('src/layouts/Sidebar.tsx', 'utf8');

if (!content.includes('PackageSearch')) {
    content = content.replace('CalendarDays, X', 'CalendarDays, PackageSearch, X');
    content = content.replace('CalendarDays, X', 'CalendarDays, PackageSearch, X'); // just in case
    
    // add PackageSearch to import if not added
    if (!content.includes('PackageSearch')) {
        content = content.replace('import { LayoutDashboard', 'import { PackageSearch, LayoutDashboard');
    }
}

content = content.replace(/\{ icon: FileText, label: "Documentos", href: "\/documentos" \},/, 
  '{ icon: PackageSearch, label: "Estoque", href: "/estoque" },\n  { icon: FileText, label: "Documentos", href: "/documentos" },');

fs.writeFileSync('src/layouts/Sidebar.tsx', content);
