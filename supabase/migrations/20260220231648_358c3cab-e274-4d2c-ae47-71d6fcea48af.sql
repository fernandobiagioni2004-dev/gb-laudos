
-- Create private bucket for exam files
INSERT INTO storage.buckets (id, name, public)
VALUES ('exam-files', 'exam-files', false);

-- Admin full access
CREATE POLICY "Admin full access exam-files"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'exam-files'
  AND current_user_role() = 'admin'::user_role
)
WITH CHECK (
  bucket_id = 'exam-files'
  AND current_user_role() = 'admin'::user_role
);

-- Cliente can upload to their own client_id folder
CREATE POLICY "Cliente can upload exam files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'exam-files'
  AND current_user_role() = 'cliente'::user_role
  AND (storage.foldername(name))[1] = (
    SELECT cliente_id::text FROM public.app_users WHERE id = current_user_id()
  )
);

-- Cliente can read own files
CREATE POLICY "Cliente can read own exam files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'exam-files'
  AND current_user_role() = 'cliente'::user_role
  AND (storage.foldername(name))[1] = (
    SELECT cliente_id::text FROM public.app_users WHERE id = current_user_id()
  )
);

-- Radiologista can read files of exams assigned to them or available
CREATE POLICY "Radiologista can read exam files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'exam-files'
  AND current_user_role() = 'radiologista'::user_role
  AND EXISTS (
    SELECT 1 FROM public.exams
    WHERE arquivo_enviado = name
    AND (radiologista_id = current_user_id() OR status = 'Disponível'::exam_status)
  )
);
