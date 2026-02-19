import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { clients, examTypes, calcValues, Exam, ExamCategory } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { PlusCircle, Upload, CheckCircle2, AlertTriangle } from 'lucide-react';

// Simulating as OralMax client
const SIMULATED_CLIENT_ID = 'c1';

function generateId(): string {
  return 'EX' + String(Math.floor(Math.random() * 900) + 100);
}

export default function NovoExame() {
  const { addExam } = useApp();
  const [form, setForm] = useState({
    patientName: '',
    patientBirthDate: '',
    examCategory: '' as ExamCategory | '',
    examTypeId: '',
    observations: '',
    urgent: false,
    urgentDate: '',
    urgentTime: '',
  });
  const [fileUploaded, setFileUploaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const filteredExamTypes = form.examCategory
    ? examTypes.filter(t => t.category === form.examCategory)
    : [];

  const handleSubmit = () => {
    if (!form.patientName || !form.patientBirthDate || !form.examCategory || !form.examTypeId) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }
    if (form.urgent && (!form.urgentDate || !form.urgentTime)) {
      toast({ title: 'Informe a data e o horário desejados para o exame urgente', variant: 'destructive' });
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const { clientValue } = calcValues(SIMULATED_CLIENT_ID, form.examTypeId, null);
    const id = generateId();
    const newExam: Exam = {
      id,
      clientId: SIMULATED_CLIENT_ID,
      patientName: form.patientName,
      patientBirthDate: form.patientBirthDate,
      examTypeId: form.examTypeId,
      examCategory: form.examCategory as ExamCategory,
      software: 'Axel', // default, will be assigned later
      radiologistId: null,
      status: 'Disponível',
      clientValue,
      radiologistValue: 0,
      margin: clientValue,
      observations: form.observations,
      createdAt: today,
      statusHistory: [{ status: 'Disponível', date: today, by: 'Portal Cliente' }],
      files: [],
      urgent: form.urgent,
      urgentDate: form.urgent ? form.urgentDate : undefined,
      urgentTime: form.urgent ? form.urgentTime : undefined,
    };
    addExam(newExam);
    setSubmitted(true);
    toast({ title: '✅ Exame enviado!', description: `Exame ${id} criado com sucesso. Um radiologista irá assumir em breve.` });
  };

  const handleNew = () => {
    setForm({ patientName: '', patientBirthDate: '', examCategory: '', examTypeId: '', observations: '', urgent: false, urgentDate: '', urgentTime: '' });
    setFileUploaded(false);
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="h-16 w-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold">Exame Enviado com Sucesso!</h2>
        <p className="text-muted-foreground text-sm text-center max-w-sm">
          Seu exame foi registrado e está disponível para ser assumido por um radiologista.
          Acompanhe o status em <strong>Meus Exames</strong>.
        </p>
        <Button onClick={handleNew} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Enviar Novo Exame
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Novo Exame</h1>
        <p className="text-sm text-muted-foreground">Solicitando como: {clients.find(c => c.id === SIMULATED_CLIENT_ID)?.name}</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Dados do Paciente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Nome do Paciente *</Label>
              <Input
                placeholder="Nome completo"
                value={form.patientName}
                onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Data de Nascimento *</Label>
              <Input
                type="date"
                value={form.patientBirthDate}
                onChange={e => setForm(f => ({ ...f, patientBirthDate: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Dados do Exame</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Categoria do Exame *</Label>
              <Select
                value={form.examCategory}
                onValueChange={v => setForm(f => ({ ...f, examCategory: v as ExamCategory, examTypeId: '' }))}
              >
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="radiografia">Radiografia</SelectItem>
                  <SelectItem value="tomografia">Tomografia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de Exame *</Label>
              <Select
                value={form.examTypeId}
                onValueChange={v => setForm(f => ({ ...f, examTypeId: v }))}
                disabled={!form.examCategory}
              >
                <SelectTrigger><SelectValue placeholder={form.examCategory ? 'Selecionar...' : 'Escolha a categoria primeiro'} /></SelectTrigger>
                <SelectContent>
                  {filteredExamTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea
              placeholder="Informações adicionais, queixa principal..."
              value={form.observations}
              onChange={e => setForm(f => ({ ...f, observations: e.target.value }))}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Urgência */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Urgência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <Label htmlFor="urgent-switch" className="cursor-pointer">Marcar como urgente</Label>
            </div>
            <Switch
              id="urgent-switch"
              checked={form.urgent}
              onCheckedChange={v => setForm(f => ({ ...f, urgent: v, urgentDate: v ? f.urgentDate : '', urgentTime: v ? f.urgentTime : '' }))}
            />
          </div>
          {form.urgent && (
            <div className="space-y-1.5 border-l-2 border-amber-500/50 pl-4 animate-in slide-in-from-top-2">
              <Label>Para quando você precisa do exame? *</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Data</Label>
                  <Input
                    type="date"
                    value={form.urgentDate}
                    onChange={e => setForm(f => ({ ...f, urgentDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Horário</Label>
                  <Input
                    type="time"
                    value={form.urgentTime}
                    onChange={e => setForm(f => ({ ...f, urgentTime: e.target.value }))}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Informe a data e o horário desejados para priorização do laudo.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File upload */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Arquivos do Exame</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              fileUploaded ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setFileUploaded(true)}
          >
            {fileUploaded ? (
              <div className="text-emerald-400">
                <CheckCircle2 className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm font-medium">imagens_exame.dcm — Upload concluído</p>
              </div>
            ) : (
              <div className="text-muted-foreground">
                <Upload className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Clique para fazer upload (simulado)</p>
                <p className="text-xs mt-1">DICOM, JPEG, PNG — até 200MB</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button size="lg" className="w-full gap-2" onClick={handleSubmit}>
        <PlusCircle className="h-4 w-4" />
        Enviar Exame
      </Button>
    </div>
  );
}
