# Plano de Ajustes da Reunião de Validação do MVP

Data de consolidação: 2026-07-30

Baseado nos resumos:
- `resumo IA GSI orador - validacao MVP.txt`
- `resumo IA GSI - validacao MVP.txt`

## Objetivo

Consolidar, em sequência de execução, os ajustes e validações necessários para alinhar o MVP do GSI antes da próxima apresentação para a área de negócio.

## Diretriz geral da reunião

O MVP deve priorizar:
- aderência ao fluxo real de operação
- padronização visual com os sistemas já usados internamente
- indicadores que gerem ação prática
- flexibilidade do modelo de dados para ativos, planos e OS
- remoção de funcionalidades não validadas do escopo de apresentação

## Sequência recomendada de trabalho

### 1. Limpar o escopo do MVP apresentado

Objetivo:
- remover do foco da apresentação tudo o que ainda não foi validado em grupo

Ajustes:
- retirar ou ocultar `Home` / `Visão Geral` se estiver funcionando apenas como menu expandido
- retirar `Central de Alertas` da apresentação principal
- retirar `Relatórios` da apresentação principal
- não destacar importação de planilhas/JSON como funcionalidade pronta sem validação final
- revisar qualquer funcionalidade adicionada por iniciativa própria e não debatida com o grupo

Resultado esperado:
- MVP mais enxuto, sem gerar expectativa indevida para a área

### 2. Revisar a navegação principal do módulo de serviços

Objetivo:
- garantir que a entrada no módulo mostre trabalho a fazer, e não apenas agrupamento de menus

Ajustes:
- reduzir telas que funcionem só como “submenus”
- fazer com que cada entrada principal mostre pendências e ações operacionais
- evitar duplicação entre menu lateral e cards internos da tela
- reorganizar a gestão de serviços com foco em execução operacional

Resultado esperado:
- o usuário entra no módulo e entende imediatamente o que precisa tratar

### 3. Revisar indicadores para manter apenas os orientados à ação

Objetivo:
- remover indicadores informativos sem consequência operacional

Manter prioridade para indicadores como:
- atividades próximas do vencimento
- atividades vencidas
- ordens atrasadas
- OS sem técnico
- OS travadas por falta de material
- solicitações pendentes de estoque

Revisar ou remover indicadores como:
- total acumulado
- itens “em dia”
- volumes que não exigem atuação
- estados obrigatórios que não geram decisão

Resultado esperado:
- dashboards menores e mais úteis

### 4. Padronizar visualmente telas, botões e formulários

Objetivo:
- alinhar o MVP com o padrão visual dos sistemas internos já adotados

Ajustes:
- seguir referência dos sistemas de eventos e demandas
- padronizar botões, cabeçalhos, grids, tabs e rodapés de formulário
- evitar estilos próprios fora do padrão acordado
- usar a mesma lógica visual para criação, edição, filtros e visualização

Resultado esperado:
- consistência visual e redução de retrabalho

### 5. Consolidar a modelagem flexível entre planos, OS e ativos

Objetivo:
- garantir que o sistema suporte cenários reais sem amarrar a arquitetura cedo demais

Regras que precisam ser mantidas:
- uma OS pode ter um ou vários ativos
- um plano pode gerar uma ou várias OS
- o vínculo entre plano, OS e ativo deve aceitar cenários N para N
- o sistema não deve assumir cedo demais uma única estratégia operacional

Validar tecnicamente:
- cadastro e edição de OS com múltiplos ativos
- cadastro e edição de planos com múltiplos ativos
- geração de OS por plano sem travar o modelo em 1:1
- filtros, listagens e visualização refletindo essas relações

Resultado esperado:
- base de dados e interface prontas para diferentes regras da área

### 6. Revisar o fluxo completo de manutenção corretiva, preventiva e OS

Objetivo:
- evitar duplicidade de estruturas que tratam o mesmo processo com nomes diferentes

Pontos de revisão:
- verificar se preventiva, corretiva, preditiva e inspeção estão usando base funcional coerente
- reduzir telas duplicadas para processos equivalentes
- manter diferenciação apenas quando houver regra de negócio realmente distinta

Resultado esperado:
- sistema mais simples, com menos redundância

### 7. Consolidar a integração entre OS e estoque

Objetivo:
- manter o fluxo como diferencial funcional do MVP

Escopo mínimo esperado:
- OS deve poder registrar materiais envolvidos
- material com saldo suficiente segue fluxo normal
- material sem saldo deve gerar solicitação ao estoque
- material não cadastrado deve gerar solicitação específica
- entrada/recebimento no estoque deve refletir no avanço da OS
- status da OS deve responder ao estado de suprimento

Validar no protótipo:
- criação da OS
- fila de estoque
- associação do item à OS
- mudança de status após abastecimento

Resultado esperado:
- fluxo fim a fim demonstrável

### 8. Revisar a agenda operacional

Objetivo:
- decidir se a agenda realmente ajuda o usuário ou se deve ser simplificada

Encaminhamento da reunião:
- o calendário visual pode ficar confuso com alto volume
- lista agrupada pode ser mais eficiente
- agenda só deve permanecer se ajudar alocação e acompanhamento real

Ações:
- revisar se a visualização principal deve ser agenda, lista ou híbrido
- manter foco em programação e disponibilidade real dos técnicos
- evitar complexidade excessiva de controle

Resultado esperado:
- agenda útil e legível, ou simplificada para o formato certo

### 9. Validar importação de dados antes de apresentar

Objetivo:
- não expor uma funcionalidade sensível sem regra clara de uso

Condições mínimas:
- padrão fixo de arquivo
- campos obrigatórios definidos
- tratamento de inconsistências
- retorno claro de erros

Se isso não estiver maduro:
- remover da apresentação
- manter apenas como item futuro de backlog

Resultado esperado:
- sem risco de prometer algo instável

### 10. Levantar dependências com a área de negócio

Objetivo:
- parar de decidir por hipótese o que precisa de definição funcional

Perguntas que precisam ser levadas à área:
- uma OS pode atender múltiplos ativos simultaneamente?
- um plano deve gerar uma OS por ativo ou uma OS única para vários ativos?
- qual o nível real de detalhamento da base de ativos?
- como a área controla hoje manutenção por ativo, local e agrupamento?
- quais indicadores são realmente usados para tomada de decisão?
- como desejam enxergar programação: lista, agenda ou ambos?

Dependência externa citada:
- obter planilha de ativos para avaliar o modelo necessário

Resultado esperado:
- próximos ajustes guiados por regra real de negócio

## Priorização prática

### Prioridade 1

- limpar escopo do MVP
- revisar navegação do módulo de serviços
- revisar indicadores para ação
- padronizar visual de formulários e ações

### Prioridade 2

- consolidar modelagem flexível de planos, OS e ativos
- revisar fluxo unificado de manutenção
- fechar integração OS + estoque

### Prioridade 3

- revisar agenda operacional
- validar ou retirar importação de dados
- preparar perguntas formais para a área de negócio

## Itens que devem sair da apresentação se não estiverem validados

- central de alertas
- relatórios
- importação de planilhas/JSON
- qualquer dashboard que só replique menu
- qualquer fluxo novo sem alinhamento prévio

## Checklist de preparação para a próxima apresentação

- MVP sem funcionalidades paralelas fora do escopo
- telas no padrão visual esperado
- indicadores revisados e clicáveis para ação
- fluxo de OS com múltiplos ativos validado
- integração OS e estoque demonstrável
- dúvidas de regra de negócio listadas formalmente
- roteiro da apresentação focado no que já está consistente

## Responsáveis mencionados na reunião

- Christian:
  revisar telas, padronização visual, fluxos, modelagem e escopo do MVP
- Ivan:
  apoiar levantamento da planilha de ativos e entendimento com a área
- Iury:
  consolidar direcionamento funcional e validação dos pontos críticos

## Observação final

O principal recado da reunião foi que o MVP precisa deixar de “mostrar possibilidades” e passar a “demonstrar operação”. A evolução do projeto deve priorizar menos volume de tela e mais clareza de execução, pendência e tomada de decisão.
