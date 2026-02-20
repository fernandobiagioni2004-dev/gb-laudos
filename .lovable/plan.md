

# Adicionar imagem de fundo na tela de login

## O que muda
A tela de login tera a imagem enviada como fundo, cobrindo toda a tela, com o card de login centralizado por cima com um leve overlay para manter a legibilidade.

## Detalhes Tecnicos

### 1. Copiar a imagem para o projeto
- Copiar `user-uploads://WhatsApp_Image_2026-02-20_at_19.25.00.jpeg` para `src/assets/login-bg.jpeg`

### 2. Alterar `src/pages/Auth.tsx`
- Importar a imagem: `import loginBg from '@/assets/login-bg.jpeg'`
- Aplicar como background no div container usando `style={{ backgroundImage: url(...) }}` com `bg-cover bg-center`
- Adicionar um overlay semi-transparente escuro (`bg-black/40`) para garantir contraste com o card branco

