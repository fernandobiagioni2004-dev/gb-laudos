
-- Add missing columns needed by the UI

-- clients: softwares array
ALTER TABLE public.clients ADD COLUMN softwares text[] DEFAULT '{}';

-- exam_types: categoria
ALTER TABLE public.exam_types ADD COLUMN categoria text NOT NULL DEFAULT 'radiografia';

-- exams: additional fields used by UI
ALTER TABLE public.exams ADD COLUMN observacoes text DEFAULT '';
ALTER TABLE public.exams ADD COLUMN urgente boolean DEFAULT false;
ALTER TABLE public.exams ADD COLUMN urgente_data date;
ALTER TABLE public.exams ADD COLUMN urgente_hora text;
ALTER TABLE public.exams ADD COLUMN dentista_nome text;
ALTER TABLE public.exams ADD COLUMN finalidade text;
ALTER TABLE public.exams ADD COLUMN data_exame date;
ALTER TABLE public.exams ADD COLUMN arquivo_enviado text;
