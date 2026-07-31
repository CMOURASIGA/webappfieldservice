const fs = require('fs');

const fixFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/import \{.*?format,.*?parseISO.*?\} from "date-fns";/, (match) => {
    return match.replace("format,", "format, isValid,");
  });
  content = content.replace(/import \{.*?parseISO,.*?format.*?\} from "date-fns";/, (match) => {
    return match.replace("format", "format, isValid");
  });
  // Replace direct format(parseISO(...), ...) calls with safe checks
  // Using a regex is tricky, let's use a replacer function
  
  content = content.replace(/format\(parseISO\((.*?)\), '(.*?)'\)/g, "(isValid(parseISO($1)) ? format(parseISO($1), '$2') : 'Data Inválida')");

  fs.writeFileSync(filePath, content);
};

fixFile('src/pages/Preventivas.tsx');
fixFile('src/pages/Documentos.tsx');
fixFile('src/pages/DetalheAtivo.tsx');
fixFile('src/pages/DetalheOrdem.tsx');
