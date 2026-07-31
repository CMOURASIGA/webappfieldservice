const fs = require('fs');

function fixBackButton(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Regex to match Link wrapped ArrowLeft buttons
  const linkRegex = /<Link\s+to="[^"]*"\s*>\s*<Button\s+variant="(?:outline|ghost)"(?:\s+size="icon")?(?:\s+className="[^"]*")?\s*>\s*<ArrowLeft\s+className="[^"]*"\s*\/>\s*<\/Button>\s*<\/Link>/g;
  
  if (linkRegex.test(content)) {
    content = content.replace(linkRegex, (match) => {
      // Extract properties of the button
      const buttonMatch = match.match(/<Button(.*?)>/);
      const arrowMatch = match.match(/<ArrowLeft(.*?)\/>/);
      return `<Button ${buttonMatch[1]} onClick={() => navigate(-1)}>\n              <ArrowLeft ${arrowMatch[1]}/>\n            </Button>`;
    });
  }
  
  // also handle some `<Link to="/..."><Button variant="ghost"...><ArrowLeft/></Button></Link>` which is the same regex

  // sometimes it's written in one line, sometimes multiple.
  const linkRegex2 = /<Link to="[^"]*"(?:\s+className="[^"]*")?>\s*<ArrowLeft\s+className="[^"]*"\s*\/>\s*<\/Link>/g;
  if (linkRegex2.test(content)) {
    content = content.replace(linkRegex2, (match) => {
       const arrowMatch = match.match(/<ArrowLeft(.*?)\/>/);
       return `<button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700">\n            <ArrowLeft ${arrowMatch[1]}/>\n          </button>`;
    });
  }

  // Handle bare Button without Link but just using onClick? 
  // Wait, let's see if there are missing Link wrappings
  const linkRegex3 = /<Link to="[^"]*"(?:\s+className="[^"]*")?>\s*(<Button\s+variant="ghost"\s+className="[^"]*">\s*<ArrowLeft\s+className="[^"]*"\s*\/>\s*<\/Button>)\s*<\/Link>/g;
  if (linkRegex3.test(content)) {
    content = content.replace(linkRegex3, (match, p1) => {
      return p1.replace('<Button ', '<Button onClick={() => navigate(-1)} ');
    });
  }

  // Just to be sure, check if there is an <ArrowLeft> wrapped by Link in another way
  const genericLinkArrow = /<Link\s+to="[^"]*">\s*<Button([^>]*)>\s*<ArrowLeft([^>]*)\/>\s*<\/Button>\s*<\/Link>/g;
  content = content.replace(genericLinkArrow, '<Button$1 onClick={() => navigate(-1)}>\n              <ArrowLeft$2/>\n            </Button>');

  fs.writeFileSync(file, content);
}

const files = [
  'src/pages/NovoDocumento.tsx',
  'src/pages/FilaEstoque.tsx',
  'src/pages/DetalheLocal.tsx',
  'src/pages/EditarDocumento.tsx',
  'src/pages/DetalheAtivo.tsx',
  'src/pages/EditarPreventiva.tsx',
  'src/pages/DetalheDocumento.tsx',
  'src/pages/DetalhePreventiva.tsx'
];

files.forEach(fixBackButton);

