const fs = require('fs');
let content = fs.readFileSync('src/layouts/Sidebar.tsx', 'utf8');

content = content.replace(
  'const navItems = [',
  'const navItems: { icon: any, label: string, href: string, subItems?: { label: string, href: string }[] }[] = ['
);

content = content.replace(
  'const adminItems = [',
  'const adminItems: { icon: any, label: string, href: string, subItems?: { label: string, href: string }[] }[] = ['
);

fs.writeFileSync('src/layouts/Sidebar.tsx', content);
