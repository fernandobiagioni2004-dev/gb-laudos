

## Adicionar filtro de mes nas telas do administrador

### Resumo

Adicionar um seletor de mes/ano (igual ao do Meu Financeiro do radiologista) nas telas **Dashboard**, **Clientes** e **Radiologistas** do perfil administrador, para visualizar valores financeiros filtrados por mes.

### Alteracoes

#### 1. Dashboard (`src/pages/admin/Dashboard.tsx`)

- Substituir o filtro de periodo atual (Hoje / 7d / 30d / Total) por um **seletor de mes** com setas ChevronLeft/ChevronRight
- Todos os KPIs, graficos e tabela de producao passam a filtrar pelo mes selecionado
- O grafico mostrara os dias do mes selecionado (em vez dos ultimos 14 dias)
- Manter a opcao "Total" como alternativa ao lado do seletor de mes

#### 2. Clientes (`src/pages/admin/Clientes.tsx`)

- Adicionar seletor de mes entre o titulo e os cards
- Os valores nos cards (Exames, Faturado, Margem) serao filtrados pelo mes selecionado
- No dialog de detalhes, os resumos financeiros e historico de exames tambem serao filtrados pelo mes

#### 3. Radiologistas (`src/pages/admin/Radiologistas.tsx`)

- Adicionar seletor de mes entre o titulo e os cards
- Os valores nos cards (Finalizados, Em Analise, A Receber) serao filtrados pelo mes selecionado
- No dialog de detalhes, os resumos e lista de exames tambem serao filtrados pelo mes

### Detalhes tecnicos

Padrao reutilizado do `MeuFinanceiro.tsx`:

```typescript
const [selectedMonth, setSelectedMonth] = useState(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
});

function changeMonth(delta: number) {
  const [y, m] = selectedMonth.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
}

const [y, m] = selectedMonth.split('-');
const monthLabel = new Date(+y, +m - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
```

Filtro aplicado nos arrays de exames com `e.createdAt.startsWith(selectedMonth)`.

**Dashboard**: o filtro de periodo existente (hoje/7d/30d/total) sera mantido e o seletor de mes sera adicionado ao lado, funcionando como um filtro complementar. O periodo filtra dentro do mes selecionado.

**Clientes e Radiologistas**: seletor de mes adicionado abaixo do titulo, com o mesmo visual compacto (botoes ghost + label capitalizado centralizado).

3 arquivos alterados no total.

