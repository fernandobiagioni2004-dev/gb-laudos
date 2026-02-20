import { useMemo, useState } from 'react';
import { useExams } from '@/hooks/useExams';
import { useExamTypes } from '@/hooks/useExamTypes';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileText, Download, Calendar, User, Stethoscope, Clock, AlertTriangle, Paperclip } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

function formatDateBR(dateStr: string | null) {
  if (!dateStr) return '—';
  const d = dateStr.split('T')[0];
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'Disponível', label: 'Disponíveis' },
  { value: 'Em análise', label: 'Em análise' },
  { value: 'Finalizado', label: 'Finalizados' },
  { value: 'Cancelado', label: 'Cancelados' },
] as const;

export default function MeusExamesExterno() {
  const { data: exams = [] } = useExams();
  const { data: examTypes = [] } = useExamTypes();
  const { profile } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [detailId, setDetailId] = useState<number | null>(null);

  const myExams = useMemo(() => exams.filter(e => e.client_id === profile?.cliente_id), [exams, profile]);
  const filteredExams = useMemo(() => activeFilter === 'all' ? myExams : myExams.filter(e => e.status === activeFilter), [myExams, activeFilter]);
  const countByStatus = (status: string) => status === 'all' ? myExams.length : myExams.filter(e => e.status === status).length;

  const handleDownload = (examId: number) => {
    toast({ title: '📥 Download iniciado', description: `laudo_${examId}.pdf (simulado)` });
  };

  const detailExam = detailId ? myExams.find(e => e.id === detailId) : null;
  const detailExamType = detailExam ? examTypes.find(t => t.id === detailExam.exam_type_id) : null;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Meus Exames</h1><p className="text-sm text-muted-foreground">{filteredExams.length} exames encontrados</p></div>

      <Tabs value={activeFilter} onValueChange={setActiveFilter}>
        <TabsList className="flex-wrap h-auto gap-1">
          {STATUS_FILTERS.map(f => (<TabsTrigger key={f.value} value={f.value} className="text-xs">{f.label} ({countByStatus(f.value)})</TabsTrigger>))}
        </TabsList>
      </Tabs>

      {filteredExams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <FileText className="h-12 w-12 opacity-20" /><p className="text-base font-medium">Nenhum exame encontrado</p><p className="text-sm">Envie seu primeiro exame clicando em "Novo Exame"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExams.map(e => {
            const examType = examTypes.find(t => t.id === e.exam_type_id);
            return (
              <Card key={e.id} className="hover:border-border/80 transition-colors cursor-pointer" onClick={() => setDetailId(e.id)}>
                <CardContent className="flex items-center justify-between py-4 px-5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0"><FileText className="h-4 w-4 text-muted-foreground" /></div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2"><span className="font-mono text-xs text-primary">{e.id}</span><span className="font-medium">{e.paciente_nome}</span></div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5"><span>{examType?.nome}</span><span>·</span><span>{e.software}</span><span>·</span><span>{formatDateBR(e.criado_em)}</span></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={e.status as any} />
                    {e.status === 'Finalizado' && (
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={(ev) => { ev.stopPropagation(); handleDownload(e.id); }}><Download className="h-3.5 w-3.5" />Baixar Laudo</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!detailId} onOpenChange={open => !open && setDetailId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><span className="font-mono text-sm text-primary">{detailExam?.id}</span><span>{detailExam?.paciente_nome}</span></DialogTitle>
            <DialogDescription>Detalhes do exame</DialogDescription>
          </DialogHeader>
          {detailExam && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><p className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Paciente</p><p className="text-sm font-medium">{detailExam.paciente_nome}</p></div>
                <div className="space-y-1"><p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Data Nasc.</p><p className="text-sm font-medium">{formatDateBR(detailExam.paciente_data_nascimento)}</p></div>
                <div className="space-y-1"><p className="text-xs text-muted-foreground flex items-center gap-1"><Stethoscope className="h-3 w-3" /> Dentista</p><p className="text-sm font-medium">{detailExam.dentista_nome || '—'}</p></div>
                <div className="space-y-1"><p className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3" /> Finalidade</p><p className="text-sm font-medium">{detailExam.finalidade || '—'}</p></div>
              </div>
              <div className="border-t pt-3 grid grid-cols-2 gap-3">
                <div className="space-y-1"><p className="text-xs text-muted-foreground">Tipo</p><p className="text-sm font-medium">{detailExamType?.nome}</p></div>
                <div className="space-y-1"><p className="text-xs text-muted-foreground">Categoria</p><p className="text-sm font-medium capitalize">{detailExamType?.categoria}</p></div>
                <div className="space-y-1"><p className="text-xs text-muted-foreground">Software</p><p className="text-sm font-medium">{detailExam.software}</p></div>
                <div className="space-y-1"><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={detailExam.status as any} /></div>
              </div>
              {detailExam.urgente && (
                <div className="border-t pt-3 flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-amber-500" /><span className="font-medium">Urgente</span>{detailExam.urgente_data && <span className="text-muted-foreground">— Prazo: {formatDateBR(detailExam.urgente_data)}{detailExam.urgente_hora ? ` às ${detailExam.urgente_hora}` : ''}</span>}</div>
              )}
              {detailExam.observacoes && (<div className="border-t pt-3 space-y-1"><p className="text-xs text-muted-foreground">Observações</p><p className="text-sm">{detailExam.observacoes}</p></div>)}
              {detailExam.arquivo_enviado && (<div className="border-t pt-3 space-y-1"><p className="text-xs text-muted-foreground flex items-center gap-1"><Paperclip className="h-3 w-3" /> Arquivo</p><p className="text-sm font-medium">{detailExam.arquivo_enviado}</p></div>)}
              {detailExam.status === 'Finalizado' && (<div className="border-t pt-3"><Button className="w-full gap-2" onClick={() => handleDownload(detailExam.id)}><Download className="h-4 w-4" />Baixar Laudo</Button></div>)}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
