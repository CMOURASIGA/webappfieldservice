# Relatório Final de Homologação do MVP

## Gestão de Manutenção Predial, Estoque e Documentação Regulatória

## 1. Objetivo

Este documento consolida a homologação funcional, operacional e visual realizada no MVP.

O objetivo é registrar:

- o que foi testado;
- o comportamento observado;
- o comportamento esperado;
- os desvios identificados;
- as pendências por requisito funcional;
- as correções relacionadas aos componentes CNC;
- as prioridades para o DEV;
- os critérios para uma nova rodada de validação.

---

## 2. Escopo

Foram avaliados:

- Visão Geral;
- Gestão de Serviços;
- Manutenções Corretivas;
- Manutenções Preventivas;
- Ordens de Serviço;
- Agenda;
- Gestão de Estoque;
- Fila de Solicitações;
- Documentação Regulatória;
- Cadastro e edição de documentos;
- indicadores;
- filtros;
- navegação;
- botões;
- cards;
- formulários;
- anexos;
- impressão;
- aderência aos RN-01 a RN-05;
- aderência aos RF-01 a RF-22;
- aderência visual ao padrão CNC.

---

## 3. Metodologia

```text
Acessar tela
        ↓
Executar ação
        ↓
Registrar comportamento atual
        ↓
Comparar com RN, RF e padrão visual
        ↓
Classificar como aprovado, parcial ou não atendido
        ↓
Registrar correção necessária
```

Foram considerados três eixos:

1. Regra de negócio.
2. Operação de ponta a ponta.
3. Usabilidade e padrão visual CNC.

---

## 4. Resumo Executivo

O MVP apresenta boa evolução estrutural, principalmente em:

- redução do menu lateral;
- organização por módulos;
- visão geral única;
- agenda por técnico;
- cards operacionais;
- vínculo entre manutenção, OS e estoque;
- cadastro de documentos;
- anexos em OS e documentos;
- indicadores básicos.

Entretanto, o sistema ainda não pode ser considerado homologado.

Principais problemas:

- indicadores da Visão Geral não abrem telas com filtros aplicados;
- divergência entre números do dashboard e dos módulos;
- botões visíveis sem operação;
- ausência de botão de voltar padronizado;
- formulários fora do padrão CNC;
- cards fora do padrão dos componentes;
- ações em texto, sem ícones e sem rodapé estruturado;
- relatórios não implementados;
- alertas automáticos não implementados;
- histórico auditável incompleto;
- movimentações de estoque incompletas;
- cálculo automático da próxima manutenção não validado;
- impressão de OS com erro;
- recorrência documental não implementada;
- filtros e buscas incompletos.

---

## 5. Status Geral por RN

| RN | Tema | Situação |
|---|---|---|
| RN-01 | Movimentações e solicitações de materiais | Não homologada |
| RN-02 | Níveis, reposição e relatórios de estoque | Não homologada |
| RN-03 | Ciclo de vida das manutenções | Não homologada |
| RN-04 | Alertas e indicadores de manutenção | Não homologada |
| RN-05 | Documentação regulatória | Não homologada |

---

# 6. Visão Geral

## 6.1 Indicadores sem filtro

Ao clicar em:

- manutenções preventivas atrasadas;
- OS atrasadas;
- falta de material;
- reposição necessária;
- documentos vencidos;
- documentos críticos;
- OS sem responsável;

o sistema abre o módulo, mas não aplica o filtro correspondente.

### Comportamento esperado

```text
Indicador
        ↓
Abrir módulo de destino
        ↓
Aplicar filtro automaticamente
        ↓
Exibir somente os registros correspondentes
```

## 6.2 Divergência de números

Foram encontradas diferenças entre dashboard e módulo, por exemplo:

- 1 documento crítico no dashboard e 2 no módulo;
- 1 documento vencido no dashboard e 0 no módulo;
- compras pendentes com valor zero, embora existam solicitações.

### Regra obrigatória

```text
Número do KPI = quantidade exibida após aplicar o filtro correspondente
```

Dashboard e módulo devem usar a mesma regra e a mesma fonte de dados.

## 6.3 Compras pendentes

O KPI deve contar solicitações pendentes, não a soma de unidades.

Exemplo:

- uma solicitação de 4 unidades;
- uma solicitação de 1 unidade.

Resultado esperado:

```text
2 solicitações pendentes
```

## 6.4 Bloco "Precisa da sua decisão"

O botão "Resolver" deve abrir a pendência já filtrada.

Exemplos:

- OS sem técnico;
- OS aguardando material;
- compra pendente;
- conflito de agenda.

## 6.5 Agenda resumida

Tornar clicáveis:

- atividades hoje;
- atividades na semana;
- atividades sem responsável.

---

# 7. Navegação

## 7.1 Botão de voltar

Várias telas não possuem retorno interno. O usuário precisou usar o navegador e perdeu o contexto.

### Correção

Todas as telas internas devem possuir:

```text
← Voltar
```

O retorno deve preservar:

- tela de origem;
- filtros;
- posição;
- contexto.

---

# 8. Padrão Visual CNC

## 8.1 Componentes oficiais

Priorizar:

```text
@cnc-ti/layout-basic
```

Utilizar:

- PageHeader;
- Button;
- Card;
- CardHeader;
- CardContent;
- CardFooter;
- Badge;
- Input;
- Select;
- Combobox;
- Tabs;
- Dialog;
- AlertDialog;
- Drawer;
- Sheet;
- Popover;
- Collapsible.

Evitar mistura desnecessária entre componentes locais e oficiais.

## 8.2 Indicadores

Devem ser mini cards clicáveis com:

- ícone;
- título;
- quantidade;
- descrição;
- cor semântica;
- hover;
- foco;
- estado selecionado.

Valor zero deve ser neutro.

## 8.3 Cards

Estrutura obrigatória:

```text
CardHeader
- código
- título
- status

CardContent
- informações essenciais

CardFooter
- ações
```

## 8.4 Ações nos cards

Evitar textos soltos.

Padrão:

```text
Ação principal
- ícone + texto

Ações recorrentes
- ícone com tooltip

Ação destrutiva
- ícone de perigo + confirmação
```

## 8.5 Formulários

Padronizar:

- título;
- descrição;
- agrupamento de campos;
- componentes oficiais;
- Cancelar secundário;
- Salvar primário;
- mensagens de erro;
- loading;
- foco;
- obrigatoriedade.

---

# 9. Gestão de Serviços

## 9.1 Tela principal

Ações superiores:

- Nova corretiva;
- Nova preventiva;
- Nova OS;
- Ver agenda.

Cards de acesso:

- Corretivas;
- Ordens;
- Preventivas;
- Ativos;
- Locais;
- Técnicos.

Não repetir a mesma opção em botão e card.

---

# 10. Manutenções Corretivas

## 10.1 Indicadores

Devem refletir:

- total;
- abertas;
- sem planejamento;
- convertidas em OS.

## 10.2 Conversão em OS

O comportamento de manter a corretiva como histórico e marcar "Convertida em OS" foi considerado adequado.

### Melhoria

Exibir:

- número da OS;
- link para abrir a OS.

## 10.3 Geração de OS

Ao gerar OS a partir de uma corretiva, preencher automaticamente:

- título;
- descrição;
- ativo;
- local;
- unidade;
- prioridade;
- origem;
- observações relevantes.

O usuário não deve redigitar informações existentes.

---

# 11. Manutenções Preventivas

## 11.1 Filtro vindo do dashboard

Abrir diretamente apenas as preventivas atrasadas.

## 11.2 Botão "Gerar OS pendentes"

Não exibir mensagem técnica como:

```text
Rotina manual executada
```

Exibir:

```text
OS criada com sucesso.
Código: OS-2026-0001
[Abrir OS]
```

Ou:

```text
Nenhuma manutenção pendente sem OS foi encontrada.
```

## 11.3 Cadastro

Ajustar:

- botão voltar;
- título;
- agrupamento de campos;
- obrigatórios;
- botões;
- padrão CNC.

## 11.4 Checklist

Decisão tomada:

- não exigir modelo;
- permitir criação livre de itens dentro da preventiva;
- modelo reutilizável pode ser evolução futura.

Permitir:

- editar;
- excluir;
- reordenar;
- marcar obrigatório, se necessário.

---

# 12. Ordens de Serviço

## 12.1 Lista de OS

Ajustar:

- indicadores em mini cards;
- filtros clicáveis;
- cards padronizados;
- ações por ícones;
- botão voltar;
- prioridade e prazo;
- origem da OS.

## 12.2 Impressão

O botão de impressão retornou erro 404.

### Implementar PDF com:

- número da OS;
- origem;
- unidade;
- local;
- ativo;
- descrição;
- técnico;
- prestador;
- datas e horários;
- materiais;
- checklist;
- anexos referenciados;
- observações;
- assinaturas;
- QR Code opcional.

## 12.3 Navegação de mão dupla

```text
Manutenção → OS
OS → manutenção de origem
```

## 12.4 Estrutura interna

Organizar em:

- Informações Técnicas;
- Planejamento;
- Equipe;
- Materiais;
- Execução;
- Anexos;
- Acompanhamento;
- Histórico.

## 12.5 Equipe

Permitir:

- técnico principal;
- auxiliares;
- prestador externo;
- equipe mista.

## 12.6 Materiais

Para item cadastrado:

- pesquisar estoque;
- quantidade;
- reserva;
- consumo.

Para item não cadastrado:

- nome;
- quantidade;
- justificativa;
- solicitação de compra.

## 12.7 Anexos

Exibir:

- nome;
- tipo;
- tamanho;
- status de upload;
- visualizar;
- baixar;
- excluir.

Revisar lentidão no upload de PDF.

## 12.8 Programação

Rodapé correto:

```text
[Cancelar] [Confirmar Programação]
```

Dois botões claramente separados.

---

# 13. Agenda

## 13.1 Funcional

Pontos positivos:

- semana;
- dia;
- lista;
- equipe;
- técnico;
- duração;
- indisponibilidade.

## 13.2 Visual

Adicionar:

- linhas verticais e horizontais mais visíveis;
- destaque do dia atual;
- linha da hora atual;
- melhor contraste dos cards;
- seleção clara de Semana, Dia, Lista e Equipe.

## 13.3 Equipe

Exibir:

- número de OS;
- horas ocupadas;
- capacidade;
- percentual de ocupação;
- conflitos;
- disponibilidade.

---

# 14. RN-01 e RF-01 a RF-05

## RF-01 — Cadastro de materiais

### Situação

Parcialmente atendido.

### Faltante

- novo material funcional;
- editar;
- excluir ou inativar;
- validar código duplicado;
- histórico;
- todos os campos obrigatórios.

Material com histórico deve ser inativado.

## RF-02 — Entradas e saídas

### Situação

Não homologado.

Botões sem operação:

- Registrar Entrada;
- Registrar Saída.

### Implementar

- entrada;
- saída;
- devolução;
- descarte;
- ajuste físico;
- estorno.

Campos:

- material;
- quantidade;
- responsável;
- setor;
- data e hora;
- unidade;
- local;
- motivo;
- documento relacionado.

Persistir:

- saldo anterior;
- quantidade;
- saldo posterior.

## RF-03 — Solicitação de materiais

### Situação

Parcial.

Implementar:

- solicitação independente;
- solicitação vinculada à OS;
- protocolo;
- solicitante;
- setor;
- material;
- quantidade;
- prioridade;
- data necessária;
- justificativa;
- acompanhamento.

QR Code pode ser fase posterior.

## RF-04 — Histórico

### Situação

Não homologado.

Filtros por:

- material;
- responsável;
- setor;
- tipo;
- categoria;
- unidade;
- local;
- período;
- OS;
- nota fiscal.

## RF-05 — Busca e filtros

### Situação

Parcial.

Implementar:

- nome;
- código;
- categoria;
- local;
- situação;
- unidade;
- ativo ou inativo;
- reposição;
- abaixo do mínimo.

---

# 15. RN-02 e RF-06 a RF-08

## RF-06 — Indicadores

### Situação

Parcial.

Implementar:

- normal;
- atenção;
- crítico;
- abaixo do mínimo;
- valor total;
- valor reservado;
- valor disponível.

Definir regra de custo.

Recomendação:

```text
Custo médio ponderado
```

## RF-07 — Reposição

### Situação

Parcial.

Regra:

```text
Saldo disponível = saldo físico - reservado
```

Reposição quando:

```text
Saldo disponível <= estoque mínimo
```

Sugestão:

```text
Estoque ideal - saldo disponível
```

Fluxo:

```text
Reposição identificada
→ avaliação
→ compra solicitada
→ compra em andamento
→ recebimento
→ entrada
→ encerramento
```

## RF-08 — Relatórios

### Situação

Não atendido.

Implementar PDF por:

- período;
- tipo;
- localização;
- categoria;
- consumo;
- gasto;
- unidade;
- setor;
- material.

Excel e CSV recomendados.

---

# 16. Gestão de Estoque

## 16.1 Botões sem operação

- Novo Material;
- Registrar Entrada;
- Registrar Saída;
- Solicitar Material;
- Consultar Movimentações.

## 16.2 Cards

Os botões Abrir e Solicitar também não funcionavam.

Ações esperadas:

- abrir;
- editar;
- entrada;
- saída;
- solicitar compra;
- reservas;
- inativar.

## 16.3 Fila de Solicitações

Ponto positivo: Compras Pendentes direciona para a fila.

Ajustar:

- protocolo;
- solicitante;
- setor;
- prioridade;
- status;
- origem;
- OS;
- ação principal;
- botões oficiais;
- estado vazio.

---

# 17. RN-03 e RF-09 a RF-13

## RF-09 — Planos

### Situação

Parcial.

Faltante:

- tipo configurável;
- responsável interno;
- empresa;
- valor estimado;
- duração;
- anexos;
- instruções;
- status ativo.

## RF-10 — Próxima execução

### Situação

Não homologado.

Regra esperada:

```text
Próxima execução = data real da última execução + periodicidade
```

## RF-11 — Execução com anexos

### Situação

Parcial.

Criar registro auditável com:

- data real;
- observações;
- técnico;
- prestador;
- materiais;
- custos;
- anexos;
- laudos;
- evidências;
- resultado;
- não conformidades.

## RF-12 — Histórico por ativo/local

### Situação

Não homologado.

Implementar:

- execuções;
- OS;
- materiais;
- custos;
- responsáveis;
- prestadores;
- anexos;
- filtros.

## RF-13 — Busca e filtros

### Situação

Não homologado integralmente.

Implementar:

- descrição;
- ativo;
- local;
- empresa;
- status;
- periodicidade;
- tipo;
- unidade;
- responsável.

---

# 18. RN-04 e RF-14 a RF-15

## RF-14 — Alertas

### Situação

Não homologado.

Implementar:

- janelas configuráveis;
- notificação interna;
- destinatários;
- lido ou não lido;
- histórico;
- prevenção de duplicidade.

## RF-15 — Painel e relatório

### Situação

Parcial.

Implementar:

- em dia;
- próximo;
- atrasado;
- sem data;
- por tipo;
- por periodicidade;
- custo total;
- custo previsto;
- custo realizado;
- exportação em PDF.

---

# 19. RN-05 e RF-16 a RF-22

## RF-16 — Cadastro documental

### Situação

Parcial.

Faltante:

- data de atualização;
- data de renovação;
- abrangência;
- tipo de compromisso.

## RF-17 — Status e prazo

### Situação

Parcial.

Unificar:

```text
Vigente
Atenção
Crítico
Vencido
Sem validade definida
```

Remover duplicidades como "Válido" e "A Vencer".

## RF-18 — Alertas configuráveis

### Situação

Não homologado integralmente.

Implementar janelas:

- 90 dias;
- 60 dias;
- 15 dias;
- 5 dias.

## RF-19 — Anexos

### Situação

Parcial.

Ajustar:

- PDF;
- links externos;
- storage;
- controle de acesso;
- histórico;
- retenção;
- antivírus;
- tamanho;
- formatos.

## RF-20 — Filtros

### Situação

Não homologado.

Botão Buscar Documento não funcionava.

Implementar:

- texto;
- status;
- responsável;
- órgão;
- tipo;
- abrangência;
- unidade;
- anexo.

## RF-21 — Recorrência

### Situação

Não atendido.

Implementar:

```text
Único
Periódico
Recorrente mensal
```

Para recorrente mensal:

- competência;
- vencimento;
- status;
- comprovante;
- valor;
- geração automática.

## RF-22 — Conformidade

### Situação

Parcial.

Implementar:

- vigentes;
- atenção;
- críticos;
- vencidos;
- por tipo;
- por responsável;
- por unidade;
- conformidade geral;
- sem responsável;
- sem anexo;
- sem vencimento.

---

# 20. Documentação Regulatória

## 20.1 Botões sem operação

- Registrar Renovação;
- Anexar Arquivo;
- Consultar Vencimentos;
- Buscar Documento.

## 20.2 Formulários

Novo Documento e Editar Documento devem ser refeitos no padrão CNC.

---

# 21. Auditoria

Registrar:

- usuário;
- ação;
- entidade;
- valor anterior;
- valor novo;
- data;
- hora;
- motivo.

---

# 22. Permissões

A tela permanece igual para todos.

Permissões controlam:

- visualizar;
- criar;
- editar;
- inativar;
- movimentar;
- aprovar;
- executar;
- validar;
- cancelar;
- imprimir;
- exportar.

---

# 23. Concorrência e Estornos

## Concorrência

Reservas e saídas devem ser validadas no backend em transação.

## Estornos

Não excluir movimentações.

Criar estorno para:

- entrada;
- saída;
- reserva;
- ajuste;
- consumo;
- renovação;
- conclusão incorreta.

---

# 24. Estados Vazios

Criar mensagens para:

- nenhum registro;
- nenhum resultado;
- nenhum item em alerta;
- nenhuma atividade;
- nenhuma solicitação;
- nenhum documento.

---

# 25. Responsividade e Acessibilidade

## Responsividade

- desktop: 3 ou 4 cards;
- tablet: 2;
- mobile: 1;
- filtros em Drawer;
- agenda em lista;
- ações secundárias em Dropdown.

## Acessibilidade

- aria-label;
- tooltip;
- foco visível;
- teclado;
- contraste;
- texto além da cor;
- fonte mínima de 11px ou 12px.

---

# 26. Priorização

## Prioridade Crítica

1. Corrigir indicadores e filtros do dashboard.
2. Corrigir divergência de números.
3. Ativar botões principais.
4. Corrigir impressão da OS.
5. Preencher OS com dados da origem.
6. Implementar CRUD de materiais.
7. Implementar entradas e saídas.
8. Implementar histórico de movimentações.
9. Implementar solicitação de materiais.
10. Implementar filtros de documentação.
11. Implementar alertas reais.
12. Implementar relatórios obrigatórios.

## Prioridade Alta

13. Botão voltar em todas as telas.
14. Padronizar componentes CNC.
15. Padronizar cards.
16. Padronizar indicadores.
17. Padronizar formulários.
18. Padronizar status documentais.
19. Implementar execução auditável.
20. Implementar cálculo da próxima manutenção.
21. Implementar recorrência documental.
22. Implementar conformidade.

## Prioridade Média

23. Melhorar agenda visual.
24. Melhorar tela de equipe.
25. Melhorar anexos.
26. QR Code.
27. Excel e CSV.
28. Gráficos.
29. Responsividade.
30. Acessibilidade.

---

# 27. Critérios para Nova Homologação

A nova rodada deve ocorrer quando:

- todos os botões principais estiverem funcionais;
- indicadores abrirem telas filtradas;
- números estiverem consistentes;
- impressão de OS funcionar;
- formulários usarem padrão CNC;
- botão voltar existir;
- CRUD de estoque estiver completo;
- movimentações estiverem rastreáveis;
- relatórios estiverem disponíveis;
- alertas estiverem implementados;
- filtros estiverem funcionais;
- recorrência estiver implementada;
- status documentais estiverem unificados.

---

# 28. Checklist de Regressão

## Visão Geral

- [ ] indicadores clicam;
- [ ] filtros aplicados;
- [ ] números conferem;
- [ ] resolver direciona;
- [ ] agenda resumida é clicável.

## Serviços

- [ ] corretiva gera OS;
- [ ] OS recebe dados da origem;
- [ ] link de mão dupla;
- [ ] impressão funciona;
- [ ] programação clara;
- [ ] anexos funcionam.

## Estoque

- [ ] novo material;
- [ ] editar;
- [ ] inativar;
- [ ] entrada;
- [ ] saída;
- [ ] solicitação;
- [ ] histórico;
- [ ] reposição;
- [ ] relatório.

## Documentos

- [ ] novo;
- [ ] editar;
- [ ] renovar;
- [ ] anexar;
- [ ] buscar;
- [ ] filtrar;
- [ ] status;
- [ ] alertas;
- [ ] recorrência;
- [ ] conformidade.

## Visual

- [ ] fonte;
- [ ] títulos;
- [ ] menu;
- [ ] cards;
- [ ] badges;
- [ ] botões;
- [ ] ícones;
- [ ] voltar;
- [ ] estados vazios;
- [ ] responsividade.

---

# 29. Parecer Final

O MVP demonstra o conceito e possui uma base funcional relevante, mas ainda não está homologado para entrega.

Os maiores riscos são:

- funcionalidades aparentarem estar prontas sem estarem operacionais;
- dashboard apresentar números divergentes;
- navegação perder contexto;
- falta de rastreabilidade;
- ausência de relatórios;
- falta de alertas reais;
- impressão de OS com erro;
- estoque sem ciclo completo;
- documentação sem recorrência;
- visual híbrido fora do padrão CNC.

A orientação final ao DEV é:

```text
Não corrigir somente a aparência.
Fechar o fluxo funcional de cada RF.
        +
Utilizar componentes CNC.
        +
Garantir rastreabilidade e consistência.
```

---

# 30. Revisão do Documento e Complementos Necessários

Após revisão integral do relatório, foram identificados pontos que precisavam ser acrescentados para transformar o material em um documento completo de homologação e execução para o DEV.

Os complementos abaixo fazem parte da versão revisada.

---

# 31. Identificação da Rodada de Homologação

## Informações a preencher

- Projeto: Gestão de Manutenção Predial
- Rodada: Homologação inicial do MVP
- Data da validação: 22/07/2026
- Ambiente: MVP / homologação
- Versão do sistema: preencher pelo DEV
- URL do ambiente: preencher pelo DEV
- Responsável pela validação: Christian
- Responsável técnico: preencher
- Navegador utilizado: preencher
- Dispositivo e resolução: preencher

## Regra

Toda nova entrega deve possuir:

- versão identificada;
- data da publicação;
- lista de itens corrigidos;
- lista de itens ainda pendentes;
- evidência de teste;
- responsável pela liberação.

---

# 32. Legenda de Status

| Status | Significado |
|---|---|
| Aprovado | Comportamento testado e aderente ao requisito |
| Parcialmente atendido | Existe parte da funcionalidade, mas faltam regras, campos ou fluxos |
| Não atendido | Funcionalidade ausente ou botão sem operação |
| Não homologado | Não foi possível testar de ponta a ponta |
| Com defeito | A funcionalidade existe, mas apresentou erro |
| Fora do escopo atual | Melhoria recomendada, mas não obrigatória para o RF |
| Dependente de decisão | Necessita definição do cliente ou da equipe antes da implementação |

Essa legenda deve ser utilizada na matriz de rastreabilidade e nos registros de teste.

---

# 33. Matriz Consolidada de Rastreabilidade

| RF | Descrição resumida | Situação atual | Principal pendência |
|---|---|---|---|
| RF-01 | Cadastro de materiais | Parcialmente atendido | CRUD, edição, inativação e validação |
| RF-02 | Entradas e saídas | Não atendido | Botões sem operação e fluxo completo ausente |
| RF-03 | Solicitação de materiais | Parcialmente atendido | Formulário funcional e solicitação independente |
| RF-04 | Histórico de movimentações | Não atendido | Consulta, busca e filtros |
| RF-05 | Filtros de estoque | Parcialmente atendido | Busca e filtros combinados |
| RF-06 | Indicadores de estoque | Parcialmente atendido | Situações completas e valor total |
| RF-07 | Reposição | Parcialmente atendido | Sugestão automática e ciclo de compra |
| RF-08 | Relatório de consumo | Não atendido | PDF e indicadores analíticos |
| RF-09 | Planos de manutenção | Parcialmente atendido | Tipo, custo, responsáveis e anexos |
| RF-10 | Próxima execução | Não homologado | Cálculo automático pela execução real |
| RF-11 | Registro de execução | Parcialmente atendido | Registro auditável e evidências |
| RF-12 | Histórico por ativo/local | Não homologado | Histórico consolidado e filtros |
| RF-13 | Busca de manutenções | Não homologado | Filtros combinados completos |
| RF-14 | Alertas de manutenção | Não atendido | Notificações configuráveis |
| RF-15 | Painel e relatório gerencial | Parcialmente atendido | Custos, distribuições e PDF |
| RF-16 | Cadastro documental | Parcialmente atendido | Atualização, abrangência e compromisso |
| RF-17 | Status documental | Parcialmente atendido | Regra única e números consistentes |
| RF-18 | Alertas documentais | Parcialmente atendido | Janelas progressivas e avisos automáticos |
| RF-19 | Anexos documentais | Parcialmente atendido | PDF, links, storage e histórico |
| RF-20 | Filtros documentais | Não atendido | Busca e filtros combinados |
| RF-21 | Recorrência documental | Não atendido | Competências mensais e lógica própria |
| RF-22 | Conformidade | Parcialmente atendido | Indicador geral e visões analíticas |

---

# 34. Funcionalidades Aprovadas ou Bem Encaminhadas

O relatório original concentrava-se principalmente nas pendências. Para evitar uma visão desequilibrada, ficam registrados os pontos considerados aprovados ou conceitualmente corretos:

- menu reduzido e organizado por módulos;
- visão geral única para todos os usuários;
- agenda com visão semanal, diária, lista e equipe;
- filtro interno de preventivas atrasadas funciona quando acionado dentro do módulo;
- manutenção corretiva permanece como histórico após conversão em OS;
- indicação de "Convertida em OS" está coerente;
- programação de OS por técnico, data, horário e duração está conceitualmente adequada;
- inclusão de materiais cadastrados e não cadastrados na OS está bem direcionada;
- justificativa para material não cadastrado está adequada;
- anexação de imagens na OS funciona;
- fluxo de compras pendentes direciona para a fila de solicitações;
- cadastro básico de documento regulatório está presente;
- tela de detalhe de documento apresenta informações relevantes;
- visão de equipe apresenta capacidade e ocupação;
- conceito de saldo físico, reservado e disponível está correto.

Esses itens devem ser preservados durante as correções.

---

# 35. Casos de Teste de Regressão Detalhados

## CT-01 — Indicador de preventiva atrasada

### Pré-condição

Existir ao menos uma preventiva atrasada.

### Passos

1. Abrir a Visão Geral.
2. Clicar em "Manutenções Preventivas Atrasadas".

### Resultado esperado

- abrir Gestão de Serviços;
- acessar preventivas;
- aplicar filtro `Atrasada`;
- quantidade exibida igual ao KPI;
- permitir limpar o filtro.

---

## CT-02 — Indicador de documentos críticos

### Passos

1. Abrir a Visão Geral.
2. Clicar em "Documentos Críticos".

### Resultado esperado

- abrir Documentação Regulatória;
- aplicar filtro `Crítico`;
- quantidade igual ao dashboard;
- cards exibidos com o mesmo critério de status.

---

## CT-03 — Gerar OS de preventiva

### Passos

1. Acessar preventiva atrasada sem OS.
2. Executar "Gerar OS pendente".

### Resultado esperado

- criar apenas uma OS;
- exibir código da OS;
- disponibilizar link;
- impedir duplicidade;
- vincular plano, ativo, local e origem;
- registrar auditoria.

---

## CT-04 — Gerar OS de corretiva

### Resultado esperado

A OS deve receber automaticamente:

- título;
- descrição;
- ativo;
- local;
- unidade;
- prioridade;
- origem;
- observações;
- vínculo de retorno.

---

## CT-05 — Impressão da OS

### Resultado esperado

- não apresentar erro 404;
- abrir visualização ou baixar PDF;
- apresentar todos os campos essenciais;
- respeitar permissão;
- registrar código da OS;
- imprimir em formato adequado.

---

## CT-06 — Registrar entrada de estoque

### Resultado esperado

- validar campos obrigatórios;
- atualizar saldo físico;
- registrar saldo anterior e posterior;
- gerar movimentação;
- registrar responsável, setor, data e hora;
- atualizar indicadores.

---

## CT-07 — Registrar saída

### Resultado esperado

- impedir saída acima do disponível;
- considerar reservas;
- registrar retirante e setor;
- atualizar saldo;
- vincular à OS quando aplicável;
- permitir estorno autorizado.

---

## CT-08 — Solicitação independente

### Resultado esperado

- permitir solicitação sem OS;
- gerar protocolo;
- registrar solicitante e setor;
- permitir acompanhamento;
- atualizar fila e dashboard.

---

## CT-09 — Renovação de documento

### Resultado esperado

- preservar versão anterior;
- anexar nova versão;
- registrar data de renovação;
- recalcular vencimento;
- recalcular status;
- registrar auditoria.

---

## CT-10 — Compromisso recorrente

### Resultado esperado

- gerar competência mensal;
- controlar situação por competência;
- manter histórico;
- gerar próxima competência;
- permitir anexo de comprovante.

---

# 36. Regras de Integridade de Dados

## Estoque

- não permitir saldo negativo sem permissão especial;
- reserva não pode superar quantidade disponível sem alerta e autorização;
- saída e reserva devem ser transacionais;
- toda alteração de saldo deve gerar movimentação;
- movimentação não pode ser excluída;
- estorno deve referenciar a movimentação original.

## Manutenção

- uma execução concluída não deve ser apagada;
- OS gerada a partir de plano ou corretiva deve manter a origem;
- gerar OS novamente deve verificar duplicidade;
- conclusão da OS deve atualizar plano somente quando aplicável;
- anexos e evidências devem permanecer vinculados.

## Documentos

- renovação não deve sobrescrever a versão anterior;
- status deve ser calculado por função única;
- documento sem vencimento deve usar regra própria;
- recorrência mensal não pode ser tratada como simples vencimento periódico.

---

# 37. Requisitos Não Funcionais a Validar

Estes itens não estavam detalhados nos RF, mas precisam ser verificados antes da produção.

## Desempenho

- tempo de carregamento das páginas;
- tempo de pesquisa;
- tempo de upload;
- comportamento com grande volume de cards;
- paginação ou carregamento incremental.

## Anexos

- tamanho máximo;
- formatos permitidos;
- progresso de upload;
- cancelamento;
- erro e nova tentativa;
- segurança;
- antivírus;
- visualização de PDF.

## Segurança

- autenticação;
- autorização por ação;
- proteção de links;
- acesso a anexos;
- logs;
- dados sensíveis;
- sessão expirada.

## Compatibilidade

Testar em:

- Chrome;
- Edge;
- resoluções de notebook;
- monitor;
- tablet;
- celular, quando aplicável.

## Disponibilidade e erro

- API indisponível;
- falha ao salvar;
- perda de conexão;
- timeout;
- duplicidade de clique;
- atualização concorrente.

---

# 38. Mensagens e Feedback ao Usuário

Padronizar mensagens com componentes CNC.

## Sucesso

```text
Material cadastrado com sucesso.
```

```text
OS criada com sucesso. Código: OS-2026-0001.
```

## Sem resultado

```text
Nenhum registro encontrado para os filtros aplicados.
```

## Erro

```text
Não foi possível concluir a operação. Tente novamente.
```

## Confirmação

```text
Deseja realmente inativar este registro?
```

## Regra

Não utilizar:

- alert nativo do navegador;
- texto técnico;
- mensagens pretas soltas;
- erro sem orientação;
- sucesso sem identificação do registro criado.

---

# 39. Critérios de Pronto para o DEV

Um item só pode ser marcado como concluído quando:

- o fluxo estiver funcional;
- o padrão CNC estiver aplicado;
- houver validação de campos;
- houver tratamento de sucesso e erro;
- permissões forem respeitadas;
- auditoria for registrada;
- o dado de origem e destino estiver consistente;
- indicadores forem atualizados;
- o teste de regressão correspondente passar;
- não houver erro no console;
- não houver botão sem ação.

---

# 40. Evidências para a Próxima Entrega

O DEV deve entregar, junto com a nova versão:

- lista de correções;
- versão publicada;
- referência ao RF;
- evidência visual;
- resultado de teste;
- itens não concluídos;
- limitações conhecidas;
- scripts ou ajustes de dados necessários.

Modelo:

| Item | RF | Correção | Evidência | Resultado |
|---|---|---|---|---|
| Indicador de preventiva | RF-15 | Aplicado filtro na navegação | Captura | Aprovado |
| Impressão da OS | RF-11 | PDF corrigido | Arquivo gerado | Aprovado |

---

# 41. Decisões Pendentes de Negócio

Antes de concluir algumas funções, devem ser validadas as seguintes decisões:

1. A próxima manutenção será calculada pela data real de execução ou pelo calendário fixo?
2. Qual regra de custo será utilizada no estoque?
3. Documentos em atenção entram como conformes ou conformes com risco?
4. Quais canais serão usados para alertas?
5. Qual limite de anexos e tamanho?
6. Quem pode autorizar saída acima do disponível?
7. Quais registros podem ser excluídos e quais apenas inativados?
8. Checklist continuará totalmente livre ou poderá ser salvo como modelo futuro?
9. O QR Code será incluído no MVP ou em fase posterior?
10. A OS impressa exigirá campos de assinatura?

Essas decisões devem ser registradas antes da implementação definitiva.

---

# 42. Conclusão da Revisão

O relatório original estava abrangente e cobria os principais problemas funcionais e visuais.

Os itens que faltavam para torná-lo um documento completo de homologação eram:

- identificação formal da rodada;
- legenda de status;
- matriz de rastreabilidade;
- registro do que está aprovado;
- casos de teste detalhados;
- regras de integridade;
- requisitos não funcionais;
- padrão de mensagens;
- definição de pronto;
- evidências esperadas;
- decisões pendentes de negócio.

Com esses complementos, o documento passa a servir como:

- relatório de homologação;
- backlog de correções;
- referência de aceite;
- roteiro de regressão;
- base de rastreabilidade entre RN, RF, tela e correção.
