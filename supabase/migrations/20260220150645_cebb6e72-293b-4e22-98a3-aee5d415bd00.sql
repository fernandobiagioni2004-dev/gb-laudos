
-- Fix permissive WITH CHECK on admin exams policy
DROP POLICY "Admin full access exams" ON public.exams;
CREATE POLICY "Admin full access exams"
ON public.exams FOR ALL
TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');
