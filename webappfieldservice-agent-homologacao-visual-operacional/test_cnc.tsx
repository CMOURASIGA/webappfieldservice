import { PageHeader, PageHeaderTitle, PageHeaderTitleContent, PageHeaderActionsContainer, Button } from "@cnc-ti/layout-basic";

export const Teste = () => (
  <PageHeader>
    <PageHeaderTitleContent>
      <PageHeaderTitle title="Gestão de Estoque" />
      <p>Controle materiais, movimentações e necessidades de reposição.</p>
    </PageHeaderTitleContent>

    <PageHeaderActionsContainer>
      <Button variant="outline">Exportar</Button>
      <Button>Novo material</Button>
    </PageHeaderActionsContainer>
  </PageHeader>
)
