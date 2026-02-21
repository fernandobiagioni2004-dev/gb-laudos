

# Adicionar menu de edição e barra de pesquisa na aba Radiologistas

## O que muda para o usuário
- Cada card de radiologista terá um botão "..." (tres pontos) no canto superior direito que abre um menu com a opção "Editar"
- Ao clicar em "Editar", abre um modal para alterar Nome e Softwares do radiologista
- Uma barra de pesquisa será adicionada abaixo do cabeçalho para filtrar radiologistas por nome em tempo real

## Detalhes Técnicos

### Alterações em `src/pages/admin/Radiologistas.tsx`

1. **Barra de pesquisa**
   - Adicionar um `Input` com ícone de lupa (`Search`) entre o cabeçalho e o seletor de mês
   - Estado `searchQuery` filtra a lista `rows` por nome (case-insensitive)

2. **Menu "..." nos cards**
   - Importar `DropdownMenu` do shadcn e ícone `MoreVertical`
   - Adicionar botão "..." no canto superior direito de cada card (ao lado do avatar/nome)
   - Menu com opção "Editar" (ícone `Pencil`)

3. **Modal de edição**
   - Novo `Dialog` com campos: Nome e checkboxes de Softwares (OnDemand, iDixel)
   - Usa o hook `useUpdateUser` já existente em `src/hooks/useAppUsers.ts` para salvar as alterações
   - Ao salvar, invalida queries e fecha o modal

### Hooks utilizados
- `useUpdateUser` de `src/hooks/useAppUsers.ts` -- já suporta atualizar `nome` e `softwares` por `userId`

