import { useState } from 'react';
import { useAppUsers, useUpdateUser } from '@/hooks/useAppUsers';
import { useSupabaseClients } from '@/hooks/useSupabaseClients';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { UsersRound, Pencil } from 'lucide-react';
import { AppProfile } from '@/context/AuthContext';

const roleOptions = [
  { value: 'nenhum', label: 'Pendente' },
  { value: 'admin', label: 'Administrador' },
  { value: 'radiologista', label: 'Radiologista' },
  { value: 'cliente', label: 'Cliente' },
];

const roleBadgeColors: Record<string, string> = {
  admin: 'bg-blue-500/15 text-blue-600',
  radiologista: 'bg-emerald-500/15 text-emerald-600',
  cliente: 'bg-amber-500/15 text-amber-600',
  nenhum: 'bg-gray-500/15 text-gray-500',
};

const softwareOptions = ['OnDemand', 'iDixel'];

export default function Usuarios() {
  const { data: users, isLoading } = useAppUsers();
  const { data: clients } = useSupabaseClients();
  const updateUser = useUpdateUser();

  const [editingUser, setEditingUser] = useState<AppProfile | null>(null);
  const [formNome, setFormNome] = useState('');
  const [formPapel, setFormPapel] = useState('');
  const [formClienteId, setFormClienteId] = useState<string>('');
  const [formSoftwares, setFormSoftwares] = useState<string[]>([]);

  const openEdit = (user: AppProfile) => {
    setEditingUser(user);
    setFormNome(user.nome);
    setFormPapel(user.papel);
    setFormClienteId(String(user.cliente_id ?? ''));
    setFormSoftwares(user.softwares ?? []);
  };

  const handleSave = () => {
    if (!editingUser) return;
    updateUser.mutate({
      userId: editingUser.id,
      nome: formNome,
      papel: formPapel,
      cliente_id: formPapel === 'cliente' && formClienteId ? Number(formClienteId) : null,
      softwares: formPapel === 'radiologista' ? formSoftwares : null,
    }, {
      onSuccess: () => setEditingUser(null),
    });
  };

  const toggleSoftware = (sw: string) => {
    setFormSoftwares(prev => prev.includes(sw) ? prev.filter(s => s !== sw) : [...prev, sw]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
        <p className="text-sm text-muted-foreground">{users?.length ?? 0} usuários cadastrados</p>
      </div>

      {!users || users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <UsersRound className="h-12 w-12 opacity-20" />
          <p>Nenhum usuário cadastrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map(u => (
            <Card key={u.id}>
              <CardContent className="flex items-center justify-between py-4 px-5">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {u.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{u.nome}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={roleBadgeColors[u.papel] ?? roleBadgeColors.nenhum}>
                    {roleOptions.find(r => r.value === u.papel)?.label ?? u.papel}
                  </Badge>
                  {u.papel === 'cliente' && u.cliente_id && (
                    <Badge variant="outline" className="text-xs">
                      {clients?.find(c => c.id === u.cliente_id)?.nome ?? 'Cliente'}
                    </Badge>
                  )}
                  {u.papel === 'radiologista' && u.softwares && u.softwares.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {u.softwares.join(', ')}
                    </Badge>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => openEdit(u)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editingUser} onOpenChange={open => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Altere as informações do usuário abaixo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome</Label>
              <Input id="edit-nome" value={formNome} onChange={e => setFormNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Papel</Label>
              <Select value={formPapel} onValueChange={setFormPapel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formPapel === 'cliente' && (
              <div className="space-y-2">
                <Label>Cliente vinculado</Label>
                <Select value={formClienteId} onValueChange={setFormClienteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {formPapel === 'radiologista' && (
              <div className="space-y-2">
                <Label>Softwares</Label>
                <div className="flex gap-4">
                  {softwareOptions.map(sw => (
                    <label key={sw} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formSoftwares.includes(sw)}
                        onCheckedChange={() => toggleSoftware(sw)}
                      />
                      <span className="text-sm">{sw}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={updateUser.isPending}>
              {updateUser.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
