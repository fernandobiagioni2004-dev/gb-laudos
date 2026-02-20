import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppProfile } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export function useAppUsers() {
  return useQuery({
    queryKey: ['app_users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('app_users').select('*').order('criado_em', { ascending: false });
      if (error) throw error;
      return data as unknown as AppProfile[];
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, nome, papel, cliente_id, softwares }: { userId: number; nome?: string; papel?: string; cliente_id?: number | null; softwares?: string[] | null }) => {
      const update: any = {};
      if (nome !== undefined) update.nome = nome;
      if (papel !== undefined) update.papel = papel;
      if (cliente_id !== undefined) update.cliente_id = cliente_id;
      if (softwares !== undefined) update.softwares = softwares;
      const { error } = await supabase.from('app_users').update(update).eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['app_users'] });
      qc.invalidateQueries({ queryKey: ['radiologists'] });
      toast({ title: '✅ Usuário atualizado!' });
    },
  });
}

/** @deprecated Use useUpdateUser instead */
export const useUpdateUserRole = useUpdateUser;
