

## Atualizar cor da sidebar para #8E2EBF e trocar logo

### Resumo

Duas alteracoes: (1) mudar o tom de roxo da sidebar para o codigo especifico `#8E2EBF` e (2) substituir o logo atual pelo novo enviado (logo "GB"), com fundo removido e tamanho maior.

### Alteracoes

#### 1. Novo logo (`src/assets/gb-laudos-logo.png`)

- Substituir o arquivo atual pela nova imagem enviada (logo "GB")
- A imagem enviada ja possui fundo colorido; como nao e possivel remover fundo de imagem automaticamente em codigo, a melhor alternativa e aplicar `mix-blend-mode: screen` ou usar `border-radius` para suavizar. Porem, o ideal seria o usuario fornecer a versao PNG com fundo transparente. Se nao for possivel, sera utilizada a imagem como esta, com bordas arredondadas.
- Aumentar o tamanho do logo de `h-8 w-8` para `h-10 w-10` (expandido) e `h-9 w-9` (colapsado)

#### 2. Cor da sidebar (`src/index.css`)

Converter `#8E2EBF` para HSL: aproximadamente `278 61% 47%`. Derivar a paleta da sidebar a partir desse tom:

```
--sidebar-background: 278 55% 14%;         /* versao bem escura do #8E2EBF */
--sidebar-foreground: 278 20% 80%;         /* texto claro com leve tom roxo */
--sidebar-primary: 278 61% 47%;           /* o proprio #8E2EBF */
--sidebar-primary-foreground: 0 0% 100%;  /* branco */
--sidebar-accent: 278 45% 22%;            /* hover: roxo medio escuro */
--sidebar-accent-foreground: 278 15% 93%; /* texto hover: quase branco */
--sidebar-border: 278 35% 20%;            /* bordas */
--sidebar-ring: 278 61% 47%;              /* ring de foco */
```

#### 3. Componente AppSidebar (`src/components/AppSidebar.tsx`)

- Atualizar `bg-purple-600` (caso exista) para usar a cor da sidebar ou manter coerencia
- Aumentar tamanho do logo: `h-10 w-10` na versao expandida, `h-9 w-9` na colapsada
- Adicionar `rounded-xl` para suavizar bordas do logo

### Arquivos afetados

- `src/assets/gb-laudos-logo.png` (substituido)
- `src/index.css` (variaveis sidebar)
- `src/components/AppSidebar.tsx` (tamanho do logo)

