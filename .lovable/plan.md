

## Adicionar filtro de mes na aba Meu Financeiro

### Resumo

Adicionar um seletor de mes/ano na tela Meu Financeiro do radiologista, para que ele possa visualizar quanto vai ganhar (ou ganhou) em cada mes especifico. Os cards de resumo e a tabela de historico serao filtrados pelo mes selecionado.

### Alteracoes

#### Arquivo unico: `src/pages/radiologista/MeuFinanceiro.tsx`

1. **Novo estado** `selectedMonth` inicializado com o mes/ano atual (ex: `2026-02`)

2. **Seletor de mes** entre o titulo e os cards de resumo:
   - Botoes de seta para navegar entre meses (anterior/proximo)
   - Texto central mostrando o mes e ano formatado em portugues (ex: "Fevereiro 2026")
   - Visual compacto e alinhado com o design existente

3. **Filtrar exames pelo mes selecionado**: os arrays `finalized` e `inProgress` passam a considerar apenas exames cujo `createdAt` corresponde ao mes/ano selecionado

4. **Cards de resumo atualizados**: os valores de "Total a Receber", "Em Analise (pendente)" e "Exames Finalizados" refletem apenas o mes filtrado

5. **Tabela de historico filtrada**: mostra apenas exames finalizados do mes selecionado

### Detalhes tecnicos

```typescript
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Estado: "2026-02" (ano-mes)
const [selectedMonth, setSelectedMonth] = useState(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
});

// Filtro por mes
const monthExams = myExams.filter(e => e.createdAt.startsWith(selectedMonth));

// Navegacao
function changeMonth(delta: number) {
  const [y, m] = selectedMonth.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
}

// Formatacao: "Fevereiro 2026"
const monthLabel = new Date(+y, +m - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
```

O seletor sera composto por dois botoes (ChevronLeft/ChevronRight) e o nome do mes centralizado, usando os componentes Button ja existentes.

