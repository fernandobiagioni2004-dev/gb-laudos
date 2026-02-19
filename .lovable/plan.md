

## Permitir multiplos softwares por cliente + badges estilizados

### Resumo

Alterar o campo `software` do cliente de um valor unico (`Software`) para um array (`Software[]`), igual ao que ja existe para radiologistas. Tambem aplicar o mesmo estilo visual de badges com icone de monitor usado na aba Radiologistas.

### Alteracoes por arquivo

#### 1. `src/data/mockData.ts`

- Mudar `Client.software` de `Software` para `Software[]`
- Atualizar dados mock: ex. `c1: ['Axel']`, `c2: ['Axel', 'Morita']`, `c3: ['Morita']`

#### 2. `src/pages/admin/Clientes.tsx`

**Badges no card** (substituir o `Badge` simples):
- Usar o mesmo estilo da aba Radiologistas: badges coloridos com icone `Monitor`
  - Axel: `bg-violet-500/15 text-violet-400`
  - Morita: `bg-sky-500/15 text-sky-400`
- Renderizar um badge para cada software do array

**Formulario de criar/editar**:
- Substituir o `Select` unico de software por checkboxes ou botoes toggle para selecionar multiplos softwares
- O estado `form.software` passa de `string` para `Software[]`
- Validacao: pelo menos um software deve estar selecionado

**Dialog de detalhes**:
- Exibir os softwares separados por virgula ou como badges

#### 3. `src/pages/externo/NovoExame.tsx`

- Ajustar a referencia a `simClient?.software` -- como agora e um array, usar o primeiro software do array como padrao (`simClient?.software[0]`) ou permitir selecao caso o cliente tenha mais de um

#### 4. `src/context/AppContext.tsx`

- Nenhuma alteracao necessaria na logica (ja aceita `Client` generico), mas a tipagem se atualiza automaticamente com a mudanca na interface
