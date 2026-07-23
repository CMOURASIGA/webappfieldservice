import React from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2, PowerOff, History, Printer } from "lucide-react";
import { Button } from "./Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@cnc-ti/layout-basic";
import { useState } from "react";

interface CardFooterActionsProps {
  onView?: () => void;
  viewLink?: string;
  viewLabel?: string;
  
  onEdit?: () => void;
  editLink?: string;
  editLabel?: string;
  
  onDelete?: () => void;
  deleteLabel?: string;
  isDeactivate?: boolean;
  
  onHistory?: () => void;
  historyLabel?: string;
  
  onPrint?: () => void;
  printLabel?: string;
  children?: React.ReactNode;
}

export const CardFooterActions = ({
  onView,
  viewLink,
  viewLabel = "Ver detalhes",
  onEdit,
  editLink,
  editLabel = "Editar registro",
  onDelete,
  deleteLabel = "Inativar registro",
  isDeactivate = true,
  onHistory,
  historyLabel = "Consultar histórico",
  onPrint,
  printLabel = "Imprimir",
  children,
}: CardFooterActionsProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const renderViewButton = () => {
    if (viewLink) {
      return (
        <Link to={viewLink}>
          <Button variant="primary" size="sm" className="gap-2 shadow-1">
            <Eye className="w-4 h-4" /> {viewLabel}
          </Button>
        </Link>
      );
    }
    if (onView) {
      return (
        <Button variant="primary" size="sm" className="gap-2 shadow-1" onClick={onView}>
          <Eye className="w-4 h-4" /> {viewLabel}
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="card-action-bar">
      <div className="card-action-cell card-action-primary">
        {renderViewButton()}
      </div>
      {children && <div className="card-action-cell card-action-custom">{children}</div>}
      
      {onHistory && (
        <Button
          variant="secondary" 
          size="sm" 
          className="card-action-button"
          onClick={onHistory}
          title={historyLabel}
          aria-label={historyLabel}
        >
          <History className="w-4 h-4" />
        </Button>
      )}
      
      {onPrint && (
        <Button
          variant="secondary" 
          size="sm" 
          className="card-action-button"
          onClick={onPrint}
          title={printLabel}
          aria-label={printLabel}
        >
          <Printer className="w-4 h-4" />
        </Button>
      )}

      {(onEdit || editLink) && (
        editLink ? (
          <Link to={editLink}>
            <Button
              variant="secondary" 
              size="sm" 
              className="card-action-button"
              title={editLabel}
              aria-label={editLabel}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </Link>
        ) : (
          <Button
            variant="secondary" 
            size="sm" 
            className="card-action-button"
            onClick={onEdit}
            title={editLabel}
            aria-label={editLabel}
          >
            <Pencil className="w-4 h-4" />
          </Button>
        )
      )}
      
      {onDelete && (
        <>
        <Button
          variant="secondary" 
          size="sm" 
          className="card-action-button text-red-700 hover:bg-red-50"
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
                <Button variant="secondary">Cancelar</Button>
              </DialogClose>
              <Button 
                variant="primary" 
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
      </>
      )}
    </div>
  );
};
