

## Padronizar todas as datas para formato brasileiro (DD/MM/YYYY)

### Problema

Algumas telas ainda exibem datas no formato americano (YYYY-MM-DD) diretamente dos dados mock, enquanto outras ja foram convertidas para DD/MM/YYYY.

### Arquivos que precisam de alteracao

#### 1. `src/pages/admin/Exames.tsx`

- Adicionar funcao `formatDateBR` para converter YYYY-MM-DD em DD/MM/YYYY
- **Linha 153**: campo "Nascimento" (`detailExam.patientBirthDate`) -- aplicar `formatDateBR`
- **Linha 185**: historico de status (`h.date`) -- aplicar `formatDateBR`

#### 2. `src/pages/radiologista/MeuFinanceiro.tsx`

- Adicionar funcao `formatDateBR`
- **Linha 96**: coluna "Data" na tabela de historico financeiro (`e.createdAt`) -- aplicar `formatDateBR`

#### 3. `src/pages/radiologista/ExamesDisponiveis.tsx`

- Adicionar funcao `formatDateBR`
- **Linha 106**: texto "Solicitado em" (`e.createdAt`) -- aplicar `formatDateBR`

### Arquivos que ja estao corretos (nenhuma alteracao necessaria)

- `src/pages/radiologista/MeusExames.tsx` -- ja usa `formatDate`
- `src/pages/externo/MeusExames.tsx` -- ja usa `formatDateBR`
- `src/pages/shared/Calendario.tsx` -- ja usa `date-fns` com locale `ptBR`
- `src/pages/admin/Dashboard.tsx` -- grafico ja mostra DD/M

### Detalhes tecnicos

A funcao `formatDateBR` sera identica em todos os arquivos:

```typescript
function formatDateBR(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}
```

Sao 3 arquivos alterados com mudancas minimas (adicionar a funcao helper e aplicar nos pontos que exibem datas cruas).

