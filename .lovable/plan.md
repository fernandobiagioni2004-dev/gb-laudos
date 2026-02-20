

## Indicador de Urgencia na tela Exames Disponiveis

### Resumo

Adicionar badge "URGENTE" pulsante nos cards de exames disponiveis que possuem flag de urgencia, e ordenar exames urgentes primeiro na lista. Tambem adicionar 1-2 exames "Disponivel" com flag urgente no mock data para que o indicador seja visivel nesta tela.

### Alteracoes por arquivo

#### 1. `src/data/mockData.ts`

- Marcar 1-2 exames com status "Disponivel" como urgentes para testar na tela:
  - EX015 (Marcos Ribeiro): `urgent: true, urgentDate: '2026-02-17', urgentTime: '14:00'`
  - EX017 (Felipe Araujo): `urgent: true, urgentDate: '2026-02-19', urgentTime: '09:00'`

#### 2. `src/pages/radiologista/ExamesDisponiveis.tsx`

- Importar `AlertTriangle` de lucide-react
- No `useMemo`, apos filtrar, ordenar exames urgentes primeiro (`.sort((a,b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0))`)
- No card de cada exame, se `e.urgent === true`:
  - Adicionar badge vermelho pulsante com icone `AlertTriangle` e texto "URGENTE" entre o cabecalho e a info do tipo de exame
  - Se houver `urgentDate`/`urgentTime`, exibir "Prazo: dd/mm/aaaa as HH:MM" abaixo do badge
  - Adicionar borda vermelha sutil no card (`border-red-500/40`)

### Visual do card urgente

```text
+------------------------------------------+
| EX015              [Disponivel]          |
| Marcos Ribeiro                           |
| Centro de Imagem Dental                  |
|                                          |
| [!] URGENTE   Prazo: 17/02/2026 as 14:00|
|                                          |
| Tomografia   [Morita]                    |
| Solicitado em 15/02/2026                 |
| [      Assumir Exame      ]             |
+------------------------------------------+
```

### Detalhes tecnicos

- Reutilizar o mesmo estilo de badge pulsante ja implementado em MeusExames.tsx (`animate-pulse bg-red-500/15 text-red-400`)
- Nenhuma nova dependencia necessaria

