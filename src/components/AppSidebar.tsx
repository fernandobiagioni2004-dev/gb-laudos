import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Users, UserCheck, DollarSign, BarChart3,
  User, ClipboardList, Wallet, PlusCircle, LogOut, CalendarDays, UsersRound,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { useAuth, AppRole } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import gbLaudosLogo from '@/assets/gb-laudos-logo.png';
import { Button } from '@/components/ui/button';

const roleLabels: Record<AppRole, string> = {
  admin: 'Administrador',
  radiologista: 'Radiologista',
  cliente: 'Cliente',
  nenhum: 'Pendente',
};

const roleColors: Record<AppRole, string> = {
  admin: 'text-blue-200',
  radiologista: 'text-emerald-200',
  cliente: 'text-amber-200',
  nenhum: 'text-gray-300',
};

const adminNav = [
  { title: 'Dashboard',        url: '/',                 icon: LayoutDashboard },
  { title: 'Exames',           url: '/exames',           icon: FileText },
  { title: 'Clientes',         url: '/clientes',         icon: Users },
  { title: 'Radiologistas',    url: '/radiologistas',    icon: UserCheck },
  { title: 'Usuários',         url: '/usuarios',         icon: UsersRound },
  { title: 'Tabelas de Preço', url: '/tabelas-preco',    icon: DollarSign },
  { title: 'Relatórios',       url: '/relatorios',       icon: BarChart3 },
  { title: 'Calendário',       url: '/calendario',       icon: CalendarDays },
  { title: 'Meu Perfil',       url: '/perfil',           icon: User },
];

const radiologistaNav = [
  { title: 'Exames Disponíveis', url: '/exames-disponiveis', icon: ClipboardList },
  { title: 'Meus Exames',        url: '/meus-exames',        icon: FileText },
  { title: 'Meu Financeiro',     url: '/meu-financeiro',     icon: Wallet },
  { title: 'Calendário',         url: '/calendario',         icon: CalendarDays },
  { title: 'Meu Perfil',         url: '/perfil',             icon: User },
];

const clienteNav = [
  { title: 'Novo Exame',  url: '/novo-exame',  icon: PlusCircle },
  { title: 'Meus Exames', url: '/meus-exames', icon: FileText },
  { title: 'Meu Perfil',  url: '/perfil',      icon: User },
];

const navByRole: Record<AppRole, typeof adminNav> = {
  admin: adminNav,
  radiologista: radiologistaNav,
  cliente: clienteNav,
  nenhum: [],
};

export function AppSidebar() {
  const { role, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const nav = navByRole[role];
  const initials = profile?.nome
    ? profile.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <img src={gbLaudosLogo} alt="GB Laudos" className="h-10 w-10 rounded-xl object-contain mix-blend-screen" />
            <div>
              <p className="text-sm font-semibold text-sidebar-accent-foreground">GB Laudos</p>
              <p className="text-xs text-sidebar-foreground">Laudos Odontológicos</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <img src={gbLaudosLogo} alt="GB Laudos" className="h-9 w-9 rounded-xl object-contain mix-blend-screen" />
          </div>
        )}
      </SidebarHeader>

      {/* User info */}
      <div className="px-3 py-3 border-b border-sidebar-border">
        <div className={cn(
          'flex items-center gap-2 rounded-lg px-2 py-2 text-sm',
          collapsed && 'justify-center px-0',
        )}>
          <div className={cn(
            'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold',
            'bg-white/15',
            roleColors[role],
          )}>
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{profile?.nome ?? 'Carregando...'}</p>
              <p className={cn('text-[10px]', roleColors[role])}>{roleLabels[role]}</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <SidebarContent className="py-2">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-xs text-sidebar-foreground/50 uppercase tracking-wider px-4 mb-1">Menu</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map(item => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <button
                        onClick={() => navigate(item.url)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150',
                          isActive
                            ? 'bg-sidebar-primary/15 text-sidebar-primary-foreground font-medium'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        )}
                      >
                        <item.icon className={cn('h-4 w-4 flex-shrink-0', isActive && 'text-sidebar-primary-foreground')} />
                        {!collapsed && <span>{item.title}</span>}
                        {isActive && !collapsed && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={signOut}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </Button>
        ) : (
          <button onClick={signOut} className="flex justify-center w-full">
            <LogOut className="h-3.5 w-3.5 text-sidebar-foreground/70 hover:text-sidebar-foreground" />
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
