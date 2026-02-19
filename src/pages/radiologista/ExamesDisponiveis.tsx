import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { clients, radiologists, examTypes } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ClipboardList, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

// Simulating as Dr. Carlos Menezes (Axel) for radiologista role
const SIMULATED_RADIOLOGIST = radiologists[0]; // r1 - Axel

export default function ExamesDisponiveis() {
  const { exams, assumeExam } = useApp();
  const [confirm, setConfirm] = useState<string | null>(null);

  const available = useMemo(() =>
    exams.filter(e =>
      e.status === 'Disponível' &&
      SIMULATED_RADIOLOGIST.software.includes(e.software)
    ), [exams]);

  const handleAssume = (examId: string) => {
    assumeExam(examId, SIMULATED_RADIOLOGIST.id);
    setConfirm(null);
  };

  const confirmExam = confirm ? exams.find(e => e.id === confirm) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Exames Disponíveis</h1>
        <p className="text-sm text-muted-foreground">
          Conectado como {SIMULATED_RADIOLOGIST.name} · Software: {SIMULATED_RADIOLOGIST.software.join(', ')}
        </p>
      </div>

      {available.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <ClipboardList className="h-12 w-12 opacity-20" />
          <p className="text-base font-medium">Nenhum exame disponível</p>
          <p className="text-sm">Não há exames compatíveis com {SIMULATED_RADIOLOGIST.software.join(', ')} no momento</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {available.map(e => {
            const client = clients.find(c => c.id === e.clientId);
            const examType = examTypes.find(t => t.id === e.examTypeId);
            return (
              <Card key={e.id} className="hover:border-primary/30 transition-all">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs text-primary">{e.id}</span>
                      <p className="font-semibold mt-0.5">{e.patientName}</p>
                      <p className="text-xs text-muted-foreground">{client?.name}</p>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{examType?.name}</span>
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1',
                      e.software === 'Axel' ? 'bg-violet-500/15 text-violet-400' : 'bg-sky-500/15 text-sky-400',
                    )}>
                      <Monitor className="h-3 w-3" />{e.software}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Solicitado em {e.createdAt}</p>
                  {e.observations && (
                    <p className="text-xs bg-muted/30 rounded p-2 text-muted-foreground">{e.observations}</p>
                  )}
                  <Button className="w-full" size="sm" onClick={() => setConfirm(e.id)}>
                    Assumir Exame
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assumir Exame</DialogTitle>
            <DialogDescription>
              Deseja assumir o exame {confirmExam?.id} — {confirmExam?.patientName}?
              O status mudará para <strong>Em análise</strong> e o exame ficará atribuído a você.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancelar</Button>
            <Button onClick={() => confirm && handleAssume(confirm)}>Confirmar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
