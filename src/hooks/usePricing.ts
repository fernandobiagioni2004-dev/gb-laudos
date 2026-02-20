import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface DbPriceClient {
  id: number;
  client_id: number | null;
  exam_type_id: number | null;
  valor_cliente: number;
}

export interface DbPriceRadiologist {
  id: number;
  client_id: number | null;
  exam_type_id: number | null;
  radiologista_id: number | null;
  valor_radiologista: number;
}

export function usePricingClients() {
  return useQuery({
    queryKey: ['price_table_clients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('price_table_clients').select('*');
      if (error) throw error;
      return data as unknown as DbPriceClient[];
    },
  });
}

export function usePricingRadiologist() {
  return useQuery({
    queryKey: ['price_table_radiologist'],
    queryFn: async () => {
      const { data, error } = await supabase.from('price_table_radiologist').select('*');
      if (error) throw error;
      return data as unknown as DbPriceRadiologist[];
    },
  });
}

export function useUpsertPriceClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: { client_id: number; exam_type_id: number; valor_cliente: number }) => {
      // Check if exists
      const { data: existing } = await supabase
        .from('price_table_clients')
        .select('id')
        .eq('client_id', entry.client_id)
        .eq('exam_type_id', entry.exam_type_id)
        .single();
      
      if (existing) {
        const { error } = await supabase.from('price_table_clients')
          .update({ valor_cliente: entry.valor_cliente } as any)
          .eq('id', (existing as any).id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('price_table_clients').insert(entry as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['price_table_clients'] });
    },
  });
}

export function useUpsertPriceRadiologist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: { client_id: number; exam_type_id: number; radiologista_id: number; valor_radiologista: number }) => {
      const { data: existing } = await supabase
        .from('price_table_radiologist')
        .select('id')
        .eq('client_id', entry.client_id)
        .eq('exam_type_id', entry.exam_type_id)
        .eq('radiologista_id', entry.radiologista_id)
        .single();
      
      if (existing) {
        const { error } = await supabase.from('price_table_radiologist')
          .update({ valor_radiologista: entry.valor_radiologista } as any)
          .eq('id', (existing as any).id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('price_table_radiologist').insert(entry as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['price_table_radiologist'] });
    },
  });
}
