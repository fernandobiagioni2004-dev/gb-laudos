

## Adicionar nome do dentista e finalidade no dialog de detalhes - Meus Exames (Radiologista)

### Resumo

O dialog de detalhes do exame na tela do radiologista ja exibe paciente, cliente, tipo, software, etc., mas faltam os campos **Dentista Solicitante** e **Finalidade do Exame**. Esses campos ja existem na interface `Exam` (adicionados anteriormente), so precisam ser exibidos.

### Alteracao em `src/pages/radiologista/MeusExames.tsx`

#### 1. Adicionar campos no dialog de detalhes (linhas 170-196)

Inserir dois novos campos no grid de informacoes, logo apos "Paciente" e "Data Nasc.":

- **Dentista Solicitante** (`detailExam.dentistName`) - exibe o nome do dentista ou "Nao informado"
- **Finalidade** (`detailExam.purpose`) - exibe a finalidade do exame ou "Nao informada"

#### 2. Adicionar nome do paciente nos cards (ja presente)

O nome do paciente ja aparece nos cards via `PatientNameLink`. Nenhuma alteracao necessaria nesse ponto.

### Posicionamento no dialog

```text
+------------------------------------------+
| Detalhes do Exame                  [X]   |
| EX001 - Joao Silva                      |
|                                          |
| Paciente         | Data Nasc.            |
| Joao Silva       | 01/01/1990            |
| Dentista         | Finalidade            |  <-- NOVO
| Dr. Carlos       | Implante              |  <-- NOVO
| Cliente          | Tipo                  |
| OralMax          | Panoramica (2D)       |
| Software         | Data Criacao          |
| Axel             | 01/02/2026            |
|                                          |
| Observacoes                              |
| ...                                      |
+------------------------------------------+
```

### Detalhes tecnicos

- Apenas uma alteracao no arquivo `src/pages/radiologista/MeusExames.tsx`
- Campos opcionais com fallback "Nao informado"
- Nenhuma dependencia nova
