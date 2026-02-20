
-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.user_role AS ENUM ('admin','radiologista','cliente','nenhum');
CREATE TYPE public.exam_status AS ENUM ('Disponível','Em análise','Finalizado','Cancelado');
CREATE TYPE public.exam_software AS ENUM ('Axel','Morita');

-- =========================================================
-- USUÁRIOS (tabela de identidade/papéis separada de auth.users)
-- =========================================================
CREATE TABLE public.app_users (
  id bigserial PRIMARY KEY,
  auth_uid uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  email text UNIQUE,
  papel public.user_role NOT NULL DEFAULT 'nenhum',
  cliente_id int8 NULL,
  softwares text[] NULL,
  criado_em timestamptz DEFAULT now()
);

-- =========================================================
-- CLIENTES
-- =========================================================
CREATE TABLE public.clients (
  id bigserial PRIMARY KEY,
  nome text NOT NULL,
  cnpj text,
  telefone text,
  email text,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now()
);

-- FK de app_users.cliente_id para clients
ALTER TABLE public.app_users ADD CONSTRAINT fk_app_users_cliente FOREIGN KEY (cliente_id) REFERENCES public.clients(id) ON DELETE SET NULL;

-- =========================================================
-- TIPOS DE EXAME
-- =========================================================
CREATE TABLE public.exam_types (
  id bigserial PRIMARY KEY,
  nome text NOT NULL,
  criado_em timestamptz DEFAULT now()
);

-- =========================================================
-- TABELA DE PREÇO CLIENTE
-- =========================================================
CREATE TABLE public.price_table_clients (
  id bigserial PRIMARY KEY,
  client_id int8 REFERENCES public.clients(id) ON DELETE CASCADE,
  exam_type_id int8 REFERENCES public.exam_types(id) ON DELETE CASCADE,
  valor_cliente numeric(14,2) NOT NULL
);

-- =========================================================
-- TABELA DE PAGAMENTO RADIOLOGISTA
-- =========================================================
CREATE TABLE public.price_table_radiologist (
  id bigserial PRIMARY KEY,
  client_id int8 REFERENCES public.clients(id) ON DELETE CASCADE,
  exam_type_id int8 REFERENCES public.exam_types(id) ON DELETE CASCADE,
  radiologista_id int8 REFERENCES public.app_users(id) ON DELETE CASCADE,
  valor_radiologista numeric(14,2) NOT NULL
);

-- =========================================================
-- EXAMES
-- =========================================================
CREATE TABLE public.exams (
  id bigserial PRIMARY KEY,
  client_id int8 REFERENCES public.clients(id),
  exam_type_id int8 REFERENCES public.exam_types(id),
  radiologista_id int8 REFERENCES public.app_users(id),
  paciente_nome text NOT NULL,
  paciente_data_nascimento date,
  software public.exam_software NOT NULL,
  status public.exam_status NOT NULL DEFAULT 'Disponível',
  valor_cliente numeric(14,2),
  valor_radiologista numeric(14,2),
  margem numeric(14,2),
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

CREATE INDEX exams_client_idx ON public.exams(client_id);
CREATE INDEX exams_radiologista_idx ON public.exams(radiologista_id);
CREATE INDEX exams_status_idx ON public.exams(status);

-- =========================================================
-- CALENDÁRIO
-- =========================================================
CREATE TABLE public.meetings (
  id bigserial PRIMARY KEY,
  titulo text NOT NULL,
  descricao text,
  inicio timestamptz NOT NULL,
  fim timestamptz NOT NULL,
  criado_por int8 REFERENCES public.app_users(id),
  criado_em timestamptz DEFAULT now()
);

CREATE TABLE public.meeting_participants (
  id bigserial PRIMARY KEY,
  meeting_id int8 REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id int8 REFERENCES public.app_users(id) ON DELETE CASCADE
);

CREATE TABLE public.vacations (
  id bigserial PRIMARY KEY,
  user_id int8 REFERENCES public.app_users(id) ON DELETE CASCADE,
  data_inicio date NOT NULL,
  data_fim date NOT NULL,
  observacao text,
  criado_em timestamptz DEFAULT now()
);

-- =========================================================
-- FUNÇÕES UTILITÁRIAS (security definer para evitar recursão RLS)
-- =========================================================
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS bigint
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.app_users WHERE auth_uid = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT papel FROM public.app_users WHERE auth_uid = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.current_identity()
RETURNS TABLE (user_id bigint, role public.user_role)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, papel FROM public.app_users WHERE auth_uid = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.init_current_user(p_nome text, p_email text)
RETURNS public.app_users
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_user public.app_users;
BEGIN
  INSERT INTO public.app_users(auth_uid, nome, email, papel)
  VALUES(auth.uid(), p_nome, p_email, 'nenhum')
  ON CONFLICT(auth_uid) DO UPDATE
  SET nome = EXCLUDED.nome, email = EXCLUDED.email
  RETURNING * INTO v_user;
  RETURN v_user;
END;
$$;

-- =========================================================
-- Trigger para atualizar atualizado_em em exams
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_exams_updated_at
BEFORE UPDATE ON public.exams
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- RLS
-- =========================================================

-- app_users
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
ON public.app_users FOR SELECT
TO authenticated
USING (auth_uid = auth.uid() OR public.current_user_role() = 'admin');

CREATE POLICY "Only admin can update users"
ON public.app_users FOR UPDATE
TO authenticated
USING (public.current_user_role() = 'admin');

CREATE POLICY "Init own user on insert"
ON public.app_users FOR INSERT
TO authenticated
WITH CHECK (auth_uid = auth.uid());

-- clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access clients"
ON public.clients FOR ALL
TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Cliente can read own client"
ON public.clients FOR SELECT
TO authenticated
USING (
  public.current_user_role() = 'cliente'
  AND id = (SELECT cliente_id FROM public.app_users WHERE id = public.current_user_id())
);

CREATE POLICY "Radiologista can read clients"
ON public.clients FOR SELECT
TO authenticated
USING (public.current_user_role() = 'radiologista');

-- exam_types
ALTER TABLE public.exam_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read exam types"
ON public.exam_types FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin can manage exam types"
ON public.exam_types FOR ALL
TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

-- price_table_clients
ALTER TABLE public.price_table_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access price clients"
ON public.price_table_clients FOR ALL
TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

-- price_table_radiologist
ALTER TABLE public.price_table_radiologist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access price radiologist"
ON public.price_table_radiologist FOR ALL
TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Radiologista can read own prices"
ON public.price_table_radiologist FOR SELECT
TO authenticated
USING (
  public.current_user_role() = 'radiologista'
  AND radiologista_id = public.current_user_id()
);

-- exams
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access exams"
ON public.exams FOR ALL
TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (true);

CREATE POLICY "Radiologista see own and available exams"
ON public.exams FOR SELECT
TO authenticated
USING (
  public.current_user_role() = 'radiologista'
  AND (
    radiologista_id = public.current_user_id()
    OR status = 'Disponível'
  )
);

CREATE POLICY "Radiologista can update own exams"
ON public.exams FOR UPDATE
TO authenticated
USING (
  public.current_user_role() = 'radiologista'
  AND (
    radiologista_id = public.current_user_id()
    OR (status = 'Disponível' AND radiologista_id IS NULL)
  )
);

CREATE POLICY "Cliente see own exams"
ON public.exams FOR SELECT
TO authenticated
USING (
  public.current_user_role() = 'cliente'
  AND client_id = (SELECT cliente_id FROM public.app_users WHERE id = public.current_user_id())
);

CREATE POLICY "Cliente can insert exams"
ON public.exams FOR INSERT
TO authenticated
WITH CHECK (
  public.current_user_role() = 'cliente'
  AND client_id = (SELECT cliente_id FROM public.app_users WHERE id = public.current_user_id())
);

-- meetings
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access meetings"
ON public.meetings FOR ALL
TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Radiologista see own meetings"
ON public.meetings FOR SELECT
TO authenticated
USING (
  public.current_user_role() = 'radiologista'
  AND EXISTS(
    SELECT 1 FROM public.meeting_participants mp
    WHERE mp.meeting_id = meetings.id
    AND mp.user_id = public.current_user_id()
  )
);

-- meeting_participants
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access meeting participants"
ON public.meeting_participants FOR ALL
TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Radiologista see own participations"
ON public.meeting_participants FOR SELECT
TO authenticated
USING (user_id = public.current_user_id());

-- vacations
ALTER TABLE public.vacations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access vacations"
ON public.vacations FOR ALL
TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Radiologista can read all vacations"
ON public.vacations FOR SELECT
TO authenticated
USING (public.current_user_role() IN ('admin', 'radiologista'));
