import { useMemo, useState } from 'react';
import { useExams, useFinalizeExam, DbExam } from '@/hooks/useExams';
import { useSupabaseClients } from '@/hooks/useSupabaseClients';
import { useExamTypes } from '@/hooks/useExamTypes';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/StatusBadge';
import { DeadlineBadge } from '@/components/DeadlineBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileText, Upload, AlertTriangle, Download } from 'lucide-react';
import { toast } from 'sonner';

function formatDateBR(dateStr: string | null) {
  if (!dateStr) return '—';
  const d = dateStr.split('T')[0];
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export default function MeusExamesRadiologista() {
  const { data: exams = [] } = useExams();
  const { data: clients = [] } = useSupabaseClients();
  const { data: examTypes = [] } = useExamTypes();
  const { profile, userId } = useAuth();
  const finalizeExamMut = useFinalizeExam();

  const [finalizeId, setFinalizeId] = useState<number | null>(null);
  const [uploadDone, setUploadDone] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const myExams = useMemo(() => exams.filter(e => e.radiologista_id === userId), [exams, userId]);
  const sortUrgentFirst = (list: DbExam[]) => [...list].sort((a, b) => (b.urgente ? 1 : 0) - (a.urgente ? 1 : 0));
  const inProgress = sortUrgentFirst(myExams.filter(e => e.status === 'Em análise'));
  const finished = sortUrgentFirst(myExams.filter(e => e.status === 'Finalizado'));

  const finalizeExamItem = finalizeId ? exams.find(e => e.id === finalizeId) : null;
  const detailExam = detailId ? exams.find(e => e.id === detailId) : null;

  const handleFinalize = () => {
    if (finalizeId) { finalizeExamMut.mutate(finalizeId); setFinalizeId(null); setUploadDone(false); }
  };

  const handleDownloadFile = (fileName: string) => { toast.success(`Download simulado: ${fileName}`); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meus Exames</h1>
        <p className="text-sm text-muted-foreground">{profile?.nome}</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Em Análise ({inProgress.length})</h2>
        {inProgress.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2 border border-dashed border-border rounded-lg">
            <FileText className="h-8 w-8 opacity-20" /><p className="text-sm">Nenhum exame em análise</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {inProgress.map(e => {
              const client = clients.find(c => c.id === e.client_id);
              const examType = examTypes.find(t => t.id === e.exam_type_id);
              return (
                <Card key={e.id} className={`transition-all cursor-pointer ${e.urgente ? 'border-red-500/40 hover:border-red-500/60' : 'border-amber-500/20 hover:border-amber-500/40'}`} onClick={() => setDetailId(e.id)}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-primary">{e.id}</span>
                          {e.urgente && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-600 border border-red-500/40 animate-pulse"><AlertTriangle className="h-3 w-3" />Urgente</span>}
                        </div>
                        <span className="font-semibold">{e.paciente_nome}</span>
                        <p className="text-xs text-muted-foreground">{client?.nome} · {examType?.nome}</p>
                      </div>
                      <StatusBadge status={e.status as any} />
                    </div>
                    <DeadlineBadge createdAt={e.criado_em?.split('T')[0] ?? ''} urgent={e.urgente ?? false} urgentDate={e.urgente_data ?? undefined} urgentTime={e.urgente_hora ?? undefined} />
                    <p className="text-xs text-muted-foreground">{e.software} · {formatDateBR(e.criado_em)}</p>
                    <Button size="sm" className="w-full gap-2" onClick={(ev) => { ev.stopPropagation(); setFinalizeId(e.id); }}><Upload className="h-3.5 w-3.5" />Finalizar Laudo</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Finalizados ({finished.length})</h2>
        {finished.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2 border border-dashed border-border rounded-lg"><p className="text-sm">Nenhum exame finalizado ainda</p></div>
        ) : (
          <div className="space-y-2">
            {finished.map(e => {
              const client = clients.find(c => c.id === e.client_id);
              const examType = examTypes.find(t => t.id === e.exam_type_id);
              return (
                <Card key={e.id} className="cursor-pointer transition-all hover:border-primary/30" onClick={() => setDetailId(e.id)}>
                  <CardContent className="flex items-center justify-between py-3 px-5">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-primary">{e.id}</span>
                      <span className="font-semibold">{e.paciente_nome}</span>
                      <span className="text-sm text-muted-foreground">{client?.nome}</span>
                      <span className="text-sm text-muted-foreground">{examType?.nome}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{formatDateBR(e.criado_em)}</span>
                      <StatusBadge status={e.status as any} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Exame</DialogTitle>
            <DialogDescription>{detailExam?.id} — {detailExam?.paciente_nome}</DialogDescription>
          </DialogHeader>
          {detailExam && (() => {
            const client = clients.find(c => c.id === detailExam.client_id);
            const examType = examTypes.find(t => t.id === detailExam.exam_type_id);
            return (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  <div><p className="text-muted-foreground text-xs">Paciente</p><p className="font-medium">{detailExam.paciente_nome}</p></div>
                  <div><p className="text-muted-foreground text-xs">Data Nasc.</p><p className="font-medium">{formatDateBR(detailExam.paciente_data_nascimento)}</p></div>
                  <div><p className="text-muted-foreground text-xs">Dentista</p><p className="font-medium">{detailExam.dentista_nome || 'Não informado'}</p></div>
                  <div><p className="text-muted-foreground text-xs">Finalidade</p><p className="font-medium">{detailExam.finalidade || 'Não informada'}</p></div>
                  <div><p className="text-muted-foreground text-xs">Cliente</p><p className="font-medium">{client?.nome}</p></div>
                  <div><p className="text-muted-foreground text-xs">Tipo</p><p className="font-medium">{examType?.nome} ({examType?.categoria})</p></div>
                  <div><p className="text-muted-foreground text-xs">Software</p><p className="font-medium">{detailExam.software}</p></div>
                  <div><p className="text-muted-foreground text-xs">Data Criação</p><p className="font-medium">{formatDateBR(detailExam.criado_em)}</p></div>
                </div>
                {(detailExam.status === 'Disponível' || detailExam.status === 'Em análise') && (
                  <div><p className="text-muted-foreground text-xs mb-1">Prazo do Laudo</p><DeadlineBadge createdAt={detailExam.criado_em?.split('T')[0] ?? ''} urgent={detailExam.urgente ?? false} urgentDate={detailExam.urgente_data ?? undefined} urgentTime={detailExam.urgente_hora ?? undefined} /></div>
                )}
                <div><p className="text-muted-foreground text-xs mb-1">Observações</p><p className="text-sm">{detailExam.observacoes || 'Nenhuma observação'}</p></div>
                {detailExam.arquivo_enviado && (
                  <div><p className="text-muted-foreground text-xs mb-2">Arquivo do Cliente</p>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handleDownloadFile(detailExam.arquivo_enviado!)}><Download className="h-3.5 w-3.5" />Baixar Arquivo</Button>
                    <span className="text-xs text-muted-foreground ml-2">{detailExam.arquivo_enviado}</span>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Finalize Dialog */}
      <Dialog open={!!finalizeId} onOpenChange={() => { setFinalizeId(null); setUploadDone(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Exame</DialogTitle>
            <DialogDescription>{finalizeExamItem?.id} — {finalizeExamItem?.paciente_nome}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${uploadDone ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border hover:border-primary/50'}`} onClick={() => setUploadDone(true)}>
              {uploadDone ? (
                <div className="text-emerald-600"><FileText className="h-8 w-8 mx-auto mb-2" /><p className="text-sm font-medium">laudo_{finalizeId}.pdf — Pronto</p></div>
              ) : (
                <div className="text-muted-foreground"><Upload className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-sm">Clique para fazer upload do laudo (simulado)</p></div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setFinalizeId(null); setUploadDone(false); }}>Cancelar</Button>
              <Button onClick={handleFinalize} disabled={!uploadDone}>Confirmar Finalização</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
