

## Adicionar Prazo do Laudo (2 dias uteis) para Radiologistas e Gestor

### Resumo

Criar uma funcao que calcula o prazo de entrega do laudo como **2 dias uteis** a partir da data/hora de criacao do exame. Exibir esse prazo nos cards e dialogs de detalhes nas telas do radiologista (Meus Exames e Exames Disponiveis) e do admin (Exames), com indicacao visual quando o prazo estiver proximo ou vencido.

### Regra de negocio

- O prazo e de **2 dias uteis** a partir do momento de criacao do exame
- Dias uteis = segunda a sexta (sem feriados por enquanto)
- Exemplo: exame criado segunda 13h -> prazo quarta 13h
- Exemplo: exame criado quinta 13h -> prazo segunda 13h (pula sabado e domingo)
- Exames urgentes continuam com seu prazo proprio (urgentDate/urgentTime)

### Indicadores visuais

- **Verde**: mais de 12h restantes
- **Amarelo/Ambar**: menos de 12h restantes
- **Vermelho**: prazo vencido
- O prazo so sera exibido em exames com status "Disponivel" ou "Em analise" (nao faz sentido para Finalizado/Cancelado)

### Alteracoes

#### 1. Criar funcao utilitaria `calcDeadline` em `src/lib/utils.ts`

Funcao que recebe uma data no formato `YYYY-MM-DD` e retorna a data limite (2 dias uteis adiante). A logica pula sabados e domingos ao contar os dias.

#### 2. Criar componente `DeadlineBadge` em `src/components/DeadlineBadge.tsx`

Componente reutilizavel que:
- Recebe `createdAt` (string YYYY-MM-DD) e opcionalmente `urgent`/`urgentDate`/`urgentTime`
- Se urgente, usa o prazo de urgencia
- Se nao, calcula o prazo com `calcDeadline`
- Exibe o prazo formatado (DD/MM/YYYY) com cor indicando proximidade
- Exibe texto como "Prazo: 22/02/2026" com icone de relogio

#### 3. `src/pages/radiologista/MeusExames.tsx`

- Importar e adicionar `DeadlineBadge` nos cards de exames "Em analise"
- Adicionar campo "Prazo do Laudo" no dialog de detalhes para exames nao finalizados

#### 4. `src/pages/radiologista/ExamesDisponiveis.tsx`

- Adicionar `DeadlineBadge` nos cards de exames disponiveis

#### 5. `src/pages/admin/Exames.tsx`

- Adicionar coluna ou campo "Prazo" na tabela de exames e no dialog de detalhes para exames ativos

### Detalhes tecnicos

Funcao de calculo de dias uteis:

```typescript
function addBusinessDays(dateStr: string, days: number): Date {
  const date = new Date(dateStr + 'T12:00:00');
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const dow = date.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return date;
}
```

O componente DeadlineBadge comparara a data atual com o prazo calculado para definir a cor do indicador (verde/ambar/vermelho).

