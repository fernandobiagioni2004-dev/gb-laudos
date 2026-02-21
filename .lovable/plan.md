

# Adicionar botao para cadastrar radiologista na aba Radiologistas

## Resumo
Adicionar um botao "Novo Radiologista" no topo da pagina de Radiologistas que abre um modal para o admin cadastrar um novo radiologista. O cadastro criara uma conta de usuario com papel "radiologista" diretamente, usando o fluxo de signup existente via Supabase Auth.

## O que muda para o usuario
- Um botao "Novo Radiologista" aparece ao lado do titulo da pagina
- Ao clicar, abre um modal com campos: Nome, Email, Senha e Softwares (OnDemand/iDixel)
- Ao confirmar, o sistema cria a conta do radiologista ja com o papel correto

## Detalhes Tecnicos

### 1. Criar edge function `create-radiologist`
- Arquivo: `supabase/functions/create-radiologist/index.ts`
- Recebe: `{ nome, email, password, softwares }`
- Valida que o chamador e admin (verifica auth token + papel na tabela `app_users`)
- Usa `supabase.auth.admin.createUser()` com `email_confirm: true` para criar o usuario sem necessidade de confirmacao de email
- Insere/atualiza o registro em `app_users` com `papel = 'radiologista'` e softwares selecionados
- Retorna sucesso ou erro

### 2. Alterar `src/pages/admin/Radiologistas.tsx`
- Adicionar botao "Novo Radiologista" com icone `UserPlus` no cabecalho
- Adicionar estado para controlar modal de criacao
- Modal com campos: Nome, Email, Senha, checkboxes de Softwares (OnDemand, iDixel)
- Ao submeter, chamar a edge function via `supabase.functions.invoke('create-radiologist', ...)`
- Invalidar query `['radiologists']` apos sucesso
- Mostrar toast de sucesso/erro

### 3. Fluxo de seguranca
- A edge function usa `SUPABASE_SERVICE_ROLE_KEY` para criar usuarios (admin API)
- Valida que o chamador tem papel `admin` antes de prosseguir
- O radiologista recebera um email com link para definir/redefinir senha (ou ja pode logar com a senha definida pelo admin)

