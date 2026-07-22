const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

if (!code.includes('@cnc-ti/layout-basic/styles')) {
  code = code.replace("import './index.css';", "import './index.css';\nimport '@cnc-ti/layout-basic/styles';");
  fs.writeFileSync('src/main.tsx', code);
}
