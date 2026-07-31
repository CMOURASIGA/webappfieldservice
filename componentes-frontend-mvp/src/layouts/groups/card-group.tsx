import {
  Card,
  CardContent,
  CardFooter,
  CardFooterItem,
} from "@cnc-ti/layout-basic";
import { useDrawer } from "@/hooks/use-drawer";
import { useQueryString } from "@/hooks/useQueryParams";
import { PencilIcon } from "../ui/icons/pincel";
import { TrashIcon } from "../ui/icons/trash";
import { Group } from "@/types/group";
import { useState } from "react";
import { useModal } from "@/hooks/use-modal";
import Modal from "../../layouts/ui/modal/modal";
import { useGroups } from "@/hooks/groups/use-groups";

/**
 * Propriedades para o CardGroup.
 * @property group - Objeto com os dados do grupo a serem exibidos no card.
 * @property onEdit - Função para editar o grupo.
 */
export interface CardGroupProps {
  group: Group;
}

function Spinner({ className = "size-5" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export function CardGroup({ group }: CardGroupProps) {
  const { openDrawer } = useDrawer();
  const { addQueryString } = useQueryString();
  const { deleteGroup, isDeleting } = useGroups();
  const { openModal, closeModal, activeModal } = useModal();
  const [groupToDelete, setGroupToDelete] = useState<number | null>(null);

  function handleEdit() {
    addQueryString("grupoId", group.idGrupo.toString());
    openDrawer("form-group");
  }
  const tipo = group.tipoClausula?.trim();

  return (
    <li className="flex">
      <Card className="pt-4">
        <CardContent className="flex flex-col gap-2 pt-4 flex-1">
          <div className="space-y-2">
            <span className="block text-xs text-slate-600 font-medium">
              Descrição MTE
            </span>
            <strong className="flex items-center gap-2 text-sm">
              {group.descricaoMTE}
            </strong>
          </div>
          <div>
            <span className="block text-xs text-slate-500 uppercase font-medium">
              Descrição CNC
            </span>
            <span className="text-sm font-medium">
              {group.descricaoCNC || (
                <span className="italic text-gray-400 text-xs">
                  Não informado
                </span>
              )}
            </span>
          </div>
          <div>
            <span className="block text-xs text-slate-500 uppercase font-medium">
              Tipo de cláusula
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold
               ${tipo === "S"
                  ? "bg-blue-100 text-blue-800"
                  : tipo === "E"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-400 italic"
                }`}
            >
              {tipo === "S"
                ? "Social"
                : tipo === "E"
                  ? "Econômico"
                  : "Não informado"}
            </span>
          </div>
        </CardContent>
        <CardFooter className="text-slate-600">
          <CardFooterItem>
            <button
              className="hover:text-blue-800 transition-all"
              title="Editar Grupo"
              onClick={handleEdit}
            >
              <PencilIcon />
            </button>
          </CardFooterItem>
          <CardFooterItem>
            <button
              className="text-red-600 hover:text-red-900 transition-all"
              title="Deletar Grupo"
              onClick={() => {
                setGroupToDelete(Number(group.idGrupo));
                openModal(`modal_delete_subgroup_${group.idGrupo}`);
              }}
            >
              <TrashIcon />
            </button>
          </CardFooterItem>
        </CardFooter>
      </Card>
      {typeof groupToDelete === "number" && (
        <Modal id={`modal_delete_subgroup_${groupToDelete}`}>
          <div className="relative p-4 text-center sm:p-5 w-[450px]">
            <div className="flex flex-col justify-center items-center mb-6 mx-auto">
              <TrashIcon size="size-12" />
            </div>
            <p className="mb-4 font-medium">
              Tem certeza que deseja remover o grupo?
            </p>
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => {
                  closeModal();
                  setGroupToDelete(null);
                }}
                type="button"
                className="py-2 px-4 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 transition-all"
              >
                Não, cancelar
              </button>
              <button
                onClick={async () => {
                  await deleteGroup(groupToDelete.toString());
                  closeModal();
                  setGroupToDelete(null);
                }}
                className={`bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all ${isDeleting ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner className="size-4" /> Removendo...
                  </span>
                ) : (
                  "Sim, tenho certeza"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </li>
  );
}
