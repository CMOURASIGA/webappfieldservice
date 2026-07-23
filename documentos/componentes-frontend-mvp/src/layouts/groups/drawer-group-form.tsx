import {
  Drawer,
  DrawerHeader,
  DrawerContent,
} from "../../layouts/ui/drawer/drawer";
import { useDrawer } from "@/hooks/use-drawer";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { TextField } from "../../layouts/ui/fields/text-field/text-field";
import { useEffect } from "react";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@cnc-ti/layout-basic";
import { useGroups } from "@/hooks/groups/use-groups";
import { Group } from "@/types/group";
import { useIsMobile } from "@/hooks/use-mobile";

interface DrawerGroupFormProps {
  mode?: "edit" | "create";
  initialData?: Group;
}

interface GroupFormValues {
  idGrupo?: string;
  descricaoMTE: string;
  descricaoCNC?: string;
  tipoClausula?: string;
}

export function DrawerGroupForm({
  mode = "edit",
  initialData,
}: DrawerGroupFormProps) {
  const { closeDrawer } = useDrawer();
  const isMobile = useIsMobile();
  const { createGroup, updateGroup, isCreating, isUpdating } = useGroups();

  const methods = useForm({
    defaultValues: {
      id: initialData?.idGrupo || undefined,
      descricaoMTE: initialData?.descricaoMTE || "",
      descricaoCNC: initialData?.descricaoCNC || "",
      tipoClausula: initialData?.tipoClausula?.trim() || "",
    },
  });

  const typeClausesOptions = [
    { value: "0", label: "Nenhum" },
    { value: "S", label: "Social" },
    { value: "E", label: "Econômico" },
  ];

  useEffect(() => {
    if (initialData && mode === "edit") {
      methods.reset({
        id: initialData.idGrupo ? initialData.idGrupo : undefined,
        descricaoMTE: initialData.descricaoMTE || "",
        descricaoCNC: initialData.descricaoCNC || "",
        tipoClausula: initialData.tipoClausula?.trim() || "",
      });
    }
    if (mode === "create") {
      methods.reset({
        id: undefined,
        descricaoMTE: "",
        descricaoCNC: "",
        tipoClausula: "",
      });
    }
  }, [initialData, mode, methods]);

  async function onSubmit(data: GroupFormValues) {
    const payload: Group = {
      ...data,
      idGrupo: data.idGrupo || "",
      descricaoMTE: data.descricaoMTE || "",
      descricaoCNC: data.descricaoCNC || "",
      tipoClausula: data.tipoClausula || "",
    };
    if (mode === "edit" && initialData?.idGrupo) {
      await updateGroup({
        ...payload,
        id: String(initialData.idGrupo),
      });
    } else {
      await createGroup(payload);
    }

    methods.reset();
    closeDrawer();
  }

  return (
    <Drawer id="form-group" width={isMobile ? "100%" : "700px"}>
      <DrawerHeader>
        {mode === "edit" ? "Editar Grupo" : "Cadastrar Grupo"}
      </DrawerHeader>
      <DrawerContent>
        <p className="mb-4 text-gray-600 text-sm">
          {mode === "edit"
            ? "Altere as informações do grupo nos campos abaixo."
            : "Preencha os campos para cadastrar um novo grupo."}
        </p>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            aria-describedby="drawer-subgroup-desc"
          >
            <div className="space-y-1">
              <label
                className="block text-sm mb-1 font-medium text-gray-600"
                htmlFor="drawer-field-descricao-mte"
              >
                Descrição MTE <span className="text-red-600">*</span>
              </label>
              <TextField
                name="descricaoMTE"
                placeholder="Descrição MTE"
                id="drawer-field-descricao-mte"
              />
            </div>

            <TextField
              name="descricaoCNC"
              label="Descrição CNC"
              placeholder="Descrição CNC"
              id="drawer-field-descricao-cnc"
            />
            <Controller
              name="tipoClausula"
              control={methods.control}
              render={({ field }) => (
                <div className="space-y-1">
                  <label
                    className="block text-sm mb-1 font-medium text-gray-600"
                    htmlFor="drawer-field-tipo-clausula"
                  >
                    Tipo de cláusula
                  </label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo da cláusula" />
                    </SelectTrigger>
                    <SelectContent className="max-w-[442px] md:w-80">
                      {typeClausesOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value || ""}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
            <div className="flex items-center justify-end border-t border-gray-200 pt-4 mt-4">
              <Button type="submit" isLoading={isCreating || isUpdating}>
                {mode === "edit" ? "Salvar alterações" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DrawerContent>
    </Drawer>
  );
}
