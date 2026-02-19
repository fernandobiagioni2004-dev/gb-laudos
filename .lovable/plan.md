

## Gerenciamento completo de Clientes (CRUD + Software)

### Visao geral

Transformar a tela de Clientes de uma listagem estatica em um modulo completo com criacao, edicao e exclusao de clientes. Cada cliente passara a ter um campo de software (Axel/Morita) que sera vinculado automaticamente aos exames solicitados por ele.

### Alteracoes por arquivo

#### 1. `src/data/mockData.ts` -- Adicionar software ao Client

- Adicionar campo `software: Software` na interface `Client`
- Atualizar os 3 clientes existentes com um software atribuido (ex: c1 e c2 = Axel, c3 = Morita)

#### 2. `src/context/AppContext.tsx` -- Gerenciar clientes no estado

Atualmente os clientes vem de uma constante estatica. Para suportar CRUD, o contexto precisa gerencia-los:

- Adicionar estado `clients` (inicializado com a lista de `mockData`)
- Expor no contexto: `clients`, `addClient`, `updateClient`, `removeClient`
- `addClient(client)`: gera ID unico e adiciona ao estado
- `updateClient(client)`: substitui o cliente pelo ID
- `removeClient(clientId)`: remove o cliente (exibir toast de confirmacao)

#### 3. `src/pages/admin/Clientes.tsx` -- CRUD completo

**Botao "Novo Cliente"** no cabecalho:
- Abre um Dialog com formulario contendo: Nome, CNPJ, Email, Software (Select: Axel/Morita), Status (Ativo/Inativo)
- Validacao basica dos campos obrigatorios
- Ao salvar, chama `addClient` e fecha o dialog

**Menu "..." em cada card de cliente** (DropdownMenu com MoreHorizontal icon):
- Posicionado no canto superior direito do card, ao lado do badge de status
- Opcoes:
  - **Editar**: abre o mesmo Dialog do criar, preenchido com os dados do cliente, permitindo alterar qualquer campo
  - **Excluir**: abre um AlertDialog de confirmacao antes de remover

**Exibir software no card**:
- Mostrar o software do cliente como um badge/tag no card (ex: "Axel" ou "Morita")

#### 4. `src/pages/externo/NovoExame.tsx` -- Vincular software automaticamente

- Quando o usuario externo cria um exame, o campo `software` do exame sera preenchido automaticamente com base no software do cliente (vindo do contexto), em vez de ser fixo ou escolhido manualmente

### Ordem de implementacao

1. Atualizar interface `Client` e dados mock
2. Mover clientes para o estado do AppContext com funcoes CRUD
3. Implementar UI completa em Clientes.tsx (botao criar, dialog, menu "...", editar, excluir)
4. Conectar software do cliente ao NovoExame

