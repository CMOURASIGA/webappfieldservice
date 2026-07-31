import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, History, Pencil, PowerOff, Printer, Trash2 } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@cnc-ti/layout-basic";
import { Button } from "./Button";

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

const iconClassName = "h-4 w-4";

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
  historyLabel = "Consultar histÃ³rico",
  onPrint,
  printLabel = "Imprimir",
  children,
}: CardFooterActionsProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const renderAction = ({
    label,
    icon,
    onClick,
    to,
    className,
  }: {
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
    to?: string;
    className?: string;
  }) => {
    const mergedClassName = ["card-action-button", className].filter(Boolean).join(" ");

    if (to) {
      return (
        <Link to={to} className={mergedClassName} title={label} aria-label={label}>
          {icon}
        </Link>
      );
    }

    if (onClick) {
      return (
        <button type="button" className={mergedClassName} onClick={onClick} title={label} aria-label={label}>
          {icon}
        </button>
      );
    }

    return null;
  };

  return (
    <div className="card-action-bar">
      {(viewLink || onView) && (
        <div className="card-action-cell">
          {renderAction({
            label: viewLabel,
            icon: <Eye className={iconClassName} />,
            onClick: onView,
            to: viewLink,
          })}
        </div>
      )}

      {children && <div className="card-action-cell card-action-custom">{children}</div>}

      {onHistory && (
        <div className="card-action-cell">
          {renderAction({
            label: historyLabel,
            icon: <History className={iconClassName} />,
            onClick: onHistory,
          })}
        </div>
      )}

      {onPrint && (
        <div className="card-action-cell">
          {renderAction({
            label: printLabel,
            icon: <Printer className={iconClassName} />,
            onClick: onPrint,
          })}
        </div>
      )}

      {(editLink || onEdit) && (
        <div className="card-action-cell">
          {renderAction({
            label: editLabel,
            icon: <Pencil className={iconClassName} />,
            onClick: onEdit,
            to: editLink,
          })}
        </div>
      )}

      {onDelete && (
        <>
          <div className="card-action-cell">
            {renderAction({
              label: deleteLabel,
              icon: isDeactivate ? <PowerOff className={iconClassName} /> : <Trash2 className={iconClassName} />,
              onClick: () => setIsDeleteDialogOpen(true),
              className: "text-red-700 hover:bg-red-50",
            })}
          </div>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isDeactivate ? "Confirmar inativaÃ§Ã£o" : "Confirmar exclusÃ£o"}</DialogTitle>
                <DialogDescription>
                  {isDeactivate
                    ? "Deseja realmente inativar este registro? O registro serÃ¡ mantido no histÃ³rico e deixarÃ¡ de ficar disponÃ­vel para novos vÃ­nculos."
                    : "Deseja realmente excluir este registro? Esta aÃ§Ã£o nÃ£o pode ser desfeita e removerÃ¡ os dados permanentemente."}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancelar</Button>
                </DialogClose>
                <Button
                  variant="primary"
                  className="bg-red-600 text-white hover:bg-red-700"
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
