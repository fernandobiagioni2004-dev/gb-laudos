import { useState, useMemo } from 'react';
import { useExams } from '@/hooks/useExams';
import { useSupabaseClients } from '@/hooks/useSupabaseClients';
import { useRadiologists } from '@/hooks/useRadiologists';
import { useExamTypes } from '@/hooks/useExamTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download, BarChart3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export default function Relatorios() {
  const { data: exams = [] } = useExams();
  const { data: clients = [] } = useSupabaseClients();
  const { data: radiologists = [] } = useRadiologists();
  const { data: examTypes = [] } = useExamTypes();

  const [radFilter, setRadFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [examTypeFilter, setExamTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'radiologista' | 'cliente'>('radiologista');

  const radReport = useMemo(() => {
    return radiologists.map(r => {
      const rExams = exams.filter(e => {
        const okRad = radFilter === 'all' || e.radiologista_id === Number(radFilter);
        const okClient = clientFilter === 'all' || e.client_id === Number(clientFilter);
        const okType = examTypeFilter === 'all' || e.exam_type_id === Number(examTypeFilter);
        return e.radiologista_id === r.id && e.status === 'Finalizado' && okRad && okClient && okType;
      });
      const qty = rExams.length;
      const total = rExams.reduce((a, e) => a + (e.valor_radiologista ?? 0), 0);
      const unit = qty > 0 ? total / qty : 0;
      return { ...r, qty, unit, total };
    }).filter(r => r.qty > 0);
  }, [exams, radiologists, radFilter, clientFilter, examTypeFilter]);

  const clientReport = useMemo(() => {
    return clients.map(c => {
      const cExams = exams.filter(e => e.client_id === c.id && e.status !== 'Cancelado');
      const revenue = cExams.reduce((a, e) => a + (e.valor_cliente ?? 0), 0);
      const paid = cExams.reduce((a, e) => a + (e.valor_radiologista ?? 0), 0);
      return { ...c, revenue, paid, margin: revenue - paid, examCount: cExams.length };
    });
  }, [exams, clients]);

  const handleExport = () => {
    toast({ title: '📥 CSV gerado!', description: 'O arquivo foi preparado para download (simulado).' });
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Relatórios</h1><p className="text-sm text-muted-foreground">Análise financeira e operacional</p></div>

      <div className="flex gap-2">
        {(['radiologista', 'cliente'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${activeTab === tab ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
            {tab === 'radiologista' ? 'Por Radiologista' : 'Por Cliente'}
          </button>
        ))}
      </div>

      {activeTab === 'radiologista' && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap items-end">
            <div className="space-y-1"><Label className="text-xs">Radiologista</Label>
              <Select value={radFilter} onValueChange={setRadFilter}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{radiologists.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.nome}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Cliente</Label>
              <Select value={clientFilter} onValueChange={setClientFilter}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{clients.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Tipo de Exame</Label>
              <Select value={examTypeFilter} onValueChange={setExamTypeFilter}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{examTypes.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.nome}</SelectItem>)}</SelectContent></Select>
            </div>
            <Button variant="outline" size="sm" className="gap-2 ml-auto" onClick={handleExport}><Download className="h-4 w-4" />Exportar CSV</Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {radReport.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2"><BarChart3 className="h-8 w-8 opacity-20" /><p className="text-sm">Nenhum dado no período</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-muted/30">{['Radiologista', 'Software', 'Qtde', 'Vlr. Unitário', 'Total'].map(h => (<th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">{h}</th>))}</tr></thead>
                    <tbody>
                      {radReport.map(r => (
                        <tr key={r.id} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="py-3 px-4 font-medium">{r.nome}</td>
                          <td className="py-3 px-4 text-muted-foreground">{r.softwares?.join(', ')}</td>
                          <td className="py-3 px-4">{r.qty}</td>
                          <td className="py-3 px-4 text-amber-400">{fmt(r.unit)}</td>
                          <td className="py-3 px-4 text-emerald-400 font-semibold">{fmt(r.total)}</td>
                        </tr>
                      ))}
                      <tr className="bg-muted/20 font-bold">
                        <td className="py-3 px-4" colSpan={2}>Total</td>
                        <td className="py-3 px-4">{radReport.reduce((a, r) => a + r.qty, 0)}</td>
                        <td className="py-3 px-4" />
                        <td className="py-3 px-4 text-emerald-400">{fmt(radReport.reduce((a, r) => a + r.total, 0))}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'cliente' && (
        <div className="space-y-4">
          <div className="flex justify-end"><Button variant="outline" size="sm" className="gap-2" onClick={handleExport}><Download className="h-4 w-4" />Exportar CSV</Button></div>
          <div className="grid md:grid-cols-3 gap-4">
            {clientReport.map(c => (
              <Card key={c.id}>
                <CardHeader className="pb-2"><CardTitle className="text-sm">{c.nome}</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Exames</span><span>{c.examCount}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Faturamento</span><span className="text-emerald-400">{fmt(c.revenue)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Pago</span><span className="text-amber-400">{fmt(c.paid)}</span></div>
                  <div className="flex justify-between border-t border-border pt-2"><span className="font-medium">Margem</span><span className="font-bold text-blue-400">{fmt(c.margin)}</span></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
