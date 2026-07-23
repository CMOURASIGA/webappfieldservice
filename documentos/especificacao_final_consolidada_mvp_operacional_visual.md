# Especificação Final Consolidada do MVP
## Operacional, Requisitos, Usabilidade, Componentes CNC e Padrão Visual

## 1. Objetivo

Este documento consolida todas as orientações funcionais, operacionais, visuais e técnicas necessárias para evolução do MVP do sistema de Gestão de Manutenção Predial.

O documento deve orientar o DEV na implementação dos três módulos principais:

- Gestão de Estoque
- Gestão de Serviços e Manutenções
- Controle de Documentação Regulatória

Também consolida:

- aderência aos RN e RF
- organização dos menus
- nomenclaturas
- visão geral
- cards operacionais
- indicadores
- agenda
- Kanban
- formulários
- componentes CNC
- tipografia
- cores
- responsividade
- acessibilidade
- critérios de aceite

A implementação não deve apenas reproduzir visualmente as referências. Ela deve utilizar efetivamente os componentes oficiais do design system CNC e garantir que cada fluxo operacional esteja completo.

---

# 2. Diretriz Geral do Sistema

O sistema deverá funcionar como uma central operacional por módulo.

Cada tela principal deverá responder a três perguntas:

1. O que o usuário pode fazer nesta tela?
2. O que precisa da atenção dele agora?
3. Em qual item ele deve agir?

A estrutura padrão deverá ser:

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
Ações diretas
```

A tela deverá ser a mesma para todos os usuários.

Os perfis deverão controlar apenas:

- ações permitidas
- edição
- aprovação
- execução
- validação
- escopo de unidades e locais
- acesso a dados sensíveis

Não deverão existir dashboards ou layouts diferentes por perfil.

---

# 3. Base de Componentes

A implementação deve utilizar:

```bash
@cnc-ti/layout-basic
```

Sempre que houver um componente oficial equivalente, ele deve ser priorizado.

## Componentes principais

```tsx
PageHeader
PageHeaderTitle
PageHeaderTitleContent
PageHeaderActionsContainer

Button

Card
CardHeader
CardContent
CardFooter
CardFooterItem

Badge

Input
Select
Combobox

Tabs
TabsList
TabsTrigger
TabsContent

Collapsible
CollapsibleTrigger
CollapsibleContent

Dialog
AlertDialog
Modal
Drawer
Sheet
Popover
DropdownMenu
```

Também deverão ser reaproveitados os componentes existentes no pacote de frontend, especialmente:

```text
src/components/shared/cards/CardBadge.tsx
src/components/shared/cards/CardFooterActions.tsx
src/components/shared/cards/TruncatedText.tsx
```

E como referência visual:

```text
src/components/eventos/card-evento.tsx
src/components/reservas/card-reserva.tsx
src/components/espacos/card-espaco.tsx
src/components/cadastros/locais/card-local.tsx
```

## Regra

Não misturar componentes locais e oficiais sem necessidade.

Evitar:

```tsx
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "@cnc-ti/layout-basic";
```

Preferir:

```tsx
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Badge,
  Button
} from "@cnc-ti/layout-basic";
```

Componentes locais só devem permanecer quando:

1. não houver equivalente oficial
2. forem wrappers específicos de negócio
3. utilizarem internamente o componente CNC

---

# 4. Estrutura Final do Menu

O menu lateral deverá permanecer reduzido:

```text
Visão Geral

Gestão de Serviços

Gestão de Estoque

Documentação Regulatória

Configurações
```

## Gestão de Serviços

Deverá concentrar:

- manutenções corretivas
- ordens de serviço
- manutenções preventivas
- inspeções
- ativos
- locais
- técnicos
- prestadores
- agenda
- histórico

## Gestão de Estoque

Deverá concentrar:

- materiais
- entradas
- saídas
- solicitações
- reservas
- reposição
- movimentações
- relatórios

## Documentação Regulatória

Deverá concentrar:

- documentos
- vencimentos
- alertas
- anexos
- renovações
- recorrências
- histórico
- conformidade

## Configurações

Deverá concentrar:

- usuários
- permissões
- categorias
- tipos de serviço
- periodicidades
- unidades
- locais
- parâmetros de alerta
- auditoria

---

# 5. Nomenclatura

O conceito de Demanda deve ser removido.

Utilizar:

```text
Serviço
├── Preventivo
├── Corretivo
├── Preditivo
├── Inspeção
└── Outros tipos configuráveis
```

A Ordem de Serviço representa a execução operacional.

## Relação recomendada

```text
Serviço
        ↓
Planejamento
        ↓
Ordem de Serviço
        ↓
Execução
        ↓
Validação
        ↓
Conclusão
```

## Regras

- um serviço pode gerar uma ou mais OS
- uma OS pode ser criada manualmente
- um plano preventivo pode gerar OS recorrentes
- a OS representa o trabalho a executar
- a execução representa o registro auditável do trabalho realizado

---

# 6. Padrão Visual Geral

## Fundo

Utilizar fundo claro:

```text
cinza muito claro
slate-50
```

## Cards

Utilizar:

- fundo branco
- borda discreta
- sombra leve
- raio do design system
- espaçamento interno consistente

## Texto

### Texto principal

```text
slate-900
slate-800
```

### Texto auxiliar

```text
slate-500
slate-600
```

Evitar textos claros demais.

---

# 7. Fonte e Tipografia

O DEV deve confirmar qual fonte é definida oficialmente pelo pacote CNC.

Se a biblioteca já carregar a fonte institucional, não sobrescrever.

Evitar misturar:

- Inter
- Arial
- Helvetica
- fonte própria da biblioteca

Preferir:

```css
font-family: var(--font-family-base);
```

## Hierarquia recomendada

### Título da página

```text
20px a 24px
peso 600 ou 700
```

### Descrição da página

```text
14px
peso 400
```

### Título de seção

```text
16px a 18px
peso 600
```

### Título do card

```text
14px a 16px
peso 600
```

### Texto auxiliar

```text
12px a 14px
```

### Métrica

```text
24px a 28px
peso 700
```

## Regra

Não utilizar textos relevantes com 10px.

Usar no mínimo 11px ou 12px.

---

# 8. Cores Semânticas

```text
Azul
- navegação
- ação principal
- informação

Verde
- criação
- sucesso
- vigente
- disponível

Amarelo ou âmbar
- atenção
- próximo do vencimento

Laranja
- reposição
- ação necessária
- risco operacional

Vermelho
- crítico
- vencido
- erro
- exclusão

Cinza
- neutro
- sem ocorrência
- desabilitado
```

## Indicadores com valor zero

Valor zero deve ser neutro.

Exemplo:

```text
OS atrasadas: 0
```

Não deve aparecer em vermelho.

Somente utilizar cor de alerta quando houver ocorrência.

---

# 9. Menu Lateral

## Contraste

Textos e ícones devem ser claros sobre o azul.

Recomendação:

```tsx
text-white/90
```

Ativo:

```tsx
text-white
```

## Item ativo

Utilizar:

- fundo azul mais claro ou branco translúcido
- texto branco
- ícone branco

Evitar aplicar simultaneamente:

- fundo forte
- borda lateral grossa
- mudança intensa de cor

---

# 10. Cabeçalho Superior

O cabeçalho deve exibir:

- nome do sistema
- usuário
- papel ou função
- unidade

Evitar:

```text
Admin (Admin)
```

Preferir:

```text
Christian Moura
Administrador
Todas as unidades
```

---

# 11. Padrão de Cabeçalho de Página

Utilizar:

```tsx
PageHeader
PageHeaderTitle
PageHeaderTitleContent
PageHeaderActionsContainer
```

Exemplo:

```text
Gestão de Estoque
Controle materiais, movimentações e necessidades de reposição.

[Solicitações] [+ Novo Material]
```

## Regras

- título visível
- descrição abaixo
- no máximo duas ações principais à direita
- linha divisória discreta
- bom espaçamento vertical

---

# 12. Padrão de Ações Rápidas

Os atalhos principais devem seguir a referência da tela de Eventos.

Cada atalho deve possuir:

- ícone
- título
- descrição
- estado de hover
- indicação de ação principal

## Gestão de Estoque

```text
Novo material
Cadastrar item no estoque

Registrar entrada
Adicionar quantidade ao estoque

Registrar saída
Registrar consumo ou retirada

Solicitar material
Registrar pedido de material

Consultar movimentações
Visualizar entradas e saídas
```

## Gestão de Serviços

```text
Nova manutenção corretiva
Registrar necessidade pontual

Novo plano preventivo
Programar manutenção recorrente

Nova ordem de serviço
Planejar e executar uma atividade

Ver agenda
Consultar programação da equipe
```

## Documentação Regulatória

```text
Novo documento
Cadastrar obrigação regulatória

Registrar renovação
Atualizar documento existente

Anexar arquivo
Adicionar documento digitalizado

Consultar vencimentos
Visualizar documentos próximos do prazo
```

## Regra

Botões superiores devem representar ações.

Cards de navegação devem representar áreas.

Não repetir a mesma opção nos dois lugares.

---

# 13. Visão Geral

A Visão Geral deve ser uma central de controle.

## Estrutura

```text
Alertas consolidados
        ↓
Precisa da sua decisão
        ↓
Agenda resumida
        ↓
Gráficos úteis
```

## Indicadores

- preventivas atrasadas
- OS atrasadas
- OS aguardando material
- serviços sem responsável
- reposição necessária
- compras pendentes
- documentos vencidos
- documentos críticos

## Regras

- indicadores clicáveis
- valor zero neutro
- clique abre módulo filtrado
- foco visível
- navegação por teclado
- estado selecionado
- hover

## Bloco Precisa da sua decisão

Itens recomendados:

- OS sem técnico
- OS travada por material
- compra aguardando aprovação
- documento crítico sem responsável
- conflito de agenda
- reprogramação pendente

A ação `Resolver` deve ser botão ou link oficial.

---

# 14. Indicadores Acionáveis

Cada indicador deve possuir:

- título
- quantidade
- período
- ícone
- cor semântica
- estado selecionado
- ação de clique
- filtro correspondente

## Fluxo

```text
Indicador
        ↓
Filtro automático
        ↓
Cards atualizados
        ↓
Filtro visível
```

---

# 15. Cards Operacionais

Utilizar:

```tsx
Card
CardHeader
CardContent
CardFooter
CardFooterItem
```

## Estrutura

```text
Cabeçalho
- título
- código
- badge

Conteúdo
- informações essenciais
- responsável
- prazo
- local
- dados operacionais

Rodapé
- ações
```

## Regra

O card deve ser uma unidade de trabalho.

Não carregar o card com excesso de informação.

O detalhe completo deve ficar em Drawer, Modal ou página de detalhe.

---

# 16. Gestão de Estoque

## RN-01 e RN-02

O módulo deve centralizar o cadastro, movimentação, solicitação, conferência e reposição.

---

## RF-01 Cadastro de materiais

Implementar:

- novo material
- edição
- detalhe
- inativação
- reativação
- validação de código duplicado
- histórico
- exclusão lógica

### Regra

Material com movimentação não pode ser excluído fisicamente.

---

## RF-02 Entradas e saídas

Implementar:

- entrada rápida
- saída rápida
- devolução
- descarte
- ajuste de inventário
- conferência física
- estorno

### Campos de entrada

- material
- quantidade
- responsável
- fornecedor
- setor
- unidade
- local
- data e hora
- nota fiscal
- pedido
- valor unitário
- observação

### Campos de saída

- material
- quantidade
- responsável
- retirante
- setor solicitante
- unidade
- local de destino
- OS
- data e hora
- finalidade
- observação

### Ajuste de inventário

- saldo do sistema
- saldo físico
- diferença
- motivo
- responsável
- aprovador
- data e hora

### Regra

Persistir:

- saldo anterior
- quantidade movimentada
- saldo posterior

---

## RF-03 Solicitação de materiais

Permitir:

```text
Solicitação vinculada a OS
ou
Solicitação independente
```

Campos:

- protocolo
- solicitante
- setor
- unidade
- local
- material
- quantidade
- finalidade
- prioridade
- data necessária
- OS opcional
- justificativa
- anexo opcional

### QR Code

Deve apontar para URL segura.

Pode preencher:

- unidade
- setor
- local
- ativo
- almoxarifado

---

## RF-04 Histórico de movimentações

Criar página com filtros por:

- material
- código
- responsável
- setor
- técnico
- tipo
- categoria
- unidade
- local
- período
- OS
- fornecedor
- nota fiscal

---

## RF-05 Filtros

Implementar:

- busca nome ou código
- categoria
- local
- unidade
- ativo ou inativo
- abaixo do mínimo
- com reserva
- reposição necessária

---

## RF-06 Indicadores

Exibir:

- total de itens
- normal
- atenção
- crítico
- abaixo do mínimo
- reposição necessária
- valor total do estoque

### Custo

Definir:

- último preço
- custo padrão
- custo médio ponderado

Recomendação:

```text
custo médio ponderado
```

---

## RF-07 Reposição

### Regra

```text
Saldo disponível = Saldo físico - Reservado
```

Reposição necessária quando:

```text
Saldo disponível <= Estoque mínimo
```

Sugestão:

```text
Estoque ideal - Saldo disponível
```

ou:

```text
Estoque mínimo - Saldo disponível
```

### Fluxo

```text
Reposição identificada
        ↓
Avaliação
        ↓
Solicitação de compra
        ↓
Compra em andamento
        ↓
Recebimento
        ↓
Entrada
        ↓
Pendência encerrada
```

---

## RF-08 Relatórios

Implementar:

- PDF
- Excel ou CSV recomendado

Visões:

- período
- material
- categoria
- unidade
- local
- setor
- consumo
- valor
- OS
- técnico
- descarte
- ajustes

---

## Card de material

Exibir:

- nome
- código
- unidade
- saldo físico
- reservado
- disponível
- mínimo
- ideal
- badge
- próxima necessidade

### Cor do disponível

```text
Acima do mínimo
- verde

Abaixo do mínimo
- laranja

Zero ou negativo
- vermelho
```

### Ações

- abrir
- editar
- entrada
- saída
- solicitar compra
- reservas
- inativar

---

## Fila de solicitações

Cada card deve exibir:

- protocolo
- solicitante
- setor
- data
- prioridade
- status
- material
- quantidade
- OS
- ação principal

### Cores

```text
Não cadastrado
- azul

Saldo insuficiente
- âmbar

Urgente
- vermelho
```

Ações devem ser botões:

- cadastrar ou associar
- registrar entrada
- aprovar
- rejeitar
- abrir

---

# 17. Gestão de Serviços e Manutenções

## RN-03 e RN-04

O módulo deve controlar:

- planos
- periodicidade
- OS
- agenda
- execução
- evidências
- alertas
- indicadores
- histórico

---

## RF-09 Planos

Campos:

- tipo
- ativo
- local
- unidade
- periodicidade
- responsável
- empresa
- descrição
- valor estimado
- duração
- checklist
- anexos
- instruções
- status ativo

### Regra por tipo

```text
Preventiva
- periodicidade obrigatória

Preditiva
- periodicidade ou condição

Inspeção
- periodicidade normalmente obrigatória

Corretiva
- periodicidade não aplicável
```

---

## RF-10 Próxima execução

Regra padrão:

```text
Próxima execução = Data real da execução + Periodicidade
```

Regra alternativa:

```text
Data prevista anterior + Periodicidade
```

A política precisa ser validada.

---

## RF-11 Execução

Criar entidade:

```text
MaintenanceExecution
```

Campos:

- plano
- OS
- início real
- término real
- técnico
- prestador
- observações
- checklist
- materiais
- custos
- anexos
- laudos
- evidências
- resultado
- não conformidades
- próxima execução

A execução deve ser imutável.

---

## RF-12 Histórico

Na visão do ativo ou local:

- planos
- OS abertas
- OS concluídas
- execuções
- custos
- materiais
- prestadores
- documentos
- reincidências
- anexos

---

## RF-13 Filtros

- descrição
- ativo
- local
- empresa
- status
- periodicidade
- tipo
- unidade
- responsável
- prestador
- período

---

## RF-14 Alertas

Implementar:

- janelas configuráveis
- geração automática
- notificação interna
- destinatário
- data
- lido ou não lido
- histórico
- prevenção de duplicidade

Canais externos podem ser fase posterior.

---

## RF-15 Painel e relatório

Exibir:

- em dia
- próximo
- atrasado
- sem data
- por tipo
- por periodicidade
- custo previsto
- custo realizado
- percentual de cumprimento
- tempo médio
- reincidência
- por unidade

Exportação:

- PDF

---

## Gestão de Serviços

### Ações superiores

- nova corretiva
- nova preventiva
- nova OS
- ver agenda

### Cards de navegação

- corretivas
- ordens
- preventivas
- ativos
- locais
- técnicos

Não repetir as mesmas opções em botão e card.

---

# 18. Agenda

Reaproveitar os componentes da agenda do sistema de Eventos.

Adaptar para:

- OS
- preventivas
- corretivas
- inspeções
- técnicos
- ativos
- locais

## Filtros

- técnico
- equipe
- prestador
- ativo
- local
- unidade
- tipo
- status
- prioridade

## Visões

- dia
- semana
- mês
- lista
- equipe

## Regras

- conflito de agenda
- sem técnico
- sem horário
- reprogramação
- abertura de OS
- duração estimada

---

# 19. Kanban

Utilizar apenas status principais:

```text
Aberta
Planejamento
Programada
Em execução
Validação
Concluída
```

Condições devem ser badges:

- aguardando material
- aguardando compra
- material liberado
- aguardando terceiro
- pausada
- atrasada
- reaberta
- sem responsável

Não transformar condições em colunas.

---

# 20. Documentação Regulatória

## RN-05

O módulo deve controlar documentos, vencimentos, alertas, anexos, recorrências e conformidade.

---

## RF-16 Cadastro

Campos:

- título
- tipo
- número
- órgão
- unidade
- local
- emissão
- atualização
- renovação
- vencimento
- periodicidade
- responsável
- ART
- observações
- abrangência
- tipo de compromisso

---

## RF-17 Status

Criar função única:

```text
calcularStatusDocumento(documento, dataAtual)
```

Retorno:

- status
- dias restantes
- dias em atraso
- nível

Status:

```text
Vigente
Atenção
Crítico
Vencido
Sem validade definida
```

Remover:

- Válido
- A Vencer

---

## RF-18 Alertas

Permitir várias janelas:

```text
90 dias
60 dias
15 dias
5 dias
```

Controlar:

- destinatário
- data
- canal
- reenvio
- duplicidade
- histórico

---

## RF-19 Anexos

Implementar:

- upload
- links externos
- versões
- histórico
- consulta
- exclusão controlada

Produção:

- storage
- permissão
- tamanho
- formatos
- antivírus
- retenção
- auditoria

---

## RF-20 Filtros

- busca textual
- status
- responsável
- órgão
- tipo
- abrangência
- unidade
- com ou sem anexo

Abrangência:

- nacional
- estadual
- municipal
- corporativo
- unidade
- local
- ativo

---

## RF-21 Recorrência

Tipos:

```text
Único
Periódico
Recorrente mensal
```

Recorrente mensal:

- competência
- vencimento
- responsável
- status
- comprovante
- valor
- geração automática

---

## RF-22 Conformidade

Indicadores:

- vigentes
- atenção
- críticos
- vencidos
- sem responsável
- sem anexo
- sem vencimento
- por tipo
- por responsável
- por unidade

Fórmula:

```text
Documentos vigentes / Documentos obrigatórios ativos × 100
```

---

## Card de documento

Exibir:

- nome
- tipo
- unidade
- órgão
- responsável
- emissão
- vencimento
- dias restantes
- status
- anexo

Ações:

- abrir
- editar
- anexar
- renovar
- histórico

### Sem anexo

Usar badge:

```text
Sem anexo
```

Não usar texto longo em laranja.

---

# 21. Formulários

As telas de cadastro devem seguir o padrão das referências.

## Estrutura

```text
Botão voltar
Título
Descrição
Tabs
Formulário em painel branco
Rodapé com Cancelar e Salvar
```

## Exemplo

```text
← Novo Material
Cadastre um novo material no estoque.

[Informações Gerais] [Estoque] [Localização] [Histórico]
```

## Componentes

### Input

- nome
- código
- quantidade
- valor

### Select

- categoria
- unidade
- periodicidade
- tipo
- prioridade

### Combobox

- material
- técnico
- ativo
- local
- prestador
- responsável
- órgão

### Validação

Utilizar:

```text
react-hook-form
zod
@hookform/resolvers
```

## Regras

- label visível
- obrigatório identificado
- mensagem de erro
- impedir envio duplicado
- loading
- manter valores após erro
- botão salvar desabilitado durante processamento

---

# 22. Tabs

## Material

```text
Informações Gerais
Estoque
Localização
Histórico
```

## Plano

```text
Informações Gerais
Planejamento
Checklist
Responsáveis
Anexos
```

## OS

```text
Informações Gerais
Planejamento
Materiais
Execução
Anexos
Histórico
```

## Documento

```text
Informações Gerais
Vencimentos
Anexos
Renovações
Histórico
```

---

# 23. Filtros

Utilizar:

- Input
- Select
- Combobox
- Collapsible

Estrutura:

```text
Busca principal
Filtros básicos
[Filtros avançados]
```

## Regras

- combináveis
- ativos visíveis
- limpar filtros
- quantidade de resultados
- manter filtro ao voltar
- indicador aplica filtro

---

# 24. Modal, Drawer e Dialog

## Modal

- novo material
- entrada
- saída
- solicitação
- nova preventiva
- nova corretiva
- documento
- renovação

## AlertDialog

- excluir
- inativar
- cancelar
- rejeitar
- ação irreversível

## Drawer ou Sheet

- detalhe rápido
- edição simples
- histórico
- reservas
- OS pela agenda
- filtros mobile

---

# 25. Estados Vazios

Toda tela deve possuir estado vazio.

Exemplos:

```text
Nenhum material precisa de reposição.
Todos os materiais estão acima do nível mínimo.
```

```text
Nenhuma movimentação encontrada.
Ajuste os filtros ou registre uma nova movimentação.
```

```text
Nenhum documento vence no período.
```

Não deixar áreas vazias.

---

# 26. Gráficos

Reaproveitar:

```text
bar.tsx
line.tsx
pie.tsx
```

## Barras

- OS por status
- atividades por técnico
- consumo por categoria
- documentos por responsável

## Linha

- consumo
- OS concluídas
- custos

## Pizza

- documentos por status
- serviços por tipo
- estoque por situação

## Regra

Todo gráfico deve permitir detalhamento.

Não usar gráfico decorativo.

---

# 27. Auditoria

Registrar:

- usuário
- ação
- entidade
- valor anterior
- valor novo
- data
- hora
- motivo

Cobrir todos os módulos.

---

# 28. Permissões

Controlar:

- visualizar
- criar
- editar
- inativar
- movimentar
- aprovar
- executar
- validar
- cancelar
- exportar

A tela permanece igual.

As ações variam por permissão.

---

# 29. Concorrência de Estoque

Reservas, saídas e ajustes devem ser validados no backend.

Utilizar transação.

Duas pessoas não podem consumir o mesmo saldo simultaneamente.

---

# 30. Estornos

Não apagar movimentações.

Criar movimento de estorno para:

- entrada
- saída
- reserva
- consumo
- ajuste
- renovação
- conclusão incorreta

---

# 31. Datas e Horários

Padronizar:

- UTC no armazenamento
- fuso local na exibição
- data de negócio
- horário real
- competência mensal

---

# 32. Responsividade

```text
Desktop
3 ou 4 cards por linha

Tablet
2 cards

Mobile
1 card
```

No mobile:

- filtros em Drawer
- ações secundárias em Dropdown
- agenda em lista
- evitar tabela horizontal
- manter ação principal

---

# 33. Acessibilidade

Implementar:

- aria-label em ícones
- foco visível
- teclado
- Enter e Espaço em cards
- contraste
- texto além da cor
- tamanho mínimo de fonte
- tooltip em abreviações

---

# 34. Prioridades

## Prioridade 1

1. Padronizar componentes CNC.
2. Corrigir fonte.
3. Corrigir contraste do menu.
4. Garantir títulos de página.
5. Remover duplicidade em Gestão de Serviços.
6. Criar ações rápidas em cards.
7. Padronizar indicadores.
8. Padronizar status documentais.
9. CRUD completo de materiais.
10. Entradas, saídas e ajustes.
11. Histórico de movimentações.
12. Solicitação independente.
13. Reposição completa.
14. Plano completo.
15. Execução auditável.
16. Recorrência documental.

## Prioridade 2

17. Alertas internos.
18. Histórico por ativo e local.
19. Relatórios.
20. Conformidade.
21. Gráficos.
22. Responsividade.
23. Acessibilidade.
24. Auditoria.

## Prioridade 3

25. QR Code.
26. Notificações externas.
27. Excel e CSV.
28. Storage corporativo.
29. Integrações externas.

---

# 35. Critérios de Aceite Final

A solução será considerada aderente quando:

- utilizar componentes CNC
- não misturar componentes duplicados
- fonte estiver padronizada
- menu estiver legível
- títulos estiverem visíveis
- visão geral for única
- indicadores forem clicáveis
- zero for neutro
- ações rápidas seguirem o padrão visual
- cards operacionais forem usados
- estados vazios forem tratados
- formulários usarem tabs quando necessário
- botões de voltar forem padronizados
- estoque possuir entrada, saída, ajuste e histórico
- reposição possuir ciclo completo
- execução da manutenção for auditável
- próxima execução usar regra validada
- alertas forem reais
- documentos usarem uma única regra de status
- recorrência mensal estiver implementada
- auditoria e permissões estiverem aplicadas
- estornos preservarem histórico
- frontend for responsivo e acessível

---

# 36. Resumo Final para o DEV

A implementação deve seguir esta estrutura:

```text
PageHeader
        +
Ações rápidas em cards
        +
Indicadores clicáveis
        +
Filtros
        +
Cards operacionais
        +
Modal, Drawer ou Dialog
        +
Regras completas de negócio
```

A prioridade não é apenas deixar as telas parecidas com os sistemas de referência.

A prioridade é:

```text
Utilizar o design system CNC
        +
Garantir consistência visual
        +
Fechar o ciclo operacional de cada RF
```

O sistema deve ser simples, claro, orientado à ação, auditável e fiel aos RN e RF.
