# Padronização das Ações nos Cards

## 1. Objetivo

Este documento define como as ações dos cards devem ser apresentadas no frontend do sistema, utilizando os componentes CNC e mantendo consistência visual, operacional e de acessibilidade.

O objetivo é evitar ações exibidas como textos soltos no rodapé dos cards, como:

```text
Ver Detalhes  Editar  Excluir
```

Esse formato não deve ser mantido.

---

# 2. Regra Geral

As ações dos cards devem ficar dentro de um rodapé próprio:

```tsx
CardFooter
```

Sempre que possível, utilizar o componente:

```text
CardFooterActions
```

Esse componente deve concentrar ações recorrentes como:

- visualizar
- editar
- excluir
- inativar
- concluir
- abrir histórico
- executar ação personalizada

---

# 3. Uso de Ícones e Texto

A orientação não é remover todo texto dos cards.

A regra recomendada é:

## Ação principal

Usar:

```text
ícone + texto
```

Exemplos:

- Ver detalhes
- Abrir OS
- Iniciar execução
- Registrar entrada
- Solicitar compra

## Ações recorrentes e compactas

Usar:

```text
somente ícone
```

Exemplos:

- editar
- excluir
- inativar
- imprimir
- visualizar histórico

Esses ícones devem possuir:

- tooltip
- `aria-label`
- `title`
- foco visível
- descrição acessível

---

# 4. Padrão Recomendado

## Opção principal

```text
[Ver detalhes] [ícone editar] [ícone inativar]
```

## Opção compacta

```text
[ícone visualizar] [ícone editar] [ícone inativar]
```

Com tooltip:

```text
Visualizar detalhes
Editar registro
Inativar registro
```

---

# 5. Regra por Tipo de Ação

## Visualizar

Preferência:

```text
ícone de olho
```

Pode usar:

```text
ícone + Detalhes
```

quando for a principal ação do card.

## Editar

Utilizar:

```text
ícone de lápis
```

Com tooltip:

```text
Editar registro
```

## Excluir

Utilizar:

```text
ícone de lixeira
```

Com:

- cor de perigo
- tooltip
- confirmação em `AlertDialog`

## Inativar

Para registros com histórico, preferir:

```text
ícone de pausa, bloqueio ou desligamento
```

Com tooltip:

```text
Inativar registro
```

## Histórico

Utilizar:

```text
ícone de relógio ou histórico
```

Com tooltip:

```text
Consultar histórico
```

---

# 6. Exemplo para Card de Ativo

## Formato atual inadequado

```text
Ver Detalhes  Editar  Excluir
```

## Formato recomendado

```text
[Ver detalhes] [Editar] [Inativar]
```

Visualmente:

```text
[ícone olho + Detalhes] [ícone lápis] [ícone inativar]
```

---

# 7. Exemplo de Implementação

```tsx
<Card>
  <CardHeader>
    <div>
      <span>AC-DF-001</span>
      <Badge variant="success">Ativo</Badge>
    </div>

    <h3>Ar Condicionado Central Chiller A</h3>
  </CardHeader>

  <CardContent>
    <div>
      <span>Local</span>
      <strong>Sala Técnica Ar</strong>
    </div>

    <div>
      <span>Unidade</span>
      <strong>Sede - Brasília</strong>
    </div>

    <div>
      <span>Patrimônio / Fabricante</span>
      <strong>- / Carrier</strong>
    </div>
  </CardContent>

  <CardFooter>
    <CardFooterActions
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDeactivate}
      viewLabel="Ver detalhes"
      editLabel="Editar ativo"
      deleteLabel="Inativar ativo"
    />
  </CardFooter>
</Card>
```

---

# 8. Quando Usar Texto

O texto deve ser mantido quando:

- a ação for principal
- o ícone puder gerar dúvida
- a ação for pouco comum
- a ação representar um fluxo importante
- o card tiver poucas ações

Exemplos:

```text
Ver detalhes
Iniciar execução
Registrar entrada
Solicitar compra
Renovar documento
```

---

# 9. Quando Usar Somente Ícone

Somente ícone é adequado quando:

- a ação for recorrente
- o significado for amplamente conhecido
- houver pouco espaço
- existir tooltip
- houver acessibilidade
- a ação estiver em um conjunto padronizado

Exemplos:

- visualizar
- editar
- excluir
- histórico
- imprimir

---

# 10. Ações Destrutivas

Toda ação destrutiva deve:

- utilizar cor de perigo
- exibir tooltip
- abrir confirmação
- indicar claramente o impacto
- nunca executar imediatamente com um único clique

Exemplo:

```text
Deseja realmente inativar este ativo?

O registro será mantido no histórico e deixará de ficar disponível para novos vínculos.
```

---

# 11. Exclusão versus Inativação

## Excluir

Utilizar somente quando:

- o registro nunca foi utilizado
- não possui histórico
- não possui vínculo
- a regra de negócio permitir

## Inativar

Utilizar quando houver:

- movimentações
- ordens de serviço
- planos
- documentos
- histórico
- vínculo com outros registros

Para ativos, materiais, locais, prestadores e planos, a ação padrão deve ser:

```text
Inativar
```

e não:

```text
Excluir
```

---

# 12. Acessibilidade

Todos os ícones de ação devem possuir:

```tsx
aria-label
title
```

Também devem ter:

- foco visível
- navegação por teclado
- contraste adequado
- área mínima de clique
- estado desabilitado
- estado de carregamento

## Exemplo

```tsx
<Button
  variant="ghost"
  aria-label="Editar ativo"
  title="Editar ativo"
  onClick={handleEdit}
>
  <Pencil size={16} />
</Button>
```

---

# 13. Responsividade

## Desktop

Pode utilizar:

```text
ação principal com texto
ações secundárias com ícones
```

## Mobile

Manter:

- ação principal visível
- ações secundárias em ícones
- excesso de ações dentro de `DropdownMenu`

Exemplo:

```text
[Ver detalhes] [Mais opções]
```

Dentro de Mais opções:

- editar
- histórico
- inativar

---

# 14. Padronização por Módulo

## Ativos

- detalhes
- editar
- inativar
- histórico

## Materiais

- abrir
- editar
- entrada
- saída
- solicitar compra
- reservas
- inativar

## Ordens de Serviço

- abrir
- editar
- iniciar
- pausar
- concluir
- reprogramar
- histórico

## Documentos

- abrir
- editar
- anexar
- renovar
- histórico
- inativar

## Solicitações

- abrir
- aprovar
- rejeitar
- associar material
- registrar entrada

---

# 15. Critérios de Aceite

A adequação será considerada concluída quando:

- não existirem ações como textos soltos no rodapé
- todas as ações estiverem dentro de `CardFooter`
- o componente `CardFooterActions` for utilizado quando aplicável
- a ação principal estiver visível
- ações recorrentes utilizarem ícones
- ícones possuírem tooltip e `aria-label`
- ações destrutivas possuírem confirmação
- registros com histórico utilizarem inativação
- o padrão for consistente em todos os módulos
- o comportamento for responsivo
- o foco por teclado estiver disponível

---

# 16. Resumo para o DEV

A regra final é:

```text
Ação principal
- ícone + texto

Ação recorrente
- ícone com tooltip

Ação destrutiva
- ícone de perigo + confirmação

Registro com histórico
- inativar, não excluir
```

As ações não devem aparecer como textos soltos.

Devem ser organizadas em:

```text
CardFooter
        +
CardFooterActions
```

com consistência visual, acessibilidade e controle de permissão.
