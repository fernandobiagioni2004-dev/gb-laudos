import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { clients, radiologists, examTypes } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, DollarSign, TrendingUp, Users, Activity, Percent, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export default function Dashboard() {
  const { exams } = useApp();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  function changeMonth(delta: number) {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const [y, m] = selectedMonth.split('-');
  const monthLabel = new Date(+y, +m - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const filtered = useMemo(() => {
    return exams.filter(e => {
      if (e.status === 'Cancelado') return false;
      return e.createdAt.startsWith(selectedMonth);
    });
  }, [exams, selectedMonth]);

  const kpis = useMemo(() => {
    const totalExams = filtered.length;
    const revenue = filtered.reduce((a, e) => a + e.clientValue, 0);
    const paid = filtered.reduce((a, e) => a + e.radiologistValue, 0);
    const margin = filtered.reduce((a, e) => a + e.margin, 0);
    const ticket = totalExams > 0 ? revenue / totalExams : 0;
    const activeClients = new Set(filtered.map(e => e.clientId)).size;
    return { totalExams, revenue, paid, margin, ticket, activeClients };
  }, [filtered]);

  // Chart data: days in the selected month
  const chartData = useMemo(() => {
    const year = +y;
    const month = +m;
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
      const dayExams = exams.filter(e => e.createdAt === dateStr && e.status !== 'Cancelado');
      return {
        date: `${day}/${month}`,
        exames: dayExams.length,
        faturamento: dayExams.reduce((a, e) => a + e.clientValue, 0),
      };
    });
  }, [exams, selectedMonth, y, m]);

  // Production table
  const production = useMemo(() => {
    return radiologists.map(r => {
      const rExams = filtered.filter(e => e.radiologistId === r.id && e.status === 'Finalizado');
      return {
        ...r,
        count: rExams.length,
        generated: rExams.reduce((a, e) => a + e.clientValue, 0),
        toReceive: rExams.reduce((a, e) => a + e.radiologistValue, 0),
      };
    }).filter(r => r.count > 0);
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral operacional e financeira</p>
      </div>

      {/* Month Selector */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeMonth(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium capitalize min-w-[160px] text-center">{monthLabel}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeMonth(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard icon={FileText} label="Total de Exames" value={String(kpis.totalExams)} color="blue" />
        <KpiCard icon={DollarSign} label="Faturamento" value={fmt(kpis.revenue)} color="emerald" />
        <KpiCard icon={TrendingUp} label="Pago Radiologistas" value={fmt(kpis.paid)} color="amber" />
        <KpiCard icon={Percent} label="Margem Total" value={fmt(kpis.margin)} color="violet" />
        <KpiCard icon={Activity} label="Ticket Médio" value={fmt(kpis.ticket)} color="sky" />
        <KpiCard icon={Users} label="Clientes Ativos" value={String(kpis.activeClients)} color="rose" />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Exames por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line type="monotone" dataKey="exames" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: 'hsl(var(--primary))' }} name="Exames" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento por Dia (R$)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(v: number) => [fmt(v), 'Faturamento']}
                />
                <Line type="monotone" dataKey="faturamento" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={{ r: 3 }} name="Faturamento" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Production Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Produção por Radiologista</CardTitle>
        </CardHeader>
        <CardContent>
          {production.length === 0 ? (
            <EmptyState message="Nenhuma produção no período" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs uppercase">
                    <th className="text-left py-2 pr-4 font-medium">Radiologista</th>
                    <th className="text-right py-2 pr-4 font-medium">Qtde Exames</th>
                    <th className="text-right py-2 pr-4 font-medium">Valor Gerado</th>
                    <th className="text-right py-2 font-medium">A Receber</th>
                  </tr>
                </thead>
                <tbody>
                  {production.map(r => (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 pr-4 font-medium">{r.name}</td>
                      <td className="py-3 pr-4 text-right">{r.count}</td>
                      <td className="py-3 pr-4 text-right text-emerald-600">{fmt(r.generated)}</td>
                      <td className="py-3 text-right text-amber-600">{fmt(r.toReceive)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-500/10',
    emerald: 'text-emerald-600 bg-emerald-500/10',
    amber: 'text-amber-600 bg-amber-500/10',
    violet: 'text-violet-600 bg-violet-500/10',
    sky: 'text-sky-600 bg-sky-500/10',
    rose: 'text-rose-600 bg-rose-500/10',
  };
  return (
    <Card className="hover:border-border/80 transition-colors">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colorMap[color])}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground leading-none mb-1">{label}</p>
            <p className="text-lg font-bold leading-none">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
      <Activity className="h-8 w-8 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
