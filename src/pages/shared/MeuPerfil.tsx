import { useApp } from '@/context/AppContext';
import { radiologists } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Monitor, Shield } from 'lucide-react';
import { Role } from '@/data/mockData';

const SIMULATED_RAD = radiologists[0];

const profileData: Record<Role, { name: string; email: string; role: string; extra?: string }> = {
  admin: { name: 'Admin Geral', email: 'admin@laudos.com', role: 'Administrador', extra: 'Acesso total ao sistema' },
  radiologista: { name: SIMULATED_RAD.name, email: SIMULATED_RAD.email, role: 'Radiologista', extra: SIMULATED_RAD.software.join(', ') },
  externo: { name: 'Usuário Clínica OralMax', email: 'contato@oralmax.com.br', role: 'Usuário Externo', extra: 'Clínica OralMax' },
};

export default function MeuPerfil() {
  const { role } = useApp();
  const profile = profileData[role];

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <p className="text-sm text-muted-foreground">Informações da conta</p>
      </div>

      <div className="flex items-center gap-5">
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
          {profile.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </div>
        <div>
          <h2 className="text-lg font-semibold">{profile.name}</h2>
          <p className="text-sm text-muted-foreground">{profile.role}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProfileField icon={User} label="Nome" value={profile.name} />
          <ProfileField icon={Mail} label="E-mail" value={profile.email} />
          <ProfileField icon={Shield} label="Perfil" value={profile.role} />
          {profile.extra && (
            <ProfileField icon={Monitor} label={role === 'radiologista' ? 'Softwares' : 'Clínica'} value={profile.extra} />
          )}
        </CardContent>
      </Card>

      <Card className="border-muted/50 bg-muted/10">
        <CardContent className="p-4 text-xs text-muted-foreground text-center">
          Plataforma de Laudos v1.0 — Dados simulados para demonstração
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
