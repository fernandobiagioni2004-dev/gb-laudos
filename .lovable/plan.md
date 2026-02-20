

## Filtros por status e data em formato brasileiro - Meus Exames (Externo)

### Resumo

Adicionar filtros por status (Todos, Disponivel, Em analise, Finalizado, Cancelado) usando Tabs na tela de Meus Exames do usuario externo, e converter a data de `YYYY-MM-DD` para o formato brasileiro `DD/MM/YYYY`.

### Alteracoes em `src/pages/externo/MeusExames.tsx`

#### 1. Filtro por status com Tabs
- Importar `Tabs, TabsList, TabsTrigger, TabsContent` de `@/components/ui/tabs`
- Adicionar estado `activeFilter` com valor padrao `'all'`
- Criar tabs: "Todos", "Disponivel", "Em analise", "Finalizado", "Cancelado"
- Cada tab exibe a contagem de exames naquele status (ex: "Finalizados (3)")
- Filtrar a lista `myExams` de acordo com o tab selecionado

#### 2. Data no formato brasileiro
- Criar funcao auxiliar `formatDateBR(dateStr)` que converte `2026-02-01` para `01/02/2026`
- Substituir a exibicao de `e.createdAt` pela versao formatada na linha de detalhes do card

### Detalhes tecnicos

- Usar `useState` para controlar o filtro ativo
- A filtragem sera feita com `useMemo` encadeado: primeiro filtra por cliente, depois por status
- Funcao `formatDateBR`: split por `-`, inverte e junta com `/`
- Nenhuma dependencia nova necessaria

### Visual esperado

```text
Meus Exames
X exames encontrados

[Todos (6)] [Disponiveis (2)] [Em analise (1)] [Finalizados (3)] [Cancelados (0)]

+------------------------------------------------------------+
| [icon] EX001  Joao Silva                                   |
|        Panoramica · Axel · 01/02/2026                      |
|                          [Finalizado] [Baixar Laudo]       |
+------------------------------------------------------------+
```

