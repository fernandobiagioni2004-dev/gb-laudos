
## Exibir finalidade, dentista e arquivo corretamente nos Meus Exames (Externo)

### Problema identificado

O formulario "Novo Exame" coleta os campos `dentistName` (nome do dentista), `purpose` (finalidade) e `examDate` (data do exame), mas esses dados nao sao salvos no objeto do exame. Alem disso, o nome do arquivo selecionado tambem nao e armazenado. Por fim, a tela de Meus Exames do usuario externo nao possui um dialog de detalhes ao clicar no card.

### Alteracoes necessarias

#### 1. Adicionar campos na interface `Exam` (`src/data/mockData.ts`)

- Adicionar `dentistName?: string` para o nome do dentista solicitante
- Adicionar `purpose?: string` para a finalidade do exame
- Adicionar `examDate?: string` para a data do exame
- Adicionar valores simulados nos exames mock existentes para que tenham dados visiveis

#### 2. Salvar os novos campos ao criar exame (`src/pages/externo/NovoExame.tsx`)

- No `handleSubmit`, incluir `dentistName`, `purpose` e `examDate` no objeto `newExam`
- Salvar `selectedFile?.name` no campo `uploadedFile` para que o nome do arquivo apareca

#### 3. Adicionar dialog de detalhes nos Meus Exames externo (`src/pages/externo/MeusExames.tsx`)

- Tornar o card inteiro clicavel (igual ao que foi feito no radiologista)
- Adicionar estado `detailId` para controlar qual exame esta aberto
- Criar um Dialog com as informacoes do exame:
  - Paciente, Data de Nascimento
  - Dentista Solicitante (novo campo)
  - Finalidade do Exame (novo campo)
  - Tipo de exame, Categoria, Software
  - Data de criacao (formato brasileiro)
  - Status atual
  - Urgencia (se aplicavel)
  - Observacoes
  - Historico de status
  - Arquivo enviado (com botao de download, se existir)
  - Laudo disponivel (botao de download para exames finalizados)
- O botao "Baixar Laudo" existente no card precisa de `e.stopPropagation()` para nao abrir o dialog ao ser clicado

#### 4. Dados mock para exames existentes

- Adicionar `dentistName` e `purpose` na funcao `makeExam` com valores padrao opcionais
- Adicionar valores de exemplo nos exames iniciais do cliente `c1` (OralMax) para que aparecam dados no dialog
