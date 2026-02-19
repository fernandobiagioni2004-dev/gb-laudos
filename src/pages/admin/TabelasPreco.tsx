import { useState, useMemo } from 'react';
import { clients, examTypes, radiologists, getPricing, pricing, PricingEntry } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { TrendingUp } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export default function TabelasPreco() {
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [localPricing, setLocalPricing] = useState<PricingEntry[]>(pricing);
  const [clientValue, setClientValue] = useState('');
  const [radValues, setRadValues] = useState<Record<string, string>>({});

  const entry = useMemo(() => {
    if (!selectedClient || !selectedExamType) return null;
    return localPricing.find(p => p.clientId === selectedClient && p.examTypeId === selectedExamType);
  }, [localPricing, selectedClient, selectedExamType]);

  // Load entry values when selection changes
  useMemo(() => {
    if (entry) {
      setClientValue(String(entry.clientValue));
      const rv: Record<string, string> = {};
      radiologists.forEach(r => { rv[r.id] = String(entry.radiologistValues[r.id] ?? ''); });
      setRadValues(rv);
    } else {
      setClientValue('');
      setRadValues({});
    }
  }, [entry]);

  const handleSave = () => {
    const cv = parseFloat(clientValue) || 0;
    const rvMap: Record<string, number> = {};
    Object.entries(radValues).forEach(([id, v]) => { rvMap[id] = parseFloat(v) || 0; });
    setLocalPricing(prev => {
      const idx = prev.findIndex(p => p.clientId === selectedClient && p.examTypeId === selectedExamType);
      const newEntry: PricingEntry = { clientId: selectedClient, examTypeId: selectedExamType, clientValue: cv, radiologistValues: rvMap };
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newEntry;
        return updated;
      }
      return [...prev, newEntry];
    });
    toast({ title: '✅ Tabela salva', description: 'Valores atualizados com sucesso.' });
  };

  const cv = parseFloat(clientValue) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tabelas de Preço</h1>
        <p className="text-sm text-muted-foreground">Configure os valores por cliente, tipo de exame e radiologista</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de Exame</Label>
              <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  {examTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedClient && selectedExamType && (
            <>
              <div className="space-y-1.5">
                <Label>Valor Cliente (R$)</Label>
                <Input type="number" placeholder="0,00" value={clientValue} onChange={e => setClientValue(e.target.value)} />
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Valores por Radiologista</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {radiologists.map(r => (
                    <div key={r.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.software.join(', ')}</p>
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          placeholder="0,00"
                          value={radValues[r.id] ?? ''}
                          onChange={e => setRadValues(prev => ({ ...prev, [r.id]: e.target.value }))}
                          className="text-right"
                        />
                      </div>
                      <div className="w-24 text-right">
                        {radValues[r.id] && cv > 0 && (
                          <span className="text-xs text-blue-400">
                            margem: {fmt(cv - (parseFloat(radValues[r.id]) || 0))}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button className="w-full" onClick={handleSave}>Salvar Tabela</Button>
            </>
          )}

          {!selectedClient || !selectedExamType ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <TrendingUp className="h-8 w-8 opacity-20" />
              <p className="text-sm">Selecione um cliente e tipo de exame</p>
            </div>
          ) : null}
        </div>

        {/* Preview table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Matriz de Preços Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 pr-3">Cliente</th>
                    <th className="text-left py-2 pr-3">Exame</th>
                    <th className="text-right py-2 pr-3">Vlr. Cliente</th>
                    <th className="text-right py-2">Vlr. Mín. Rad.</th>
                  </tr>
                </thead>
                <tbody>
                  {localPricing.map((p, i) => {
                    const minRad = Math.min(...Object.values(p.radiologistValues));
                    return (
                      <tr key={i} className="border-b border-border/40 hover:bg-muted/20">
                        <td className="py-2 pr-3">{clients.find(c => c.id === p.clientId)?.name}</td>
                        <td className="py-2 pr-3">{examTypes.find(e => e.id === p.examTypeId)?.name}</td>
                        <td className="py-2 pr-3 text-right text-emerald-400">{fmt(p.clientValue)}</td>
                        <td className="py-2 text-right text-amber-400">{fmt(minRad)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
