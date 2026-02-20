

## Atualizar logo da sidebar

### Resumo

Substituir o arquivo `src/assets/gb-laudos-logo.png` pela nova imagem enviada (logo "GB" com fundo roxo) e atualizar o fundo da sidebar para usar `#8E2EBF` diretamente como background.

### Alteracoes

#### 1. Substituir o logo
- Copiar `user-uploads://image-5.png` para `src/assets/gb-laudos-logo.png`

#### 2. Atualizar fundo da sidebar (`src/index.css`)
- Mudar `--sidebar-background` de `278 55% 14%` (roxo escuro) para `278 61% 47%` (o proprio `#8E2EBF`)
- Ajustar as demais variaveis para manter contraste sobre o fundo vibrante:

```
--sidebar-background: 278 61% 47%;
--sidebar-foreground: 0 0% 100%;
--sidebar-primary: 0 0% 100%;
--sidebar-primary-foreground: 0 0% 100%;
--sidebar-accent: 278 61% 40%;
--sidebar-accent-foreground: 0 0% 100%;
--sidebar-border: 278 50% 42%;
--sidebar-ring: 0 0% 100%;
```

2 arquivos afetados.

