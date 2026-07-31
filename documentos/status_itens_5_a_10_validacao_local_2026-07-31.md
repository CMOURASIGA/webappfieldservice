# Status dos Itens 5 a 10 e Roteiro de Validacao Local

Data de consolidacao: 2026-07-31

## Diretriz aplicada nesta etapa

- relatorios ficam fora do foco neste primeiro momento
- prioridade total no processo operacional funcionando de ponta a ponta
- validacao concentrada em OS, corretivas, preventivas, agenda e estoque

## Status item a item

### Item 5. Modelagem flexivel entre planos, OS e ativos

Status atual:
- atendido de forma funcional para o MVP operacional

O que ja esta seguindo:
- a OS nova permite vincular mais de um ativo na mesma ordem
- a tela de criacao foi ajustada para manter a selecao de ativos em branco e permitir composicao gradual
- a relacao de ativos fica refletida na OS
- a agenda e os filtros operacionais consideram relacoes com ativo principal e ativos adicionais

Ponto de atencao:
- a regra definitiva de como um plano deve gerar OS em cenarios 1:1 ou N:N ainda depende de alinhamento com a area

Conclusao:
- para o MVP operacional local, o item esta suficiente
- para apresentacao funcional, nao travar o discurso em uma unica regra de negocio

### Item 6. Fluxo completo de manutencao operacional

Status atual:
- parcialmente consolidado e apto para validacao local

O que ja esta coerente:
- corretiva, preventiva e OS passaram a seguir o mesmo padrao visual e de formulacao
- a OS concentra o fluxo operacional principal
- programacao e reprogramacao de OS existem na propria ficha e tambem pela agenda
- estoque conversa com a OS por meio dos materiais vinculados

O que ainda exige monitoramento:
- manter a reducao de duplicidade funcional entre corretiva e OS ao longo dos proximos ajustes
- revisar textos herdados antigos quando aparecerem caracteres invalidos em telas legadas

Conclusao:
- o processo operacional esta utilizavel
- o ajuste remanescente aqui passa mais por acabamento e consistencia do que por falta de fluxo

### Item 7. Validacao local do fluxo e das integracoes

Status atual:
- em validacao dirigida

Fluxos que precisam obrigatoriamente ser validados localmente:
- criar OS sem material
- criar OS com material cadastrado e saldo suficiente
- criar OS com material cadastrado e saldo insuficiente
- criar OS com material nao cadastrado
- registrar entrada de estoque vinculada a solicitacao
- registrar saida de estoque vinculada a OS
- programar mais de uma OS no mesmo dia e horario
- conferir reflexo de status na OS e na fila de estoque

Conclusao:
- este item depende de execucao local do roteiro abaixo
- a base de codigo ja sustenta o fluxo; o objetivo agora e confirmar comportamento e salvamento

### Item 8. Visualizar mais de uma OS no mesmo dia e no mesmo periodo

Status atual:
- atendido na agenda operacional

Como o sistema esta tratando isso:
- a agenda semanal e diaria ja calculam sobreposicao real por intervalo de inicio e fim
- quando duas ou mais OS ocupam o mesmo periodo, elas sao distribuidas lado a lado em colunas
- a programacao nao trava conflito automaticamente; o sistema alerta e permite programar mesmo assim quando fizer sentido operacional

Uso recomendado agora:
- usar a agenda como visao principal para conflito de horario
- manter a lista para leitura mais ampla de programacao

Conclusao:
- nao precisa novo desenvolvimento estrutural para esse ponto neste momento
- o foco deve ser validar em tela com casos reais de sobreposicao

### Item 9. Retirar importacao e exportacao do sistema

Status atual:
- atendido na interface

O que foi aplicado:
- a tela de Administracao foi reduzida para conter apenas categorias
- importacao, exportacao e restauracao deixaram de aparecer no fluxo visivel do sistema

Conclusao:
- para o MVP em ambiente local, o sistema deixa de expor um processo sensivel que poderia gerar questionamento desnecessario

### Item 10. Conversa com a area

Status atual:
- sem acao nesta etapa

Motivo:
- depende de alinhamento funcional com a area de negocio

## Roteiro de teste local orientado a operacao

### Preparacao

1. Executar `npm run lint`
2. Executar `npm run build`
3. Abrir o sistema em ambiente local
4. Validar que a navegacao principal abre sem erro em:
   - `/servicos`
   - `/ordens`
   - `/servicos/corretivas`
   - `/preventivas`
   - `/estoque`
   - `/estoque/fila`
   - `/estoque/movimentacoes`
   - `/documentos`

### Bloco A. Criacao e salvamento de OS

1. Acessar `/ordens/nova`
2. Criar uma OS sem material e com um unico ativo
3. Salvar e confirmar redirecionamento ou exibicao correta da OS criada
4. Repetir a criacao com dois ou mais ativos
5. Confirmar que os ativos aparecem na ficha da OS
6. Editar a programacao da OS e salvar
7. Confirmar persistencia apos atualizar a pagina

Resultado esperado:
- salvamento sem erro
- OS criada com numero
- ativos vinculados corretamente
- programacao persistida

### Bloco B. OS com materiais e integracao com estoque

1. Criar uma OS com material cadastrado e saldo suficiente
2. Confirmar que o material aparece na OS
3. Criar uma OS com material cadastrado e saldo insuficiente
4. Confirmar geracao de solicitacao na fila de estoque
5. Criar uma OS com material nao cadastrado
6. Confirmar geracao de solicitacao especifica na fila

Resultado esperado:
- materiais ficam vinculados a OS
- fila de estoque reflete a necessidade criada pela OS
- OS responde ao estado de suprimento

### Bloco C. Fila de estoque e abastecimento

1. Acessar `/estoque/fila`
2. Verificar se os cards mais antigos aparecem primeiro
3. Acionar `Cadastrar/Associar` em item nao cadastrado
4. Confirmar abertura correta do drawer lateral
5. Registrar entrada para item pendente
6. Voltar para a OS relacionada
7. Confirmar alteracao de disponibilidade do material e reflexo no status da OS

Resultado esperado:
- a fila organiza pendencias mais antigas primeiro
- a acao lateral abre corretamente
- a entrada atualiza material, movimentacao e OS relacionada

### Bloco D. Movimentacoes de estoque

1. Acessar `/estoque/movimentacoes/nova?tipo=Entrada`
2. Registrar entrada valida
3. Acessar `/estoque/movimentacoes/nova?tipo=Saida`
4. Registrar saida vinculada a uma OS em aberto
5. Conferir o historico em `/estoque/movimentacoes`

Resultado esperado:
- saldo fisico atualizado
- saldo reservado reduzido quando aplicavel
- OS vinculada avanca para execucao quando o fluxo exigir

### Bloco E. Agenda operacional

1. Criar ou editar duas OS para o mesmo dia e mesmo horario
2. Acessar `/agenda` em visao semanal
3. Confirmar visualizacao lado a lado das OS sobrepostas
4. Trocar para visao diaria
5. Confirmar a mesma leitura operacional no dia selecionado

Resultado esperado:
- mais de uma OS no mesmo periodo aparece sem sobrepor de forma ilegivel
- a agenda continua editavel

### Bloco F. Corretivas, preventivas e padrao de formulacao

1. Acessar:
   - `/servicos/nova`
   - `/preventivas/nova`
   - `/documentos/novo`
   - `/estoque/materiais/novo`
2. Validar padrao visual:
   - cabecalho operacional
   - abas
   - rodape de formulario
   - botao `Salvar` azul
3. Executar um salvamento valido em cada fluxo

Resultado esperado:
- formularios seguem o mesmo padrao
- salvamento conclui sem quebra visual ou erro funcional

## Criterios de aceite desta etapa

- nenhuma tela operacional principal pode depender de importacao ou exportacao
- OS deve salvar com e sem material
- OS deve aceitar mais de um ativo
- estoque deve reagir a solicitacoes geradas pela OS
- agenda deve exibir OS simultaneas no mesmo periodo
- botoes de salvar devem concluir o fluxo sem erro aparente
- build e lint precisam concluir sem falha

## Pendencias que nao entram agora

- relatorios
- novas discussoes de importacao/exportacao
- definicoes de negocio que dependem da area
- refinamentos avancados da agenda alem da sobreposicao de OS
