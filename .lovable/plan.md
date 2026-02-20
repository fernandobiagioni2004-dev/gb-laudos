

## Alterar cor da sidebar para roxo escuro suave

### Resumo

Trocar o fundo da sidebar de cinza escuro para um roxo escuro suave (tipo "deep purple" com baixa saturacao), mantendo o contraste com o conteudo principal claro. Os textos e elementos interativos da sidebar serao ajustados para combinar com o novo tom.

### Alteracoes

#### Arquivo unico: `src/index.css`

Atualizar as variaveis de sidebar na linha 48-55 para tons de roxo escuro:

```css
/* Sidebar — roxo escuro suave */
--sidebar-background: 260 30% 12%;        /* fundo principal: roxo escuro discreto */
--sidebar-foreground: 260 15% 75%;        /* texto: lavanda suave */
--sidebar-primary: 260 60% 65%;           /* destaque primario: roxo medio */
--sidebar-primary-foreground: 0 0% 100%;  /* texto sobre primario: branco */
--sidebar-accent: 260 25% 18%;            /* hover/ativo: roxo um pouco mais claro */
--sidebar-accent-foreground: 260 20% 92%; /* texto hover: quase branco */
--sidebar-border: 260 20% 18%;            /* bordas: roxo escuro sutil */
--sidebar-ring: 260 60% 65%;              /* ring de foco */
```

Tambem atualizar o logo "PL" no `AppSidebar.tsx` para usar um tom de roxo em vez de `bg-primary` (azul), ficando mais coerente com a sidebar roxa.

#### Arquivo: `src/components/AppSidebar.tsx`

- Trocar `bg-primary` do logo para `bg-purple-600` (ou similar)
- Trocar cor do item ativo de `bg-primary/15 text-primary` para `bg-purple-500/15 text-purple-300` e o dot indicador para `bg-purple-400`

Isso garante que os elementos interativos da sidebar seguem o mesmo tom roxo.

### Resultado esperado

Sidebar com fundo roxo escuro discreto (nao vibrante), textos em tons de lavanda clara, itens ativos em roxo medio — criando uma identidade visual mais sofisticada mantendo boa legibilidade.

2 arquivos alterados no total.

