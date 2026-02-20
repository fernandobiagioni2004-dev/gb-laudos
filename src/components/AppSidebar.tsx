import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Users, UserCheck, DollarSign, BarChart3,
  User, ClipboardList, Wallet, PlusCircle, ChevronDown, LogOut, CalendarDays,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { Role } from '@/data/mockData';
import gbLaudosLogo from '@/assets/gb-laudos-logo.png';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const roleLabels: Record<Role, string> = {
  admin: 'Administrador',
  radiologista: 'Radiologista',
  externo: 'Usuário Externo',
};

const roleColors: Record<Role, string> = {
  admin: 'text-blue-600',
  radiologista: 'text-emerald-600',
  externo: 'text-amber-600',
};

const roleAvatars: Record<Role, string> = {
  admin: 'AD',
  radiologista: 'RL',
  externo: 'UE',
};

const adminNav = [
  { title: 'Dashboard',        url: '/',                 icon: LayoutDashboard },
  { title: 'Exames',           url: '/exames',           icon: FileText },
  { title: 'Clientes',         url: '/clientes',         icon: Users },
  { title: 'Radiologistas',    url: '/radiologistas',    icon: UserCheck },
  { title: 'Tabelas de Preço', url: '/tabelas-preco',   icon: DollarSign },
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

const externoNav = [
  { title: 'Novo Exame',  url: '/novo-exame',  icon: PlusCircle },
  { title: 'Meus Exames', url: '/meus-exames', icon: FileText },
  { title: 'Meu Perfil',  url: '/perfil',      icon: User },
];

const navByRole: Record<Role, typeof adminNav> = {
  admin: adminNav,
  radiologista: radiologistaNav,
  externo: externoNav,
};

export function AppSidebar() {
  const { role, setRole, switching } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const nav = navByRole[role];

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    const firstRoute = navByRole[newRole][0].url;
    navigate(firstRoute);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <img src={gbLaudosLogo} alt="GB Laudos" className="h-8 w-8 rounded-lg object-contain" />
            <div>
              <p className="text-sm font-semibold text-sidebar-accent-foreground">GB Laudos</p>
              <p className="text-xs text-sidebar-foreground">Laudos Odontológicos</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <img src={gbLaudosLogo} alt="GB Laudos" className="h-8 w-8 rounded-lg object-contain" />
          </div>
        )}
      </SidebarHeader>

      {/* Role switcher */}
      <div className="px-3 py-3 border-b border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              'w-full flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors',
              'hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground',
              collapsed && 'justify-center px-0',
            )}>
              <div className={cn(
                'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                'bg-sidebar-accent',
                roleColors[role],
              )}>
                {roleAvatars[role]}
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <p className={cn('text-xs font-medium truncate', roleColors[role])}>{roleLabels[role]}</p>
                    <p className="text-[10px] text-muted-foreground">Trocar perfil</p>
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {(Object.keys(roleLabels) as Role[]).map(r => (
              <DropdownMenuItem key={r} onClick={() => handleRoleChange(r)} className={cn(role === r && 'bg-accent')}>
                <span className={cn('font-medium', roleColors[r])}>{roleLabels[r]}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nav */}
      <SidebarContent className="py-2">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-xs text-sidebar-foreground/50 uppercase tracking-wider px-4 mb-1">Menu</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {switching ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <div className="px-2 py-1">
                      <Skeleton className="h-8 w-full rounded-md" />
                    </div>
                  </SidebarMenuItem>
                ))
              ) : (
                nav.map(item => {
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
                              ? 'bg-purple-500/15 text-purple-300 font-medium'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          )}
                        >
                          <item.icon className={cn('h-4 w-4 flex-shrink-0', isActive && 'text-purple-300')} />
                          {!collapsed && <span>{item.title}</span>}
                          {isActive && !collapsed && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-purple-400" />
                          )}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed ? (
          <p className="text-[10px] text-muted-foreground text-center">v1.0 — GB Laudos</p>
        ) : (
          <div className="flex justify-center">
            <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
