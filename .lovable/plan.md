

## Melhorar visibilidade das opcoes de perfil na sidebar

### Problema

As cores dos perfis (`text-blue-600`, `text-emerald-600`, `text-amber-600`) nao tem contraste suficiente contra o fundo roxo `#8E2EBF` da sidebar, dificultando a leitura.

### Solucao

Trocar as cores dos perfis para tons mais claros/vibrantes que se destaquem sobre o fundo roxo:

#### Arquivo: `src/components/AppSidebar.tsx`

Alterar o mapa `roleColors` (linhas 26-30):

| Perfil | Antes | Depois |
|---|---|---|
| Administrador | `text-blue-600` | `text-blue-200` |
| Radiologista | `text-emerald-600` | `text-emerald-200` |
| Usuario Externo | `text-amber-600` | `text-amber-200` |

Tambem alterar o fundo do avatar (linha 114) de `bg-sidebar-accent` para `bg-white/15` para dar mais contraste ao circulo do avatar.

O texto "Trocar perfil" (linha 123) sera alterado de `text-muted-foreground` para `text-white/60` para ficar visivel sobre o roxo.

1 arquivo afetado.

