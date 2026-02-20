import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DbExamType {
  id: number;
  nome: string;
  categoria: string;
  criado_em: string | null;
}

export function useExamTypes() {
  return useQuery({
    queryKey: ['exam_types'],
    queryFn: async () => {
      const { data, error } = await supabase.from('exam_types').select('*').order('id');
      if (error) throw error;
      return data as unknown as DbExamType[];
    },
  });
}
