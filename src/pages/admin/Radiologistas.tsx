import { useState, useMemo } from 'react';
import { useExams } from '@/hooks/useExams';
import { useRadiologists } from '@/hooks/useRadiologists';
import { useSupabaseClients } from '@/hooks/useSupabaseClients';
import { useExamTypes } from '@/hooks/useExamTypes';
import { useUpdateUser } from '@/hooks/useAppUsers';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Monitor, ChevronLeft, ChevronRight, UserPlus, Loader2, Search, MoreVertical, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export default function Radiologistas() {
  const { data: exams = [] } = useExams();
  const { data: radiologists = [] } = useRadiologists();
  const { data: clients = [] } = useSupabaseClients();
  const { data: examTypes = [] } = useExamTypes();
  const [detail, setDetail] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const updateUser = useUpdateUser();

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Edit modal state
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editSoftwares, setEditSoftwares] = useState<string[]>([]);

  function openEdit(r: any) {
    setEditId(r.id);
    setEditName(r.nome);
    setEditSoftwares(r.softwares ?? []);
  }

  function toggleEditSoftware(s: string) {
    setEditSoftwares(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  function handleSaveEdit() {
    if (!editId) return;
    updateUser.mutate({ userId: editId, nome: editName, softwares: editSoftwares }, {
      onSuccess: () => setEditId(null),
    });
  }

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // New radiologist modal state
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newSoftwares, setNewSoftwares] = useState<string[]>([]);

  function toggleSoftware(s: string) {
    setNewSoftwares(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  async function handleCreateRadiologist() {
    if (!newName || !newEmail || !newPassword) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-radiologist', {
        body: { nome: newName, email: newEmail, password: newPassword, softwares: newSoftwares },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success('Radiologista cadastrado com sucesso!');
      setShowCreate(false);
      setNewName(''); setNewEmail(''); setNewPassword(''); setNewSoftwares([]);
      queryClient.invalidateQueries({ queryKey: ['radiologists'] });
    } catch (err: any) {
      toast.error(err.message || 'Erro ao cadastrar radiologista');
    } finally {
      setCreating(false);
    }
  }

  function changeMonth(delta: number) {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const [sy, sm] = selectedMonth.split('-');
  const monthLabel = new Date(+sy, +sm - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const rows = useMemo(() => radiologists.map(r => {
    const rExams = exams.filter(e => e.radiologista_id === r.id && e.status !== 'Cancelado' && e.criado_em?.startsWith(selectedMonth));
    const done = rExams.filter(e => e.status === 'Finalizado');
    const toReceive = done.reduce((a, e) => a + (e.valor_radiologista ?? 0), 0);
    return { ...r, examCount: done.length, inProgress: rExams.filter(e => e.status === 'Em análise').length, toReceive };
  }), [exams, radiologists, selectedMonth]);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter(r => r.nome.toLowerCase().includes(q));
  }, [rows, searchQuery]);

  const detailRad = detail ? radiologists.find(r => r.id === detail) : null;
  const detailExams = detail ? exams.filter(e => e.radiologista_id === detail && e.criado_em?.startsWith(selectedMonth)) : [];
  const total = detailExams.filter(e => e.status === 'Finalizado').reduce((a, e) => a + (e.valor_radiologista ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Radiologistas</h1>
          <p className="text-sm text-muted-foreground">{radiologists.length} radiologistas cadastrados</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Novo Radiologista
        </Button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar radiologista por nome..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeMonth(-1)}><ChevronLeft className="h-4 w-4" /></Button>
        <span className="text-sm font-medium capitalize min-w-[160px] text-center">{monthLabel}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeMonth(1)}><ChevronRight className="h-4 w-4" /></Button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {filteredRows.map(r => (
          <Card key={r.id} className="hover:border-border/80 transition-colors">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">{r.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{r.nome}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem onClick={() => openEdit(r)} className="gap-2">
                      <Pencil className="h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-wrap gap-1">
                {(r.softwares ?? []).map(s => (
                  <span key={s} className={cn('px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1',
                    s === 'iDixel' ? 'bg-violet-500/15 text-violet-600' : 'bg-sky-500/15 text-sky-600',
                  )}><Monitor className="h-3 w-3" />{s}</span>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/30 rounded p-2"><p className="text-xs text-muted-foreground">Finalizados</p><p className="font-bold text-sm">{r.examCount}</p></div>
                <div className="bg-muted/30 rounded p-2"><p className="text-xs text-muted-foreground">Em Análise</p><p className="font-bold text-sm text-amber-600">{r.inProgress}</p></div>
                <div className="bg-muted/30 rounded p-2"><p className="text-xs text-muted-foreground">A Receber</p><p className="font-bold text-xs text-emerald-600">{fmt(r.toReceive)}</p></div>
              </div>
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setDetail(r.id)}><Eye className="h-3.5 w-3.5" />Ver detalhes</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail modal */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailRad?.nome}</DialogTitle>
            <DialogDescription>{detailRad?.email} · {detailRad?.softwares?.join(', ')}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-muted/30 rounded-lg p-3 text-center"><p className="text-xs text-muted-foreground mb-1">Exames Finalizados</p><p className="font-bold text-lg">{detailExams.filter(e => e.status === 'Finalizado').length}</p></div>
            <div className="bg-muted/30 rounded-lg p-3 text-center"><p className="text-xs text-muted-foreground mb-1">Total a Receber</p><p className="font-bold text-emerald-600">{fmt(total)}</p></div>
          </div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Exames</div>
          <div className="space-y-2">
            {detailExams.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-border/50 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-primary text-xs">{e.id}</span>
                  <span>{e.paciente_nome}</span>
                  <span className="text-muted-foreground">{clients.find(c => c.id === e.client_id)?.nome}</span>
                  <span className="text-muted-foreground text-xs">{examTypes.find(t => t.id === e.exam_type_id)?.nome}</span>
                </div>
                <div className="flex items-center gap-3">
                  {e.status === 'Finalizado' && <span className="text-emerald-600">{fmt(e.valor_radiologista ?? 0)}</span>}
                  <StatusBadge status={e.status as any} />
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit radiologist modal */}
      <Dialog open={!!editId} onOpenChange={() => setEditId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Radiologista</DialogTitle>
            <DialogDescription>Altere o nome e os softwares do radiologista.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome</Label>
              <Input id="edit-nome" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nome completo" />
            </div>
            <div className="space-y-2">
              <Label>Softwares</Label>
              <div className="flex gap-4">
                {['OnDemand', 'iDixel'].map(s => (
                  <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={editSoftwares.includes(s)} onCheckedChange={() => toggleEditSoftware(s)} />
                    {s}
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={handleSaveEdit} disabled={updateUser.isPending} className="w-full gap-2">
              {updateUser.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {updateUser.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create radiologist modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Radiologista</DialogTitle>
            <DialogDescription>Cadastre um novo radiologista no sistema.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rad-nome">Nome *</Label>
              <Input id="rad-nome" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome completo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rad-email">Email *</Label>
              <Input id="rad-email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@exemplo.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rad-password">Senha *</Label>
              <Input id="rad-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Senha inicial" />
            </div>
            <div className="space-y-2">
              <Label>Softwares</Label>
              <div className="flex gap-4">
                {['OnDemand', 'iDixel'].map(s => (
                  <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={newSoftwares.includes(s)} onCheckedChange={() => toggleSoftware(s)} />
                    {s}
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={handleCreateRadiologist} disabled={creating} className="w-full gap-2">
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              {creating ? 'Cadastrando...' : 'Cadastrar Radiologista'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
