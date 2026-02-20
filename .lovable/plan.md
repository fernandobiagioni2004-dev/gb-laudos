

## Adicionar campos "Nome do Dentista Solicitante" e "Data do Exame" em Dados do Paciente

### Arquivo: `src/pages/externo/NovoExame.tsx`

**1. Atualizar o estado do formulario (linha 24-34)**
- Adicionar `dentistName: ''` e `examDate: ''` ao estado inicial do formulario

**2. Adicionar os dois campos no card "Dados do Paciente" (linhas 118-137)**
- Abaixo do campo "Data de Nascimento", adicionar:
  - **Nome do Dentista Solicitante**: campo `Input` de texto com placeholder "Nome do dentista"
  - **Data do Exame**: campo `Input` tipo `date`
- Layout: os dois novos campos ficam lado a lado em grid de 2 colunas

**3. Atualizar o reset em `handleNew` (linha 82)**
- Incluir `dentistName: ''` e `examDate: ''` no reset do formulario

**4. Validacao (linha 44)**
- Tornar ambos os campos obrigatorios na validacao do `handleSubmit`

### Resultado visual do card "Dados do Paciente"

```text
+--------------------------------------+
| Dados do Paciente                    |
|                                      |
| Nome do Paciente *        (col-span) |
| Data de Nasc. *  | Dentista Solic. * |
| Data do Exame *  |                   |
+--------------------------------------+
```

### Detalhes tecnicos

- Nao requer novas dependencias
- Os campos serao adicionados apenas ao estado local do formulario (nao afetam a interface `Exam` por enquanto)
- O campo "Data do Exame" usara `<Input type="date">` para manter consistencia com os outros campos de data do formulario

