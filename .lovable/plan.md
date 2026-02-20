

## Melhorias na tela "Meus Exames" do Radiologista

### Resumo

Adicionar dialog de detalhes ao clicar no nome do paciente, com download do arquivo enviado pelo cliente externo (nao o laudo). Incluir indicador visual de exames urgentes.

### Alteracoes por arquivo

#### 1. `src/data/mockData.ts`

- Na funcao `makeExam`, adicionar campo `uploadedFile` simulando o arquivo enviado pelo usuario externo (ex: `exame_EX001.dcm` para todos os exames)
- Adicionar `urgent: true`, `urgentDate` e `urgentTime` em 2 exames "Em analise" (EX011 e EX013) para testar o indicador visual
- Adicionar `uploadedFile` na interface `Exam`

#### 2. `src/pages/radiologista/MeusExames.tsx`

**Dialog de detalhes (clique no nome do paciente):**
- Novo estado `detailId` para controlar o dialog
- Nome do paciente vira clicavel (cursor pointer, hover underline, cor primaria)
- Dialog exibe:
  - ID do exame, nome do paciente, data de nascimento
  - Cliente solicitante, tipo de exame, categoria
  - Software utilizado
  - Observacoes clinicas (ou "Nenhuma")
  - Historico de status com datas
  - Botao "Baixar Arquivo" para o arquivo enviado pelo cliente externo (simulado)

**Indicador de urgencia:**
- Badge vermelho pulsante com icone `AlertTriangle` e texto "URGENTE" nos cards de exames urgentes
- Se houver data/horario de urgencia, exibir "Prazo: dd/mm/aaaa as HH:MM"
- Exames urgentes ordenados primeiro nas listas

**Importacoes adicionais:** `AlertTriangle`, `Download`, `Eye`, `Calendar`

#### 3. `src/components/StatusBadge.tsx`

- Envolver com `React.forwardRef` para eliminar warning no console

### Layout do Dialog de detalhes

```text
+------------------------------------------+
| Detalhes do Exame                   [X]  |
| EX011 -- Bruno Martins                   |
|                                          |
| Paciente: Bruno Martins                  |
| Data Nasc.: 08/10/1970                   |
| Cliente: Centro de Imagem Dental         |
| Tipo: Tomografia (tomografia)            |
| Software: Morita                         |
| Data Criacao: 11/02/2026                 |
|                                          |
| Observacoes:                             |
| (texto ou "Nenhuma observacao")          |
|                                          |
| Historico de Status:                     |
| Disponivel  11/02/2026  Sistema          |
| Em analise  11/02/2026  Dr. Ricardo      |
|                                          |
| Arquivo do Cliente:                      |
| [Baixar Arquivo] exame_EX011.dcm         |
+------------------------------------------+
```

### Detalhes tecnicos

- O botao "Baixar Arquivo" simula o download (nao ha backend real)
- O campo `uploadedFile` representa o arquivo DICOM/imagem enviado pelo cliente externo, diferente do `files[]` que contem o laudo do radiologista
- Nenhuma nova dependencia necessaria
