const fs = require('fs');
let content = fs.readFileSync('src/layouts/Header.tsx', 'utf8');

content = content.replace(
  /currentUser\?\.role === 'admin' \? 'Administrador' : currentUser\?\.role === 'manager' \? 'Gestor' : 'Técnico'/g,
  "currentUser?.role === 'Administrador' ? 'Administrador' : currentUser?.role === 'Gestor GSI' ? 'Gestor' : 'Técnico'"
);

fs.writeFileSync('src/layouts/Header.tsx', content);
