import React, { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useApp } from '@/context/AppContext';
import { CalendarEvent, radiologists } from '@/data/mockData';
import { format, isWithinInterval, parseISO, isSameDay, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CalendarIcon, Plus, Sun, Users, MoreVertical, Pencil, Trash2, Palmtree } from 'lucide-react';
import { cn } from '@/lib/utils';

const participantOptions = [
  { id: 'admin', name: 'Administrador' },
  ...radiologists.map(r => ({ id: r.id, name: r.name })),
];

const durationOptions = [
  { value: 15, label: '15min' },
  { value: 30, label: '30min' },
  { value: 45, label: '45min' },
  { value: 60, label: '1h' },
  { value: 90, label: '1h30' },
  { value: 120, label: '2h' },
];

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
}

export default function Calendario() {
  const { role, calendarEvents, addCalendarEvent, updateCalendarEvent, removeCalendarEvent } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [feriasDialogOpen, setFeriasDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editingFerias, setEditingFerias] = useState<CalendarEvent | null>(null);

  // Meeting form state
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDuration, setNewDuration] = useState<number>(60);
  const [newParticipants, setNewParticipants] = useState<string[]>([]);
  const [newDescription, setNewDescription] = useState('');

  // Vacation form state
  const [feriasRadiologistId, setFeriasRadiologistId] = useState('');
  const [feriasStartDate, setFeriasStartDate] = useState('');
  const [feriasEndDate, setFeriasEndDate] = useState('');
  const [feriasDescription, setFeriasDescription] = useState('');

  const currentUserId = role === 'admin' ? 'admin' : 'r1';

  const visibleEvents = useMemo(() => {
    return calendarEvents.filter(ev => {
      if (ev.type === 'ferias') return true;
      if (role === 'admin') return true;
      return ev.participants.includes(currentUserId);
    });
  }, [calendarEvents, role, currentUserId]);

  const eventDays = useMemo(() => {
    const days: { ferias: Date[]; reuniao: Date[] } = { ferias: [], reuniao: [] };
    visibleEvents.forEach(ev => {
      const interval = { start: parseISO(ev.startDate), end: parseISO(ev.endDate) };
      const allDays = eachDayOfInterval(interval);
      allDays.forEach(d => {
        days[ev.type].push(d);
      });
    });
    return days;
  }, [visibleEvents]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return visibleEvents.filter(ev => {
      const start = parseISO(ev.startDate);
      const end = parseISO(ev.endDate);
      return isWithinInterval(selectedDate, { start, end }) || isSameDay(selectedDate, start) || isSameDay(selectedDate, end);
    });
  }, [selectedDate, visibleEvents]);

  const toggleParticipant = (id: string) => {
    setNewParticipants(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setNewDuration(60);
    setNewParticipants([]);
    setNewDescription('');
    setEditingEvent(null);
  };

  const resetFeriasForm = () => {
    setFeriasRadiologistId('');
    setFeriasStartDate('');
    setFeriasEndDate('');
    setFeriasDescription('');
    setEditingFerias(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openFeriasDialog = () => {
    resetFeriasForm();
    setFeriasDialogOpen(true);
  };

  const openEditDialog = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setNewTitle(ev.title);
    setNewDate(ev.startDate);
    setNewTime(ev.time || '');
    setNewDuration(ev.duration || 60);
    setNewParticipants([...ev.participants]);
    setNewDescription(ev.description);
    setDialogOpen(true);
  };

  const openEditFeriasDialog = (ev: CalendarEvent) => {
    setEditingFerias(ev);
    setFeriasRadiologistId(ev.participants[0] || '');
    setFeriasStartDate(ev.startDate);
    setFeriasEndDate(ev.endDate);
    setFeriasDescription(ev.description);
    setFeriasDialogOpen(true);
  };

  const handleSaveEvent = () => {
    if (!newTitle || !newDate || !newTime || newParticipants.length === 0) return;
    const event: CalendarEvent = {
      id: editingEvent ? editingEvent.id : `ev_${Date.now()}`,
      title: newTitle,
      type: 'reuniao',
      startDate: newDate,
      endDate: newDate,
      participants: newParticipants,
      description: newDescription,
      createdBy: editingEvent ? editingEvent.createdBy : currentUserId,
      time: newTime,
      duration: newDuration,
    };
    if (editingEvent) {
      updateCalendarEvent(event);
    } else {
      addCalendarEvent(event);
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleSaveFerias = () => {
    if (!feriasRadiologistId || !feriasStartDate || !feriasEndDate) return;
    const radName = radiologists.find(r => r.id === feriasRadiologistId)?.name ?? '';
    const event: CalendarEvent = {
      id: editingFerias ? editingFerias.id : `ev_${Date.now()}`,
      title: `Férias - ${radName}`,
      type: 'ferias',
      startDate: feriasStartDate,
      endDate: feriasEndDate,
      participants: [feriasRadiologistId],
      description: feriasDescription,
      createdBy: editingFerias ? editingFerias.createdBy : currentUserId,
    };
    if (editingFerias) {
      updateCalendarEvent(event);
    } else {
      addCalendarEvent(event);
    }
    setFeriasDialogOpen(false);
    resetFeriasForm();
  };

  const handleDeleteEvent = (ev: CalendarEvent) => {
    removeCalendarEvent(ev.id);
  };

  const getParticipantName = (id: string) => {
    if (id === 'admin') return 'Administrador';
    return radiologists.find(r => r.id === id)?.name ?? id;
  };

  const getRadiologistInitial = (id: string) => {
    const rad = radiologists.find(r => r.id === id);
    if (!rad) return '?';
    return rad.name.replace(/^(Dr\.|Dra\.)\s*/, '').charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendário</h1>
          <p className="text-muted-foreground text-sm">Férias, reuniões e eventos da equipe</p>
        </div>
        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <Button variant="outline" onClick={openFeriasDialog}>
              <Palmtree className="h-4 w-4 mr-2" /> Adicionar Férias
            </Button>
          )}
          <Button onClick={openCreateDialog}><Plus className="h-4 w-4 mr-2" /> Nova Reunião</Button>
        </div>
      </div>

      {/* Meeting Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Editar Reunião' : 'Nova Reunião'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Título</Label>
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ex: Reunião de alinhamento" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Data</Label>
                <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Horário</Label>
                <Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Duração</Label>
                <Select value={String(newDuration)} onValueChange={v => setNewDuration(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map(d => (
                      <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Participantes</Label>
              <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                {participantOptions.map(p => (
                  <div key={p.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`part-${p.id}`}
                      checked={newParticipants.includes(p.id)}
                      onCheckedChange={() => toggleParticipant(p.id)}
                    />
                    <label htmlFor={`part-${p.id}`} className="text-sm cursor-pointer">{p.name}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Detalhes da reunião..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancelar</Button>
            <Button onClick={handleSaveEvent} disabled={!newTitle || !newDate || !newTime || newParticipants.length === 0}>
              {editingEvent ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vacation Dialog */}
      <Dialog open={feriasDialogOpen} onOpenChange={(open) => { setFeriasDialogOpen(open); if (!open) resetFeriasForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFerias ? 'Editar Férias' : 'Adicionar Férias'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Radiologista</Label>
              <Select value={feriasRadiologistId} onValueChange={setFeriasRadiologistId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o radiologista" />
                </SelectTrigger>
                <SelectContent>
                  {radiologists.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Data início</Label>
                <Input type="date" value={feriasStartDate} onChange={e => setFeriasStartDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Data fim</Label>
                <Input type="date" value={feriasEndDate} onChange={e => setFeriasEndDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Descrição (opcional)</Label>
              <Textarea value={feriasDescription} onChange={e => setFeriasDescription(e.target.value)} placeholder="Observações sobre as férias..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setFeriasDialogOpen(false); resetFeriasForm(); }}>Cancelar</Button>
            <Button onClick={handleSaveFerias} disabled={!feriasRadiologistId || !feriasStartDate || !feriasEndDate}>
              {editingFerias ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              className="p-3 pointer-events-auto w-full"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                month: "space-y-4 w-full",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                table: "w-full border-collapse space-y-1",
                head_row: "flex w-full",
                head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "flex-1 h-12 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-12 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground font-semibold",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_hidden: "invisible",
              }}
              modifiers={{
                ferias: eventDays.ferias,
                reuniao: eventDays.reuniao,
              }}
              modifiersStyles={{
                ferias: { position: 'relative' },
                reuniao: { position: 'relative' },
              }}
              components={{
                DayContent: ({ date }) => {
                  const hasFer = eventDays.ferias.some(d => isSameDay(d, date));
                  const hasReun = eventDays.reuniao.some(d => isSameDay(d, date));
                  return (
                    <div className="relative flex flex-col items-center gap-0.5 w-full h-full justify-center">
                      {hasFer && (
                        <div className="absolute inset-x-1 inset-y-0 bg-amber-400/20 rounded-md" />
                      )}
                      <span className="relative z-10">{date.getDate()}</span>
                      <div className="flex gap-0.5 relative z-10">
                        {hasFer && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                        {hasReun && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                      </div>
                    </div>
                  );
                },
              }}
            />
            <div className="flex items-center gap-4 mt-3 px-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Férias</div>
              <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Reunião</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {selectedDate ? format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR }) : 'Selecione um dia'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedDateEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum evento neste dia.</p>
            ) : (
              selectedDateEvents.map(ev => (
                <div
                  key={ev.id}
                  className={cn(
                    "rounded-lg border p-3 space-y-2",
                    ev.type === 'ferias' ? 'border-amber-500/40 bg-amber-500/10' : 'border-blue-500/30 bg-blue-500/5'
                  )}
                >
                  {ev.type === 'ferias' ? (
                    <>
                      {/* Vacation card - enhanced layout */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700 font-semibold text-sm">
                            {getRadiologistInitial(ev.participants[0])}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                              {getParticipantName(ev.participants[0])}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                              <Sun className="h-3 w-3" />
                              Férias
                            </div>
                          </div>
                        </div>
                        {role === 'admin' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditFeriasDialog(ev)}>
                                <Pencil className="h-4 w-4 mr-2" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteEvent(ev)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <div className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-500/10 rounded px-2 py-1 inline-block">
                        📅 {format(parseISO(ev.startDate), 'dd/MM')} a {format(parseISO(ev.endDate), 'dd/MM/yyyy')}
                      </div>
                      {ev.description && <p className="text-xs text-muted-foreground">{ev.description}</p>}
                    </>
                  ) : (
                    <>
                      {/* Meeting card */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{ev.title}</span>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-blue-600 border-blue-500/50">
                            <Users className="h-3 w-3 mr-1" />
                            Reunião
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(ev)}>
                                <Pencil className="h-4 w-4 mr-2" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteEvent(ev)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      {ev.description && <p className="text-xs text-muted-foreground">{ev.description}</p>}
                      <div className="text-xs text-muted-foreground">
                        {ev.time
                          ? `${format(parseISO(ev.startDate), 'dd/MM/yyyy')} às ${ev.time}${ev.duration ? ` (${formatDuration(ev.duration)})` : ''}`
                          : format(parseISO(ev.startDate), 'dd/MM/yyyy')
                        }
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {ev.participants.map(pid => (
                          <Badge key={pid} variant="secondary" className="text-[10px]">{getParticipantName(pid)}</Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
