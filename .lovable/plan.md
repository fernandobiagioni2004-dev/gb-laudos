

## Adicionar logo GB Laudos na sidebar

### Resumo

Substituir o placeholder "PL" e o texto "Plataforma de Laudos" no cabecalho da sidebar pela logo da empresa GB Laudos (imagem enviada) e o nome "GB Laudos".

### Alteracoes

#### 1. Copiar a imagem do logo para o projeto

- Copiar `user-uploads://image-2.png` para `src/assets/gb-laudos-logo.png`

#### 2. Atualizar `src/components/AppSidebar.tsx`

- Importar a imagem: `import gbLaudosLogo from '@/assets/gb-laudos-logo.png'`
- No header (sidebar expandida): substituir o quadrado roxo "PL" por uma tag `<img>` com o logo, e trocar "Plataforma / de Laudos" por "GB Laudos"
- No header (sidebar colapsada): substituir o quadrado "PL" pelo logo redimensionado (h-8 w-8)
- No footer: atualizar o texto "v1.0 — Plataforma de Laudos" para "v1.0 — GB Laudos"

### Detalhes tecnicos

Cabecalho expandido (substituicao):
```tsx
<div className="flex items-center gap-2">
  <img src={gbLaudosLogo} alt="GB Laudos" className="h-8 w-8 rounded-lg object-contain" />
  <div>
    <p className="text-sm font-semibold text-sidebar-accent-foreground">GB Laudos</p>
    <p className="text-xs text-sidebar-foreground">Laudos Odontologicos</p>
  </div>
</div>
```

Cabecalho colapsado:
```tsx
<div className="flex justify-center">
  <img src={gbLaudosLogo} alt="GB Laudos" className="h-8 w-8 rounded-lg object-contain" />
</div>
```

2 arquivos afetados (1 asset copiado + 1 componente editado).

