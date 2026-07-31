# Nova Validação Completa do Sistema
## Varredura Funcional, Visual e Técnica do Frontend

## 1. Objetivo

Este documento consolida uma nova varredura do sistema como um todo, considerando:

- as telas apresentadas durante a homologação;
- os dois padrões visuais anexados;
- os pontos levantados pelo usuário;
- a estrutura atual do código-fonte enviado;
- a aderência ao design system CNC;
- a consistência entre módulos;
- a operação dos cards, indicadores, formulários e ações.

A revisão foi feita em duas frentes:

1. **Validação visual e funcional**, com base nas telas e comportamentos observados.
2. **Validação estática do código-fonte**, com base no pacote `webappfieldservice-main (8)(1).zip`.

Esta análise não substitui uma nova execução completa no ambiente publicado. Há pontos em que o código enviado já contém tratamento, mas o ambiente homologado ainda apresenta comportamento antigo. Esses casos são identificados como possível divergência de versão ou implantação.

---

# 2. Referências Visuais Obrigatórias

## 2.1 Padrão de tela de inclusão e edição

Todas as telas de cadastro e edição devem seguir o padrão demonstrado na referência de Cadastro de Espaço:

- faixa clara de cabeçalho;
- botão de voltar em componente delimitado;
- título principal destacado;
- subtítulo explicativo;
- painel branco com borda;
- campos organizados em grade;
- labels visíveis;
- obrigatoriedade indicada com asterisco;
- seções internas delimitadas;
- controles com altura e espaçamento padronizados;
- rodapé de ações claramente separado;
- botão primário e botão secundário visualmente distintos.

## 2.2 Padrão de indicadores

Os indicadores devem seguir o padrão da segunda referência:

- card branco;
- borda sutil;
- raio consistente;
- título em caixa alta ou padrão institucional;
- número em grande destaque;
- ícone dentro de área própria;
- informação complementar quando aplicável;
- espaçamento interno uniforme;
- estado de hover;
- estado selecionado;
- comportamento clicável;
- valor zero com aparência neutra.

Também pode ser utilizado o padrão existente na tela de técnicos, desde que todos os módulos utilizem uma única linguagem visual.

---

# 3. Conclusão Executiva

A arquitetura geral do sistema está correta, mas o frontend ainda apresenta três problemas estruturais:

1. **Ausência de uma camada visual única para todos os módulos.**
2. **Implementação incompleta ou desigual das ações operacionais.**
3. **Diferença entre o código enviado e o comportamento visto no ambiente homologado.**

A correção não deve ser feita tela por tela de forma isolada. O DEV deve criar componentes reutilizáveis para:

- cabeçalho de página;
- botão de voltar;
- card de indicador;
- card operacional;
- rodapé de ações;
- formulário em página;
- formulário em drawer;
- estado vazio;
- feedback de sucesso e erro.

Depois disso, aplicar os componentes a todos os módulos.

---

# 4. Matriz dos 14 Pontos Informados

| Nº | Ponto | Resultado da validação | Prioridade |
|---|---|---|---|
| 1 | Telas sem botão de voltar | Confirmado | Crítica |
| 2 | Indicadores fora do padrão | Confirmado | Alta |
| 3 | Cards de ativos desorganizados | Confirmado | Alta |
| 4 | Ativos e locais na mesma tela | Confirmado no código | Alta |
| 5 | Locais melhor apresentados | Confirmado visualmente | Média |
| 6 | Agenda resumida não clicável | Confirmado no código | Alta |
| 7 | Cards de técnicos sobrepostos | Confirmado pelo relato; código possui estrutura de risco | Alta |
| 8 | Ações de estoque fora do padrão | Confirmado | Crítica |
| 9 | Cards de OS sem operações completas | Confirmado | Crítica |
| 10 | Título e descrição aglutinados | Confirmado no ambiente; composição existe no código | Alta |
| 11 | Indicadores de OS não clicáveis | Divergência entre ambiente e código | Crítica |
| 12 | Cards sem botões operacionais | Parcialmente confirmado | Crítica |
| 13 | Cadastros e edições fora do padrão | Confirmado | Alta |
| 14 | Indicadores da Visão Geral fora do padrão | Confirmado | Alta |

---

# 5. Ponto 1 — Botão de Voltar

## Situação

O código possui um componente:

```text
src/components/ui/BackButton.tsx
```

Porém, ele não está sendo utilizado pelas páginas.

A varredura encontrou diversas telas sem botão de voltar:

- Agenda;
- Ativos;
- Documentos;
- Estoque;
- Gestão de Serviços;
- Ordens;
- Preventivas;
- Técnicos;
- Nova OS;
- Nova Preventiva;
- Novo Serviço;
- Novo Técnico;
- Administração;
- Auditoria.

Algumas telas possuem uma seta manual ou texto "Voltar", mas não existe um padrão único.

## Problema técnico adicional

O componente atual usa:

```text
navigate(-1)
```

Isso apenas retorna uma posição no histórico do navegador. Pode levar o usuário para uma tela diferente da origem lógica e perder filtros.

## Correção obrigatória

Criar um componente de cabeçalho com retorno contextual:

```text
PageHeaderWithBack
```

Propriedades recomendadas:

- `title`;
- `description`;
- `backTo`;
- `backLabel`;
- `actions`;
- `preserveState`.

## Regra

- telas abertas pela lista voltam para a lista;
- telas abertas pelo dashboard voltam ao dashboard;
- filtros devem ser preservados;
- cadastro cancelado volta para a origem;
- não depender exclusivamente de `navigate(-1)`.

---

# 6. Ponto 2 — Padronização dos Indicadores

## Situação

Existem três padrões diferentes no código:

1. cards completos na Visão Geral;
2. botões manuais com classes Tailwind em Ordens, Estoque e Documentos;
3. cards locais na tela de Técnicos.

Isso cria inconsistência em:

- borda;
- altura;
- raio;
- ícones;
- alinhamento;
- fonte;
- espaçamento;
- estados selecionados.

## Correção

Criar um único componente:

```tsx
<IndicatorCard
  title="OS Atrasadas"
  value={3}
  icon={Clock}
  tone="danger"
  selected={false}
  onClick={...}
  helperText="Requer ação"
/>
```

## Regras visuais

- valor zero: neutro;
- atenção: âmbar;
- crítico: vermelho;
- informação: azul;
- sucesso: verde;
- card selecionado: borda e fundo identificáveis;
- todos devem funcionar por teclado;
- todos devem ter `aria-label`.

## Regra funcional

Todo indicador deve aplicar filtro e deixar o filtro visível.

---

# 7. Pontos 3, 4 e 5 — Ativos e Locais

## 7.1 Estrutura atual encontrada

A rota `/ativos` renderiza a página `Ativos.tsx`.

Nessa página existem duas abas internas:

```text
Ativos
Locais
```

Portanto, o relato de que o acesso de ativos mostra ativos e locais está confirmado no código.

## 7.2 Problema de arquitetura

Ativo e local são entidades relacionadas, mas operacionalmente distintas.

Misturar as duas em uma única página provoca:

- tela com dupla finalidade;
- título genérico "Ativos e Locais";
- ações que mudam conforme a aba;
- dificuldade de navegação;
- inconsistência com os cards do menu de Gestão de Serviços;
- maior risco de layout quebrado.

## Correção recomendada

Separar em rotas próprias:

```text
/ativos
/locais
```

Criar:

```text
src/pages/Ativos.tsx
src/pages/Locais.tsx
```

O card "Ativos" da Gestão de Serviços deve abrir somente ativos.

O card "Locais" deve abrir somente locais.

## 7.3 Problemas de layout dos cards

O código cria um `Card` externo e, dentro dele, uma nova grade com vários `Card`.

Também utiliza:

```text
overflow-x-auto
```

em torno de uma grade responsiva.

Essa combinação pode gerar:

- compressão;
- cards visualmente colados;
- corte;
- largura inadequada;
- sensação de sobreposição;
- espaçamento inconsistente.

## Correção

Remover o `Card` externo usado apenas como contêiner.

Usar:

```text
PageHeader
Filters
IndicatorCards
Grid de cards
```

Diretamente sobre o fundo da página.

## 7.4 Card de ativo

Informações mínimas:

- código;
- nome;
- status;
- categoria;
- local;
- unidade;
- patrimônio;
- fabricante.

Rodapé:

- detalhes;
- editar;
- histórico;
- inativar.

## 7.5 Card de local

Manter o padrão visual considerado melhor, mas migrar para o mesmo componente base dos ativos.

---

# 8. Ponto 6 — Agenda da Visão Geral

## Situação confirmada no código

Na Visão Geral, apenas o texto:

```text
Abrir Agenda Completa
```

possui evento de clique.

As linhas:

- Atividades Hoje;
- Atividades na Semana;
- Atividades sem Responsável;

não possuem `onClick`.

## Correção

Transformar cada linha em ação:

```text
Atividades Hoje
→ /agenda?view=day&date=hoje

Atividades na Semana
→ /agenda?view=week

Atividades sem Responsável
→ /agenda?filter=sem-responsavel
```

## Visual

Cada linha deve possuir:

- hover;
- cursor;
- ícone;
- quantidade;
- seta de navegação;
- foco;
- área de clique completa.

---

# 9. Ponto 7 — Cards de Técnicos Sobrepostos

## Situação

O relato visual indica sobreposição.

No código, a página de técnicos possui:

- um `Card` externo;
- filtros dentro do card;
- `overflow-x-auto`;
- grade de cards dentro do mesmo card;
- cards com conteúdos de alturas variáveis.

Essa estrutura pode gerar problemas em determinadas resoluções.

## Correção

Separar:

```text
Cabeçalho
Indicadores
Painel de filtros
Grid de técnicos
```

Não envolver toda a grade em um card de conteúdo.

## Card de técnico

Utilizar:

- altura automática;
- `min-width: 0`;
- truncamento com tooltip;
- rodapé fixado pela estrutura flex;
- conteúdo sem posição absoluta;
- grid responsivo.

## Breakpoints

```text
1 coluna: até 767px
2 colunas: 768px a 1199px
3 colunas: 1200px ou mais
```

## Testes obrigatórios

- 1366 × 768;
- 1440 × 900;
- 1920 × 1080;
- zoom de 100%, 110% e 125%;
- textos longos;
- nome de empresa longo;
- múltiplos badges.

---

# 10. Ponto 8 — Operações do Estoque e Drawer Lateral

## Situação no código

O código enviado já possui handlers para:

- Registrar Entrada;
- Registrar Saída;
- Solicitar Material;
- Consultar Movimentações;
- Solicitações;
- Novo Material.

Entretanto, o ambiente homologado não apresentava todos os fluxos funcionando corretamente.

Isso indica possível:

- versão não implantada;
- código não publicado;
- erro de runtime;
- componente duplicado;
- conflito de modal.

## Problema técnico encontrado

No final de `Estoque.tsx`, os três modais são renderizados duas vezes:

- condicionalmente;
- novamente de forma incondicional.

Isso deve ser corrigido.

## Correção visual

Utilizar drawer lateral direito para:

- Novo Material;
- Registrar Entrada;
- Registrar Saída;
- Solicitar Material.

## Drawer recomendado

- largura entre 480px e 600px no desktop;
- tela inteira no mobile;
- cabeçalho fixo;
- título e descrição;
- conteúdo com rolagem;
- rodapé fixo;
- Cancelar secundário;
- Salvar ou Confirmar primário.

## Consultas

Não usar drawer para:

- histórico de movimentações;
- fila de solicitações;
- relatórios.

Essas ações devem abrir páginas completas.

## Hierarquia das ações

Ação principal:

```text
Novo Material
```

Operações frequentes:

```text
Entrada
Saída
Solicitação
```

Consultas:

```text
Movimentações
Fila
```

---

# 11. Pontos 9, 11 e 12 — Cards e Indicadores de OS

## 11.1 Indicadores

No código enviado, os indicadores de OS possuem `onClick`.

Se no ambiente não funcionam, existe divergência entre código e publicação.

## Ação obrigatória

O DEV deve confirmar:

- commit publicado;
- versão do frontend;
- query string;
- leitura do filtro pelo módulo;
- atualização da URL;
- estado inicial do filtro.

## 11.2 Operações dos cards

O código atual utiliza `CardFooterActions`, porém somente com:

```text
Abrir OS
```

Isso não atende a operação completa.

## Ações esperadas por status

### Aberta

- abrir;
- editar;
- programar;
- atribuir técnico;
- imprimir;
- cancelar.

### Programada

- abrir;
- reprogramar;
- iniciar;
- imprimir;
- histórico.

### Em execução

- abrir;
- pausar;
- registrar acompanhamento;
- concluir;
- anexar;
- imprimir.

### Aguardando material

- abrir;
- ver solicitação;
- registrar entrada;
- liberar material;
- reprogramar.

### Concluída

- abrir;
- imprimir;
- ver execução;
- histórico;
- reabrir, conforme permissão.

## Padrão visual

Ação principal com texto.

Ações secundárias com ícones e tooltip.

Excesso de ações em menu de três pontos.

---

# 12. Ponto 10 — Título e Descrição Aglutinados

## Situação

No código, `PageHeaderTitle` e o parágrafo de descrição estão separados.

Exemplo:

```tsx
<PageHeaderTitle title="Ordens de Serviço" />
<p>Acompanhamento e execução operacional.</p>
```

Se aparecem como:

```text
Ordens de ServiçoAcompanhamento e execução operacional.
```

o problema provável está em:

- CSS do `PageHeaderTitleContent`;
- versão do pacote;
- estilo sobrescrito;
- componente sendo renderizado em linha;
- falta de `display: flex` com direção em coluna;
- incompatibilidade da API do componente.

## Correção

Criar wrapper padronizado:

```tsx
<div className="flex flex-col gap-1">
  <PageHeaderTitle title="Ordens de Serviço" />
  <p className="text-sm text-slate-500">
    Acompanhamento e execução operacional.
  </p>
</div>
```

Aplicar a todos os módulos:

- Serviços;
- OS;
- Preventivas;
- Estoque;
- Documentos;
- Ativos;
- Locais;
- Técnicos;
- Agenda.

---

# 13. Ponto 13 — Telas de Inclusão e Edição

## Situação

Hoje existem três formatos diferentes:

1. páginas completas;
2. modais;
3. drawer local.

Não existe padrão único.

## Diretriz obrigatória

### Página completa

Usar para cadastros complexos:

- Nova OS;
- Editar OS;
- Nova Preventiva;
- Editar Preventiva;
- Novo Documento;
- Editar Documento;
- novo plano complexo.

### Drawer lateral

Usar para operações rápidas:

- Novo Material;
- Entrada;
- Saída;
- Solicitação;
- Novo Ativo;
- Novo Local;
- atribuição de técnico;
- programação simples.

## Estrutura de página

```text
Cabeçalho claro
Botão Voltar
Título
Descrição
Painel branco
Seções
Campos
Rodapé de ações
```

## Estrutura de drawer

```text
Cabeçalho fixo
Título
Descrição
Conteúdo rolável
Rodapé fixo
```

## Campos

- label acima;
- asterisco;
- mensagem de erro;
- ajuda quando necessária;
- altura uniforme;
- grid consistente;
- campos relacionados próximos;
- foco visível.

---

# 14. Ponto 14 — Indicadores da Visão Geral

## Situação

A estrutura atual já se aproxima da referência, mas ainda precisa de ajuste visual e funcional.

## Correções

- padronizar altura;
- usar título em padrão institucional;
- aumentar contraste do número;
- alinhar ícone;
- usar informação complementar;
- valor zero neutro;
- filtro correto;
- query string correta;
- estado de foco;
- seta ou indicação de navegação;
- carregamento;
- estado de erro.

## Nomenclatura

Substituir:

```text
Sem Responsável
```

por:

```text
OS sem técnico
```

ou dividir em indicadores específicos se também houver serviços sem responsável.

---

# 15. Achados Adicionais da Varredura do Código

## 15.1 Mistura de componentes

Algumas páginas usam componentes CNC.

Outras usam:

```text
src/components/ui/Button
src/components/ui/Card
src/components/ui/Badge
src/components/ui/Input
src/components/ui/Select
```

Exemplos de forte uso local:

- Ativos;
- Técnicos;
- detalhes;
- formulários antigos.

## Correção

Definir uma matriz oficial:

| Componente | Origem obrigatória |
|---|---|
| Button | CNC |
| Card | CNC |
| Badge | CNC |
| Input | CNC |
| Select | CNC |
| Dialog | CNC |
| Drawer | wrapper institucional |
| CardFooterActions | wrapper institucional |

---

## 15.2 Ações vazias no estoque

No card de material foi encontrado:

```tsx
onView={() => {}}
```

Portanto, o botão Abrir é renderizado, mas não executa ação.

O botão Solicitar do card também não possui handler no trecho analisado.

Isso confirma o problema operacional dos cards de estoque.

---

## 15.3 Métrica mockada

Foi encontrado:

```text
solicitacoesPendentes: 0 // Mock
```

As métricas não devem conter valores simulados em homologação.

---

## 15.4 Confirmação nativa do navegador

Existem usos de:

```text
confirm(...)
```

em Ativos e Técnicos.

Substituir por:

```text
AlertDialog
```

do padrão CNC.

---

## 15.5 Auditoria com nomenclatura incorreta

Ao inativar um ativo, o log utiliza texto semelhante a:

```text
Excluiu Ativo
```

A operação real é inativação.

Corrigir para:

```text
Inativou Ativo
```

A auditoria deve refletir exatamente o evento.

---

## 15.6 Tela de relatório incompleta

A rota de relatórios ainda é um placeholder:

```text
Relatórios (Em breve)
```

Isso mantém RF-08 e RF-15 não atendidos.

---

## 15.7 Rotas de locais

Existe detalhe de local:

```text
/locais/:id
```

Mas não existe uma rota de listagem própria:

```text
/locais
```

Criar a listagem separada.

---

## 15.8 Cabeçalhos manuais

Ativos, Técnicos e outras páginas usam `<h1>` manual, enquanto outras usam `PageHeader`.

Padronizar todas.

---

## 15.9 Estatísticas de técnicos parcialmente clicáveis

Na tela de Técnicos:

- Ativos é clicável;
- Inativos é clicável;
- Ordens Ativas não possui ação;
- Ordens Atrasadas não possui ação.

Todos os indicadores devem aplicar filtro ou abrir lista relacionada.

---

## 15.10 Validação técnica do pacote

A tentativa de executar a checagem TypeScript não foi concluída porque as dependências do pacote não estavam integralmente instaladas no ambiente de análise.

O DEV deve obrigatoriamente executar:

```bash
npm ci
npm run lint
npm run build
```

E entregar o resultado sem erros.

---

# 16. Plano de Correção por Camada

## Fase 1 — Componentes Base

Criar ou consolidar:

- `PageHeaderWithBack`;
- `IndicatorCard`;
- `OperationalCard`;
- `CardFooterActions`;
- `FormPageLayout`;
- `RightDrawerForm`;
- `EmptyState`;
- `FeedbackToast`;
- `ConfirmDialog`.

## Fase 2 — Estrutura e Navegação

- separar Ativos e Locais;
- botão voltar em todas as telas;
- corrigir títulos;
- corrigir rotas;
- preservar filtros;
- corrigir query strings.

## Fase 3 — Operação

- ativar ações de estoque;
- completar ações de OS;
- tornar agenda resumida clicável;
- corrigir indicadores;
- remover mocks;
- corrigir cards sem handlers.

## Fase 4 — Padronização Visual

- indicadores;
- cards;
- formulários;
- drawers;
- tipografia;
- espaçamento;
- ícones;
- estados vazios.

## Fase 5 — Testes

- desktop;
- tablet;
- mobile;
- zoom;
- textos longos;
- cards sem dados;
- indicadores zero;
- filtros;
- retorno;
- permissões.

---

# 17. Critérios de Aceite

## Navegação

- [ ] todas as telas internas possuem botão voltar;
- [ ] retorno preserva contexto;
- [ ] Ativos e Locais possuem telas separadas.

## Indicadores

- [ ] único padrão visual;
- [ ] todos clicáveis quando aplicável;
- [ ] números corretos;
- [ ] valor zero neutro;
- [ ] filtros visíveis.

## Cards

- [ ] separação visual;
- [ ] conteúdo legível;
- [ ] sem sobreposição;
- [ ] ações no rodapé;
- [ ] ícones com tooltip;
- [ ] ações variam por status e permissão.

## Formulários

- [ ] padrão da referência;
- [ ] página ou drawer conforme complexidade;
- [ ] Cancelar e Salvar claros;
- [ ] validação;
- [ ] loading;
- [ ] mensagens.

## Estoque

- [ ] entrada;
- [ ] saída;
- [ ] solicitação;
- [ ] novo material;
- [ ] cards operacionais;
- [ ] sem duplicidade de modais.

## OS

- [ ] indicadores clicáveis;
- [ ] operações completas;
- [ ] impressão;
- [ ] programação;
- [ ] material;
- [ ] equipe;
- [ ] anexos.

## Visão Geral

- [ ] indicadores no padrão;
- [ ] agenda resumida operacional;
- [ ] nomes claros;
- [ ] navegação filtrada.

## Qualidade técnica

- [ ] lint sem erro;
- [ ] build sem erro;
- [ ] sem mocks em métricas;
- [ ] sem handlers vazios;
- [ ] sem `confirm` nativo;
- [ ] componentes oficiais aplicados.

---

# 18. Parecer Final

Os 14 pontos informados são procedentes.

Além deles, a análise do código identificou:

- renderização duplicada dos modais de estoque;
- handlers vazios em cards;
- métrica mockada;
- ausência de rota própria de locais;
- mistura entre componentes oficiais e locais;
- confirmações nativas;
- auditoria com nomenclatura incorreta;
- indicadores parcialmente acionáveis;
- ausência de padronização de cabeçalho;
- divergência potencial entre versão enviada e versão publicada.

A recomendação é não corrigir apenas detalhes isolados.

O DEV deve primeiro criar os componentes base reutilizáveis e, em seguida, aplicar o padrão em todos os módulos. Isso reduz inconsistência, evita retrabalho e garante que novas telas já nasçam aderentes ao padrão CNC.
