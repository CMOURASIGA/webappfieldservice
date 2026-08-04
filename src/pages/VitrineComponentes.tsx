import React, { useMemo, useState } from "react";
import { Bell, Eye, Layers3, LayoutPanelTop, Search, Sparkles, Wrench } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/Card";
import { CardFooterActions } from "../components/ui/CardFooterActions";
import { Drawer } from "../components/ui/Drawer";
import { Input } from "../components/ui/Input";
import { MultiSelectField } from "../components/ui/MultiSelectField";
import { FormGrid, MetricButton, OperationalPageHeader, SearchToolbar } from "../components/ui/OperationalPage";
import { Select } from "../components/ui/Select";
import { TabbedFormCard } from "../components/ui/TabbedFormCard";
import { TabsComponent } from "../components/ui/TabsComponent";
import { Textarea } from "../components/ui/Textarea";

type ShowcaseBlockProps = {
  title: string;
  description: string;
  usedIn: string[];
  children: React.ReactNode;
};

const ShowcaseBlock = ({ title, description, usedIn, children }: ShowcaseBlockProps) => (
  <Card>
    <CardHeader className="gap-3 border-b border-slate-200 pb-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {usedIn.map((item) => (
            <Badge key={item} variant="default">
              {item}
            </Badge>
          ))}
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-5 pt-5">{children}</CardContent>
  </Card>
);

export const VitrineComponentes = () => {
  const [toolbarSearch, setToolbarSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(["corretiva", "urgente"]);
  const [footerActionLog, setFooterActionLog] = useState("Nenhuma ação simulada até o momento.");

  const multiSelectOptions = useMemo(
    () => [
      { value: "corretiva", label: "Corretiva" },
      { value: "preventiva", label: "Preventiva" },
      { value: "urgente", label: "Urgente" },
      { value: "estoque", label: "Estoque" },
      { value: "documentos", label: "Documentos" },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <OperationalPageHeader
        title="Vitrine de Componentes"
        description="Catálogo manual dos componentes realmente usados neste sistema para servir de referência em futuros projetos."
        backTo="/servicos"
        actions={
          <>
            <Button type="button" variant="secondary" className="gap-2" onClick={() => window.location.assign("/servicos")}>
              Voltar para operação
            </Button>
            <Button type="button" variant="primary" className="gap-2" onClick={() => setDrawerOpen(true)}>
              <Layers3 className="h-4 w-4" />
              Abrir observações
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <MetricButton label="Componentes base" value={11} active valueClassName="text-brand-700" icon={Layers3} />
        <MetricButton label="Padrões de layout" value={4} valueClassName="text-blue-700" icon={LayoutPanelTop} />
        <MetricButton label="Amostras de fluxo" value={3} valueClassName="text-green-700" icon={Sparkles} />
        <MetricButton label="Uso em telas reais" value={9} valueClassName="text-amber-700" icon={Wrench} />
      </div>

      <Card className="border-dashed">
        <CardContent className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Objetivo</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Referência interna para reaproveitamento</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Esta página é manual e curada. Ela documenta os componentes usados no sistema atual, com exemplos visuais e indicação
              de onde cada padrão já aparece nas telas operacionais.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">Rota isolada</Badge>
            <Badge variant="success">Sem impacto operacional</Badge>
            <Badge variant="warning">Catálogo manual</Badge>
          </div>
        </CardContent>
      </Card>

      <ShowcaseBlock
        title="Botões e feedback"
        description="Variantes e estados de ação aplicados nas telas de ordens, corretivas, preventivas, agenda e estoque."
        usedIn={["Serviços", "Ordens", "Preventivas", "Agenda", "Estoque"]}
      >
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Variantes</p>
          <div className="flex flex-wrap gap-3">
            <Button>Primário</Button>
            <Button variant="create">Criar</Button>
            <Button variant="secondary">Secundário</Button>
            <Button variant="destructive">Destrutivo</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tamanhos e estado desabilitado</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Pequeno</Button>
            <Button size="md">Médio</Button>
            <Button size="lg">Grande</Button>
            <Button disabled>Desabilitado</Button>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Badges</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">Concluída</Badge>
            <Badge variant="warning">Em triagem</Badge>
            <Badge variant="danger">Crítica</Badge>
            <Badge variant="info">Aberta</Badge>
            <Badge variant="default">Rascunho</Badge>
          </div>
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        title="Campos de formulário"
        description="Conjunto de entrada padronizado para cadastros, filtros e rotinas operacionais."
        usedIn={["Novo Serviço", "Ativos", "Locais", "Prestadores", "Documentos"]}
      >
        <FormGrid>
          <Input label="Título" placeholder="Ex.: Vazamento na cobertura" />
          <Select
            label="Prioridade"
            defaultValue="alta"
            options={[
              { value: "baixa", label: "Baixa" },
              { value: "media", label: "Média" },
              { value: "alta", label: "Alta" },
            ]}
          />
          <Input label="Campo com erro" defaultValue="Sem unidade vinculada" error="Selecione uma unidade válida." />
          <Input label="Desabilitado" placeholder="Somente leitura" disabled />
        </FormGrid>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <Textarea
            label="Descrição"
            placeholder="Descreva o contexto, o risco operacional e o que precisa ser executado."
          />
          <MultiSelectField
            label="Etiquetas operacionais"
            helperText="Exemplo do seletor de múltiplos vínculos usado em formulários mais ricos."
            options={multiSelectOptions}
            value={selectedTags}
            onChange={setSelectedTags}
          />
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        title="Busca, cabeçalho e navegação"
        description="Padrões visuais repetidos nas páginas operacionais com busca, métricas e troca de contexto."
        usedIn={["Serviços", "Ordens", "Preventivas", "Prestadores"]}
      >
        <SearchToolbar value={toolbarSearch} onChange={setToolbarSearch} placeholder="Buscar por protocolo, ativo ou local..." resultCount={12} />

        <div className="grid gap-5 xl:grid-cols-2">
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Abas com URL</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <TabsComponent
                defaultValue="resumo"
                items={[
                  {
                    value: "resumo",
                    title: "Resumo",
                    children: <p className="text-sm text-slate-600">Estrutura usada em fluxos que precisam preservar a aba ativa na URL.</p>,
                  },
                  {
                    value: "detalhes",
                    title: "Detalhes",
                    children: <p className="text-sm text-slate-600">Útil para fichas longas com múltiplas seções de cadastro e histórico.</p>,
                  },
                  {
                    value: "historico",
                    title: "Histórico",
                    children: <p className="text-sm text-slate-600">Separação clara entre dados correntes e eventos anteriores do registro.</p>,
                  },
                ]}
              />
            </CardContent>
          </Card>

          <TabbedFormCard
            submitLabel="Salvar exemplo"
            tabs={[
              {
                value: "dados",
                label: "Dados",
                content: (
                  <div className="grid gap-4 p-5 md:grid-cols-2">
                    <Input label="Código" placeholder="EX-001" />
                    <Input label="Nome" placeholder="Exemplo tabulado" />
                  </div>
                ),
              },
              {
                value: "apoio",
                label: "Apoio",
                content: (
                  <div className="grid gap-4 p-5 md:grid-cols-2">
                    <Select label="Categoria" options={[{ value: "infra", label: "Infraestrutura" }]} />
                    <Input label="Responsável" placeholder="Equipe interna" />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        title="Cards operacionais"
        description="Cartões usados para exibir registros, detalhes compactos e barra de ações no rodapé."
        usedIn={["Serviços", "Ordens", "Preventivas", "Ativos", "Documentos"]}
      >
        <div className="grid gap-5 xl:grid-cols-2">
          <Card className="record-card">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Solicitação</p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">Infiltração próxima ao quadro elétrico</h3>
                  <p className="text-sm text-slate-500">SRV-2026-0041</p>
                </div>
                <Badge variant="warning">Em triagem</Badge>
              </div>
              <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-slate-200">
                <div className="border-b border-r border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Unidade</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">Matriz</p>
                </div>
                <div className="border-b border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Local</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">Subsolo</p>
                </div>
                <div className="border-r border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Data</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">04/08/2026</p>
                </div>
                <div className="bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Prioridade</p>
                  <p className="mt-1 text-sm font-medium text-red-700">Alta</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-0">
              <CardFooterActions
                onView={() => setFooterActionLog("Ação simulada: visualizar registro.")}
                onHistory={() => setFooterActionLog("Ação simulada: abrir histórico.")}
                onPrint={() => setFooterActionLog("Ação simulada: imprimir registro.")}
                onEdit={() => setFooterActionLog("Ação simulada: editar registro.")}
                onDelete={() => setFooterActionLog("Ação simulada: inativar registro.")}
              >
                <button
                  type="button"
                  className="card-action-button gap-2"
                  onClick={() => setFooterActionLog("Ação simulada: gerar OS a partir da solicitação.")}
                >
                  Gerar OS
                </button>
              </CardFooterActions>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-brand-700" />
                Registro de interação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Este bloco existe só para demonstrar interações da barra de ações sem depender de dados reais nem alterar o sistema.
              </p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{footerActionLog}</div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" className="gap-2" onClick={() => setFooterActionLog("Ação simulada: abrir detalhe em modo leitura.")}>
                  <Eye className="h-4 w-4" />
                  Simular detalhe
                </Button>
                <Button type="button" variant="ghost" className="gap-2" onClick={() => setFooterActionLog("Ação simulada: executar busca contextual.")}>
                  <Search className="h-4 w-4" />
                  Simular busca
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ShowcaseBlock>

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Observações da vitrine">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Esta rota foi pensada como base de referência visual. O ideal é expandi-la aos poucos, sempre que novos componentes ou
            padrões relevantes forem estabilizados no sistema.
          </p>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Sugestões de evolução</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Adicionar exemplos específicos por domínio, como estoque, documentos e agenda.</li>
              <li>Separar tokens visuais, como espaçamento, cores e tipografia operacional.</li>
              <li>Registrar componentes que vierem de bibliotecas externas, como diálogo e tabs do kit CNC.</li>
            </ul>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
