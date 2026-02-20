import { useState, useMemo } from 'react';
import { useExams } from '@/hooks/useExams';
import { useSupabaseClients, useCreateClient, useUpdateClient, useDeleteClient, DbClient } from '@/hooks/useSupabaseClients';
import { useExamTypes } from '@/hooks/useExamTypes';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Users, CheckCircle2, XCircle, Eye, PlusCircle, MoreHorizontal, Pencil, Trash2, Monitor, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Software = 'Axel' | 'Morita';

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

const emptyForm = { nome: '', cnpj: '', email: '', softwares: [] as string[], ativo: true };

export default function Clientes() {
  const { data: exams = [] } = useExams();
  const { data: clients = [] } = useSupabaseClients();
  const { data: examTypesData = [] } = useExamTypes();
  const createClient = useCreateClient();
  const updateClientMut = useUpdateClient();
  const deleteClientMut = useDeleteClient();

  const [detail, setDetail] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  function changeMonth(delta: number) {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const [sy, sm] = selectedMonth.split('-');
  const monthLabel = new Date(+sy, +sm - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const rows = useMemo(() => clients.map(c => {
    const cExams = exams.filter(e => e.client_id === c.id && e.status !== 'Cancelado' && e.criado_em?.startsWith(selectedMonth));
    const revenue = cExams.reduce((a, e) => a + (e.valor_cliente ?? 0), 0);
    const paid = cExams.reduce((a, e) => a + (e.valor_radiologista ?? 0), 0);
    const margin = revenue - paid;
    return { ...c, examCount: cExams.length, revenue, paid, margin };
  }), [exams, clients, selectedMonth]);

  const detailClient = detail ? clients.find(c => c.id === detail) : null;
  const detailExams = detail ? exams.filter(e => e.client_id === detail && e.criado_em?.startsWith(selectedMonth)) : [];
  const detailRevenue = detailExams.filter(e => e.status !== 'Cancelado').reduce((a, e) => a + (e.valor_cliente ?? 0), 0);
  const detailPaid = detailExams.filter(e => e.status !== 'Cancelado').reduce((a, e) => a + (e.valor_radiologista ?? 0), 0);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (c: DbClient) => {
    setEditingId(c.id);
    setForm({ nome: c.nome, cnpj: c.cnpj ?? '', email: c.email ?? '', softwares: c.softwares ?? [], ativo: c.ativo ?? true });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.nome || !form.cnpj || !form.email || form.softwares.length === 0) return;
    if (editingId) {
      updateClientMut.mutate({ id: editingId, nome: form.nome, cnpj: form.cnpj, email: form.email, softwares: form.softwares, ativo: form.ativo });
    } else {
      createClient.mutate({ nome: form.nome, cnpj: form.cnpj, email: form.email, softwares: form.softwares, ativo: form.ativo, telefone: null });
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) { deleteClientMut.mutate(deleteId); setDeleteId(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-muted-foreground">{clients.length} clientes cadastrados</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><PlusCircle className="h-4 w-4" />Novo Cliente</Button>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeMonth(-1)}><ChevronLeft className="h-4 w-4" /></Button>
        <span className="text-sm font-medium capitalize min-w-[160px] text-center">{monthLabel}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeMonth(1)}><ChevronRight className="h-4 w-4" /></Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {rows.map(c => (
          <Card key={c.id} className="hover:border-border/80 transition-colors">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{c.nome}</p>
                  <p className="text-xs text-muted-foreground">{c.cnpj}</p>
                  <p className="text-xs text-muted-foreground">{c.email}</p>
                </div>
                <div className="flex items-center gap-1">
                  {(c.softwares ?? []).map(sw => (
                    <span key={sw} className={cn('flex items-center gap-1 text-xs px-2 py-1 rounded-full', sw === 'Axel' ? 'bg-violet-500/15 text-violet-600' : 'bg-sky-500/15 text-sky-600')}>
                      <Monitor className="h-3 w-3" />{sw}
                    </span>
                  ))}
                  <span className={cn('flex items-center gap-1 text-xs px-2 py-1 rounded-full', c.ativo ? 'bg-emerald-500/15 text-emerald-600' : 'bg-red-500/15 text-red-600')}>
                    {c.ativo ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {c.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5 mr-2" /> Editar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/30 rounded p-2"><p className="text-xs text-muted-foreground">Exames</p><p className="font-bold text-sm">{c.examCount}</p></div>
                <div className="bg-muted/30 rounded p-2"><p className="text-xs text-muted-foreground">Faturado</p><p className="font-bold text-sm text-emerald-600">{fmt(c.revenue)}</p></div>
                <div className="bg-muted/30 rounded p-2"><p className="text-xs text-muted-foreground">Margem</p><p className="font-bold text-sm text-blue-600">{fmt(c.margin)}</p></div>
              </div>
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setDetail(c.id)}><Eye className="h-3.5 w-3.5" />Ver detalhes</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailClient?.nome}</DialogTitle>
            <DialogDescription>{detailClient?.cnpj} · {detailClient?.email} · Software: {detailClient?.softwares?.join(', ')}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-muted/30 rounded-lg p-3 text-center"><p className="text-xs text-muted-foreground mb-1">Total Faturado</p><p className="font-bold text-emerald-600">{fmt(detailRevenue)}</p></div>
            <div className="bg-muted/30 rounded-lg p-3 text-center"><p className="text-xs text-muted-foreground mb-1">Total Pago</p><p className="font-bold text-amber-600">{fmt(detailPaid)}</p></div>
            <div className="bg-muted/30 rounded-lg p-3 text-center"><p className="text-xs text-muted-foreground mb-1">Margem</p><p className="font-bold text-blue-600">{fmt(detailRevenue - detailPaid)}</p></div>
          </div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Histórico de Exames</div>
          <div className="space-y-2">
            {detailExams.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-border/50 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-primary text-xs">{e.id}</span>
                  <span>{e.paciente_nome}</span>
                  <span className="text-muted-foreground">{examTypesData.find(t => t.id === e.exam_type_id)?.nome}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-600">{fmt(e.valor_cliente ?? 0)}</span>
                  <StatusBadge status={e.status as any} />
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            <DialogDescription>{editingId ? 'Atualize as informações do cliente.' : 'Preencha os dados para cadastrar um novo cliente.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Nome *</Label><Input placeholder="Nome da clínica" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>CNPJ *</Label><Input placeholder="00.000.000/0000-00" value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Email *</Label><Input type="email" placeholder="contato@clinica.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Software *</Label>
                <div className="flex gap-3 pt-1">
                  {(['Axel', 'Morita'] as Software[]).map(sw => {
                    const checked = form.softwares.includes(sw);
                    return (
                      <label key={sw} className={cn('flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border transition-colors', checked ? (sw === 'Axel' ? 'border-violet-500/50 bg-violet-500/10 text-violet-600' : 'border-sky-500/50 bg-sky-500/10 text-sky-600') : 'border-border text-muted-foreground hover:border-border/80')}>
                        <input type="checkbox" className="sr-only" checked={checked} onChange={() => setForm(f => ({ ...f, softwares: checked ? f.softwares.filter(s => s !== sw) : [...f.softwares, sw] }))} />
                        <Monitor className="h-3.5 w-3.5" /><span className="text-sm font-medium">{sw}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.ativo ? 'Ativo' : 'Inativo'} onValueChange={v => setForm(f => ({ ...f, ativo: v === 'Ativo' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.nome || !form.cnpj || !form.email || form.softwares.length === 0}>
              {editingId ? 'Salvar' : 'Criar Cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>O cliente "{clients.find(c => c.id === deleteId)?.nome}" será removido permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
