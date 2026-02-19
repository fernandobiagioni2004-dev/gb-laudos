

## Adicionar Data + Horario na Urgencia

### Alteracao

**Arquivo:** `src/pages/externo/NovoExame.tsx`

No bloco de urgencia (linhas 196-208), substituir o campo unico de horario por dois campos lado a lado:

1. **Data** - `Input type="date"` para o usuario escolher a data desejada para o exame urgente
2. **Horario** - `Input type="time"` (ja existente) para o horario desejado

### Detalhes

- Adicionar campo `urgentDate` ao estado do formulario (string, formato date)
- Exibir os dois campos em um `grid grid-cols-2 gap-4` dentro do bloco condicional de urgencia
- Atualizar a validacao no `handleSubmit` para exigir tanto `urgentDate` quanto `urgentTime` quando urgente
- Atualizar o `handleNew` para limpar `urgentDate`
- Atualizar o label para "Para quando voce precisa do exame? *"
- Atualizar o modelo `Exam` em `src/data/mockData.ts` para incluir `urgentDate?: string`
- Salvar `urgentDate` no objeto do exame criado
