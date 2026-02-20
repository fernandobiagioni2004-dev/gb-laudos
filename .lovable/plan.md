

# Recuperacao de Senha na Tela de Login

## O que muda

Sera adicionado um link "Esqueceu sua senha?" na tela de login. Ao clicar, o usuario informa seu e-mail e recebe um link de redefinicao. Ao clicar no link do e-mail, ele e redirecionado para uma pagina onde pode definir uma nova senha.

## Fluxo do usuario

1. Na tela de login, clica em "Esqueceu sua senha?"
2. Aparece um campo para digitar o e-mail
3. Recebe um e-mail com link de redefinicao
4. Clica no link e e redirecionado para `/reset-password`
5. Define a nova senha e confirma
6. E redirecionado para o login

## Detalhes Tecnicos

### 1. Alterar `src/pages/Auth.tsx`
- Adicionar um estado para alternar entre login, cadastro e "esqueci minha senha"
- No modo "esqueci senha", mostrar apenas o campo de e-mail e um botao "Enviar link"
- Chamar `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`
- Mostrar mensagem de confirmacao apos envio

### 2. Criar pagina `src/pages/ResetPassword.tsx`
- Formulario com campos "Nova senha" e "Confirmar senha"
- Verificar se ha token de recuperacao na URL (hash `type=recovery`)
- Chamar `supabase.auth.updateUser({ password })` para salvar a nova senha
- Redirecionar para `/auth` apos sucesso

### 3. Adicionar rota em `src/App.tsx`
- Adicionar `<Route path="/reset-password" element={<ResetPassword />} />` como rota publica ao lado de `/auth`

