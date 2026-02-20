import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { examTypes } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SIMULATED_CLIENT_ID = 'c1';

function formatDateBR(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'Disponível', label: 'Disponíveis' },
  { value: 'Em análise', label: 'Em análise' },
  { value: 'Finalizado', label: 'Finalizados' },
  { value: 'Cancelado', label: 'Cancelados' },
] as const;

export default function MeusExamesExterno() {
  const { exams } = useApp();
  const [activeFilter, setActiveFilter] = useState('all');

  const myExams = useMemo(() =>
    exams.filter(e => e.clientId === SIMULATED_CLIENT_ID),
    [exams]
  );

  const filteredExams = useMemo(() =>
    activeFilter === 'all' ? myExams : myExams.filter(e => e.status === activeFilter),
    [myExams, activeFilter]
  );

  const countByStatus = (status: string) =>
    status === 'all' ? myExams.length : myExams.filter(e => e.status === status).length;

  const handleDownload = (examId: string) => {
    toast({ title: '📥 Download iniciado', description: `laudo_${examId}.pdf (simulado)` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meus Exames</h1>
        <p className="text-sm text-muted-foreground">{filteredExams.length} exames encontrados</p>
      </div>

      <Tabs value={activeFilter} onValueChange={setActiveFilter}>
        <TabsList className="flex-wrap h-auto gap-1">
          {STATUS_FILTERS.map(f => (
            <TabsTrigger key={f.value} value={f.value} className="text-xs">
              {f.label} ({countByStatus(f.value)})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filteredExams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <FileText className="h-12 w-12 opacity-20" />
          <p className="text-base font-medium">Nenhum exame encontrado</p>
          <p className="text-sm">Envie seu primeiro exame clicando em "Novo Exame"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExams.map(e => {
            const examType = examTypes.find(t => t.id === e.examTypeId);
            return (
              <Card key={e.id} className="hover:border-border/80 transition-colors">
                <CardContent className="flex items-center justify-between py-4 px-5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-primary">{e.id}</span>
                        <span className="font-medium">{e.patientName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{examType?.name}</span>
                        <span>·</span>
                        <span>{e.software}</span>
                        <span>·</span>
                        <span>{formatDateBR(e.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={e.status} />
                    {e.status === 'Finalizado' && (
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => handleDownload(e.id)}>
                        <Download className="h-3.5 w-3.5" />
                        Baixar Laudo
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
