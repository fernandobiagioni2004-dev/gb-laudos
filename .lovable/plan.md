

## Corrigir Upload de Arquivos no Novo Exame

### Problema atual
O botao de upload nao funciona de verdade -- ele apenas simula o upload setando um booleano (`setFileUploaded(true)`) ao clicar na area. Nao ha nenhum `<input type="file">` real no componente.

### Solucao

**Arquivo:** `src/pages/externo/NovoExame.tsx`

1. **Adicionar um `<input type="file">` oculto** com `ref` para ser acionado ao clicar na area de upload
   - Aceitar arquivos `.zip` (`accept=".zip"`)
   - Usar um `useRef<HTMLInputElement>` para referenciar o input
2. **Ao clicar na area de drop**, chamar `inputRef.current?.click()` para abrir o seletor de arquivos do sistema
3. **Ao selecionar o arquivo**, validar:
   - Se o arquivo e `.zip`
   - Se o tamanho e menor ou igual a 1GB (1073741824 bytes)
   - Se invalido, mostrar toast de erro
4. **Guardar o arquivo selecionado** em um estado `selectedFile` (`File | null`) para exibir o nome e tamanho na area de upload
5. **Atualizar a area visual** para mostrar o nome do arquivo e o tamanho formatado (ex: "exame.zip -- 245 MB")
6. **Atualizar o texto de instrucao** para "Arquivos ZIP -- ate 1GB"
7. **Adicionar botao de remover** o arquivo selecionado (um X pequeno) para permitir trocar o arquivo
8. **Resetar o arquivo** no `handleNew`

### Detalhes tecnicos

- O upload sera local/client-side apenas (sem backend), armazenando a referencia do `File` no state
- Nenhum arquivo novo sera criado; apenas `src/pages/externo/NovoExame.tsx` sera editado
- O `fileUploaded` booleano existente sera substituido por `selectedFile: File | null`
- A validacao de tamanho usa `file.size <= 1 * 1024 * 1024 * 1024`

