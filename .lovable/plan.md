

## Mudar tema para fundo cinza claro (Light Mode)

### Resumo

Trocar o tema da aplicacao de dark mode para light mode com fundo cinza claro, inspirado no print de referencia. A sidebar permanecera escura (como no exemplo, que usa sidebar roxa/escura), criando contraste com o conteudo principal claro.

### Alteracoes

#### 1. Variaveis CSS (`src/index.css`)

Atualizar todas as variaveis de cor para valores light mode:

- **background**: cinza claro (~`220 14% 96%` - equivalente a `#f1f5f9`)
- **foreground**: texto escuro (~`222 47% 11%`)
- **card**: branco (`0 0% 100%`)
- **card-foreground**: texto escuro
- **popover**: branco
- **primary**: manter azul (`217 91% 60%`) com foreground branco
- **secondary**: cinza medio claro
- **muted**: cinza suave
- **muted-foreground**: cinza escuro para texto secundario
- **border/input**: cinza claro
- **Sidebar**: manter escura (fundo escuro, texto claro) para contraste, similar ao exemplo

Remover `color-scheme: dark` e ajustar scrollbar para cores claras.

#### 2. Cores de status e badges nos componentes

Ajustar as cores hardcoded nos seguintes arquivos para melhor contraste no fundo claro:

- **`src/components/StatusBadge.tsx`**: trocar `text-emerald-400` para `text-emerald-600`, `text-amber-400` para `text-amber-600`, etc.
- **`src/components/DeadlineBadge.tsx`**: mesma troca de tons 400 para 600
- **`src/components/AppSidebar.tsx`**: roleColors trocar de 400 para 600 (pois o dropdown abre fora da sidebar)

#### 3. Paginas com cores hardcoded

Atualizar tons de cores em todas as paginas que usam `text-*-400` para `text-*-600` (melhor legibilidade em fundo claro):

- `src/pages/admin/Dashboard.tsx`
- `src/pages/admin/Exames.tsx`
- `src/pages/admin/Clientes.tsx`
- `src/pages/admin/Radiologistas.tsx`
- `src/pages/radiologista/MeuFinanceiro.tsx`
- `src/pages/radiologista/ExamesDisponiveis.tsx`
- `src/pages/radiologista/MeusExames.tsx`
- `src/pages/externo/MeusExames.tsx`
- `src/pages/externo/NovoExame.tsx`

### Detalhes tecnicos

Novas variaveis CSS (valores aproximados):

```css
:root {
  --background: 220 14% 96%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --popover: 0 0% 100%;
  --popover-foreground: 222 47% 11%;
  --primary: 217 91% 60%;
  --primary-foreground: 0 0% 100%;
  --secondary: 220 13% 91%;
  --secondary-foreground: 222 47% 20%;
  --muted: 220 14% 92%;
  --muted-foreground: 220 9% 46%;
  --accent: 217 91% 60%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;
  --border: 220 13% 87%;
  --input: 220 13% 87%;
  --ring: 217 91% 60%;

  /* Sidebar permanece escura */
  --sidebar-background: 222 22% 7%;
  --sidebar-foreground: 210 15% 75%;
  /* ... demais sidebar vars permanecem iguais */
}
```

Padrao de substituicao nos componentes: `text-emerald-400` vira `text-emerald-600`, `text-amber-400` vira `text-amber-600`, `text-blue-400` vira `text-blue-600`, `text-red-400` vira `text-red-600`. Backgrounds semi-transparentes (`bg-*-500/15`) podem ser mantidos ou ajustados para `bg-*-500/10`.

Total estimado: ~12 arquivos alterados.
