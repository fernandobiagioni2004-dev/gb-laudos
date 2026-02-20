
# Editar Usuarios - Pagina de Gestao

## Objetivo
Adicionar funcionalidade completa de edicao na pagina de Usuarios, permitindo ao administrador editar nome, papel, cliente vinculado e softwares de cada usuario atraves de um modal de edicao.

## O que muda para voce
- Cada usuario tera um botao "Editar" ao lado
- Ao clicar, abre um formulario com os campos: **Nome**, **Papel**, **Cliente vinculado** (quando cliente), e **Softwares** (quando radiologista)
- Ao salvar, as alteracoes sao aplicadas imediatamente

## Detalhes Tecnicos

### 1. Atualizar o hook `useUpdateUserRole` (src/hooks/useAppUsers.ts)
- Renomear para `useUpdateUser` e aceitar tambem o campo `nome`
- Incluir `nome` no objeto de update enviado ao banco

### 2. Refatorar a pagina `Usuarios.tsx` (src/pages/admin/Usuarios.tsx)
- Adicionar um Dialog (modal) de edicao com os campos:
  - **Nome** (input de texto)
  - **Papel** (select com as opcoes existentes)
  - **Cliente vinculado** (select, visivel apenas quando papel = cliente)
  - **Softwares** (checkboxes para "Morita" e "Axel", visivel apenas quando papel = radiologista)
- Botao "Editar" (icone de lapis) em cada card de usuario
- Botao "Salvar" no modal que chama a mutacao de update
- Estado local para controlar qual usuario esta sendo editado e os valores do formulario

### 3. Sem alteracoes no banco de dados
- A tabela `app_users` ja possui os campos `nome`, `papel`, `cliente_id` e `softwares`
- A policy RLS "Only admin can update users" ja permite que admins editem qualquer usuario
