# Validação Operacional Final do MVP pelos Requisitos de Negócio e Requisitos Funcionais

## 1. Objetivo

Este documento consolida a validação operacional do MVP em relação aos Requisitos de Negócio e Requisitos Funcionais dos módulos:

- Gestão de Estoque
- Gestão de Manutenções
- Controle de Documentação Regulatória

O objetivo é registrar:

- o que já existe no MVP
- o que está parcialmente atendido
- o que ainda não foi implementado
- regras operacionais que precisam ser definidas
- itens que podem ter sido esquecidos
- prioridades recomendadas para implementação

---

# 2. Resumo Executivo

A estrutura atual do MVP cobre parte importante dos fluxos operacionais, principalmente:

- agenda por técnico
- vínculo entre serviço, ordem de serviço e estoque
- reserva de materiais
- anexos em ordens de serviço
- controle básico de documentos regulatórios
- indicadores visuais
- cards operacionais
- atualização de planos após conclusão de ordens

Ainda assim, o MVP não pode ser considerado integralmente aderente aos RF-01 a RF-22.

Os principais pontos pendentes estão em:

- movimentação completa de estoque
- conferência física e ajuste de saldo
- histórico auditável
- relatórios
- alertas reais
- custos
- cálculo da próxima manutenção
- registro formal de execução
- compromissos recorrentes
- conformidade documental consolidada

---

# 3. Módulo Gestão de Estoque

## RN-01

Centralizar o registro e o rastreamento de movimentações de materiais, substituindo planilhas por um sistema único e preservando a conferência física como garantia da integridade do saldo.

---

## RF-01 — Cadastro de materiais e produtos

### Situação

Parcialmente atendido.

### O que já existe

O modelo atual contempla:

- nome
- código
- categoria
- unidade de medida
- unidade organizacional
- local
- estoque mínimo
- estoque ideal
- fabricante
- modelo
- ativo ou inativo

### O que ainda falta

- cadastro funcional de novo material
- edição
- detalhe
- inativação
- reativação
- validação de código duplicado
- histórico de alterações
- regra de exclusão lógica

### Regra recomendada

```text
Material sem movimentação
        ↓
Pode ser excluído, conforme permissão

Material com movimentação
        ↓
Somente inativação
```

---

## RF-02 — Registro de entradas e saídas

### Situação

Parcialmente atendido, mas operacionalmente incompleto.

### O que já existe no modelo

- entrada
- saída
- reserva
- liberação
- devolução
- descarte
- ajuste
- material
- quantidade
- usuário
- técnico
- ordem de serviço
- unidade
- local
- data
- nota fiscal
- pedido
- observações

### O que ainda falta

- entrada rápida
- saída rápida
- devolução
- descarte
- ajuste de inventário
- conferência física
- registro de setor
- saldo anterior
- saldo posterior
- fluxo de estorno

### Campos mínimos para entrada

- material
- quantidade
- responsável pelo lançamento
- fornecedor
- setor
- unidade
- local de armazenamento
- data e hora
- nota fiscal
- pedido
- valor unitário
- observação

### Campos mínimos para saída

- material
- quantidade
- responsável pelo lançamento
- pessoa que retirou
- setor solicitante
- unidade
- local de destino
- ordem de serviço, quando aplicável
- data e hora
- finalidade
- observação

### Ajuste de inventário

- saldo registrado no sistema
- saldo físico contado
- diferença
- motivo
- responsável pela conferência
- aprovador
- data e hora

### Regra importante

A RN-01 exige preservação da conferência física. Portanto, o sistema precisa permitir ajuste controlado de inventário, com justificativa e auditoria.

---

## RF-03 — Formulário de solicitação de materiais

### Situação

Parcialmente atendido.

### O que já existe

- quantidade
- prioridade
- solicitante
- justificativa
- material cadastrado ou não cadastrado
- necessidade por data
- vínculo com ativo e local
- fluxo de análise e recebimento

### Limitação atual

A solicitação está obrigatoriamente vinculada a uma ordem de serviço.

### O que ainda falta

- solicitação independente
- formulário funcional
- protocolo
- QR Code
- acompanhamento pelo solicitante
- setor
- unidade
- local
- anexo opcional
- histórico da solicitação

### Regra proposta

```text
Solicitação vinculada a uma OS
ou
Solicitação independente
```

### Campos recomendados

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
- ordem de serviço, opcional
- justificativa
- anexo, opcional

### QR Code

O QR Code deve apontar para uma URL segura e pode preencher previamente:

- unidade
- almoxarifado
- local
- setor
- ativo

Não deve conter dados sensíveis diretamente.

---

## RF-04 — Histórico de movimentações

### Situação

Não atendido.

### O que ainda falta

- página de histórico
- extrato por material
- busca
- filtros
- detalhamento
- auditoria da movimentação

### Filtros necessários

- material
- código
- responsável
- técnico
- setor
- tipo de movimentação
- categoria
- unidade
- local
- período
- ordem de serviço
- fornecedor
- nota fiscal

### Cada movimentação deve registrar

- saldo anterior
- quantidade movimentada
- saldo posterior
- data e hora
- origem
- destino
- usuário
- motivo
- documento relacionado

### Regra importante

Saldo anterior e saldo posterior devem ser persistidos na movimentação. Não devem ser apenas recalculados posteriormente.

---

## RF-05 — Filtros e busca

### Situação

Parcialmente atendido.

### O que já existe

Filtros rápidos por:

- todos
- reposição
- abaixo do mínimo
- reserva maior que disponibilidade

### O que ainda falta

- busca por nome
- busca por código
- categoria
- local
- unidade
- ativo ou inativo
- combinação de filtros
- persistência dos filtros ao retornar do detalhe

---

## RN-02

Monitorar níveis de estoque e apoiar decisões de reposição e compra.

---

## RF-06 — Painel de indicadores

### Situação

Parcialmente atendido.

### O que já existe

- total de itens
- reposição necessária
- abaixo do mínimo
- reserva maior que disponibilidade

### O que ainda falta

- situação normal
- atenção
- crítico
- valor total em estoque
- valor reservado
- valor disponível
- consumo no período

### Ponto estrutural

O cadastro atual não possui um valor de custo apropriado para calcular o valor total do estoque.

### Definição necessária

Escolher uma regra:

- último preço de compra
- custo padrão
- custo médio ponderado

### Recomendação

Utilizar custo médio ponderado, caso entradas com valor sejam controladas.

---

## RF-07 — Alertas e sugestão de reposição

### Situação

Parcialmente atendido.

### Regra já considerada

```text
Saldo disponível = Saldo físico - Quantidade reservada
```

Um item entra em reposição quando:

```text
Saldo disponível <= Estoque mínimo
```

### O que ainda falta

- quantidade sugerida para compra
- área de reposição urgente
- prioridade
- próxima data de consumo
- ordens vinculadas
- compra em andamento
- encerramento da pendência
- alerta persistente

### Regra sugerida

```text
Sugestão de reposição = Estoque ideal - Saldo disponível
```

Quando não houver estoque ideal:

```text
Sugestão de reposição = Estoque mínimo - Saldo disponível
```

O resultado nunca deve ser negativo.

### Fluxo operacional necessário

```text
Reposição identificada
        ↓
Avaliação pelo estoque
        ↓
Solicitação de compra
        ↓
Compra em andamento
        ↓
Material recebido
        ↓
Entrada registrada
        ↓
Reposição encerrada
```

---

## RF-08 — Relatórios mensais de consumo

### Situação

Não atendido.

### O que deve ser implementado

Relatórios por:

- período
- material
- categoria
- unidade
- local
- setor
- tipo de movimentação
- consumo
- valor
- ordem de serviço
- técnico

### Indicadores recomendados

- quantidade consumida
- valor consumido
- materiais mais utilizados
- consumo por categoria
- consumo por unidade
- consumo por setor
- descarte
- ajustes de inventário

### Exportações

Obrigatório:

- PDF

Recomendado:

- Excel
- CSV

---

# 4. Módulo Gestão de Manutenções

## RN-03

Controlar o ciclo de vida das manutenções e registrar sua execução com evidências.

---

## RF-09 — Cadastro de planos de manutenção

### Situação

Parcialmente atendido.

### O que já existe

- unidade
- local
- ativo
- categoria
- periodicidade
- prestador
- descrição
- checklist
- primeira execução

### O que ainda falta

- tipo configurável
- valor estimado
- responsável interno
- empresa
- duração estimada
- anexos técnicos
- escopo
- instruções
- situação ativa ou inativa

### Regra por tipo

```text
Preventiva
- periodicidade obrigatória

Preditiva
- periodicidade ou condição de monitoramento

Inspeção
- periodicidade normalmente obrigatória

Corretiva
- periodicidade não aplicável
```

---

## RF-10 — Cálculo automático da próxima execução

### Situação

Parcialmente atendido.

### Problema identificado

O cálculo atual considera a data prevista anterior, mas o RF determina uso da data da última execução registrada.

### Regra recomendada

```text
Próxima execução = Data real da execução + Periodicidade
```

### Regra alternativa

Pode existir uma configuração de calendário fixo:

```text
Próxima execução = Data prevista anterior + Periodicidade
```

### Decisão necessária

O cliente deve validar qual política será utilizada.

---

## RF-11 — Registro de execução com anexos

### Situação

Parcialmente atendido.

### O que já existe na ordem de serviço

- checklist
- observações
- anexos
- materiais
- histórico
- responsável
- status
- conclusão

### O que ainda falta

Um registro formal e imutável de execução.

### Entidade recomendada

```text
MaintenanceExecution
```

### Dados mínimos

- plano
- ordem de serviço
- data real de início
- data real de término
- técnico
- prestador
- observações da execução
- checklist final
- materiais consumidos
- custos
- anexos
- laudos
- evidências
- resultado
- não conformidades
- próxima execução calculada

### Regra

A ordem de serviço representa o fluxo operacional.

A execução representa o registro auditável do que foi efetivamente realizado.

---

## RF-12 — Histórico consultável por ativo e local

### Situação

Parcialmente atendido.

### O que ainda falta

Na visão do ativo ou local, exibir:

- planos ativos
- ordens abertas
- ordens concluídas
- execuções realizadas
- custos
- materiais utilizados
- prestadores
- documentos
- falhas reincidentes
- anexos
- período

O histórico deve considerar execuções concluídas, e não apenas o estado atual da ordem de serviço.

---

## RF-13 — Filtros e busca

### Situação

Parcialmente atendido.

### Filtros necessários

- descrição
- ativo
- local
- empresa
- status
- periodicidade
- tipo de serviço
- unidade
- responsável
- período
- prestador

---

## RN-04

Monitorar vencimentos, alertar a equipe e gerar indicadores de desempenho.

---

## RF-14 — Alertas de vencimento

### Situação

Não atendido integralmente.

### O que já existe

Classificação visual de:

- em dia
- próxima
- atrasada

### O que ainda falta

- parâmetros de antecedência
- geração automática
- notificação interna
- destinatário
- responsável
- gestor
- data de envio
- lido ou não lido
- histórico
- prevenção de duplicidade

### Canais a definir

- sistema
- e-mail
- Teams
- outros

A mudança de cor ou status não substitui um alerta real.

---

## RF-15 — Painel de indicadores e relatório gerencial

### Situação

Parcialmente atendido.

### O que já existe

- em dia
- próximas
- atrasadas

### O que ainda falta

- sem data
- distribuição por tipo
- distribuição por periodicidade
- custo total
- custo previsto
- custo realizado
- exportação em PDF
- percentual de cumprimento
- tempo médio
- reincidência
- quantidade por unidade
- quantidade por responsável

---

# 5. Módulo Controle de Documentação Regulatória

## RN-05

Registrar documentos regulatórios e controlar proativamente seus vencimentos.

---

## RF-16 — Cadastro de documentos regulatórios

### Situação

Parcialmente atendido.

### O que já existe

- título
- tipo
- número
- órgão regulador
- unidade
- local
- data de emissão
- data de vencimento
- periodicidade
- responsável
- ART
- observações

### O que ainda falta

- data da última atualização
- data da última renovação
- abrangência
- tipo de compromisso
- classificação entre único, periódico e recorrente

### Regra importante

O campo técnico `updatedAt` não substitui a data de atualização legal do documento.

---

## RF-17 — Cálculo automático de status e prazo

### Situação

Parcialmente atendido.

### Problema identificado

Existem regras e nomenclaturas diferentes em telas distintas.

Foram identificados status como:

- Vigente
- Atenção
- Crítico
- Vencido
- A vencer
- Válido

### Correção necessária

Criar uma função única:

```text
calcularStatusDocumento(documento, dataAtual)
```

Ela deverá retornar:

- status
- dias restantes
- dias em atraso
- nível do alerta

### Status recomendados

```text
Vigente
Atenção
Crítico
Vencido
Sem validade definida
```

Remover duplicidade entre `Válido` e `A vencer`.

---

## RF-18 — Alertas configuráveis de vencimento

### Situação

Parcialmente atendido.

### O que já existe

- dias para atenção
- dias para crítico

### O que ainda falta

- várias janelas configuráveis
- envio automático
- destinatários
- canais
- controle de disparo
- prevenção de duplicidade
- histórico

### Exemplo

```text
90 dias: informativo
60 dias: atenção
15 dias: crítico
5 dias: urgente
```

---

## RF-19 — Anexação e consulta de documentos digitalizados

### Situação

Atendido no MVP, com ressalvas para produção.

### O que já existe

- anexar arquivos
- consultar anexos
- excluir anexos
- registrar versões
- registrar renovação

### O que ainda falta para produção

- storage externo
- controle de acesso
- tamanho máximo
- tipos permitidos
- antivírus
- versionamento
- retenção
- trilha de auditoria
- suporte a links externos

---

## RF-20 — Filtros e busca

### Situação

Parcialmente atendido.

### O que já existe

- críticos
- vencidos
- a vencer
- sem anexo

### O que ainda falta

- busca textual
- responsável
- órgão
- tipo
- abrangência
- unidade
- combinação de filtros

### Abrangência

Definir valores como:

- nacional
- estadual
- municipal
- corporativo
- unidade
- local
- ativo

---

## RF-21 — Compromissos recorrentes e periódicos

### Situação

Não atendido.

### Problema

Ter periodicidade mensal não é suficiente para controlar compromissos mensais recorrentes.

### Tipos necessários

```text
Vencimento único
Periódico
Recorrente mensal
```

### Para compromissos recorrentes

- competência
- vencimento
- responsável
- situação
- comprovante
- pagamento ou cumprimento
- valor, quando aplicável
- geração automática da próxima competência

### Exemplo

```text
Contrato de manutenção

Janeiro: cumprido
Fevereiro: cumprido
Março: vencido
Abril: pendente
```

---

## RF-22 — Painel analítico de conformidade

### Situação

Parcialmente atendido.

### O que já existe

- críticos
- vencidos
- a vencer
- sem anexo

### O que ainda falta

- vigentes
- atenção
- por tipo
- por responsável
- por unidade
- indicador geral de conformidade
- sem responsável
- sem vencimento
- sem anexo
- tendência temporal

### Indicador sugerido

```text
Conformidade =
Documentos vigentes / Documentos obrigatórios ativos × 100
```

### Classificação sugerida

```text
Vigente: conforme
Atenção: conforme com risco
Crítico: não conforme iminente
Vencido: não conforme
```

---

# 6. Itens Operacionais que Não Podem Ser Esquecidos

Estes itens não representam novos requisitos do cliente. São controles necessários para garantir confiabilidade, auditoria e funcionamento correto.

---

## 6.1 Auditoria

Registrar:

- quem criou
- quem alterou
- valor anterior
- valor novo
- data e hora
- entidade
- motivo

A auditoria deve cobrir todos os módulos.

---

## 6.2 Permissões

Controlar por ação:

- consultar
- criar
- editar
- inativar
- movimentar estoque
- aprovar solicitação
- concluir ordem de serviço
- validar execução
- anexar documento
- renovar documento
- exportar relatório

A tela deve permanecer igual para todos. As ações variam conforme permissão.

---

## 6.3 Numeração e protocolos

Definir padrões para:

- material
- solicitação de material
- serviço
- ordem de serviço
- plano
- execução
- documento
- movimentação

Não utilizar números aleatórios em produção.

---

## 6.4 Concorrência de estoque

Duas pessoas não podem consumir o mesmo saldo simultaneamente.

Reserva, saída e ajuste devem ser validados no backend, dentro de transação.

---

## 6.5 Datas e horários

Padronizar:

- fuso horário
- armazenamento UTC
- exibição local
- data de negócio
- horário real
- competência mensal

---

## 6.6 Cancelamentos e estornos

Definir como desfazer:

- entrada incorreta
- saída incorreta
- reserva
- consumo
- solicitação
- conclusão de ordem de serviço
- renovação de documento

Não apagar movimentações. Criar movimento de estorno.

---

## 6.7 Anexos

Definir:

- tamanho máximo
- formatos aceitos
- quantidade
- versionamento
- exclusão
- permissão
- retenção

---

## 6.8 Exclusão lógica

Aplicar inativação a registros com histórico:

- materiais
- ativos
- locais
- planos
- prestadores
- documentos

---

## 6.9 Campos obrigatórios por contexto

Exemplos:

- preventiva exige periodicidade
- corretiva não exige periodicidade
- documento sem vencimento não gera alerta
- saída de estoque exige destinatário ou setor
- ajuste exige justificativa
- conclusão de ordem exige evidências mínimas

---

# 7. Pontos Mais Críticos que Podem Ter Sido Esquecidos

Os itens abaixo devem entrar obrigatoriamente no backlog do DEV:

1. Conferência física e ajuste de inventário.
2. Campo setor em entradas, saídas e solicitações.
3. Saldo anterior e saldo posterior em cada movimentação.
4. Solicitação de material independente de ordem de serviço.
5. Regra de custo para cálculo do valor total de estoque.
6. Registro imutável de execução da manutenção.
7. Cálculo da próxima execução a partir da data real.
8. Alertas reais, e não apenas mudança de cor.
9. Data de atualização legal do documento.
10. Campo abrangência documental.
11. Controle de competências mensais recorrentes.
12. Fluxo de compra em andamento para reposição.
13. Estorno de movimentações.
14. Auditoria completa.
15. Controle de concorrência de estoque.

---

# 8. Ordem Recomendada de Implementação

## Prioridade 1

1. CRUD completo de materiais.
2. Entrada, saída, ajuste e devolução.
3. Histórico de movimentações.
4. Solicitação independente de OS.
5. Regra completa de reposição.
6. Cadastro completo do plano de manutenção.
7. Correção do cálculo da próxima execução.
8. Registro formal de execução.
9. Unificação do cálculo de status documental.
10. Compromissos recorrentes.

## Prioridade 2

11. Filtros completos.
12. Alertas internos.
13. Histórico por ativo e local.
14. Painéis analíticos.
15. Custos de estoque e manutenção.
16. Relatórios em PDF.
17. Indicador de conformidade.

## Prioridade 3

18. QR Code.
19. Notificações externas.
20. Exportações em Excel e CSV.
21. Gráficos adicionais.
22. Integrações com storage e serviços corporativos.

---

# 9. Critérios de Aceite Operacional

A solução será considerada aderente quando:

- o cadastro de materiais estiver completo
- entradas e saídas estiverem funcionais
- ajuste de inventário estiver disponível
- movimentações possuírem saldo anterior e posterior
- solicitações puderem existir sem OS
- o estoque possuir regra de custo
- a reposição possuir ciclo completo
- relatórios mensais puderem ser exportados
- planos possuírem tipos e regras adequadas
- a próxima execução usar a regra validada
- a execução da manutenção gerar registro auditável
- históricos por ativo e local estiverem disponíveis
- alertas forem efetivamente gerados
- documentos utilizarem uma única regra de status
- janelas de alerta forem configuráveis
- anexos possuírem histórico
- abrangência documental estiver disponível
- compromissos recorrentes controlarem competência
- o painel de conformidade estiver completo
- permissões e auditoria estiverem aplicadas
- estornos e cancelamentos não apagarem histórico

---

# 10. Conclusão

O MVP possui uma base funcional adequada para evolução, mas ainda apresenta lacunas importantes em relação aos RN e RF.

Os maiores riscos operacionais estão em:

- considerar estruturas de dados como funcionalidades concluídas
- tratar mudança visual de status como alerta real
- não registrar execução de manutenção de forma imutável
- não controlar ajuste físico de estoque
- não persistir saldo anterior e posterior
- não diferenciar periodicidade de recorrência mensal
- não definir regra de custo
- não controlar estornos e concorrência

A prioridade deve ser fechar o ciclo operacional completo de cada módulo antes de considerar o requisito atendido.
