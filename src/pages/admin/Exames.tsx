import { useState, useMemo } from 'react';
import { useExams, DbExam, useCancelExam, useUpdateExamRadiologist } from '@/hooks/useExams';
import { useSupabaseClients } from '@/hooks/useSupabaseClients';
import { useExamTypes } from '@/hooks/useExamTypes';
import { useRadiologists } from '@/hooks/useRadiologists';
import { StatusBadge } from '@/components/StatusBadge';
import { DeadlineBadge } from '@/components/DeadlineBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, UserCheck, XCircle, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

function formatDateBR(dateStr: string | null) {
  if (!dateStr) return '—';
  const d = dateStr.split('T')[0];
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export default function Exames() {
  const { data: exams = [] } = useExams();
  const { data: clients = [] } = useSupabaseClients();
  const { data: examTypes = [] } = useExamTypes();
  const { data: rads = [] } = useRadiologists();
  const cancelExam = useCancelExam();
  const assignRad = useUpdateExamRadiologist();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [detailExam, setDetailExam] = useState<DbExam | null>(null);
  const [assignDialog, setAssignDialog] = useState<DbExam | null>(null);
  const [selectedRad, setSelectedRad] = useState('');
  const [cancelDialog, setCancelDialog] = useState<DbExam | null>(null);

  const getClient = (id: number | null) => clients.find(c => c.id === id);
  const getExamType = (id: number | null) => examTypes.find(e => e.id === id);
  const getRad = (id: number | null) => id ? rads.find(r => r.id === id) : null;

  const filtered = useMemo(() => {
    return exams.filter(e => {
      const term = search.toLowerCase();
      const match = !term || e.paciente_nome.toLowerCase().includes(term) ||
        String(e.id).includes(term) ||
        getClient(e.client_id)?.nome.toLowerCase().includes(term);
      const statusOk = filterStatus === 'all' || e.status === filterStatus;
      return match && statusOk;
    });
  }, [exams, search, filterStatus, clients]);

  const handleAssign = () => {
    if (!assignDialog || !selectedRad) return;
    assignRad.mutate({ examId: assignDialog.id, radiologistaId: Number(selectedRad) });
    setAssignDialog(null);
    setSelectedRad('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestão de Exames</h1>
        <p className="text-sm text-muted-foreground">{exams.length} exames no total</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por ID, paciente, cliente..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="Disponível">Disponível</SelectItem>
            <SelectItem value="Em análise">Em análise</SelectItem>
            <SelectItem value="Finalizado">Finalizado</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <FileText className="h-10 w-10 opacity-20" />
              <p className="text-sm">Nenhum exame encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['ID', 'Cliente', 'Paciente', 'Tipo', 'Software', 'Radiologista', 'Status', 'Vlr. Cliente', 'Vlr. Rad.', 'Margem', 'Ações'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(e => (
                    <tr key={e.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-primary">{e.id}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{getClient(e.client_id)?.nome}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{e.paciente_nome}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{getExamType(e.exam_type_id)?.nome}</td>
                      <td className="py-3 px-4">
                        <span className={cn('px-2 py-0.5 rounded text-xs font-medium',
                          e.software === 'Axel' ? 'bg-violet-500/15 text-violet-600' : 'bg-sky-500/15 text-sky-600',
                        )}>{e.software}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">{getRad(e.radiologista_id)?.nome ?? '—'}</td>
                      <td className="py-3 px-4"><StatusBadge status={e.status as any} /></td>
                      <td className="py-3 px-4 text-emerald-600 whitespace-nowrap">{fmt(e.valor_cliente ?? 0)}</td>
                      <td className="py-3 px-4 text-amber-600 whitespace-nowrap">{fmt(e.valor_radiologista ?? 0)}</td>
                      <td className="py-3 px-4 text-blue-600 whitespace-nowrap">{fmt(e.margem ?? 0)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailExam(e)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {e.status === 'Disponível' && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 hover:text-emerald-500" onClick={() => { setAssignDialog(e); setSelectedRad(String(e.radiologista_id ?? '')); }}>
                              <UserCheck className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {e.status !== 'Cancelado' && e.status !== 'Finalizado' && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-500" onClick={() => setCancelDialog(e)}>
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailExam} onOpenChange={() => setDetailExam(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhe do Exame — {detailExam?.id}</DialogTitle>
            <DialogDescription>Informações completas do exame</DialogDescription>
          </DialogHeader>
          {detailExam && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Paciente" value={detailExam.paciente_nome} />
                <Field label="Nascimento" value={formatDateBR(detailExam.paciente_data_nascimento)} />
                <Field label="Cliente" value={getClient(detailExam.client_id)?.nome ?? '—'} />
                <Field label="Tipo" value={getExamType(detailExam.exam_type_id)?.nome ?? '—'} />
                <Field label="Software" value={detailExam.software} />
                <Field label="Radiologista" value={getRad(detailExam.radiologista_id)?.nome ?? 'Não atribuído'} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Valor Cliente</p>
                  <p className="font-bold text-emerald-600">{fmt(detailExam.valor_cliente ?? 0)}</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Valor Rad.</p>
                  <p className="font-bold text-amber-600">{fmt(detailExam.valor_radiologista ?? 0)}</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Margem</p>
                  <p className="font-bold text-blue-600">{fmt(detailExam.margem ?? 0)}</p>
                </div>
              </div>
              {detailExam.observacoes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Observações</p>
                  <p className="bg-muted/40 rounded p-2">{detailExam.observacoes}</p>
                </div>
              )}
              {(detailExam.status === 'Disponível' || detailExam.status === 'Em análise') && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Prazo do Laudo</p>
                  <DeadlineBadge createdAt={detailExam.criado_em?.split('T')[0] ?? ''} urgent={detailExam.urgente ?? false} urgentDate={detailExam.urgente_data ?? undefined} urgentTime={detailExam.urgente_hora ?? undefined} />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={!!assignDialog} onOpenChange={() => setAssignDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Radiologista</DialogTitle>
            <DialogDescription>Selecione um radiologista para o exame {assignDialog?.id}</DialogDescription>
          </DialogHeader>
          <Select value={selectedRad} onValueChange={setSelectedRad}>
            <SelectTrigger><SelectValue placeholder="Selecionar radiologista..." /></SelectTrigger>
            <SelectContent>
              {rads.filter(r => r.softwares?.includes(assignDialog?.software ?? 'Axel')).map(r => (
                <SelectItem key={r.id} value={String(r.id)}>{r.nome} ({r.softwares?.join(', ')})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setAssignDialog(null)}>Cancelar</Button>
            <Button onClick={handleAssign} disabled={!selectedRad}>Atribuir</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={!!cancelDialog} onOpenChange={() => setCancelDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Exame</DialogTitle>
            <DialogDescription>Tem certeza que deseja cancelar o exame {cancelDialog?.id}?</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setCancelDialog(null)}>Voltar</Button>
            <Button variant="destructive" onClick={() => { if (cancelDialog) { cancelExam.mutate(cancelDialog.id); setCancelDialog(null); } }}>
              Cancelar Exame
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
