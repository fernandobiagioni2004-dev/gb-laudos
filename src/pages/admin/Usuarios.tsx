import { useState } from 'react';
import { useAppUsers, useUpdateUserRole } from '@/hooks/useAppUsers';
import { useSupabaseClients } from '@/hooks/useSupabaseClients';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UsersRound, Shield } from 'lucide-react';

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

export default function Usuarios() {
  const { data: users, isLoading } = useAppUsers();
  const { data: clients } = useSupabaseClients();
  const updateRole = useUpdateUserRole();

  const handleRoleChange = (userId: number, newRole: string) => {
    updateRole.mutate({ userId, papel: newRole });
  };

  const handleClientChange = (userId: number, clientId: string) => {
    updateRole.mutate({ userId, papel: 'cliente', cliente_id: clientId ? Number(clientId) : null });
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
                  <Select value={u.papel} onValueChange={v => handleRoleChange(u.id, v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {u.papel === 'cliente' && (
                    <Select value={String(u.cliente_id ?? '')} onValueChange={v => handleClientChange(u.id, v)}>
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Vincular cliente..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clients?.map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
