

## Ajustes no Calendário: Férias exclusivas para Admin + Layout mais claro

### 1. Botão "Adicionar Férias" (somente Admin)

**Arquivo:** `src/pages/shared/Calendario.tsx`

- Adicionar um botão "Adicionar Férias" ao lado do botão "Nova Reunião", visível **somente quando `role === 'admin'`**
- Ao clicar, abrir um dialog separado (ou reutilizar o existente com modo "férias") com os campos:
  - **Radiologista** (select com a lista dos 4 radiologistas)
  - **Data início** e **Data fim** (inputs de data para definir o período)
  - **Descrição** (textarea opcional)
- O título será gerado automaticamente como "Férias - [Nome do Radiologista]"
- Ao salvar, cria um `CalendarEvent` com `type: 'ferias'`

### 2. Layout mais claro para férias

No painel lateral de eventos do dia selecionado:

- Para eventos de férias, exibir de forma destacada o **nome do radiologista** que está de férias (extraindo do `participants[0]`) em vez de mostrar apenas o título genérico
- Adicionar um **avatar/ícone** com a inicial do nome do radiologista ao lado
- Mostrar o **período completo** das férias (ex: "24/02 a 28/02") de forma mais visível
- Usar um fundo amarelo/âmbar mais forte para diferenciar visualmente dos cards de reunião

No calendário mensal:

- Para dias de férias, além do dot âmbar, exibir uma **barra horizontal** âmbar sutil no fundo do dia para indicar que há alguém de férias naquele período (diferenciando visualmente de um simples ponto de reunião)

### Detalhes técnicos

- O dialog de férias usará um estado separado `feriasDialogOpen` para não conflitar com o dialog de reunião
- O select de radiologista usará o componente `Select` do shadcn já importado
- A visibilidade do botão é controlada por `{role === 'admin' && ...}`
- Para editar férias via menu "...", o admin poderá abrir o dialog de férias pre-preenchido (similar ao fluxo de edição de reunião)
- Nenhum arquivo novo será criado; todas as alterações ficam em `src/pages/shared/Calendario.tsx`
