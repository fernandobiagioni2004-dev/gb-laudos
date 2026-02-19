

## Reorganizar campos do formulario Novo Exame

### Alteracoes no arquivo `src/pages/externo/NovoExame.tsx`

1. **Adicionar campo "Finalidade do Exame"** logo abaixo dos selects de Categoria e Tipo de Exame (apos linha 170), dentro do card "Dados do Exame"
   - Sera um `Input` de texto com placeholder "Ex: Implante, Ortodontia, Avaliacao de cisto..."
   - Adicionar `purpose` ao estado do formulario
   - Adicionar `purpose` no `handleNew` para resetar

2. **Mover "Observacoes" para acima do card de Arquivos**
   - Remover o bloco de Observacoes (linhas 171-179) de dentro do card "Dados do Exame"
   - Criar um novo Card proprio para Observacoes, posicionado entre o card de Urgencia e o card de Arquivos do Exame

### Ordem final dos cards

1. Dados do Paciente (nome, data nascimento)
2. Dados do Exame (categoria, tipo, finalidade)
3. Urgencia
4. Observacoes (card proprio)
5. Arquivos do Exame
6. Botao Enviar

### Estado do formulario atualizado

Adicionar `purpose: ''` ao estado inicial e ao reset em `handleNew`.

