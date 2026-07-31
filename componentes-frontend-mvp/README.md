# Componentes — Frontend Gestão de Eventos (base para MVP)

Este pacote reúne os **componentes do frontend do módulo de Gestão de Eventos** (CNC),
para servir de base a um novo MVP. Foi extraído do projeto `gestao-eventos-frontend`
(Next.js 16 + React 18 + TypeScript + Tailwind).

> Objetivo: reaproveitar UI e padrões já validados. **Não é um app rodável** —
> é o conjunto de componentes + as dependências internas que eles importam.

---

## 1. O que está incluído

A estrutura espelha o `src/` original, então os imports com alias `@/...`
continuam válidos ao colar num projeto Next.js com `paths: { "@/*": ["./src/*"] }`.

```
src/
├── components/     → componentes de UI e de domínio (ver seção 3)
├── layouts/        → biblioteca de layout legada (ainda em uso parcial)
├── hooks/          → hooks reutilizáveis (modal, drawer, mobile, query params, print…)
├── providers/      → contexts (app, modal, drawer)
├── icons/ + shared/icons/ + components/icons/  → ícones em SVG/React
├── types/          → tipagens compartilhadas
├── utils/          → funções utilitárias
├── lib/            → navegação, integração NextAuth
├── services/       → camada de chamadas à API (por domínio)
├── infra/          → http (axios) e tanStack (react-query)
├── styles/         → globals.css + FontAwesome
└── app/(private)/  → apenas os arquivos-companheiros que os componentes importam
                      (schema.ts, action.ts, *DTO.ts de eventos/reservas/espacos/locais)
```

**Excluídos de propósito:** `node_modules`, `.next`, arquivos de teste
(`*.spec.*`, `*.test.*`) e as páginas/rotas completas do `app/`.

---

## 2. Dependência externa: `@cnc-ti/layout-basic`

Boa parte dos componentes é construída **sobre a lib interna `@cnc-ti/layout-basic`**
(design system da CNC). Essa lib **não tem código-fonte no projeto** — vem compilada
via npm. Para usar este pacote, instale-a:

```bash
npm install @cnc-ti/layout-basic
```

E importe o CSS dela uma vez (no layout raiz):

```ts
import "@cnc-ti/layout-basic/styles";
```

### Componentes da lib efetivamente usados (72 imports em ~50 arquivos)

| Componente da lib | Nº de arquivos que usam |
|---|---|
| `Button` | 22 |
| `Card` (+ `CardHeader`/`CardContent`/`CardFooter`/`CardFooterItem`) | 9 |
| `Input` | 9 |
| `PageHeader` (+ `Title`/`TitleContent`/`ActionsContainer`) | 6 |
| `Tabs` (+ `TabsList`/`TabsTrigger`/`TabsContent`) | 6 |
| `Badge` | 5 |
| `Combobox` | 2 |
| `Select` (+ `Content`/`Item`/`Trigger`/`Value`) | 2 |
| `Collapsible` (+ `Content`/`Trigger`) | 1 |

> A lib exporta muito mais (Header, Sidebar, Modal, DropdownMenu, Popover, Command,
> Dialog…), mas o módulo de eventos usa apenas o subconjunto acima.

---

## 3. Componentes próprios por domínio

Total: **~235 arquivos `.tsx`** + 44 `.ts`.

### `components/eventos/` (31)
Cards, formulário, visualização, busca, agenda (calendar/list/day panel), dashboard
(indicadores, painel gerencial, próximos eventos), fluxo de status, multiselects
(demandante, temática, período), modais de cadastro.

### `components/reservas/` (16)
Card, formulário, busca, agenda de reserva, dashboard (indicadores), visualização
+ sidebar de próximas reservas, modal de horários.

### `components/espacos/` (14)
Card, formulário, busca e busca por disponibilidade, seleção de local, características
(multiselect + modal), lista de reservas do espaço.

### `components/cadastros/locais/` (6)
Card de local, formulário, busca (cabeçalho/campos/grade), wrapper de edição.

### `components/shared/` (11)
Cards genéricos (`CardBadge`, `CardFooterActions`, `TruncatedText`), charts Nivo
(bar/line/pie), ícones, skeletons, metadata de resultado.

### `components/layouts/` (65) e `layouts/` (raiz, 41 + groups/ui)
Biblioteca de UI própria: botões (back, delete, export, outline, print, save, search),
campos de formulário (text, select, date, radio, switch, textarea, upload),
inputs, table (+ mobile), tabs, modal, drawer, collapse, tooltip, tag, heading, label,
loader, avatar, page-header, cards, ícones. Também `protected-layout`, `content`,
`main`, `container`, e a feature de **groups** (card/grid/drawer/search).

> ⚠️ Há **duas** pastas de layout: `components/layouts/` (principal) e `layouts/`
> (raiz, versão legada ainda referenciada por ~7 arquivos, ex. `SelectField`).
> Ambas foram incluídas para não quebrar imports. Ao evoluir o MVP, consolide numa só.

### `components/ui/` (6)
Wrappers Radix: `alert-dialog`, `dialog`, `sheet`, `switch`, `skeleton`, `toast-provider`.

### `components/home/` (4)
Header, cards e skeleton da home.

---

## 4. Dependências de bibliotecas (do `package.json` original)

Para os componentes funcionarem, além de `@cnc-ti/layout-basic`:

- **UI/estilo:** `tailwindcss`, `tailwind-merge`, `tailwindcss-animate`, `clsx`,
  `classnames`, `class-variance-authority`, `lucide-react`, `framer-motion`
- **Formulários:** `react-hook-form`, `@hookform/resolvers`, `zod`
- **Dados:** `@tanstack/react-query`, `axios`
- **Selects/inputs:** `react-select`
- **Datas:** `date-fns`
- **Charts:** `@nivo/bar`, `@nivo/line`, `@nivo/pie`
- **Auth:** `next-auth`, `jwt-decode`
- **Outros:** `react-toastify`, `sweetalert2`, `react-to-print`, `xlsx`, `diff`,
  `@microsoft/clarity`, `@next/third-parties`

Base: `next@16`, `react@18`, `typescript@5`.

---

## 5. Como aproveitar num novo projeto

1. Crie um projeto Next.js (App Router) com Tailwind e o alias `@/* → ./src/*`.
2. Instale `@cnc-ti/layout-basic` + as libs da seção 4 (conforme for usando).
3. Copie as pastas de `src/` que interessarem ao MVP.
4. Importe `@cnc-ti/layout-basic/styles` no layout raiz.
5. A camada `services/`+`infra/` aponta para a API do backend de eventos — ajuste as
   URLs/base ou substitua pelos endpoints do MVP.
