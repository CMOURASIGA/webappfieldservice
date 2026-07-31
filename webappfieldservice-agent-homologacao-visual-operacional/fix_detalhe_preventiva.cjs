const fs = require('fs');
let content = fs.readFileSync('src/pages/DetalhePreventiva.tsx', 'utf8');

// replace Excluir button with Dialog
content = content.replace(
  'import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";',
  'import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";\nimport { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@cnc-ti/layout-basic";'
);

content = content.replace(
  'const [plan, setPlan] = useState<PreventivePlan | null>(null);',
  'const [plan, setPlan] = useState<PreventivePlan | null>(null);\n  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);'
);

content = content.replace(
  /const handleDelete = \(\) => \{\s*if \(window\.confirm\("Deseja realmente excluir este plano preventivo\?"\)\) \{\s*const plans = storageService\.get\("gsi_preventive_plans"\);\s*storageService\.set\("gsi_preventive_plans", plans\.filter\(p => p\.id !== id\)\);\s*navigate\("\/preventivas"\);\s*\}\s*\};/g,
  `const handleDelete = () => {
    const plans = storageService.get("gsi_preventive_plans");
    storageService.set("gsi_preventive_plans", plans.map(p => p.id === id ? { ...p, status: 'Inativo' } : p));
    navigate("/preventivas");
  };`
);

content = content.replace(
  /<Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick=\{handleDelete\}>\s*<Trash2 className="w-4 h-4 mr-2" \/> Excluir\s*<\/Button>/g,
  `<Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setIsDeleteDialogOpen(true)}>
            <PowerOff className="w-4 h-4 mr-2" /> Inativar
          </Button>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar inativação</DialogTitle>
                <DialogDescription>
                  Deseja realmente inativar este plano preventivo? O registro será mantido no histórico e deixará de ficar disponível para novos vínculos.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button 
                  variant="default" 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    handleDelete();
                    setIsDeleteDialogOpen(false);
                  }}
                >
                  Confirmar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>`
);

content = content.replace(
  'import { ArrowLeft, Calendar, FileText, CheckCircle2, Clock, Settings, Edit, Trash2 } from "lucide-react";',
  'import { ArrowLeft, Calendar, FileText, CheckCircle2, Clock, Settings, Edit, Trash2, PowerOff } from "lucide-react";'
);

fs.writeFileSync('src/pages/DetalhePreventiva.tsx', content);
