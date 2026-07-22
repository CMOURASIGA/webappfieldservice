const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/pages/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Badge variants
  if (content.includes('<Badge')) {
    const old = content;
    content = content.replace(/<Badge([^>]*)variant="secondary"([^>]*)>/g, '<Badge$1variant="default"$2>');
    if (old !== content) changed = true;
  }

  // Button variants
  // Be careful with @cnc-ti/layout-basic which might have different variants.
  // Actually, @cnc-ti/layout-basic Button has: "default", "destructive", "outline", "secondary", "ghost", "link", "create"
  // Wait! Did I mix up standard Button and @cnc-ti Button?
  // Let's only replace if it's the internal Button, or let's check the error logs.
  
  // The error log says:
  // src/pages/DetalheOrdem.tsx(390,19): error TS2322: Type '"default"' is not assignable to type '"secondary" | "primary" | "destructive" | "ghost"'.
  // src/pages/DetalhePreventiva.tsx(106,20): error TS2322: Type '"outline"' is not assignable to type '"secondary" | "primary" | "destructive" | "ghost"'.
  // src/pages/EditarPreventiva.tsx(150,19): error TS2322: Type '"outline"' is not assignable to type '"secondary" | "primary" | "destructive" | "ghost"'.
  // src/pages/Estoque.tsx(104,18): error TS2322: Type '"outline"' is not assignable to type '"default" | "danger" | "info" | "warning" | "success"'. Wait, Estoque is Badge? No, Estoque line 104 says type '"outline" is not assignable to '"default" | "danger"...' That's a Badge!
  
  if (content.match(/<Button([^>]*)variant="(default|outline|icon)"([^>]*)>/) || content.match(/size="icon"/)) {
    const isInternalButton = content.includes('import { Button } from "../components/ui/Button"') || content.includes('import { Button } from "../../components/ui/Button"');
    
    if (isInternalButton) {
      content = content.replace(/<Button([^>]*)variant="default"([^>]*)>/g, '<Button$1variant="primary"$2>');
      content = content.replace(/<Button([^>]*)variant="outline"([^>]*)>/g, '<Button$1variant="secondary"$2>');
      content = content.replace(/<Button([^>]*)size="icon"([^>]*)>/g, '<Button$1size="sm" className="p-2"$2>');
      changed = true;
    }
  }

  // Estoque line 104 is Badge? Let's fix badge with outline
  content = content.replace(/<Badge([^>]*)variant="outline"([^>]*)>/g, '<Badge$1variant="default"$2>');

  // Prestadores.tsx 183
  content = content.replace(/<Badge([^>]*)variant="secondary"([^>]*)>/g, '<Badge$1variant="default"$2>');

  if (changed) {
    fs.writeFileSync(file, content);
  }
});
