const fs = require('fs');
let content = fs.readFileSync('src/pages/Preventivas.tsx', 'utf8');

if (!content.includes('import { v4 as uuidv4 }')) {
  content = content.replace(
    'import { useNavigate, useSearchParams } from "react-router-dom";',
    'import { useNavigate, useSearchParams } from "react-router-dom";\nimport { v4 as uuidv4 } from "uuid";'
  );
}

fs.writeFileSync('src/pages/Preventivas.tsx', content);
