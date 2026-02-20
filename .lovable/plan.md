

## Tornar o Card inteiro clicavel para abrir detalhes

### Resumo

Atualmente, apenas o nome do paciente e clicavel para abrir o dialog de detalhes. A mudanca fara com que clicar em qualquer lugar do card abra o dialog, tornando a interacao mais intuitiva.

### Alteracoes em `src/pages/radiologista/MeusExames.tsx`

#### 1. Cards "Em Analise" (linha ~98)
- Adicionar `onClick={() => setDetailId(e.id)}` e `cursor-pointer` no elemento `<Card>`
- Manter o botao "Finalizar Laudo" com `e.stopPropagation()` para que ele nao abra o dialog ao ser clicado

#### 2. Cards "Finalizados" (linha ~137)
- Adicionar `onClick={() => setDetailId(e.id)}` e `cursor-pointer` no elemento `<Card>`

#### 3. Componente PatientNameLink (linha ~50-58)
- Pode ser simplificado para um `<span>` sem handler de click proprio, ja que o card inteiro agora abre o dialog
- Manter o estilo visual (font-semibold) mas remover hover:underline e o onClick, pois o card ja cuida disso

### Resultado esperado

- Clicar em qualquer area do card abre o dialog de detalhes
- O botao "Finalizar Laudo" continua funcionando normalmente sem abrir o dialog

