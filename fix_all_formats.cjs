const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Make sure isValid is imported if format is used
  if (content.includes('format(') && !content.includes('isValid')) {
    content = content.replace(/import \{.*?format.*?\} from "date-fns";/, (match) => {
      return match.replace("format", "format, isValid");
    });
  }

  // Find all format(..., ...) calls that might not be wrapped
  // Actually, a simpler robust way to protect it is to override the `format` function locally in the files or safely wrap `parseISO`
  // But regex can work for `format(parseISO(something), formatString)`
  
  content = content.replace(/format\(\s*parseISO\(([^)]+)\)\s*,\s*('[^']+'|"[^"]+")\s*\)/g, 
    "(isValid(parseISO($1)) ? format(parseISO($1), $2) : 'Data Inválida')");

  fs.writeFileSync(file, content);
});

