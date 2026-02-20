
-- Rename enum values: Axel -> iDixel, Morita -> OnDemand
ALTER TYPE public.exam_software RENAME VALUE 'Axel' TO 'iDixel';
ALTER TYPE public.exam_software RENAME VALUE 'Morita' TO 'OnDemand';

-- Update array values in clients.softwares
UPDATE public.clients SET softwares = array_replace(softwares, 'Axel', 'iDixel');
UPDATE public.clients SET softwares = array_replace(softwares, 'Morita', 'OnDemand');

-- Update array values in app_users.softwares
UPDATE public.app_users SET softwares = array_replace(softwares, 'Axel', 'iDixel');
UPDATE public.app_users SET softwares = array_replace(softwares, 'Morita', 'OnDemand');
