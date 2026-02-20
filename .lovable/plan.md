

# Separar logos: Login e Sidebar

## Problema
Ambas as telas (login e sidebar) usam o mesmo arquivo `src/assets/gb-laudos-logo.png`. Quando o logo foi substituido para a tela de login, ele mudou tambem na sidebar.

## Solucao
Salvar o novo logo (enviado pelo usuario) em um arquivo separado para uso exclusivo na tela de login, e restaurar o logo original na sidebar.

## Detalhes Tecnicos

### 1. Criar novo arquivo de imagem
- Copiar `user-uploads://Design_sem_nome_1.jpg` para `src/assets/gb-laudos-login-logo.png` (novo arquivo separado)

### 2. Restaurar logo original na sidebar
- Copiar o logo original de volta para `src/assets/gb-laudos-logo.png` (o arquivo que a sidebar ja importa)
- Como o logo original foi sobrescrito, sera necessario usar a versao anterior do repositorio ou solicitar ao usuario o arquivo original

### 3. Alternativa mais simples (recomendada)
Como o logo original foi sobrescrito, a abordagem mais pratica e:
- Renomear o uso atual: manter `gb-laudos-logo.png` como esta (com o logo novo)
- Criar `src/assets/gb-laudos-sidebar-logo.png` com o logo antigo (que precisara ser restaurado do historico do projeto)
- Atualizar `src/components/AppSidebar.tsx` para importar o novo arquivo

**Na pratica:** O arquivo original pode ser recuperado do historico de versoes. A mudanca em codigo sera apenas atualizar o import em `Auth.tsx` ou `AppSidebar.tsx` para apontar para o arquivo correto.

### Arquivos alterados
- `src/assets/gb-laudos-login-logo.png` — novo arquivo com o logo do login
- `src/assets/gb-laudos-logo.png` — restaurado para o logo original (sidebar)
- `src/pages/Auth.tsx` — import atualizado para usar `gb-laudos-login-logo.png`

