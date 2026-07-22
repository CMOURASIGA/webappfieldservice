const fs = require('fs');

function fixBackButton(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Match anything inside to={} or to=""
  const genericLinkArrow = /<Link\s+to=\{?[^}>]*\}?>\s*<Button([^>]*)>\s*<ArrowLeft([^>]*)\/>\s*<\/Button>\s*<\/Link>/g;
  content = content.replace(genericLinkArrow, '<Button$1 onClick={() => navigate(-1)}>\n              <ArrowLeft$2/>\n            </Button>');

  const genericLinkArrow2 = /<Link\s+to=\{?[^}>]*\}?(?:\s+className="[^"]*")?>\s*<ArrowLeft([^>]*)\/>\s*<\/Link>/g;
  content = content.replace(genericLinkArrow2, '<button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700">\n            <ArrowLeft$1/>\n          </button>');

  fs.writeFileSync(file, content);
}

const files = [
  'src/pages/EditarDocumento.tsx',
  'src/pages/DetalheDocumento.tsx',
  'src/pages/DetalhePreventiva.tsx',
  'src/pages/EditarPreventiva.tsx'
];

files.forEach(fixBackButton);
