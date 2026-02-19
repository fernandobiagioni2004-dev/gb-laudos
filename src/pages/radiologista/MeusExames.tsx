import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { clients, radiologists, examTypes } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileText, Upload } from 'lucide-react';

const SIMULATED_RADIOLOGIST = radiologists[0];

export default function MeusExamesRadiologista() {
  const { exams, finalizeExam } = useApp();
  const [finalizeId, setFinalizeId] = useState<string | null>(null);
  const [uploadDone, setUploadDone] = useState(false);

  const myExams = useMemo(() =>
    exams.filter(e => e.radiologistId === SIMULATED_RADIOLOGIST.id),
    [exams]
  );

  const inProgress = myExams.filter(e => e.status === 'Em análise');
  const finished = myExams.filter(e => e.status === 'Finalizado');

  const finalizeExamItem = finalizeId ? exams.find(e => e.id === finalizeId) : null;

  const handleFinalize = () => {
    if (finalizeId) {
      finalizeExam(finalizeId);
      setFinalizeId(null);
      setUploadDone(false);
    }
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
                <Card key={e.id} className="border-amber-500/20 hover:border-amber-500/40 transition-all">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs text-primary">{e.id}</span>
                        <p className="font-semibold">{e.patientName}</p>
                        <p className="text-xs text-muted-foreground">{client?.name} · {examType?.name}</p>
                      </div>
                      <StatusBadge status={e.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">{e.software} · {e.createdAt}</p>
                    <Button size="sm" className="w-full gap-2" onClick={() => setFinalizeId(e.id)}>
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
                <Card key={e.id}>
                  <CardContent className="flex items-center justify-between py-3 px-5">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-primary">{e.id}</span>
                      <span className="font-medium">{e.patientName}</span>
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
