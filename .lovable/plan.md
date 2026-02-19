

## Software Filter on "Exames Disponíveis"

Add a toggle filter bar (Todos / Axel / Morita) to the radiologist's "Exames Disponíveis" screen so they can narrow the list by software type.

### Changes

**Single file:** `src/pages/radiologista/ExamesDisponiveis.tsx`

1. Add a `softwareFilter` state (`"Todos" | "Axel" | "Morita"`, default `"Todos"`)
2. Place a `ToggleGroup` filter bar between the page header and the exam grid with three options: Todos, Axel, Morita
3. Update the `available` memo to additionally filter by selected software (when not "Todos"), on top of the existing radiologist compatibility check
4. Update the empty state message to mention the active filter

No new files or dependencies needed.

