import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface DbExam {
  id: number;
  client_id: number | null;
  exam_type_id: number | null;
  radiologista_id: number | null;
  paciente_nome: string;
  paciente_data_nascimento: string | null;
  software: string;
  status: string;
  valor_cliente: number | null;
  valor_radiologista: number | null;
  margem: number | null;
  criado_em: string | null;
  atualizado_em: string | null;
  observacoes: string | null;
  urgente: boolean | null;
  urgente_data: string | null;
  urgente_hora: string | null;
  dentista_nome: string | null;
  finalidade: string | null;
  data_exame: string | null;
  arquivo_enviado: string | null;
}

export function useExams() {
  return useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const { data, error } = await supabase.from('exams').select('*').order('criado_em', { ascending: false });
      if (error) throw error;
      return data as unknown as DbExam[];
    },
  });
}

export function useCreateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ exam, file }: { exam: Partial<DbExam>; file?: File | null }) => {
      // Fetch client value
      if (exam.client_id && exam.exam_type_id) {
        const { data: priceData } = await supabase
          .from('price_table_clients')
          .select('valor_cliente')
          .eq('client_id', exam.client_id)
          .eq('exam_type_id', exam.exam_type_id)
          .single();
        if (priceData) {
          exam.valor_cliente = (priceData as any).valor_cliente;
          exam.margem = exam.valor_cliente;
        }
      }
      const { data, error } = await supabase.from('exams').insert(exam as any).select().single();
      if (error) throw error;

      // Upload file to storage if provided
      if (file && data) {
        const examData = data as unknown as DbExam;
        const filePath = `${exam.client_id}/${examData.id}/${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('exam-files')
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        // Update exam record with the real file path
        await supabase.from('exams').update({ arquivo_enviado: filePath } as any).eq('id', examData.id);
      }

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exams'] });
      toast({ title: '✅ Exame criado!' });
    },
  });
}

export function useAssumeExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ examId, radiologistaId }: { examId: number; radiologistaId: number }) => {
      // Get exam to find client_id and exam_type_id
      const { data: exam } = await supabase.from('exams').select('*').eq('id', examId).single();
      if (!exam) throw new Error('Exame não encontrado');
      const e = exam as unknown as DbExam;

      // Get radiologist price
      let valorRad = 0;
      const { data: priceData } = await supabase
        .from('price_table_radiologist')
        .select('valor_radiologista')
        .eq('client_id', e.client_id!)
        .eq('exam_type_id', e.exam_type_id!)
        .eq('radiologista_id', radiologistaId)
        .single();
      if (priceData) {
        valorRad = (priceData as any).valor_radiologista;
      }

      const margem = (e.valor_cliente ?? 0) - valorRad;
      const { error } = await supabase.from('exams').update({
        radiologista_id: radiologistaId,
        status: 'Em análise',
        valor_radiologista: valorRad,
        margem,
      } as any).eq('id', examId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exams'] });
      toast({ title: '✅ Exame assumido!' });
    },
  });
}

export function useFinalizeExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (examId: number) => {
      const { error } = await supabase.from('exams').update({ status: 'Finalizado' } as any).eq('id', examId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exams'] });
      toast({ title: '🎉 Exame finalizado!' });
    },
  });
}

export function useCancelExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (examId: number) => {
      const { error } = await supabase.from('exams').update({ status: 'Cancelado' } as any).eq('id', examId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exams'] });
      toast({ title: 'Exame cancelado', variant: 'destructive' });
    },
  });
}

export function useUpdateExamRadiologist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ examId, radiologistaId }: { examId: number; radiologistaId: number }) => {
      // Get exam details
      const { data: exam } = await supabase.from('exams').select('*').eq('id', examId).single();
      if (!exam) throw new Error('Exame não encontrado');
      const e = exam as unknown as DbExam;

      let valorRad = 0;
      const { data: priceData } = await supabase
        .from('price_table_radiologist')
        .select('valor_radiologista')
        .eq('client_id', e.client_id!)
        .eq('exam_type_id', e.exam_type_id!)
        .eq('radiologista_id', radiologistaId)
        .single();
      if (priceData) valorRad = (priceData as any).valor_radiologista;

      const margem = (e.valor_cliente ?? 0) - valorRad;
      const { error } = await supabase.from('exams').update({
        radiologista_id: radiologistaId,
        valor_radiologista: valorRad,
        margem,
      } as any).eq('id', examId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exams'] });
      toast({ title: 'Radiologista atribuído' });
    },
  });
}
