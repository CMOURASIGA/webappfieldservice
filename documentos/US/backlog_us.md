# Backlog de US

## Situacao geral
- `Concluida`: implementacao validada em codigo e coberta por verificacao local.
- `Em andamento`: parte aplicada, mas ainda existem lacunas operacionais ou pontos para fechar.
- `Pendente`: ainda nao tratado de forma completa na aplicacao.

## Frentes em andamento
- `US-05 - Padronizar navegacao de retorno`
- `US-06 - Remover a nomenclatura Demanda do sistema`

## US-01 - Separar Ativos e Locais em telas distintas [`Concluida`]
**Objetivo**
Desacoplar o cadastro e a manutencao de ativos do cadastro de locais, garantindo navegacao independente e CRUD proprio para cada dominio.

**O que validar**
- Tela de ativos sem campos de local misturados no formulario principal.
- Tela dedicada de locais com inclusao, edicao e exclusao.
- Fluxos persistindo corretamente no `localStorage`.

**Status encontrado**
- Aplicado com a criacao da tela dedicada de locais e reorganizacao da tela de ativos.

## US-02 - Implementar a area de relatorios [`Concluida`]
**Objetivo**
Disponibilizar uma area de relatorios para consolidar visoes operacionais do sistema.

**O que validar**
- Entrada de menu para relatorios.
- Tela renderizando indicadores e resumos coerentes com os dados persistidos.
- Compatibilidade com dados salvos localmente.

**Status encontrado**
- Aplicado com nova rota e painel de relatorios baseado em dados operacionais atuais.

## US-03 - Corrigir indicadores e contagem de compras pendentes [`Concluida`]
**Objetivo**
Ajustar contadores, KPIs e visoes resumidas que dependem de solicitacoes, compras e itens pendentes.

**O que validar**
- Contagem correta no dashboard e nas filas.
- Totais consistentes entre tela de estoque, fila e relatorios.
- Atualizacao imediata apos inclusao, alteracao e exclusao.

**Status encontrado**
- Consolidacao aplicada e validada.
- `Visao Geral`, `Estoque`, `Fila` e `Relatorios` usam a mesma regra de pendencia para compras e solicitacoes.
- Validacao tecnica concluida com `lint` e `build` aprovados.

## US-04 - Fechar o fluxo operacional de estoque [`Concluida`]
**Objetivo**
Garantir o ciclo operacional completo de estoque, incluindo solicitacao, atendimento, movimentacao, historico e rastreabilidade.

**O que validar**
- Inclusao de solicitacoes.
- Atualizacao de status.
- Baixa e movimentacao refletindo no historico.
- Persistencia integral no `localStorage`.

**Status encontrado**
- Fluxo principal reforcado e validado tecnicamente.
- Solicitacao, entrada, baixa, associacao de material existente, criacao de novo material e cancelamento na fila foram tratados.
- Historico, reserva e reflexo em OS vinculada foram integrados.
- Persistencia via `localStorage` revisada nos pontos centrais do estoque.

## US-05 - Padronizar navegacao de retorno [`Pendente`]
**Objetivo**
Uniformizar botoes de voltar, breadcrumbs e fluxo de retorno entre telas relacionadas.

**O que validar**
- Comportamento consistente em detalhes, modais e paginas filhas.
- Retorno previsivel para a origem correta.

**Status encontrado**
- Ainda nao fechado como pacote completo.

## US-06 - Remover a nomenclatura Demanda do sistema [`Pendente`]
**Objetivo**
Eliminar referencias antigas a "Demanda" quando o dominio atual exigir outra nomenclatura.

**O que validar**
- Menus, titulos, labels e mensagens sem residuos.
- Chaves e textos persistidos revisados quando aplicavel.

**Status encontrado**
- Ainda precisa de revisao sistematica completa no codigo e nas telas.

## US-07 - Formalizar o CRUD de documentos regulatorios [`Concluida`]
**Objetivo**
Estruturar o cadastro de documentos regulatorios com operacoes claras de inclusao, alteracao, consulta e exclusao.

**O que validar**
- Cadastro funcionando.
- Edicao persistindo corretamente.
- Exclusao com reflexo imediato na listagem.
- Detalhamento consistente.

**Status encontrado**
- Fluxo consolidado com ajustes em listagem, detalhe e persistencia.

## US-08 - Revisar automacoes e auditoria das operacoes de localStorage [`Concluida`]
**Objetivo**
Verificar se todas as entidades usam leitura, escrita, atualizacao e remocao de forma consistente no `localStorage`.

**O que validar**
- Chaves centralizadas ou previsiveis.
- Sem divergencia entre estado em memoria e persistencia.
- Exclusoes sem residuos.
- Rehidratacao correta ao recarregar a aplicacao.

**Status encontrado**
- Revisao concluida nos modulos impactados por esta rodada.
- Regras de reconciliacao de saldo, reserva, disponibilidade e status foram centralizadas.
- Logs de auditoria foram aplicados nos principais eventos de solicitacao, movimentacao e resolucao de fila.
- Validacao tecnica concluida com persistencia e recompilacao aprovadas.

## Itens ja validados como funcionando
- CRUD de locais.
- Separacao entre ativos e locais.
- Entrada e renderizacao da area de relatorios.
- CRUD principal de documentos regulatorios.
- Reorganizacao do fluxo principal de estoque com historico e fila operacional.
- Padronizacao principal dos indicadores de compras pendentes e solicitacoes pendentes.
- Reconciliacao central de saldo, reserva, disponibilidade e status no estoque.
- Auditoria principal de `localStorage` nos fluxos revisados.
- Validacao tecnica com `npm run lint` e `npm run build` aprovados.

## Proximos blocos de execucao
1. Padronizar navegacao de retorno entre telas relacionadas.
2. Eliminar nomenclaturas antigas ainda remanescentes.
3. Evoluir a limpeza estrutural de textos com codificacao legada.
4. Atacar o code splitting do bundle inicial.
