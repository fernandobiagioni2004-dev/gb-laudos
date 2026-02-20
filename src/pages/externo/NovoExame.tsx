import { useState, useRef } from 'react';
import { useCreateExam } from '@/hooks/useExams';
import { useExamTypes } from '@/hooks/useExamTypes';
import { useSupabaseClients } from '@/hooks/useSupabaseClients';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { PlusCircle, Upload, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function NovoExame() {
  const { profile } = useAuth();
  const { data: examTypes = [] } = useExamTypes();
  const { data: clients = [] } = useSupabaseClients();
  const createExam = useCreateExam();

  const clienteId = profile?.cliente_id;
  const simClient = clients.find(c => c.id === clienteId);

  const [form, setForm] = useState({
    patientName: '',
    patientBirthDate: '',
    dentistName: '',
    examDate: '',
    examCategory: '' as 'radiografia' | 'tomografia' | '',
    examTypeId: '',
    observations: '',
    purpose: '',
    urgent: false,
    urgentDate: '',
    urgentTime: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);

  const filteredExamTypes = form.examCategory
    ? examTypes.filter(t => t.categoria === form.examCategory)
    : [];

  const handleSubmit = async () => {
    if (!form.patientName || !form.patientBirthDate || !form.dentistName || !form.examDate || !form.examCategory || !form.examTypeId) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }
    if (form.urgent && (!form.urgentDate || !form.urgentTime)) {
      toast({ title: 'Informe a data e o horário desejados para o exame urgente', variant: 'destructive' });
      return;
    }

    try {
      await createExam.mutateAsync({
        client_id: clienteId!,
        exam_type_id: Number(form.examTypeId),
        paciente_nome: form.patientName,
        paciente_data_nascimento: form.patientBirthDate,
        software: (simClient?.softwares?.[0] ?? 'Axel') as any,
        status: 'Disponível' as any,
        observacoes: form.observations,
        urgente: form.urgent,
        urgente_data: form.urgent ? form.urgentDate : null,
        urgente_hora: form.urgent ? form.urgentTime : null,
        dentista_nome: form.dentistName,
        finalidade: form.purpose,
        data_exame: form.examDate,
        arquivo_enviado: selectedFile?.name ?? null,
      });
      setSubmitted(true);
    } catch {
      toast({ title: 'Erro ao criar exame', variant: 'destructive' });
    }
  };

  const handleNew = () => {
    setForm({ patientName: '', patientBirthDate: '', dentistName: '', examDate: '', examCategory: '', examTypeId: '', observations: '', purpose: '', urgent: false, urgentDate: '', urgentTime: '' });
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="h-16 w-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold">Exame Enviado com Sucesso!</h2>
        <p className="text-muted-foreground text-sm text-center max-w-sm">
          Seu exame foi registrado e está disponível para ser assumido por um radiologista.
        </p>
        <Button onClick={handleNew} className="gap-2"><PlusCircle className="h-4 w-4" />Enviar Novo Exame</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Novo Exame</h1>
        <p className="text-sm text-muted-foreground">Solicitando como: {simClient?.nome ?? 'Carregando...'}</p>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Dados do Paciente</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5"><Label>Nome do Paciente *</Label><Input placeholder="Nome completo" value={form.patientName} onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Data de Nascimento *</Label><Input type="date" value={form.patientBirthDate} onChange={e => setForm(f => ({ ...f, patientBirthDate: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Nome do Dentista *</Label><Input placeholder="Nome do dentista" value={form.dentistName} onChange={e => setForm(f => ({ ...f, dentistName: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Data do Exame *</Label><Input type="date" value={form.examDate} onChange={e => setForm(f => ({ ...f, examDate: e.target.value }))} /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Dados do Exame</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Categoria *</Label>
              <Select value={form.examCategory} onValueChange={v => setForm(f => ({ ...f, examCategory: v as any, examTypeId: '' }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent><SelectItem value="radiografia">Radiografia</SelectItem><SelectItem value="tomografia">Tomografia</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Tipo *</Label>
              <Select value={form.examTypeId} onValueChange={v => setForm(f => ({ ...f, examTypeId: v }))} disabled={!form.examCategory}>
                <SelectTrigger><SelectValue placeholder={form.examCategory ? 'Selecionar...' : 'Escolha a categoria'} /></SelectTrigger>
                <SelectContent>{filteredExamTypes.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5"><Label>Finalidade</Label><Input placeholder="Ex: Implante, Ortodontia..." value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Urgência</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /><Label htmlFor="urgent-switch" className="cursor-pointer">Marcar como urgente</Label></div>
            <Switch id="urgent-switch" checked={form.urgent} onCheckedChange={v => setForm(f => ({ ...f, urgent: v, urgentDate: v ? f.urgentDate : '', urgentTime: v ? f.urgentTime : '' }))} />
          </div>
          {form.urgent && (
            <div className="space-y-1.5 border-l-2 border-amber-500/50 pl-4 animate-in slide-in-from-top-2">
              <Label>Para quando? *</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Data</Label><Input type="date" value={form.urgentDate} onChange={e => setForm(f => ({ ...f, urgentDate: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Horário</Label><Input type="time" value={form.urgentTime} onChange={e => setForm(f => ({ ...f, urgentTime: e.target.value }))} /></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Observações</CardTitle></CardHeader>
        <CardContent><Textarea placeholder="Informações adicionais..." value={form.observations} onChange={e => setForm(f => ({ ...f, observations: e.target.value }))} rows={3} /></CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Arquivos do Exame</CardTitle></CardHeader>
        <CardContent>
          <input ref={fileInputRef} type="file" accept=".zip" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setSelectedFile(file); }} />
          <div className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${selectedFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border hover:border-primary/50'}`} onClick={() => !selectedFile && fileInputRef.current?.click()}>
            {selectedFile ? (
              <div className="text-emerald-600">
                <CheckCircle2 className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm font-medium">{selectedFile.name} — {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                <Button type="button" variant="ghost" size="sm" className="mt-2 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                  <X className="h-4 w-4 mr-1" /> Remover
                </Button>
              </div>
            ) : (
              <div className="text-muted-foreground"><Upload className="h-6 w-6 mx-auto mb-2 opacity-50" /><p className="text-sm">Clique para upload</p><p className="text-xs mt-1">ZIP — até 1GB</p></div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button size="lg" className="w-full gap-2" onClick={handleSubmit} disabled={createExam.isPending}>
        <PlusCircle className="h-4 w-4" />{createExam.isPending ? 'Enviando...' : 'Enviar Exame'}
      </Button>
    </div>
  );
}
