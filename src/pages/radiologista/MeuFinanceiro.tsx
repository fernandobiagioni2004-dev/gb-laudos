import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { radiologists, clients, examTypes } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { Wallet, TrendingUp, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const SIMULATED_RADIOLOGIST = radiologists[0];

function formatDateBR(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export default function MeuFinanceiro() {
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

  const myExams = useMemo(() =>
    exams.filter(e => e.radiologistId === SIMULATED_RADIOLOGIST.id && e.status !== 'Cancelado'),
    [exams]
  );

  const monthExams = useMemo(() =>
    myExams.filter(e => e.createdAt.startsWith(selectedMonth)),
    [myExams, selectedMonth]
  );

  const finalized = monthExams.filter(e => e.status === 'Finalizado');
  const inProgress = monthExams.filter(e => e.status === 'Em análise');
  const totalReceived = finalized.reduce((a, e) => a + e.radiologistValue, 0);
  const totalPending = inProgress.reduce((a, e) => a + e.radiologistValue, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meu Financeiro</h1>
        <p className="text-sm text-muted-foreground">{SIMULATED_RADIOLOGIST.name}</p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm font-medium capitalize min-w-[160px] text-center">{monthLabel}</span>
        <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total a Receber</p>
              <p className="text-xl font-bold text-emerald-600">{fmt(totalReceived)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Em Análise (pendente)</p>
              <p className="text-xl font-bold text-amber-600">{fmt(totalPending)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Exames Finalizados</p>
              <p className="text-xl font-bold">{finalized.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Histórico Financeiro</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {finalized.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Wallet className="h-8 w-8 opacity-20" />
              <p className="text-sm">Nenhum exame finalizado neste mês</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['Exame', 'Cliente', 'Tipo', 'Data', 'Valor', 'Status'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {finalized.map(e => (
                    <tr key={e.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="py-3 px-4 font-mono text-xs text-primary">{e.id}</td>
                      <td className="py-3 px-4">{clients.find(c => c.id === e.clientId)?.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{examTypes.find(t => t.id === e.examTypeId)?.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{formatDateBR(e.createdAt)}</td>
                      <td className="py-3 px-4 text-emerald-600 font-medium">{fmt(e.radiologistValue)}</td>
                      <td className="py-3 px-4"><StatusBadge status={e.status} /></td>
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
