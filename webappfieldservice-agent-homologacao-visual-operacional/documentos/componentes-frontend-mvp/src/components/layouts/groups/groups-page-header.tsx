"use client";

import { PageHeader, PageHeaderActionsContainer, PageHeaderTitle, PageHeaderTitleContent } from "@cnc-ti/layout-basic";
import { ButtonOutline } from "../ui/buttons/button-outline/button-outline";
import { PlusIcon } from "../ui/icons/plus";
import { useQueryString } from "@/hooks/useQueryParams";
import { useDrawer } from "@/hooks/use-drawer";

export function GruposPageHeader() {
  const { addQueryString } = useQueryString();
  const { openDrawer } = useDrawer();
  
  function handleGroup() {
    addQueryString("grupoId", "");
    openDrawer("form-group");
  }
  
  return (
    <PageHeader className="flex flex-col gap-y-6 lg:flex-row">
      <PageHeaderTitleContent>
        <PageHeaderTitle
          title="Grupos"
          description="Gerencie, cadastre e edite os grupos utilizados nas negociações."
        />
      </PageHeaderTitleContent>
      <PageHeaderActionsContainer>
        <ButtonOutline
          onClick={handleGroup}
          aria-label="Cadastrar novo grupo"
        >
          <PlusIcon /> Novo Grupo
        </ButtonOutline>
      </PageHeaderActionsContainer>
    </PageHeader>
  );
}