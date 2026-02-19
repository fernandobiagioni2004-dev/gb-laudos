import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { clients, examTypes } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Users, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export default function Clientes() {
  const { exams } = useApp();
  const [detail, setDetail] = useState<string | null>(null);

  const rows = useMemo(() => clients.map(c => {
    const cExams = exams.filter(e => e.clientId === c.id && e.status !== 'Cancelado');
    const revenue = cExams.reduce((a, e) => a + e.clientValue, 0);
    const paid = cExams.reduce((a, e) => a + e.radiologistValue, 0);
    const margin = revenue - paid;
    return { ...c, examCount: cExams.length, revenue, paid, margin };
  }), [exams]);

  const detailClient = detail ? clients.find(c => c.id === detail) : null;
  const detailExams = detail ? exams.filter(e => e.clientId === detail) : [];
  const detailRevenue = detailExams.filter(e => e.status !== 'Cancelado').reduce((a, e) => a + e.clientValue, 0);
  const detailPaid = detailExams.filter(e => e.status !== 'Cancelado').reduce((a, e) => a + e.radiologistValue, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="text-sm text-muted-foreground">{clients.length} clientes cadastrados</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {rows.map(c => (
          <Card key={c.id} className="hover:border-border/80 transition-colors">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.cnpj}</p>
                  <p className="text-xs text-muted-foreground">{c.email}</p>
                </div>
                <span className={cn('flex items-center gap-1 text-xs px-2 py-1 rounded-full',
                  c.status === 'Ativo' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400',
                )}>
                  {c.status === 'Ativo' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {c.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/30 rounded p-2">
                  <p className="text-xs text-muted-foreground">Exames</p>
                  <p className="font-bold text-sm">{c.examCount}</p>
                </div>
                <div className="bg-muted/30 rounded p-2">
                  <p className="text-xs text-muted-foreground">Faturado</p>
                  <p className="font-bold text-sm text-emerald-400">{fmt(c.revenue)}</p>
                </div>
                <div className="bg-muted/30 rounded p-2">
                  <p className="text-xs text-muted-foreground">Margem</p>
                  <p className="font-bold text-sm text-blue-400">{fmt(c.margin)}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setDetail(c.id)}>
                <Eye className="h-3.5 w-3.5" />
                Ver detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailClient?.name}</DialogTitle>
            <DialogDescription>{detailClient?.cnpj} · {detailClient?.email}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Faturado</p>
              <p className="font-bold text-emerald-400">{fmt(detailRevenue)}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Pago</p>
              <p className="font-bold text-amber-400">{fmt(detailPaid)}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Margem</p>
              <p className="font-bold text-blue-400">{fmt(detailRevenue - detailPaid)}</p>
            </div>
          </div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Histórico de Exames</div>
          <div className="space-y-2">
            {detailExams.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-border/50 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-primary text-xs">{e.id}</span>
                  <span>{e.patientName}</span>
                  <span className="text-muted-foreground">{examTypes.find(t => t.id === e.examTypeId)?.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400">{fmt(e.clientValue)}</span>
                  <StatusBadge status={e.status} />
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
