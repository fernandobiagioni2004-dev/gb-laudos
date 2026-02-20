import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { clients, radiologists, examTypes } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { DeadlineBadge } from '@/components/DeadlineBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlertTriangle, AlertCircle, Clock, ClipboardList, Monitor } from 'lucide-react';
import { cn, calcDeadline } from '@/lib/utils';

type PrioridadeFilter = 'Todos' | 'Urgentes' | 'Expirando' | 'Vencidos';

function getDeadline(e: { urgent?: boolean; urgentDate?: string; urgentTime?: string; createdAt: string }) {
  return e.urgent && e.urgentDate
    ? new Date(`${e.urgentDate}T${e.urgentTime || '23:59'}:00`)
    : calcDeadline(e.createdAt);
}

function getDiffHours(e: { urgent?: boolean; urgentDate?: string; urgentTime?: string; createdAt: string }, now: Date) {
  return (getDeadline(e).getTime() - now.getTime()) / (1000 * 60 * 60);
}

// Simulating as Dr. Carlos Menezes (Axel) for radiologista role
function formatDateBR(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

const SIMULATED_RADIOLOGIST = radiologists[0]; // r1 - Axel

export default function ExamesDisponiveis() {
  const { exams, assumeExam } = useApp();
  const [confirm, setConfirm] = useState<string | null>(null);
  const [softwareFilter, setSoftwareFilter] = useState<'Todos' | 'Axel' | 'Morita'>('Todos');
  const [prioridadeFilter, setPrioridadeFilter] = useState<PrioridadeFilter>('Todos');

  const softwareFiltered = useMemo(() =>
    exams.filter(e =>
      e.status === 'Disponível' &&
      SIMULATED_RADIOLOGIST.software.includes(e.software) &&
      (softwareFilter === 'Todos' || e.software === softwareFilter)
    ), [exams, softwareFilter]);

  const now = useMemo(() => new Date(), []);

  const counts = useMemo(() => {
    const c = { Urgentes: 0, Expirando: 0, Vencidos: 0 };
    softwareFiltered.forEach(e => {
      const dh = getDiffHours(e, now);
      if (e.urgent) c.Urgentes++;
      if (dh >= 0 && dh < 12) c.Expirando++;
      if (dh < 0) c.Vencidos++;
    });
    return c;
  }, [softwareFiltered, now]);

  const available = useMemo(() => {
    const filtered = softwareFiltered.filter(e => {
      if (prioridadeFilter === 'Todos') return true;
      const dh = getDiffHours(e, now);
      if (prioridadeFilter === 'Urgentes') return e.urgent;
      if (prioridadeFilter === 'Expirando') return dh >= 0 && dh < 12;
      if (prioridadeFilter === 'Vencidos') return dh < 0;
      return true;
    });
    return filtered.sort((a, b) => {
      const urgDiff = (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0);
      if (urgDiff !== 0) return urgDiff;
      return getDiffHours(a, now) - getDiffHours(b, now);
    });
  }, [softwareFiltered, prioridadeFilter, now]);

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

      <ToggleGroup
        type="single"
        value={softwareFilter}
        onValueChange={(v) => v && setSoftwareFilter(v as 'Todos' | 'Axel' | 'Morita')}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="Todos">Todos</ToggleGroupItem>
        <ToggleGroupItem value="Axel" className="flex items-center gap-1.5">
          <Monitor className="h-3.5 w-3.5" />Axel
        </ToggleGroupItem>
        <ToggleGroupItem value="Morita" className="flex items-center gap-1.5">
          <Monitor className="h-3.5 w-3.5" />Morita
        </ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup
        type="single"
        value={prioridadeFilter}
        onValueChange={(v) => v && setPrioridadeFilter(v as PrioridadeFilter)}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="Todos">Todos</ToggleGroupItem>
        <ToggleGroupItem value="Urgentes" className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" />Urgentes
          {counts.Urgentes > 0 && <span className="ml-1 text-xs bg-destructive/15 text-destructive px-1.5 rounded-full">{counts.Urgentes}</span>}
        </ToggleGroupItem>
        <ToggleGroupItem value="Expirando" className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />Expirando
          {counts.Expirando > 0 && <span className="ml-1 text-xs bg-accent text-accent-foreground px-1.5 rounded-full">{counts.Expirando}</span>}
        </ToggleGroupItem>
        <ToggleGroupItem value="Vencidos" className="flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" />Vencidos
          {counts.Vencidos > 0 && <span className="ml-1 text-xs bg-destructive/15 text-destructive px-1.5 rounded-full">{counts.Vencidos}</span>}
        </ToggleGroupItem>
      </ToggleGroup>
      {available.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <ClipboardList className="h-12 w-12 opacity-20" />
          <p className="text-base font-medium">Nenhum exame disponível</p>
          <p className="text-sm">
            {softwareFilter === 'Todos'
              ? `Não há exames compatíveis com ${SIMULATED_RADIOLOGIST.software.join(', ')} no momento`
              : `Nenhum exame encontrado para o software ${softwareFilter}`}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {available.map(e => {
            const client = clients.find(c => c.id === e.clientId);
            const examType = examTypes.find(t => t.id === e.examTypeId);
            return (
              <Card key={e.id} className={cn('hover:border-primary/30 transition-all', e.urgent && 'border-red-500/40')}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs text-primary">{e.id}</span>
                      <p className="font-semibold mt-0.5">{e.patientName}</p>
                      <p className="text-xs text-muted-foreground">{client?.name}</p>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>
                  {e.urgent && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse bg-red-500/15 text-red-400 border border-red-500/30">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        URGENTE
                      </span>
                      {e.urgentDate && (
                        <span className="text-xs text-red-400">
                          Prazo: {e.urgentDate.split('-').reverse().join('/')}{e.urgentTime ? ` às ${e.urgentTime}` : ''}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{examType?.name}</span>
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1',
                      e.software === 'Axel' ? 'bg-violet-500/15 text-violet-400' : 'bg-sky-500/15 text-sky-400',
                    )}>
                      <Monitor className="h-3 w-3" />{e.software}
                    </span>
                  </div>
                  <DeadlineBadge createdAt={e.createdAt} urgent={e.urgent} urgentDate={e.urgentDate} urgentTime={e.urgentTime} />
                  <p className="text-xs text-muted-foreground">Solicitado em {formatDateBR(e.createdAt)}</p>
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
