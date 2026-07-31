import { useQuery } from "@tanstack/react-query";
import { useQueryString } from "../useQueryParams";
import useRoute from "../useRoute";

// Mocks for missing service
const createGroup = async (_data: any) => { return {}; };
const updateGroup = async (_data: any, _id: string) => { return {}; };
const deleteGrupo = async (_id: string) => { return {}; };
const fetchBulkAllGrupos = async (_params: any) => { return { items: [] }; };

import { Group } from "@/types/group";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toastError, toastSuccess } from "../use-toast";

interface UpdateGroupInput extends Partial<Group> {
  id: string;
}

export function useGroups() {
  const { getAllQueryStrings } = useQueryString();
  const { handleItemClick } = useRoute();
  const queryClient = useQueryClient();

  const { grupoId, descricaoMTE, descricaoCNC, tipoClausula } =
    getAllQueryStrings();

  const params = {
    descricaoMTE,
    descricaoCNC,
    tipoClausula,
  };

  const { data: groups, isLoading } = useQuery({
    queryKey: ["grupos", params],
    queryFn: async () => await fetchBulkAllGrupos(params),
  });

  const submitForm = (data: any) => {
    handleItemClick(data, "value");
  };

  const groupSelected = grupoId
    ? groups?.items.find((group: Group) => String(group.idGrupo) === String(grupoId))
    : null;

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: UpdateGroupInput) => {
      const { descricaoMTE = "", descricaoCNC = "", tipoClausula = "" } = body;
      return updateGroup(
        { ...body, descricaoMTE, descricaoCNC, tipoClausula },
        id
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["grupos", params] });
      toastSuccess("Grupo atualizado com sucesso!");
    },
    onError: () => {
      toastError("Erro ao atualizar grupo. Tente novamente.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGrupo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["grupos", params] });
      toastSuccess("Grupo deletado com sucesso!");
    },
    onError: () => {
      toastError("Erro ao deletar grupo. Tente novamente.");
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["grupos", params] });
      toastSuccess("Grupo cadastrado com sucesso!");
    },
    onError: () => {
      toastError("Erro ao cadastrar grupo. Tente novamente.");
    },
  });

  return {
    groups,
    isLoading,
    submitForm,
    groupSelected,
    params,
    deleteGroup: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    updateGroup: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    createGroup: createGroupMutation.mutateAsync,
    isCreating: createGroupMutation.isPending,
  };
}