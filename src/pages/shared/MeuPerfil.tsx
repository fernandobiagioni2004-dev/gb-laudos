import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Monitor, Shield } from 'lucide-react';

export default function MeuPerfil() {
  const { profile, role } = useAuth();

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    radiologista: 'Radiologista',
    cliente: 'Cliente',
    nenhum: 'Pendente',
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <p className="text-sm text-muted-foreground">Informações da conta</p>
      </div>

      <div className="flex items-center gap-5">
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
          {profile.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-semibold">{profile.nome}</h2>
          <p className="text-sm text-muted-foreground">{roleLabels[role] ?? role}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Informações Pessoais</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <ProfileField icon={User} label="Nome" value={profile.nome} />
          <ProfileField icon={Mail} label="E-mail" value={profile.email ?? '—'} />
          <ProfileField icon={Shield} label="Perfil" value={roleLabels[role] ?? role} />
          {role === 'radiologista' && profile.softwares && profile.softwares.length > 0 && (
            <ProfileField icon={Monitor} label="Softwares" value={profile.softwares.join(', ')} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileField({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
      <div className="h-8 w-8 rounded-md bg-muted/50 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
