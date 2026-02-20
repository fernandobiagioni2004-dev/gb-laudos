

## Adicionar filtro de prioridade na tela Exames Disponiveis

### Resumo

Adicionar um novo grupo de filtros por prioridade/prazo na tela de Exames Disponiveis do radiologista, permitindo filtrar por: Todos, Urgentes, Proximos de expirar (menos de 12h) e Vencidos.

### Alteracoes

#### Arquivo unico: `src/pages/radiologista/ExamesDisponiveis.tsx`

1. **Novo estado** `prioridadeFilter` com valores: `'Todos'`, `'Urgentes'`, `'Expirando'`, `'Vencidos'`

2. **Novo ToggleGroup** abaixo do filtro de software existente, com icones para cada opcao:
   - **Todos**: sem filtro adicional
   - **Urgentes**: exames com `urgent === true`
   - **Expirando**: exames cujo prazo esta a menos de 12h (mas ainda nao vencido)
   - **Vencidos**: exames cujo prazo ja passou

3. **Atualizar o `useMemo`** do array `available` para aplicar o filtro de prioridade apos o filtro de software, usando a mesma logica do `DeadlineBadge` (importar `calcDeadline` de `@/lib/utils`):
   - Calcular o deadline de cada exame
   - Comparar com `new Date()` para determinar `diffHours`
   - Filtrar conforme a opcao selecionada

4. **Ordenacao**: alem da ordenacao por urgencia ja existente, ordenar tambem por proximidade do prazo (exames mais proximos de vencer primeiro)

5. **Contador**: exibir ao lado de cada opcao do filtro a quantidade de exames correspondentes para dar visibilidade rapida

### Detalhes tecnicos

Logica de calculo no filtro:

```typescript
import { calcDeadline } from '@/lib/utils';

// Para cada exame:
const deadline = e.urgent && e.urgentDate
  ? new Date(`${e.urgentDate}T${e.urgentTime || '23:59'}:00`)
  : calcDeadline(e.createdAt);
const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

// Filtros:
// Urgentes: e.urgent === true
// Expirando: diffHours >= 0 && diffHours < 12
// Vencidos: diffHours < 0
```

Icones sugeridos: `AlertTriangle` para urgentes, `Clock` para expirando, `AlertCircle` ou `XCircle` para vencidos.

