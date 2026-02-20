import { useMemo, useState } from 'react';
import { useExams, useAssumeExam, DbExam } from '@/hooks/useExams';
import { useSupabaseClients } from '@/hooks/useSupabaseClients';
import { useExamTypes } from '@/hooks/useExamTypes';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/StatusBadge';
import { DeadlineBadge } from '@/components/DeadlineBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlertTriangle, AlertCircle, Clock, ClipboardList, Monitor } from 'lucide-react';
import { cn, calcDeadline } from '@/lib/utils';

type PrioridadeFilter = 'Todos' | 'Urgentes' | 'Expirando' | 'Vencidos';

function getDeadline(e: DbExam) {
  return e.urgente && e.urgente_data
    ? new Date(`${e.urgente_data}T${e.urgente_hora || '23:59'}:00`)
    : calcDeadline(e.criado_em?.split('T')[0] ?? '');
}

function getDiffHours(e: DbExam, now: Date) {
  return (getDeadline(e).getTime() - now.getTime()) / (1000 * 60 * 60);
}

function formatDateBR(dateStr: string | null) {
  if (!dateStr) return '—';
  const d = dateStr.split('T')[0];
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export default function ExamesDisponiveis() {
  const { data: exams = [] } = useExams();
  const { data: clients = [] } = useSupabaseClients();
  const { data: examTypes = [] } = useExamTypes();
  const { profile, userId } = useAuth();
  const assumeExam = useAssumeExam();

  const [confirm, setConfirm] = useState<number | null>(null);
  const [softwareFilter, setSoftwareFilter] = useState<'Todos' | 'Axel' | 'Morita'>('Todos');
  const [prioridadeFilter, setPrioridadeFilter] = useState<PrioridadeFilter>('Todos');

  const mySoftwares = profile?.softwares ?? [];

  const softwareFiltered = useMemo(() =>
    exams.filter(e =>
      e.status === 'Disponível' &&
      mySoftwares.includes(e.software) &&
      (softwareFilter === 'Todos' || e.software === softwareFilter)
    ), [exams, softwareFilter, mySoftwares]);

  const now = useMemo(() => new Date(), []);

  const counts = useMemo(() => {
    const c = { Urgentes: 0, Expirando: 0, Vencidos: 0 };
    softwareFiltered.forEach(e => {
      const dh = getDiffHours(e, now);
      if (e.urgente) c.Urgentes++;
      if (dh >= 0 && dh < 12) c.Expirando++;
      if (dh < 0) c.Vencidos++;
    });
    return c;
  }, [softwareFiltered, now]);

  const available = useMemo(() => {
    const filtered = softwareFiltered.filter(e => {
      if (prioridadeFilter === 'Todos') return true;
      const dh = getDiffHours(e, now);
      if (prioridadeFilter === 'Urgentes') return e.urgente;
      if (prioridadeFilter === 'Expirando') return dh >= 0 && dh < 12;
      if (prioridadeFilter === 'Vencidos') return dh < 0;
      return true;
    });
    return filtered.sort((a, b) => {
      const urgDiff = (b.urgente ? 1 : 0) - (a.urgente ? 1 : 0);
      if (urgDiff !== 0) return urgDiff;
      return getDiffHours(a, now) - getDiffHours(b, now);
    });
  }, [softwareFiltered, prioridadeFilter, now]);

  const handleAssume = (examId: number) => {
    if (!userId) return;
    assumeExam.mutate({ examId, radiologistaId: userId });
    setConfirm(null);
  };

  const confirmExam = confirm ? exams.find(e => e.id === confirm) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Exames Disponíveis</h1>
        <p className="text-sm text-muted-foreground">
          Conectado como {profile?.nome} · Software: {mySoftwares.join(', ') || 'Nenhum'}
        </p>
      </div>

      <ToggleGroup type="single" value={softwareFilter} onValueChange={(v) => v && setSoftwareFilter(v as any)} variant="outline" size="sm">
        <ToggleGroupItem value="Todos">Todos</ToggleGroupItem>
        <ToggleGroupItem value="Axel" className="flex items-center gap-1.5"><Monitor className="h-3.5 w-3.5" />Axel</ToggleGroupItem>
        <ToggleGroupItem value="Morita" className="flex items-center gap-1.5"><Monitor className="h-3.5 w-3.5" />Morita</ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup type="single" value={prioridadeFilter} onValueChange={(v) => v && setPrioridadeFilter(v as PrioridadeFilter)} variant="outline" size="sm">
        <ToggleGroupItem value="Todos">Todos</ToggleGroupItem>
        <ToggleGroupItem value="Urgentes" className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" />Urgentes{counts.Urgentes > 0 && <span className="ml-1 text-xs bg-destructive/15 text-destructive px-1.5 rounded-full">{counts.Urgentes}</span>}</ToggleGroupItem>
        <ToggleGroupItem value="Expirando" className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Expirando{counts.Expirando > 0 && <span className="ml-1 text-xs bg-accent text-accent-foreground px-1.5 rounded-full">{counts.Expirando}</span>}</ToggleGroupItem>
        <ToggleGroupItem value="Vencidos" className="flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" />Vencidos{counts.Vencidos > 0 && <span className="ml-1 text-xs bg-destructive/15 text-destructive px-1.5 rounded-full">{counts.Vencidos}</span>}</ToggleGroupItem>
      </ToggleGroup>

      {available.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <ClipboardList className="h-12 w-12 opacity-20" />
          <p className="text-base font-medium">Nenhum exame disponível</p>
          <p className="text-sm">Não há exames compatíveis com seus softwares no momento</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {available.map(e => {
            const client = clients.find(c => c.id === e.client_id);
            const examType = examTypes.find(t => t.id === e.exam_type_id);
            return (
              <Card key={e.id} className={cn('hover:border-primary/30 transition-all', e.urgente && 'border-red-500/40')}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs text-primary">{e.id}</span>
                      <p className="font-semibold mt-0.5">{e.paciente_nome}</p>
                      <p className="text-xs text-muted-foreground">{client?.nome}</p>
                    </div>
                    <StatusBadge status={e.status as any} />
                  </div>
                  {e.urgente && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse bg-red-500/15 text-red-600 border border-red-500/30"><AlertTriangle className="h-3.5 w-3.5" />URGENTE</span>
                      {e.urgente_data && <span className="text-xs text-red-600">Prazo: {formatDateBR(e.urgente_data)}{e.urgente_hora ? ` às ${e.urgente_hora}` : ''}</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{examType?.nome}</span>
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1', e.software === 'Axel' ? 'bg-violet-500/15 text-violet-600' : 'bg-sky-500/15 text-sky-600')}><Monitor className="h-3 w-3" />{e.software}</span>
                  </div>
                  <DeadlineBadge createdAt={e.criado_em?.split('T')[0] ?? ''} urgent={e.urgente ?? false} urgentDate={e.urgente_data ?? undefined} urgentTime={e.urgente_hora ?? undefined} />
                  <p className="text-xs text-muted-foreground">Solicitado em {formatDateBR(e.criado_em)}</p>
                  <Button className="w-full" size="sm" onClick={() => setConfirm(e.id)}>Assumir Exame</Button>
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
            <DialogDescription>Deseja assumir o exame {confirmExam?.id} — {confirmExam?.paciente_nome}? O status mudará para <strong>Em análise</strong>.</DialogDescription>
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
