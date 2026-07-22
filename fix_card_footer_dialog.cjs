const fs = require('fs');
let content = fs.readFileSync('src/components/ui/CardFooterActions.tsx', 'utf8');

if (!content.includes('DialogContent')) {
  content = content.replace(
    'import { Button } from "./Button";',
    'import { Button } from "./Button";\nimport { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@cnc-ti/layout-basic";\nimport { useState } from "react";'
  );

  content = content.replace(
    'children,\n}: CardFooterActionsProps) => {',
    'children,\n}: CardFooterActionsProps) => {\n  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);'
  );

  content = content.replace(
    /<Button\s*variant="secondary"\s*size="sm"\s*className="w-8 h-8 rounded p-0 text-red-500 hover:text-red-700 hover:bg-red-50"\s*onClick=\{onDelete\}\s*title=\{deleteLabel\}\s*aria-label=\{deleteLabel\}\s*>\s*\{isDeactivate \? <PowerOff className="w-4 h-4" \/> : <Trash2 className="w-4 h-4" \/>\}\s*<\/Button>/g,
    `<>
        <Button 
          variant="secondary" 
          size="sm" 
          className="w-8 h-8 rounded p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => setIsDeleteDialogOpen(true)}
          title={deleteLabel}
          aria-label={deleteLabel}
        >
          {isDeactivate ? <PowerOff className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
        </Button>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isDeactivate ? "Confirmar inativação" : "Confirmar exclusão"}</DialogTitle>
              <DialogDescription>
                {isDeactivate 
                  ? "Deseja realmente inativar este registro? O registro será mantido no histórico e deixará de ficar disponível para novos vínculos."
                  : "Deseja realmente excluir este registro? Esta ação não pode ser desfeita e removerá os dados permanentemente."}
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
                  onDelete();
                  setIsDeleteDialogOpen(false);
                }}
              >
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>`
  );

  fs.writeFileSync('src/components/ui/CardFooterActions.tsx', content);
}
