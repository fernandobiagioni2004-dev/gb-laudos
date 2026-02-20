import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface DbMeeting {
  id: number;
  titulo: string;
  descricao: string | null;
  inicio: string;
  fim: string;
  criado_por: number | null;
  criado_em: string | null;
}

export interface DbMeetingParticipant {
  id: number;
  meeting_id: number | null;
  user_id: number | null;
}

export interface DbVacation {
  id: number;
  user_id: number | null;
  data_inicio: string;
  data_fim: string;
  observacao: string | null;
  criado_em: string | null;
}

export function useMeetings() {
  return useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('meetings').select('*').order('inicio');
      if (error) throw error;
      return data as unknown as DbMeeting[];
    },
  });
}

export function useMeetingParticipants() {
  return useQuery({
    queryKey: ['meeting_participants'],
    queryFn: async () => {
      const { data, error } = await supabase.from('meeting_participants').select('*');
      if (error) throw error;
      return data as unknown as DbMeetingParticipant[];
    },
  });
}

export function useVacations() {
  return useQuery({
    queryKey: ['vacations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vacations').select('*').order('data_inicio');
      if (error) throw error;
      return data as unknown as DbVacation[];
    },
  });
}

export function useCreateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ meeting, participantIds }: { meeting: Omit<DbMeeting, 'id' | 'criado_em'>; participantIds: number[] }) => {
      const { data, error } = await supabase.from('meetings').insert(meeting as any).select().single();
      if (error) throw error;
      const meetingId = (data as any).id;
      if (participantIds.length > 0) {
        const participants = participantIds.map(uid => ({ meeting_id: meetingId, user_id: uid }));
        await supabase.from('meeting_participants').insert(participants as any);
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meetings'] });
      qc.invalidateQueries({ queryKey: ['meeting_participants'] });
      toast({ title: '📅 Reunião criada!' });
    },
  });
}

export function useUpdateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, meeting, participantIds }: { id: number; meeting: Partial<DbMeeting>; participantIds: number[] }) => {
      const { error } = await supabase.from('meetings').update(meeting as any).eq('id', id);
      if (error) throw error;
      // Replace participants
      await supabase.from('meeting_participants').delete().eq('meeting_id', id);
      if (participantIds.length > 0) {
        const participants = participantIds.map(uid => ({ meeting_id: id, user_id: uid }));
        await supabase.from('meeting_participants').insert(participants as any);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meetings'] });
      qc.invalidateQueries({ queryKey: ['meeting_participants'] });
      toast({ title: '✏️ Reunião atualizada!' });
    },
  });
}

export function useDeleteMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('meetings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meetings'] });
      qc.invalidateQueries({ queryKey: ['meeting_participants'] });
      toast({ title: 'Reunião removida' });
    },
  });
}

export function useCreateVacation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vacation: Omit<DbVacation, 'id' | 'criado_em'>) => {
      const { data, error } = await supabase.from('vacations').insert(vacation as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vacations'] });
      toast({ title: '🏖️ Férias adicionadas!' });
    },
  });
}

export function useUpdateVacation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: Partial<DbVacation> & { id: number }) => {
      const { error } = await supabase.from('vacations').update(rest as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vacations'] });
      toast({ title: '✏️ Férias atualizadas!' });
    },
  });
}

export function useDeleteVacation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('vacations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vacations'] });
      toast({ title: 'Férias removidas' });
    },
  });
}
