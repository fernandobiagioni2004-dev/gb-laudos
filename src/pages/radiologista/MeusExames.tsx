import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { clients, radiologists, examTypes } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { DeadlineBadge } from '@/components/DeadlineBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileText, Upload, AlertTriangle, Download } from 'lucide-react';
import { toast } from 'sonner';

const SIMULATED_RADIOLOGIST = radiologists[0];

export default function MeusExamesRadiologista() {
  const { exams, finalizeExam } = useApp();
  const [finalizeId, setFinalizeId] = useState<string | null>(null);
  const [uploadDone, setUploadDone] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const myExams = useMemo(() =>
    exams.filter(e => e.radiologistId === SIMULATED_RADIOLOGIST.id),
    [exams]
  );

  const sortUrgentFirst = (list: typeof myExams) =>
    [...list].sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));

  const inProgress = sortUrgentFirst(myExams.filter(e => e.status === 'Em análise'));
  const finished = sortUrgentFirst(myExams.filter(e => e.status === 'Finalizado'));

  const finalizeExamItem = finalizeId ? exams.find(e => e.id === finalizeId) : null;
  const detailExam = detailId ? exams.find(e => e.id === detailId) : null;

  const handleFinalize = () => {
    if (finalizeId) {
      finalizeExam(finalizeId);
      setFinalizeId(null);
      setUploadDone(false);
    }
  };

  const handleDownloadFile = (fileName: string) => {
    toast.success(`Download simulado: ${fileName}`);
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const PatientNameLink = ({ name }: { name: string }) => (
    <span className="font-semibold">{name}</span>
  );

  const UrgentBadge = ({ exam }: { exam: typeof detailExam }) => {
    if (!exam?.urgent) return null;
    return (
      <div className="space-y-0.5">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
          <AlertTriangle className="h-3 w-3" />
          Urgente
        </span>
        {exam.urgentDate && (
          <p className="text-[10px] text-red-400/80">
            Prazo: {formatDate(exam.urgentDate)}{exam.urgentTime ? ` às ${exam.urgentTime}` : ''}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meus Exames</h1>
        <p className="text-sm text-muted-foreground">{SIMULATED_RADIOLOGIST.name}</p>
      </div>

      {/* In progress */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Em Análise ({inProgress.length})</h2>
        {inProgress.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2 border border-dashed border-border rounded-lg">
            <FileText className="h-8 w-8 opacity-20" />
            <p className="text-sm">Nenhum exame em análise</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {inProgress.map(e => {
              const client = clients.find(c => c.id === e.clientId);
              const examType = examTypes.find(t => t.id === e.examTypeId);
              return (
                <Card key={e.id} className={`transition-all cursor-pointer ${e.urgent ? 'border-red-500/40 hover:border-red-500/60' : 'border-amber-500/20 hover:border-amber-500/40'}`} onClick={() => setDetailId(e.id)}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-primary">{e.id}</span>
                          <UrgentBadge exam={e} />
                        </div>
                        <PatientNameLink name={e.patientName} />
                        <p className="text-xs text-muted-foreground">{client?.name} · {examType?.name}</p>
                      </div>
                      <StatusBadge status={e.status} />
                    </div>
                    <DeadlineBadge createdAt={e.createdAt} urgent={e.urgent} urgentDate={e.urgentDate} urgentTime={e.urgentTime} />
                    <p className="text-xs text-muted-foreground">{e.software} · {formatDate(e.createdAt)}</p>
                    <Button size="sm" className="w-full gap-2" onClick={(ev) => { ev.stopPropagation(); setFinalizeId(e.id); }}>
                      <Upload className="h-3.5 w-3.5" />
                      Finalizar Laudo
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Finished */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Finalizados ({finished.length})</h2>
        {finished.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2 border border-dashed border-border rounded-lg">
            <p className="text-sm">Nenhum exame finalizado ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {finished.map(e => {
              const client = clients.find(c => c.id === e.clientId);
              const examType = examTypes.find(t => t.id === e.examTypeId);
              return (
                <Card key={e.id} className="cursor-pointer transition-all hover:border-primary/30" onClick={() => setDetailId(e.id)}>
                  <CardContent className="flex items-center justify-between py-3 px-5">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-primary">{e.id}</span>
                      {e.urgent && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/40">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Urgente
                        </span>
                      )}
                      <PatientNameLink name={e.patientName} />
                      <span className="text-sm text-muted-foreground">{client?.name}</span>
                      <span className="text-sm text-muted-foreground">{examType?.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{e.createdAt}</span>
                      <StatusBadge status={e.status} />
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
            <DialogDescription>
              {detailExam?.id} — {detailExam?.patientName}
            </DialogDescription>
          </DialogHeader>
          {detailExam && (() => {
            const client = clients.find(c => c.id === detailExam.clientId);
            const examType = examTypes.find(t => t.id === detailExam.examTypeId);
            return (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Paciente</p>
                    <p className="font-medium">{detailExam.patientName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Data Nasc.</p>
                    <p className="font-medium">{formatDate(detailExam.patientBirthDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Dentista Solicitante</p>
                    <p className="font-medium">{detailExam.dentistName || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Finalidade</p>
                    <p className="font-medium">{detailExam.purpose || 'Não informada'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Cliente</p>
                    <p className="font-medium">{client?.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Tipo</p>
                    <p className="font-medium">{examType?.name} ({detailExam.examCategory})</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Software</p>
                    <p className="font-medium">{detailExam.software}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Data Criação</p>
                    <p className="font-medium">{formatDate(detailExam.createdAt)}</p>
                  </div>
                </div>

                {detailExam.urgent && (
                  <div className="p-2 rounded-md bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold text-xs uppercase">Urgente</span>
                    {detailExam.urgentDate && (
                      <span className="text-xs ml-auto">Prazo: {formatDate(detailExam.urgentDate)}{detailExam.urgentTime ? ` às ${detailExam.urgentTime}` : ''}</span>
                    )}
                  </div>
                 )}

                {(detailExam.status === 'Disponível' || detailExam.status === 'Em análise') && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Prazo do Laudo</p>
                    <DeadlineBadge createdAt={detailExam.createdAt} urgent={detailExam.urgent} urgentDate={detailExam.urgentDate} urgentTime={detailExam.urgentTime} />
                  </div>
                )}

                <div>
                  <p className="text-muted-foreground text-xs mb-1">Observações</p>
                  <p className="text-sm">{detailExam.observations || 'Nenhuma observação'}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-xs mb-2">Histórico de Status</p>
                  <div className="space-y-1">
                    {detailExam.statusHistory.map((h, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <StatusBadge status={h.status} className="text-[10px] px-2 py-0.5" />
                        <span className="text-muted-foreground">{formatDate(h.date)}</span>
                        <span>{h.by}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {detailExam.uploadedFile && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-2">Arquivo do Cliente</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleDownloadFile(detailExam.uploadedFile!)}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Baixar Arquivo
                    </Button>
                    <span className="text-xs text-muted-foreground ml-2">{detailExam.uploadedFile}</span>
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
            <DialogDescription>
              {finalizeExamItem?.id} — {finalizeExamItem?.patientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                uploadDone ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setUploadDone(true)}
            >
              {uploadDone ? (
                <div className="text-emerald-400">
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">laudo_{finalizeId}.pdf — Pronto</p>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Clique para fazer upload do laudo (simulado)</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setFinalizeId(null); setUploadDone(false); }}>Cancelar</Button>
              <Button onClick={handleFinalize} disabled={!uploadDone}>
                Confirmar Finalização
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
