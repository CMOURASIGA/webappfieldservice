"use client";

import { CardFooterItem } from "@cnc-ti/layout-basic";
import Link from "next/link";
import IconSearch from "@/icons/search";
import IconEdit from "@/icons/edit";
import IconTrash from "@/icons/trash";
import { ReactNode } from "react";

type CardFooterActionsProps = {
  viewHref?: string;
  editHref?: string;
  onDelete?: () => void;
  isDeleting?: boolean;
  customActions?: ReactNode[];
  viewTitle?: string;
  editTitle?: string;
  deleteTitle?: string;
};

export function CardFooterActions({
  viewHref,
  editHref,
  onDelete,
  isDeleting = false,
  customActions = [],
  viewTitle = "Visualizar",
  editTitle = "Editar",
  deleteTitle = "Excluir",
}: CardFooterActionsProps) {
  return (
    <>
      {viewHref && (
        <CardFooterItem>
          <Link href={viewHref} className="cnc-text-brand-blue-500" title={viewTitle}>
            <IconSearch className="w-[18px] h-[18px]" />
          </Link>
        </CardFooterItem>
      )}

      {editHref && (
        <CardFooterItem>
          <Link href={editHref} className="cnc-text-brand-blue-500" title={editTitle}>
            <IconEdit className="w-[18px] h-[18px]" />
          </Link>
        </CardFooterItem>
      )}

      {customActions.map((action, index) => (
        <CardFooterItem key={`custom-action-${index}`}>
          {action}
        </CardFooterItem>
      ))}

      {onDelete && (
        <CardFooterItem>
          <button
            type="button"
            className="cnc-text-brand-red-600 hover:opacity-80 disabled:opacity-50"
            title={deleteTitle}
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <svg className="animate-spin h-[18px] w-[18px] text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <IconTrash className="w-[18px] h-[18px]" />
            )}
          </button>
        </CardFooterItem>
      )}
    </>
  );
}
