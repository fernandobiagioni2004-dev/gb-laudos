

# Renomear Softwares: Axel -> iDixel, Morita -> OnDemand

## O que muda para voce
Os nomes dos softwares em todo o sistema serao atualizados:
- **Axel** passa a se chamar **iDixel**
- **Morita** passa a se chamar **OnDemand**

Isso afeta todas as telas: cadastro de clientes, exames disponiveis, gestao de usuarios, radiologistas e listagem de exames.

## Detalhes Tecnicos

### 1. Migracao no banco de dados
Renomear os valores do enum `exam_software`:
- `Axel` -> `iDixel`
- `Morita` -> `OnDemand`

Tambem atualizar os dados existentes nas tabelas `exams`, `clients` e `app_users` que referenciam os nomes antigos.

### 2. Arquivos a alterar no codigo (8 arquivos)

| Arquivo | Alteracao |
|---------|-----------|
| `src/data/mockData.ts` | Tipo `Software`: `'Axel' \| 'Morita'` -> `'iDixel' \| 'OnDemand'` |
| `src/pages/admin/Usuarios.tsx` | Array `softwareOptions`: `['Morita', 'Axel']` -> `['OnDemand', 'iDixel']` |
| `src/pages/admin/Clientes.tsx` | Tipo `Software`, labels, cores e checkboxes |
| `src/pages/admin/Radiologistas.tsx` | Condicional de cor do badge |
| `src/pages/admin/Exames.tsx` | Condicional de cor do badge |
| `src/pages/radiologista/ExamesDisponiveis.tsx` | Filtros do ToggleGroup e badges |
| `src/pages/externo/NovoExame.tsx` | Fallback default `'Axel'` -> `'iDixel'` |

Nota: o arquivo `src/integrations/supabase/types.ts` sera atualizado automaticamente apos a migracao do banco.

### 3. Logica de cores mantida
- **iDixel** (antigo Axel): violeta (`bg-violet-500/15 text-violet-600`)
- **OnDemand** (antigo Morita): azul (`bg-sky-500/15 text-sky-600`)

