import { useState, useMemo, useEffect } from 'react';
import { useSupabaseClients } from '@/hooks/useSupabaseClients';
import { useExamTypes } from '@/hooks/useExamTypes';
import { useRadiologists } from '@/hooks/useRadiologists';
import { usePricingClients, usePricingRadiologist, useUpsertPriceClient, useUpsertPriceRadiologist } from '@/hooks/usePricing';
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
  const { data: clients = [] } = useSupabaseClients();
  const { data: examTypes = [] } = useExamTypes();
  const { data: rads = [] } = useRadiologists();
  const { data: priceClients = [] } = usePricingClients();
  const { data: priceRads = [] } = usePricingRadiologist();
  const upsertPC = useUpsertPriceClient();
  const upsertPR = useUpsertPriceRadiologist();

  const [selectedClient, setSelectedClient] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [clientValue, setClientValue] = useState('');
  const [radValues, setRadValues] = useState<Record<string, string>>({});

  const entry = useMemo(() => {
    if (!selectedClient || !selectedExamType) return null;
    return priceClients.find(p => p.client_id === Number(selectedClient) && p.exam_type_id === Number(selectedExamType));
  }, [priceClients, selectedClient, selectedExamType]);

  useEffect(() => {
    if (entry) {
      setClientValue(String(entry.valor_cliente));
      const rv: Record<string, string> = {};
      rads.forEach(r => {
        const pr = priceRads.find(p => p.client_id === Number(selectedClient) && p.exam_type_id === Number(selectedExamType) && p.radiologista_id === r.id);
        rv[String(r.id)] = pr ? String(pr.valor_radiologista) : '';
      });
      setRadValues(rv);
    } else {
      setClientValue('');
      setRadValues({});
    }
  }, [entry, rads, priceRads, selectedClient, selectedExamType]);

  const handleSave = async () => {
    const cv = parseFloat(clientValue) || 0;
    await upsertPC.mutateAsync({ client_id: Number(selectedClient), exam_type_id: Number(selectedExamType), valor_cliente: cv });
    for (const r of rads) {
      const v = parseFloat(radValues[String(r.id)]) || 0;
      if (v > 0) {
        await upsertPR.mutateAsync({ client_id: Number(selectedClient), exam_type_id: Number(selectedExamType), radiologista_id: r.id, valor_radiologista: v });
      }
    }
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
                  {clients.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de Exame</Label>
              <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  {examTypes.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.nome}</SelectItem>)}
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
                <CardHeader className="pb-2"><CardTitle className="text-sm">Valores por Radiologista</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {rads.map(r => (
                    <div key={r.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{r.nome}</p>
                        <p className="text-xs text-muted-foreground">{r.softwares?.join(', ')}</p>
                      </div>
                      <div className="w-32">
                        <Input type="number" placeholder="0,00" value={radValues[String(r.id)] ?? ''} onChange={e => setRadValues(prev => ({ ...prev, [String(r.id)]: e.target.value }))} className="text-right" />
                      </div>
                      <div className="w-24 text-right">
                        {radValues[String(r.id)] && cv > 0 && (
                          <span className="text-xs text-blue-400">margem: {fmt(cv - (parseFloat(radValues[String(r.id)]) || 0))}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Button className="w-full" onClick={handleSave}>Salvar Tabela</Button>
            </>
          )}

          {(!selectedClient || !selectedExamType) && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <TrendingUp className="h-8 w-8 opacity-20" />
              <p className="text-sm">Selecione um cliente e tipo de exame</p>
            </div>
          )}
        </div>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Matriz de Preços Atual</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 pr-3">Cliente</th>
                    <th className="text-left py-2 pr-3">Exame</th>
                    <th className="text-right py-2">Vlr. Cliente</th>
                  </tr>
                </thead>
                <tbody>
                  {priceClients.map((p, i) => (
                    <tr key={i} className="border-b border-border/40 hover:bg-muted/20">
                      <td className="py-2 pr-3">{clients.find(c => c.id === p.client_id)?.nome}</td>
                      <td className="py-2 pr-3">{examTypes.find(e => e.id === p.exam_type_id)?.nome}</td>
                      <td className="py-2 text-right text-emerald-400">{fmt(p.valor_cliente)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
