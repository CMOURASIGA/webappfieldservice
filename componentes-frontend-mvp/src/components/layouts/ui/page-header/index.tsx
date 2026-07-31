"use client";
import {
  PageHeaderActionsContainer,
  PageHeader as PageHeaderClient,
  PageHeaderTitle,
  PageHeaderTitleContent,
} from "@cnc-ti/layout-basic";
import { ButtonBack } from "../buttons/button-back/button-back";
import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { ButtonOutline } from "../buttons/button-outline/button-outline";
import { ButtonDelete } from "../buttons/button-delete/button-delete";
import { useSession } from "next-auth/react";

interface Props {
  title: string;
  description?: string;
  goBack?: boolean;
  urlBack?: string;
  urlList?: string;
  children?: ReactNode;
  urlEdit?: string;
  onDelete?: () => void; // A função que realmente exclui
  labelDelete?: string;
  hideWhenUnauthenticated?: boolean;
}

export function PageHeader({
  title,
  description,
  goBack = false,
  urlBack,
  children,
  urlEdit,
  onDelete,
  urlList,
  hideWhenUnauthenticated,
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  if (hideWhenUnauthenticated && !session) {
    return null;
  }

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    if (onDelete) onDelete();
    setShowConfirm(false);
    router.push(urlList ?? '');
  };

  return (
    <>
      <PageHeaderClient>
        <PageHeaderTitleContent>
          {goBack && (
            <div className="mr-4">
              <ButtonBack url={urlBack} />
            </div>
          )}
          <PageHeaderTitle titleAs="h1" title={title} description={description} />
        </PageHeaderTitleContent>

        <PageHeaderActionsContainer>
          {/* {session && onDelete && (
            <ButtonDelete
              onClick={handleDeleteClick}
            />
          )} */}

          {/* {session && urlEdit && (
            <ButtonOutline onClick={() => router.push(urlEdit)}>
              <p className="text-xs font-medium">Editar</p>
            </ButtonOutline>
          )} */}

          {children}
        </PageHeaderActionsContainer>
      </PageHeaderClient>

      {/* Modal de Confirmação Simples com Tailwind */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full mx-4 border border-gray-100">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Confirmar exclusão</h3>
            </div>

            <p className="text-gray-600 text-sm mb-6">
              Tem certeza que deseja excluir <strong>&ldquo;{title}&rdquo;</strong>? Esta ação não poderá ser desfeita.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"
              >
                Confirmar e Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}