

# Implementar Upload e Download Real de Arquivos

## Problema
O upload e download de arquivos do exame sao totalmente simulados. O formulario de novo exame salva apenas o nome do arquivo no banco de dados, sem fazer upload real. O botao de download no perfil do radiologista apenas exibe uma mensagem "Download simulado".

## Solucao
Criar um bucket de storage, implementar o upload real no formulario de novo exame e o download real na tela do radiologista.

## Detalhes Tecnicos

### 1. Criar bucket de storage (migracao SQL)
- Criar bucket `exam-files` (privado)
- Criar politicas RLS no `storage.objects`:
  - Cliente pode fazer upload em pastas do proprio `client_id`
  - Radiologista pode ler arquivos de exames que estao atribuidos a ele ou disponiveis
  - Admin tem acesso total

### 2. Alterar `src/pages/externo/NovoExame.tsx`
- Apos criar o exame, fazer upload do arquivo para o bucket `exam-files` usando o path `{client_id}/{exam_id}/{filename}`
- Atualizar o campo `arquivo_enviado` com o path completo no storage (nao apenas o nome)
- Mostrar progresso/estado do upload

### 3. Alterar `src/pages/radiologista/MeusExames.tsx`
- Substituir `handleDownloadFile` por logica real:
  - Gerar URL assinada via `supabase.storage.from('exam-files').createSignedUrl(path, 60)`
  - Abrir a URL em nova aba para download
- Tambem atualizar a pagina de exames do admin (`src/pages/admin/Exames.tsx`) se houver botao de download

### 4. Alterar `src/hooks/useExams.ts`
- Na mutacao `useCreateExam`, aceitar o arquivo (`File`) como parametro opcional
- Fazer o upload do arquivo apos inserir o exame no banco
- Atualizar o registro do exame com o path real do arquivo

### Fluxo resultante
1. Cliente preenche formulario e seleciona arquivo ZIP
2. Ao enviar, o exame e criado no banco e o arquivo e enviado ao storage
3. O campo `arquivo_enviado` armazena o caminho real no storage (ex: `1/42/exame.zip`)
4. Radiologista clica em "Baixar Arquivo" e recebe uma URL assinada que inicia o download

