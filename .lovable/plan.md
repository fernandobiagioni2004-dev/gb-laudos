

## Ajustes no Calendário: Horário nas Reuniões + Menu de Ações

### 1. Atualizar o modelo de dados

**Arquivo:** `src/data/mockData.ts`

- Adicionar campos opcionais ao `CalendarEvent`: `time` (string, ex: "14:00") e `duration` (number, em minutos, ex: 30, 60)
- Atualizar os eventos mock de reuniao para incluir horario e duracao (ex: `time: '14:00', duration: 60`)

### 2. Adicionar funcao de atualizar evento no contexto

**Arquivo:** `src/context/AppContext.tsx`

- Adicionar `updateCalendarEvent(event: CalendarEvent)` ao contexto e interface
- Essa funcao substitui o evento pelo ID no array de eventos

### 3. Reformular o dialog de criacao de reuniao

**Arquivo:** `src/pages/shared/Calendario.tsx`

Substituir os campos "Data inicio" e "Data fim" por:
- **Data** (campo unico de data)
- **Horario** (input type="time", ex: 14:00)
- **Duracao** (select com opcoes: 15min, 30min, 45min, 1h, 1h30, 2h)

Ao salvar, `startDate` e `endDate` serao iguais (mesmo dia), e os novos campos `time` e `duration` serao preenchidos.

### 4. Exibir horario e duracao nos eventos

No painel lateral de detalhes do dia, mostrar para reunioes:
- Horario: "14:00" e duracao: "1h" ao lado da data
- Ex: "20/02/2026 as 14:00 (1h)"

### 5. Menu de acoes ("...") em cada evento

Adicionar um `DropdownMenu` com icone `MoreVertical` (tres pontinhos) em cada card de evento no painel lateral:
- **Editar** - abre o dialog pre-preenchido com os dados do evento para edicao
- **Excluir** - chama `removeCalendarEvent` com confirmacao via toast

Para editar, reutilizar o mesmo dialog de criacao com estado de edicao (`editingEvent`). Se `editingEvent` estiver preenchido, o dialog mostra "Editar Reuniao" e ao salvar chama `updateCalendarEvent`.

### Detalhes tecnicos

- Importar `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger` do shadcn
- Importar `MoreVertical` do lucide-react
- Estado `editingEvent: CalendarEvent | null` para controlar modo edicao vs criacao
- A duracao sera armazenada em minutos no campo `duration` e formatada para exibicao (ex: 60 -> "1h", 90 -> "1h30")
- Eventos de ferias tambem terao o menu "..." mas so com opcao de excluir (admin only)

