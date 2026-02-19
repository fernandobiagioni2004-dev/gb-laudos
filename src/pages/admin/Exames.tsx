import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { clients, examTypes, radiologists, Exam } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search, Eye, UserCheck, XCircle, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

function getClient(id: string) { return clients.find(c => c.id === id); }
function getExamType(id: string) { return examTypes.find(e => e.id === id); }
function getRadiologist(id: string | null) { return id ? radiologists.find(r => r.id === id) : null; }

export default function Exames() {
  const { exams, updateExamStatus, cancelExam } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [detailExam, setDetailExam] = useState<Exam | null>(null);
  const [assignDialog, setAssignDialog] = useState<Exam | null>(null);
  const [selectedRad, setSelectedRad] = useState('');
  const [cancelDialog, setCancelDialog] = useState<Exam | null>(null);

  const filtered = useMemo(() => {
    return exams.filter(e => {
      const term = search.toLowerCase();
      const match = !term || e.patientName.toLowerCase().includes(term) ||
        e.id.toLowerCase().includes(term) ||
        getClient(e.clientId)?.name.toLowerCase().includes(term);
      const statusOk = filterStatus === 'all' || e.status === filterStatus;
      return match && statusOk;
    });
  }, [exams, search, filterStatus]);

  const handleAssign = () => {
    if (!assignDialog || !selectedRad) return;
    updateExamStatus(assignDialog.id, assignDialog.status, selectedRad);
    toast({ title: 'Radiologista atribuído', description: `${getRadiologist(selectedRad)?.name} atribuído ao exame ${assignDialog.id}` });
    setAssignDialog(null);
    setSelectedRad('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestão de Exames</h1>
        <p className="text-sm text-muted-foreground">{exams.length} exames no total</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por ID, paciente, cliente..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="Disponível">Disponível</SelectItem>
            <SelectItem value="Em análise">Em análise</SelectItem>
            <SelectItem value="Finalizado">Finalizado</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
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
                      <td className="py-3 px-4 whitespace-nowrap">{getClient(e.clientId)?.name}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{e.patientName}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{getExamType(e.examTypeId)?.name}</td>
                      <td className="py-3 px-4">
                        <span className={cn('px-2 py-0.5 rounded text-xs font-medium',
                          e.software === 'Axel' ? 'bg-violet-500/15 text-violet-400' : 'bg-sky-500/15 text-sky-400',
                        )}>{e.software}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">{getRadiologist(e.radiologistId)?.name ?? '—'}</td>
                      <td className="py-3 px-4"><StatusBadge status={e.status} /></td>
                      <td className="py-3 px-4 text-emerald-400 whitespace-nowrap">{fmt(e.clientValue)}</td>
                      <td className="py-3 px-4 text-amber-400 whitespace-nowrap">{fmt(e.radiologistValue)}</td>
                      <td className="py-3 px-4 text-blue-400 whitespace-nowrap">{fmt(e.margin)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailExam(e)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {e.status === 'Disponível' && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-400 hover:text-emerald-300" onClick={() => { setAssignDialog(e); setSelectedRad(e.radiologistId ?? ''); }}>
                              <UserCheck className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {e.status !== 'Cancelado' && e.status !== 'Finalizado' && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => setCancelDialog(e)}>
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
                <Field label="Paciente" value={detailExam.patientName} />
                <Field label="Nascimento" value={detailExam.patientBirthDate} />
                <Field label="Cliente" value={getClient(detailExam.clientId)?.name ?? '—'} />
                <Field label="Tipo" value={getExamType(detailExam.examTypeId)?.name ?? '—'} />
                <Field label="Software" value={detailExam.software} />
                <Field label="Radiologista" value={getRadiologist(detailExam.radiologistId)?.name ?? 'Não atribuído'} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Valor Cliente</p>
                  <p className="font-bold text-emerald-400">{fmt(detailExam.clientValue)}</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Valor Rad.</p>
                  <p className="font-bold text-amber-400">{fmt(detailExam.radiologistValue)}</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Margem</p>
                  <p className="font-bold text-blue-400">{fmt(detailExam.margin)}</p>
                </div>
              </div>
              {detailExam.observations && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Observações</p>
                  <p className="bg-muted/40 rounded p-2">{detailExam.observations}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Histórico de Status</p>
                <div className="space-y-2">
                  {detailExam.statusHistory.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <StatusBadge status={h.status} />
                      <span className="text-muted-foreground">{h.date}</span>
                      <span className="text-muted-foreground">por {h.by}</span>
                    </div>
                  ))}
                </div>
              </div>
              {detailExam.files.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Arquivos</p>
                  {detailExam.files.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs bg-muted/30 rounded p-2">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      <span>{f}</span>
                    </div>
                  ))}
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
            <SelectTrigger>
              <SelectValue placeholder="Selecionar radiologista..." />
            </SelectTrigger>
            <SelectContent>
              {radiologists.filter(r => r.software.includes(assignDialog?.software ?? 'Axel')).map(r => (
                <SelectItem key={r.id} value={r.id}>{r.name} ({r.software.join(', ')})</SelectItem>
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
            <DialogDescription>Tem certeza que deseja cancelar o exame {cancelDialog?.id}? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setCancelDialog(null)}>Voltar</Button>
            <Button variant="destructive" onClick={() => { if (cancelDialog) { cancelExam(cancelDialog.id); setCancelDialog(null); } }}>
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
