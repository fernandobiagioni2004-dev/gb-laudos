
# Adicionar opção de excluir radiologista no menu "..."

## O que muda para o usuário
- No menu "..." de cada card de radiologista, aparecerá uma nova opção "Excluir" em vermelho com ícone de lixeira
- Ao clicar, um diálogo de confirmação será exibido pedindo para confirmar a exclusão
- A exclusão remove o usuário tanto do banco de dados quanto do sistema de autenticação

## Detalhes Técnicos

### 1. Criar edge function `delete-user`
- Arquivo: `supabase/functions/delete-user/index.ts`
- Segue o mesmo padrão da `create-radiologist` (CORS, verificação de admin via service role)
- Recebe `{ userId }` (ID do app_users)
- Busca o `auth_uid` do usuário na tabela `app_users`
- Deleta o registro em `app_users` via `adminClient.from('app_users').delete().eq('id', userId)`
- Deleta o usuário do Auth via `adminClient.auth.admin.deleteUser(auth_uid)`
- Registrar a function no `supabase/config.toml` com `verify_jwt = false`

### 2. Criar migração para permitir DELETE em `app_users`
- A tabela `app_users` atualmente não permite DELETE
- Criar política RLS: admin pode deletar registros de `app_users`

### 3. Alterar `src/pages/admin/Radiologistas.tsx`
- Importar ícone `Trash2` do lucide-react e `AlertDialog` do shadcn
- Adicionar item "Excluir" no `DropdownMenuContent` existente (linha 173-178), com texto vermelho
- Adicionar estado `deleteId` para controlar o diálogo de confirmação
- Adicionar `AlertDialog` com mensagem de confirmação ("Tem certeza que deseja excluir este radiologista? Esta ação não pode ser desfeita.")
- Ao confirmar, chamar `supabase.functions.invoke('delete-user', { body: { userId } })`
- Invalidar queries `['radiologists']` e `['app_users']` após sucesso
