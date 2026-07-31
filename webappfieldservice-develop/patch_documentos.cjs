const fs = require('fs');
let code = fs.readFileSync('src/pages/Documentos.tsx', 'utf8');

code = code.replace(/import \{ isPast, parseISO, differenceInDays, format \} from "date-fns";/, 'import { format, parseISO } from "date-fns";\nimport { getDocumentStatus } from "../utils/documentStatus";');

code = code.replace(/const getDocStatus = \(doc: Document\) => \{[\s\S]*?\};\n/, 'const getDocStatus = (doc: Document) => getDocumentStatus(doc.expirationDate, doc.status);\n');

fs.writeFileSync('src/pages/Documentos.tsx', code);
