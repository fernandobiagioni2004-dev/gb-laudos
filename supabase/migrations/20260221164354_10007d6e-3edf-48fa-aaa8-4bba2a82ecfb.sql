CREATE POLICY "Admin can delete users"
ON public.app_users
FOR DELETE
USING (current_user_role() = 'admin'::user_role);