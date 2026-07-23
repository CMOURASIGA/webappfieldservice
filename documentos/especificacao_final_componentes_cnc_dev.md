# Especificação Final de Adequação do Frontend com os Componentes CNC

## 1. Objetivo

Este documento define como o DEV deverá adaptar o MVP de Gestão de Serviços, Estoque e Documentação Regulatória utilizando os componentes já disponibilizados no pacote de frontend da CNC.

A implementação deverá reutilizar os padrões visuais e componentes existentes, evitando criar um novo design system ou componentes paralelos sem necessidade.

A base principal deverá ser:

```bash
@cnc-ti/layout-basic
```

Também deverão ser reaproveitados os componentes do pacote:

```text
componentes-frontend-mvp
```

A mudança esperada não é somente visual. O sistema deverá deixar de ser estruturado como uma sequência de tabelas, listas e menus isolados e passar a funcionar como uma central operacional por módulo.

---

## 2. Regra geral de implementação

Cada módulo deverá seguir esta estrutura:

```text
Cabeçalho da página
        ↓
Ações rápidas
        ↓
Indicadores acionáveis
        ↓
Filtros
        ↓
Cards operacionais
        ↓
Ações diretas no card
```

A estrutura deverá ser igual para todos os usuários.

Os perfis e permissões deverão controlar apenas as ações disponíveis, não o layout da tela.

### Não implementar

- dashboards diferentes por perfil
- estrutura visual diferente por usuário
- menu diferente por perfil
- cards duplicados conforme perfil
- blocos superiores inflados por tipo de usuário
- tabelas extensas como única forma de operação
- componentes visuais novos quando já houver equivalente na biblioteca CNC

---

## 3. Preparação técnica do projeto

### 3.1 Instalar a biblioteca principal

```bash
npm install @cnc-ti/layout-basic
```

### 3.2 Importar o estilo global

No layout raiz da aplicação:

```tsx
import "@cnc-ti/layout-basic/styles";
```

### 3.3 Dependências adicionais

Instalar apenas as dependências realmente utilizadas:

```bash
npm install   react-hook-form   @hookform/resolvers   zod   @tanstack/react-query   axios   react-select   date-fns   lucide-react   clsx   tailwind-merge   class-variance-authority
```

Para gráficos:

```bash
npm install @nivo/bar @nivo/line @nivo/pie
```

### 3.4 Estrutura de layout

O pacote possui duas estruturas:

```text
src/components/layouts/
src/layouts/
```

A estrutura principal deverá ser:

```text
src/components/layouts/
```

A pasta:

```text
src/layouts/
```

deverá ser tratada como legado.

O DEV não deverá ampliar essa duplicidade.

Sempre que possível:

- migrar imports legados
- centralizar novos componentes em `src/components/layouts`
- evitar cópias duplicadas
- remover componentes obsoletos após validação

---

## 4. Reorganização do menu lateral

O menu lateral deverá ser reduzido e agrupado por módulo.

### Estrutura final

```text
Visão Geral

Gestão de Serviços

Gestão de Estoque

Documentação Regulatória

Configurações
```

### Gestão de Serviços

As funcionalidades deverão aparecer dentro da tela do módulo:

- serviços preventivos
- serviços corretivos
- serviços preditivos
- inspeções
- ordens de serviço
- agenda
- ativos
- locais
- prestadores
- histórico

### Gestão de Estoque

Deverá concentrar:

- materiais
- entradas
- saídas
- solicitações
- reservas
- reposição
- histórico
- relatórios

### Documentação Regulatória

Deverá concentrar:

- documentos
- vencimentos
- alertas
- anexos
- renovações
- histórico
- conformidade

### Configurações

Deverá concentrar:

- usuários
- permissões
- categorias
- tipos de serviço
- periodicidades
- unidades
- locais
- parâmetros
- auditoria

---

## 5. Cabeçalho das páginas

Utilizar os componentes:

```tsx
PageHeader
PageHeaderTitle
PageHeaderTitleContent
PageHeaderActionsContainer
```

### Exemplo

```tsx
<PageHeader>
  <PageHeaderTitleContent>
    <PageHeaderTitle>Gestão de Estoque</PageHeaderTitle>
    <p>Controle materiais, movimentações e necessidades de reposição.</p>
  </PageHeaderTitleContent>

  <PageHeaderActionsContainer>
    <Button variant="outline">Exportar</Button>
    <Button variant="success">Novo material</Button>
  </PageHeaderActionsContainer>
</PageHeader>
```

### Regra

O cabeçalho deve conter:

- título
- descrição curta
- no máximo duas ações principais

As demais ações deverão aparecer na faixa de ações rápidas abaixo.

---

## 6. Botões

Utilizar:

```tsx
Button
```

E, quando fizer sentido, os componentes já existentes:

```text
ButtonSearch
ButtonDelete
ButtonExport
ButtonPrint
ButtonBack
ButtonOutline
ButtonSave
```

### Padrão de uso

| Tipo de ação | Aparência |
|---|---|
| Criar ou incluir | Verde |
| Ação principal | Azul |
| Confirmar | Azul ou verde |
| Ação secundária | Contorno |
| Excluir ou cancelar | Vermelho |
| Ação indisponível | Desabilitado |
| Processamento | Loading |

### Regra

Não utilizar cores diferentes sem finalidade semântica.

Não esconder a ação principal em menu suspenso.

---

## 7. Ações rápidas por módulo

## 7.1 Gestão de Estoque

Exibir no topo:

```text
[Novo material]
[Registrar entrada]
[Registrar saída]
[Solicitar material]
[Consultar movimentações]
[Buscar material]
```

## 7.2 Gestão de Serviços

Exibir:

```text
[Novo serviço]
[Nova preventiva]
[Nova corretiva]
[Nova inspeção]
[Nova ordem de serviço]
[Ver agenda]
[Buscar]
```

## 7.3 Documentação Regulatória

Exibir:

```text
[Novo documento]
[Registrar renovação]
[Anexar arquivo]
[Consultar vencimentos]
[Buscar documento]
```

### Implementação

Utilizar uma grade responsiva de botões ou cards de atalho.

A referência visual pode seguir os acessos rápidos utilizados na tela de Gestão de Eventos.

Cada ação deverá:

- possuir ícone
- possuir título
- possuir descrição curta
- abrir modal, drawer ou página conforme a complexidade

---

## 8. Indicadores acionáveis

Os indicadores deverão ser implementados como cards clicáveis.

Não deverão ser apenas números informativos.

### Comportamento obrigatório

```text
Usuário clica no indicador
        ↓
O filtro correspondente é aplicado
        ↓
Os cards abaixo são atualizados
        ↓
O filtro ativo fica visível
```

### Regras

- exibir título
- exibir quantidade
- exibir contexto ou período
- exibir cor ou badge de situação
- permitir clique
- possuir estado selecionado
- permitir limpar filtro
- preservar filtro ao retornar do detalhe

---

## 9. Indicadores de estoque

Remover ou reduzir o uso do indicador:

```text
Sem saldo
```

Criar indicadores orientados à operação:

- Reposição necessária
- Abaixo do estoque mínimo
- Reserva maior que disponibilidade
- Solicitações pendentes
- Compras em andamento
- Materiais inativos
- Movimentações do dia

### Regra de cálculo

```text
Saldo disponível = Saldo físico - Quantidade reservada
```

Um item entra em Reposição necessária quando:

```text
Saldo disponível <= Estoque mínimo
```

### Informações necessárias

- saldo físico
- quantidade reservada
- saldo disponível
- estoque mínimo
- estoque ideal
- quantidade sugerida para compra
- próxima data de utilização
- OS vinculadas à reserva

---

## 10. Cards operacionais

Utilizar:

```tsx
Card
CardHeader
CardContent
CardFooter
CardFooterItem
```

Também reaproveitar:

```text
src/components/shared/cards/CardBadge.tsx
src/components/shared/cards/CardFooterActions.tsx
src/components/shared/cards/TruncatedText.tsx
```

### Estrutura padrão

```text
CardHeader
- título
- código
- badge de status

CardContent
- informações principais
- responsável
- prazo
- local
- dados operacionais

CardFooter
- ações rápidas
```

### Regras

- o card deve ser uma unidade de trabalho
- evitar excesso de texto
- utilizar `TruncatedText` em textos longos
- exibir status e condição separadamente
- oferecer acesso ao detalhe
- permitir ações rápidas sem abrir outra tela

---

## 11. Card de material

### Conteúdo obrigatório

```text
Nome do material
Código
Categoria
Local
Saldo físico
Quantidade reservada
Saldo disponível
Estoque mínimo
Condição
Próxima necessidade
```

### Exemplo

```text
Lâmpada LED 18W          [Reposição necessária]

Código: MAT-00124
Local: Almoxarifado Central

Saldo físico: 20
Reservado: 20
Disponível: 0
Estoque mínimo: 10

Próxima utilização: 25/07/2026

[Visualizar] [Editar] [Solicitar compra] [Ver reservas]
```

### Ações

- visualizar
- editar
- registrar entrada
- registrar saída
- solicitar compra
- consultar reservas
- inativar

### Regra de exclusão

Não excluir definitivamente um material com histórico.

Utilizar inativação.

---

## 12. Card de serviço ou ordem de serviço

### Conteúdo obrigatório

```text
Código da OS
Título
Tipo de serviço
Ativo
Local
Técnico
Prestador
Data e hora prevista
Prioridade
Status
Condição
```

### Exemplo

```text
OS-2026-0045               [Programada]

Troca de componente elétrico
Tipo: Corretiva
Técnico: João
Local: Unidade Centro
Previsão: 25/07/2026 às 09:00

Condição: Aguardando material
Prioridade: Alta

[Abrir] [Editar] [Reprogramar] [Iniciar]
```

### Ações

- abrir
- editar
- atribuir técnico
- programar
- reprogramar
- iniciar
- pausar
- concluir
- validar
- anexar evidência
- consultar materiais

---

## 13. Card de documento regulatório

### Conteúdo obrigatório

```text
Nome
Tipo
Unidade
Órgão regulador
Responsável
Data de emissão
Data de vencimento
Dias restantes
Status
Anexo
```

### Exemplo

```text
Alvará de Funcionamento       [Crítico]

Unidade: Escola Centro
Órgão: Prefeitura
Responsável: Administrativo
Vencimento: 05/08/2026
Dias restantes: 14

[Abrir] [Editar] [Renovar] [Anexar]
```

### Ações

- abrir
- editar
- anexar arquivo
- registrar renovação
- alterar responsável
- consultar histórico

---

## 14. Badges

Utilizar:

```tsx
Badge
```

Ou:

```text
CardBadge
```

### Variantes disponíveis

```text
default
primary
success
warning
danger
```

### Aplicações

#### Status

- Aberta
- Programada
- Em execução
- Em validação
- Concluída
- Cancelada

#### Condições

- Aguardando material
- Aguardando compra
- Material liberado
- Aguardando terceiro
- Sem responsável
- Atrasada

#### Níveis

- Normal
- Atenção
- Crítico
- Vencido

### Regra

Status e condição não são a mesma coisa.

Utilizar badges separados quando necessário.

---

## 15. Kanban

O Kanban deverá utilizar apenas status principais.

### Colunas sugeridas

```text
Aberta
Planejamento
Programada
Em execução
Validação
Concluída
```

### Não criar colunas para

- aguardando material
- aguardando compra
- material liberado
- aguardando terceiro
- pausada
- atrasada
- reaberta

Essas situações deverão ser badges ou condições no card.

### Regra

O fluxo definitivo deverá ser validado antes da criação de transições obrigatórias.

---

## 16. Formulários

Utilizar:

```tsx
Input
Select
Combobox
Tabs
```

E os componentes já existentes em:

```text
src/components/layouts/ui/
```

### Input

Usar para:

- nome
- código
- quantidade
- valor
- telefone
- e-mail
- observações curtas

### Select

Usar para listas curtas e estáticas:

- categoria
- unidade de medida
- tipo
- status
- periodicidade
- prioridade

### Combobox

Usar para listas grandes e pesquisáveis:

- materiais
- ativos
- técnicos
- responsáveis
- locais
- prestadores
- órgãos reguladores

### Validação

Utilizar:

```text
react-hook-form
zod
@hookform/resolvers
```

### Regras obrigatórias

- mensagens de erro abaixo do campo
- labels visíveis
- indicar campos obrigatórios
- impedir envio duplicado
- exibir loading
- desabilitar ação durante processamento
- manter valores em caso de erro da API

---

## 17. Tabs

Utilizar:

```tsx
Tabs
TabsList
TabsTrigger
TabsContent
```

### Material

```text
Dados gerais
Estoque
Movimentações
Reservas
Histórico
```

### Serviço

```text
Dados gerais
Planejamento
Ordens de serviço
Materiais
Anexos
Histórico
```

### Documento

```text
Dados gerais
Anexos
Renovações
Alertas
Histórico
```

### Regra

Tabs devem organizar o detalhe de uma entidade.

Não devem substituir os módulos do menu.

---

## 18. Filtros

Utilizar campos `Input`, `Select` e `Combobox`.

Para filtros avançados, utilizar:

```tsx
Collapsible
CollapsibleTrigger
CollapsibleContent
```

### Estrutura

```text
Busca principal
Filtros básicos

[Filtros avançados]
```

### Filtros do estoque

- busca por nome ou código
- categoria
- unidade
- local
- situação
- ativo ou inativo
- abaixo do mínimo
- com reserva
- reposição necessária

### Filtros de serviços

- tipo
- status
- condição
- técnico
- prestador
- ativo
- local
- unidade
- prioridade
- período

### Filtros de documentos

- status
- responsável
- órgão
- tipo
- unidade
- abrangência
- com ou sem anexo

### Regras

- filtros combináveis
- filtros ativos visíveis
- botão limpar
- quantidade de resultados
- preservar filtros ao voltar do detalhe

---

## 19. Modal, dialog e drawer

O pacote já possui:

```text
Modal
Dialog
AlertDialog
Sheet
Drawer
```

### Usar Modal para

- novo material
- entrada rápida
- saída rápida
- solicitação de material
- nova preventiva
- nova corretiva
- novo documento
- anexar arquivo
- registrar renovação

### Usar AlertDialog para

- excluir
- inativar
- cancelar
- rejeitar
- concluir uma ação irreversível

### Usar Drawer ou Sheet para

- consultar detalhes rápidos
- editar dados simples
- visualizar histórico
- abrir uma OS a partir da agenda
- visualizar reservas de material

### Regra

Não abrir uma página completa para ações simples.

---

## 20. Dropdown e Popover

### Dropdown

Usar para ações secundárias:

```text
Mais opções
- imprimir
- duplicar
- consultar histórico
- cancelar
- inativar
```

### Popover

Usar para informações rápidas:

- reservas do material
- explicação do indicador
- responsáveis
- detalhes do alerta
- histórico resumido

### Regra

Não esconder a ação principal dentro do dropdown.

---

## 21. Agenda

Reaproveitar como referência os componentes existentes em:

```text
src/components/eventos/agenda/
```

Especialmente:

```text
agenda-eventos.tsx
agenda-toolbar.tsx
calendar-view.tsx
day-events-panel.tsx
list-view.tsx
```

### Adaptar para o MVP

Remover regras específicas de eventos.

Substituir por:

- OS
- preventivas
- corretivas
- inspeções
- técnico
- prestador
- ativo
- local

### Filtros

- técnico
- equipe
- prestador
- ativo
- local
- unidade
- tipo de serviço
- status
- prioridade

### Visões

- dia
- semana
- mês
- lista
- equipe

### Regras

- identificar conflitos
- mostrar atividades sem técnico
- mostrar atividades sem horário
- permitir reprogramação
- abrir o detalhe da OS
- exibir duração estimada

---

## 22. Visão Geral

A Visão Geral deverá ser única para todos.

Não deverá existir uma visão superior separada por perfil.

### Estrutura

```text
Alertas consolidados
        ↓
Agenda resumida
        ↓
Gráficos úteis
        ↓
Itens que precisam de decisão
```

### Indicadores

- OS atrasadas
- OS aguardando material
- serviços sem responsável
- preventivas vencidas
- preventivas próximas
- reposições necessárias
- solicitações pendentes
- documentos vencidos
- documentos críticos

### Regra de navegação

Ao clicar:

```text
Indicador
        ↓
Módulo correspondente
        ↓
Cards filtrados
```

### Bloco de decisão

Exibir:

- compra aguardando aprovação
- OS sem técnico
- OS travada por material
- documento crítico sem responsável
- reprogramação pendente
- conflito de agenda

---

## 23. Gráficos

Reaproveitar:

```text
src/components/shared/charts/bar.tsx
src/components/shared/charts/line.tsx
src/components/shared/charts/pie.tsx
```

### Barras

- OS por status
- atividades por técnico
- consumo por categoria
- documentos por responsável

### Linha

- evolução de consumo
- evolução de OS concluídas
- evolução de custos

### Pizza

- documentos por status
- serviços por tipo
- distribuição de estoque

### Regras

- limitar a quantidade de gráficos
- usar apenas gráficos úteis para decisão
- permitir clique ou detalhamento
- não utilizar gráfico decorativo
- exibir período analisado

---

## 24. Permissões

A tela será a mesma para todos.

As permissões deverão controlar:

- visualizar
- criar
- editar
- inativar
- aprovar
- executar
- validar
- cancelar
- exportar

### Exemplo

```text
Todos visualizam o card da OS.

Técnico:
- iniciar
- pausar
- concluir
- anexar evidência

Gestor:
- atribuir
- programar
- validar
- reabrir

Estoque:
- liberar material
- registrar saída

Consulta:
- visualizar
```

### Regra

Ocultar ou desabilitar ações sem permissão.

Não alterar a estrutura inteira da tela conforme o perfil.

---

## 25. Reaproveitamento dos componentes do pacote

### Utilizar como referência visual

```text
src/components/eventos/card-evento.tsx
src/components/reservas/card-reserva.tsx
src/components/espacos/card-espaco.tsx
src/components/cadastros/locais/card-local.tsx
```

### Dashboard

```text
src/components/eventos/dashboard/centro-controle.tsx
src/components/eventos/dashboard/indicadores-eventos.tsx
src/components/eventos/dashboard/painel-gerencial.tsx
src/components/eventos/dashboard/proximos-eventos.tsx
```

### Cards compartilhados

```text
src/components/shared/cards/CardBadge.tsx
src/components/shared/cards/CardFooterActions.tsx
src/components/shared/cards/TruncatedText.tsx
```

### Busca

```text
src/components/eventos/busca/
src/components/reservas/busca/
src/components/espacos/busca/
```

### Regra importante

O DEV deverá reaproveitar:

- estrutura visual
- composição
- responsividade
- componentes compartilhados
- padrões de interação

O DEV não deverá copiar diretamente:

- regras de negócio de eventos
- DTOs de eventos
- endpoints de eventos
- nomes de demandantes
- regras de reservas de espaço
- serviços de API específicos

A camada visual deve ser adaptada para o domínio do MVP.

---

## 26. Camada de dados

O pacote inclui referências de:

```text
services/
infra/
hooks/
```

A implementação deverá substituir as chamadas de eventos pelas APIs do MVP.

### Recomendações

- utilizar `@tanstack/react-query`
- centralizar chamadas em `services`
- utilizar `axios`
- criar hooks por domínio
- não chamar API diretamente dentro do componente visual

### Estrutura sugerida

```text
src/services/estoque/
src/services/servicos/
src/services/documentos/

src/hooks/estoque/
src/hooks/servicos/
src/hooks/documentos/
```

### Separação

```text
Componente visual
        ↓
Hook
        ↓
Service
        ↓
API
```

---

## 27. Estados obrigatórios dos componentes

Cada tela ou componente deverá considerar:

- carregando
- sem dados
- erro
- sucesso
- desabilitado
- sem permissão
- filtro sem resultado
- processamento de ação

### Exemplo

```text
Carregando cards
Sem materiais cadastrados
Nenhum resultado para os filtros
Erro ao carregar materiais
```

Não exibir áreas vazias sem orientação ao usuário.

---

## 28. Responsividade

Os cards deverão ser exibidos em grade responsiva.

### Referência

```text
Desktop: 3 ou 4 cards por linha
Tablet: 2 cards por linha
Mobile: 1 card por linha
```

### Mobile

- filtros avançados em drawer ou sheet
- ações secundárias em dropdown
- agenda adaptada para lista
- evitar tabela horizontal
- manter ação principal visível

---

## 29. Prioridade de implementação

### Etapa 1

- instalar e configurar `@cnc-ti/layout-basic`
- reorganizar menu
- remover dashboards por perfil
- criar Visão Geral única
- criar cabeçalhos padronizados
- criar ações rápidas
- criar cards compartilhados
- implementar badges
- implementar indicadores clicáveis

### Etapa 2

- substituir tabelas operacionais por cards
- adaptar filtros
- implementar modais e drawers
- corrigir indicadores de estoque
- simplificar Kanban
- adaptar agenda

### Etapa 3

- implementar gráficos
- concluir permissões
- ajustar responsividade
- implementar estados de loading, erro e vazio
- consolidar layouts legados
- remover duplicidades

---

## 30. Critérios de aceite

A implementação será considerada aderente quando:

- a biblioteca CNC estiver sendo utilizada
- o menu estiver reduzido por módulo
- não existirem dashboards diferentes por perfil
- cada módulo possuir ações rápidas
- indicadores forem clicáveis
- indicadores aplicarem filtros
- dados operacionais forem exibidos em cards
- cards utilizarem badges e ações no rodapé
- status e condições estiverem separados
- o Kanban possuir poucas colunas
- formulários utilizarem os componentes CNC
- filtros avançados utilizarem Collapsible
- ações simples utilizarem modal ou drawer
- a Visão Geral for única
- gráficos permitirem detalhamento
- permissões controlarem ações, não o layout
- a agenda permitir filtro por técnico
- tabelas não forem a única forma de operação
- componentes duplicados não forem criados sem necessidade
- a pasta legada de layouts não continuar crescendo

---

## 31. Resumo direto para o DEV

O DEV deverá utilizar o design system CNC e os componentes entregues como base.

A estrutura de cada módulo deverá seguir:

```text
PageHeader
        +
Ações rápidas com Button
        +
Indicadores com Card
        +
Filtros com Input, Select, Combobox e Collapsible
        +
Cards operacionais com Badge e CardFooterActions
        +
Modal, Dialog ou Drawer para ações
```

O sistema deverá possuir uma visão única para todos.

O perfil deverá controlar apenas permissões.

A prioridade não é recriar telas do sistema de eventos. A prioridade é reutilizar os componentes visuais e aplicar as regras de negócio de Gestão de Serviços, Estoque e Documentação Regulatória.
