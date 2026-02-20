

## Adicionar horario no prazo do DeadlineBadge

### Alteracao

No componente `src/components/DeadlineBadge.tsx`, incluir o horario (HH:mm) junto da data no texto exibido.

Atualmente exibe: `Prazo: 22/02/2026`
Passara a exibir: `Prazo: 22/02/2026 as 12:00`

### Detalhes tecnicos

- Na linha 39, apos montar a string `formatted` com dia/mes/ano, adicionar as horas e minutos do deadline:
  ```
  const hours = String(deadline.getHours()).padStart(2, '0');
  const minutes = String(deadline.getMinutes()).padStart(2, '0');
  const formatted = `${day}/${month}/${year} as ${hours}:${minutes}`;
  ```
- Apenas 1 arquivo alterado: `src/components/DeadlineBadge.tsx`
- A alteracao se aplica automaticamente em todas as telas que usam o componente (Exames Disponiveis, Meus Exames, Admin)

