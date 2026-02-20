

# Plano: Integrar Supabase ao Sistema GB Laudos

## Resumo

Conectar o Supabase, criar toda a modelagem de dados, autenticacao, RLS e substituir os dados mockados por dados reais do banco. A interface existente NAO sera alterada -- apenas a camada de dados e logica de negocio sera substituida.

---

## Pre-requisito

O projeto precisa ser conectado ao Supabase (via Lovable Cloud ou projeto externo). Isso sera feito antes de qualquer codigo.

---

## Fase 1 -- Schema do Banco de Dados (Migrations)

Executar o SQL fornecido pelo usuario, que cria:

- **Enums**: `user_role`, `exam_status`, `exam_software`
- **Tabelas**: `app_users`, `clients`, `exam_types`, `price_table_clients`, `price_table_radiologist`, `exams`, `meetings`, `meeting_participants`, `vacations`
- **Funcoes utilitarias**: `current_user_id()`, `current_user_role()`, `current_identity()`, `init_current_user()`
- **RLS Policies**: controle de acesso para exames, reunioes e ferias
- **Indices**: para otimizar queries em `exams`

Adicionalmente, habilitar RLS nas tabelas `clients`, `exam_types`, `price_table_clients`, `price_table_radiologist` e `meeting_participants` com policies adequadas.

---

## Fase 2 -- Dados Iniciais (Seed)

Inserir os dados que hoje existem em `mockData.ts`:

- 3 clientes
- 7 tipos de exame
- 9 entradas de preco (price_table_clients)
- Registros de preco por radiologista (price_table_radiologist)

---

## Fase 3 -- Autenticacao e Contexto de Auth

### 3.1 Novo arquivo: `src/context/AuthContext.tsx`

- Provider com estados: `session`, `currentProfile`, `currentRole`, `currentUserId`, `loading`
- `onAuthStateChange` listener (antes de `getSession`)
- Apos login, chamar `rpc('init_current_user', { p_nome, p_email })` e carregar `current_identity`
- Se `role = 'nenhum'`, definir flag `isPending`

### 3.2 Nova pagina: `src/pages/Auth.tsx`

- Formulario de Login (email + senha)
- Formulario de Cadastro (nome + email + senha)
- Usa `supabase.auth.signInWithPassword` e `supabase.auth.signUp`
- Estilo limpo usando componentes UI existentes (Card, Input, Button, Label)

### 3.3 Novo componente: `src/components/PendingApprovalModal.tsx`

- Modal de bloqueio: "Conta pendente de aprovacao. Aguarde o administrador."
- Exibido quando `currentRole = 'nenhum'`
- Botao de logout

### 3.4 Novo componente: `src/components/ProtectedRoute.tsx`

- Verifica se usuario esta autenticado
- Redireciona para `/auth` se nao estiver
- Exibe modal de bloqueio se `role = 'nenhum'`

---

## Fase 4 -- Hooks de Dados (Supabase Queries)

Criar hooks customizados que substituem os dados mockados:

### `src/hooks/useClients.ts`
- `useClients()` -- lista clientes
- `useCreateClient()`, `useUpdateClient()`, `useDeleteClient()`

### `src/hooks/useExamTypes.ts`
- `useExamTypes()` -- lista tipos de exame

### `src/hooks/useRadiologists.ts`
- `useRadiologists()` -- lista usuarios com papel `radiologista`

### `src/hooks/useExams.ts`
- `useExams()` -- lista exames (filtrado por RLS automaticamente)
- `useCreateExam()` -- cria exame + calcula valores
- `useAssumeExam()` -- atribui radiologista ao exame
- `useFinalizeExam()` -- finaliza exame
- `useCancelExam()` -- cancela exame

### `src/hooks/usePricing.ts`
- `usePricingClients()` -- tabela de precos clientes
- `usePricingRadiologist()` -- tabela de precos radiologistas
- `useUpdatePricing()` -- atualiza precos

### `src/hooks/useCalendar.ts`
- `useMeetings()`, `useVacations()`
- `useCreateMeeting()`, `useUpdateMeeting()`, `useDeleteMeeting()`
- `useCreateVacation()`, `useUpdateVacation()`, `useDeleteVacation()`

### `src/hooks/useAppUsers.ts`
- `useAppUsers()` -- lista usuarios (admin)
- `useUpdateUserRole()` -- admin altera papel de um usuario

---

## Fase 5 -- Atualizar Contexto e Paginas

### 5.1 Refatorar `AppContext.tsx`

- Remover todos os states mockados (exams, clients, calendarEvents)
- Manter apenas o que for necessario para compatibilidade da UI
- Role vem de `AuthContext` (nao mais de state local)
- Remover o "role switcher" da sidebar e substituir por info do usuario logado

### 5.2 Atualizar cada pagina para usar hooks Supabase

Todas as paginas ja possuem a estrutura visual pronta. Apenas trocar a origem dos dados:

| Pagina | De (mock) | Para (Supabase) |
|--------|-----------|-----------------|
| Dashboard | `useApp().exams` + `radiologists` | `useExams()` + `useRadiologists()` |
| Exames | `useApp().exams` + constantes mock | `useExams()` + `useClients()` + `useExamTypes()` |
| Clientes | `useApp().clients` | `useClients()` |
| Radiologistas | constante `radiologists` | `useRadiologists()` |
| TabelasPreco | constante `pricing` | `usePricingClients()` + `usePricingRadiologist()` |
| Relatorios | `useApp().exams` | `useExams()` + `useRadiologists()` + `useClients()` |
| Calendario | `useApp().calendarEvents` | `useMeetings()` + `useVacations()` |
| ExamesDisponiveis | constante `SIMULATED_RADIOLOGIST` | `currentProfile` do auth |
| MeusExames (rad) | constante `SIMULATED_RADIOLOGIST` | `currentProfile` do auth |
| MeuFinanceiro | constante `SIMULATED_RADIOLOGIST` | `currentProfile` do auth |
| NovoExame | constante `SIMULATED_CLIENT_ID` | `currentProfile.cliente_id` |
| MeusExames (ext) | constante `SIMULATED_CLIENT_ID` | `currentProfile.cliente_id` |
| MeuPerfil | dados mockados | `currentProfile` do auth |

### 5.3 Atualizar `AppSidebar.tsx`

- Remover role switcher dropdown
- Exibir nome e papel do usuario logado (de `AuthContext`)
- Adicionar botao de logout
- Navegacao permanece identica (definida pelo papel real)

### 5.4 Atualizar `App.tsx`

- Adicionar `AuthProvider` envolvendo tudo
- Adicionar rota `/auth`
- Envolver rotas existentes com `ProtectedRoute`
- Role vem de `AuthContext` em vez de `AppContext`

---

## Fase 6 -- Admin: Gestao de Usuarios

Adicionar uma nova pagina acessivel apenas ao admin:

### `src/pages/admin/Usuarios.tsx`

- Lista todos os `app_users`
- Exibe: nome, email, papel atual
- Permite alterar o papel (dropdown: admin, radiologista, cliente, nenhum)
- Para papel `cliente`: permite associar a um `client_id`
- Para papel `radiologista`: permite definir softwares

### Adicionar ao menu admin na sidebar:

- Novo item: "Usuarios" com icone `Users`

---

## Logica de Negocio

### Criacao de Exame (cliente)
1. Buscar `valor_cliente` em `price_table_clients` (client_id + exam_type_id)
2. Inserir exame com `status = 'Disponivel'`, `radiologista_id = null`

### Autoatribuicao (radiologista)
1. Update: `radiologista_id = current_user_id()`, `status = 'Em analise'`
2. Buscar `valor_radiologista` em `price_table_radiologist`
3. Calcular `margem = valor_cliente - valor_radiologista`

### Finalizacao
1. Verificar que `radiologista_id IS NOT NULL`
2. Update: `status = 'Finalizado'`

### Cancelamento (admin)
1. Update: `status = 'Cancelado'`

---

## Detalhes Tecnicos

### Tipo `Role` atualizado
```text
De: 'admin' | 'radiologista' | 'externo'
Para: 'admin' | 'radiologista' | 'cliente' | 'nenhum'
```

Todas as referencias a `'externo'` serao substituidas por `'cliente'`.

### Mapeamento de navegacao
```text
admin -> Dashboard, Exames, Clientes, Radiologistas, Usuarios, TabelasPreco, Relatorios, Calendario, Perfil
radiologista -> ExamesDisponiveis, MeusExames, MeuFinanceiro, Calendario, Perfil
cliente -> NovoExame, MeusExames, Perfil
nenhum -> Modal de bloqueio (sem navegacao)
```

### Queries otimizadas com TanStack Query
- Cada hook usa `useQuery` / `useMutation` do TanStack Query
- Cache invalidation apos mutacoes
- Loading states ja suportados pelos componentes existentes

### Seguranca
- RLS garante que cada papel so ve o que deve
- Funcoes `security definer` evitam recursao
- Cliente NAO ve valores financeiros (colunas `valor_cliente`, `valor_radiologista`, `margem` nao sao expostas nas queries do cliente)
- Papel `nenhum` bloqueia completamente o acesso

---

## Arquivos Novos

| Arquivo | Descricao |
|---------|-----------|
| `src/integrations/supabase/client.ts` | Cliente Supabase (gerado) |
| `src/integrations/supabase/types.ts` | Tipos TypeScript (gerado) |
| `src/context/AuthContext.tsx` | Provider de autenticacao |
| `src/pages/Auth.tsx` | Pagina de login/cadastro |
| `src/components/PendingApprovalModal.tsx` | Modal de conta pendente |
| `src/components/ProtectedRoute.tsx` | Guarda de rotas |
| `src/hooks/useClients.ts` | Hook de clientes |
| `src/hooks/useExamTypes.ts` | Hook de tipos de exame |
| `src/hooks/useRadiologists.ts` | Hook de radiologistas |
| `src/hooks/useExams.ts` | Hook de exames |
| `src/hooks/usePricing.ts` | Hook de precos |
| `src/hooks/useCalendar.ts` | Hook de calendario |
| `src/hooks/useAppUsers.ts` | Hook de usuarios |
| `src/pages/admin/Usuarios.tsx` | Pagina de gestao de usuarios |

## Arquivos Modificados (sem alterar layout/visual)

| Arquivo | Tipo de Alteracao |
|---------|-------------------|
| `src/App.tsx` | Adicionar AuthProvider, rota /auth, ProtectedRoute |
| `src/context/AppContext.tsx` | Simplificar: remover mocks, usar hooks Supabase |
| `src/components/AppSidebar.tsx` | Trocar role switcher por info do usuario + logout |
| `src/data/mockData.ts` | Manter tipos/interfaces, remover dados mockados |
| `src/pages/admin/Dashboard.tsx` | Trocar fonte de dados para hooks |
| `src/pages/admin/Exames.tsx` | Trocar fonte de dados para hooks |
| `src/pages/admin/Clientes.tsx` | Trocar fonte de dados para hooks |
| `src/pages/admin/Radiologistas.tsx` | Trocar fonte de dados para hooks |
| `src/pages/admin/TabelasPreco.tsx` | Trocar fonte de dados para hooks |
| `src/pages/admin/Relatorios.tsx` | Trocar fonte de dados para hooks |
| `src/pages/radiologista/ExamesDisponiveis.tsx` | Usar usuario real em vez de simulado |
| `src/pages/radiologista/MeusExames.tsx` | Usar usuario real em vez de simulado |
| `src/pages/radiologista/MeuFinanceiro.tsx` | Usar usuario real em vez de simulado |
| `src/pages/externo/NovoExame.tsx` | Usar client_id real do usuario |
| `src/pages/externo/MeusExames.tsx` | Usar client_id real do usuario |
| `src/pages/shared/MeuPerfil.tsx` | Exibir dados reais do perfil |
| `src/pages/shared/Calendario.tsx` | Trocar fonte de dados para hooks |

---

## Ordem de Execucao

1. Conectar Supabase ao projeto
2. Criar migrations (schema completo)
3. Inserir dados iniciais (seed)
4. Criar `AuthContext`, `Auth.tsx`, `ProtectedRoute`, `PendingApprovalModal`
5. Criar todos os hooks de dados
6. Atualizar `App.tsx` e `AppContext.tsx`
7. Atualizar sidebar
8. Atualizar cada pagina (uma por uma)
9. Criar pagina de Usuarios (admin)

