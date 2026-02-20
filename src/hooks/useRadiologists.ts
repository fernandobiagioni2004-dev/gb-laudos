import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppProfile } from '@/context/AuthContext';

export function useRadiologists() {
  return useQuery({
    queryKey: ['radiologists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('papel', 'radiologista')
        .order('nome');
      if (error) throw error;
      return data as unknown as AppProfile[];
    },
  });
}
