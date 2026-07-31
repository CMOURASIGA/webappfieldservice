const fs = require('fs');
let content = fs.readFileSync('src/pages/Preventivas.tsx', 'utf8');

if (!content.includes('import { v4 as uuidv4 }')) {
  content = content.replace(
    'import { getComputedNextExecution, getStatus } from "../utils/preventiveStatus";',
    'import { getComputedNextExecution, getStatus } from "../utils/preventiveStatus";\nimport { v4 as uuidv4 } from "uuid";'
  );
}

fs.writeFileSync('src/pages/Preventivas.tsx', content);
