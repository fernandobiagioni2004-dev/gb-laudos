

# Corrigir tela de Redefinicao de Senha

## Problema
A pagina de redefinicao de senha fica presa em "Aguarde... verificando link de recuperacao" porque o evento `PASSWORD_RECOVERY` do Supabase dispara antes do componente montar, ou e interceptado pelo `AuthContext` que tambem escuta `onAuthStateChange`. Isso causa uma condicao de corrida onde o `ResetPassword` nunca detecta o evento.

## Solucao
Remover a dependencia do evento `PASSWORD_RECOVERY` e sempre exibir o formulario de nova senha. A pagina so e acessivel via link de recuperacao, entao nao ha risco de exibir o formulario indevidamente. Alem disso, verificar o hash da URL (`type=recovery`) como fallback.

## Detalhes Tecnicos

### Alterar `src/pages/ResetPassword.tsx`
- Remover o estado `isRecovery` e a logica de espera pelo evento `PASSWORD_RECOVERY`
- Sempre exibir o formulario de redefinicao de senha
- Manter o `useEffect` com `onAuthStateChange` apenas para detectar a sessao de recuperacao (sem bloquear a UI)
- Verificar tambem o hash da URL (`type=recovery`) no `useEffect` inicial como fallback

### Alterar `src/context/AuthContext.tsx`
- No `onAuthStateChange`, quando o evento for `PASSWORD_RECOVERY`, nao executar o fluxo normal de `initUser`/carregamento de perfil, para evitar interferencia com a pagina de redefinicao

