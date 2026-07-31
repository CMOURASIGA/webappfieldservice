"use client";
import { Group } from "@/types/group";
import { FolderOpenIcon } from "../ui/icons/folder-open";
import { CardGroup } from "./card-group";

interface GridGroupsProps {
  groups?: Group[];
  onEdit?: (group: Group) => void;
}

export function GridGroups({ groups = [], onEdit }: GridGroupsProps) {
  
  if (!groups.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-gray-50 rounded">
        <FolderOpenIcon className="mb-4 size-12" />
        <span className="text-lg font-medium">Nenhum grupo encontrado</span>
        <span className="text-sm text-gray-400 mt-2">
          Tente ajustar os filtros ou adicionar um novo grupo.
        </span>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {groups.map((grp) => (
        <CardGroup key={grp.idGrupo} group={grp} />
      ))}
    </ul>
  );
}
