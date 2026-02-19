

## Calendário — Nova aba para Admin e Radiologista

### Resumo
Adicionar uma tela de **Calendário** acessível pelos perfis de Administrador e Radiologista, mostrando eventos como férias de colaboradores e reuniões. As reuniões possuem visibilidade restrita aos participantes envolvidos.

---

### 1. Mock Data — Eventos de Calendário

**Arquivo:** `src/data/mockData.ts`

Adicionar novos tipos e dados:

- **CalendarEvent** com campos: `id`, `title`, `type` (`'ferias' | 'reuniao'`), `startDate`, `endDate`, `participants` (array de IDs de radiologistas/admin), `description`, `createdBy`
- Dados mock pré-definidos:
  - 2-3 eventos de férias (ex: Dr. Carlos de férias de 24/02 a 28/02)
  - 3-4 reuniões com participantes diferentes (ex: reunião entre Admin e Dr. Carlos, outra entre Admin, Dra. Ana e Dr. Ricardo)

---

### 2. Estado Global — Gerenciar Eventos

**Arquivo:** `src/context/AppContext.tsx`

- Adicionar estado `calendarEvents` com os eventos mock iniciais
- Função `addCalendarEvent` para criar novas reuniões
- Função `removeCalendarEvent` para remover eventos
- Expor no contexto

---

### 3. Tela do Calendário

**Novo arquivo:** `src/pages/shared/Calendario.tsx`

- Visualização mensal usando o componente `Calendar` (react-day-picker) já existente no projeto
- Dias com eventos recebem indicadores visuais (dots coloridos)
- Ao clicar em um dia, exibir lista de eventos daquela data em um painel lateral ou abaixo do calendário
- **Filtro de visibilidade:**
  - Admin vê todos os eventos (férias e todas as reuniões)
  - Radiologista vê: todas as férias + apenas reuniões onde ele é participante (usando o radiologista simulado, `r1`)
- Cores diferentes por tipo: férias em laranja/amarelo, reuniões em azul/roxo
- Botao "Nova Reunião" abre um dialog para criar evento

---

### 4. Dialog para Criar Reunião

Dentro da tela do calendário:

- Campos: Titulo, Data inicio, Data fim, Participantes (multi-select com checkboxes dos radiologistas e admin), Descrição
- Ao salvar, evento adicionado via `addCalendarEvent`
- Toast de confirmacao
- A reunião criada so aparece para os participantes selecionados

---

### 5. Navegação

**Arquivo:** `src/components/AppSidebar.tsx`

- Adicionar item "Calendário" no menu do Admin (entre Relatórios e Meu Perfil) com icone `CalendarDays`
- Adicionar item "Calendário" no menu do Radiologista (entre Meu Financeiro e Meu Perfil)

**Arquivo:** `src/App.tsx`

- Adicionar rota `/calendario` para os perfis admin e radiologista

---

### Detalhes Tecnicos

- O componente `Calendar` do shadcn/react-day-picker sera usado para renderizar o mes, com `modifiers` e `modifiersStyles` para destacar dias com eventos
- Multi-select de participantes: checkboxes dentro de um Popover com lista dos 4 radiologistas + "Administrador"
- Eventos de ferias sao visiveis para todos (admin e radiologistas)
- Reunioes filtradas por `participants.includes(currentUserId)` onde admin usa id fixo `'admin'` e radiologista usa `'r1'`

