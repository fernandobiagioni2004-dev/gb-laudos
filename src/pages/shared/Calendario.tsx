import React, { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useRadiologists } from '@/hooks/useRadiologists';
import { useMeetings, useMeetingParticipants, useVacations, useCreateMeeting, useUpdateMeeting, useDeleteMeeting, useCreateVacation, useUpdateVacation, useDeleteVacation, DbMeeting, DbVacation } from '@/hooks/useCalendar';
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

interface CalendarEvent {
  id: number;
  type: 'reuniao' | 'ferias';
  title: string;
  startDate: string;
  endDate: string;
  participantIds: number[];
  description: string;
  time?: string;
  duration?: number;
}

export default function Calendario() {
  const { role } = useApp();
  const { userId } = useAuth();
  const { data: rads = [] } = useRadiologists();
  const { data: meetings = [] } = useMeetings();
  const { data: participants = [] } = useMeetingParticipants();
  const { data: vacations = [] } = useVacations();
  const createMeeting = useCreateMeeting();
  const updateMeeting = useUpdateMeeting();
  const deleteMeeting = useDeleteMeeting();
  const createVacation = useCreateVacation();
  const updateVacationMut = useUpdateVacation();
  const deleteVacation = useDeleteVacation();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [feriasDialogOpen, setFeriasDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editingFerias, setEditingFerias] = useState<CalendarEvent | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDuration, setNewDuration] = useState<number>(60);
  const [newParticipants, setNewParticipants] = useState<number[]>([]);
  const [newDescription, setNewDescription] = useState('');

  const [feriasRadiologistId, setFeriasRadiologistId] = useState('');
  const [feriasStartDate, setFeriasStartDate] = useState('');
  const [feriasEndDate, setFeriasEndDate] = useState('');
  const [feriasDescription, setFeriasDescription] = useState('');

  // Convert DB data to unified events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const meetingEvents: CalendarEvent[] = meetings.map(m => {
      const mParts = participants.filter(p => p.meeting_id === m.id).map(p => p.user_id!);
      const startStr = m.inicio.split('T')[0];
      const timeStr = m.inicio.includes('T') ? m.inicio.split('T')[1]?.substring(0, 5) : '';
      const endTime = new Date(m.fim).getTime();
      const startTime = new Date(m.inicio).getTime();
      const duration = Math.round((endTime - startTime) / (1000 * 60));
      return { id: m.id, type: 'reuniao' as const, title: m.titulo, startDate: startStr, endDate: m.fim.split('T')[0], participantIds: mParts, description: m.descricao ?? '', time: timeStr, duration };
    });
    const vacationEvents: CalendarEvent[] = vacations.map(v => ({
      id: v.id, type: 'ferias' as const, title: `Férias - ${rads.find(r => r.id === v.user_id)?.nome ?? ''}`, startDate: v.data_inicio, endDate: v.data_fim, participantIds: [v.user_id!], description: v.observacao ?? '',
    }));
    return [...meetingEvents, ...vacationEvents];
  }, [meetings, participants, vacations, rads]);

  const participantOptions = useMemo(() => rads.map(r => ({ id: r.id, name: r.nome })), [rads]);

  const visibleEvents = useMemo(() => {
    return calendarEvents.filter(ev => {
      if (ev.type === 'ferias') return true;
      if (role === 'admin') return true;
      return ev.participantIds.includes(userId!);
    });
  }, [calendarEvents, role, userId]);

  const eventDays = useMemo(() => {
    const days: { ferias: Date[]; reuniao: Date[] } = { ferias: [], reuniao: [] };
    visibleEvents.forEach(ev => {
      try {
        const interval = { start: parseISO(ev.startDate), end: parseISO(ev.endDate) };
        const allDays = eachDayOfInterval(interval);
        allDays.forEach(d => { days[ev.type].push(d); });
      } catch {}
    });
    return days;
  }, [visibleEvents]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return visibleEvents.filter(ev => {
      try {
        const start = parseISO(ev.startDate);
        const end = parseISO(ev.endDate);
        return isWithinInterval(selectedDate, { start, end }) || isSameDay(selectedDate, start) || isSameDay(selectedDate, end);
      } catch { return false; }
    });
  }, [selectedDate, visibleEvents]);

  const toggleParticipant = (id: number) => {
    setNewParticipants(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const resetForm = () => { setNewTitle(''); setNewDate(''); setNewTime(''); setNewDuration(60); setNewParticipants([]); setNewDescription(''); setEditingEvent(null); };
  const resetFeriasForm = () => { setFeriasRadiologistId(''); setFeriasStartDate(''); setFeriasEndDate(''); setFeriasDescription(''); setEditingFerias(null); };

  const openCreateDialog = () => { resetForm(); setDialogOpen(true); };
  const openFeriasDialog = () => { resetFeriasForm(); setFeriasDialogOpen(true); };

  const openEditDialog = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setNewTitle(ev.title); setNewDate(ev.startDate); setNewTime(ev.time || ''); setNewDuration(ev.duration || 60);
    setNewParticipants([...ev.participantIds]); setNewDescription(ev.description);
    setDialogOpen(true);
  };

  const openEditFeriasDialog = (ev: CalendarEvent) => {
    setEditingFerias(ev);
    setFeriasRadiologistId(String(ev.participantIds[0] || '')); setFeriasStartDate(ev.startDate); setFeriasEndDate(ev.endDate); setFeriasDescription(ev.description);
    setFeriasDialogOpen(true);
  };

  const handleSaveEvent = () => {
    if (!newTitle || !newDate || !newTime || newParticipants.length === 0) return;
    const inicio = `${newDate}T${newTime}:00`;
    const endDate = new Date(new Date(inicio).getTime() + newDuration * 60 * 1000);
    const fim = endDate.toISOString();
    if (editingEvent) {
      updateMeeting.mutate({ id: editingEvent.id, meeting: { titulo: newTitle, descricao: newDescription, inicio, fim, criado_por: userId }, participantIds: newParticipants });
    } else {
      createMeeting.mutate({ meeting: { titulo: newTitle, descricao: newDescription, inicio, fim, criado_por: userId }, participantIds: newParticipants });
    }
    setDialogOpen(false); resetForm();
  };

  const handleSaveFerias = () => {
    if (!feriasRadiologistId || !feriasStartDate || !feriasEndDate) return;
    if (editingFerias) {
      updateVacationMut.mutate({ id: editingFerias.id, user_id: Number(feriasRadiologistId), data_inicio: feriasStartDate, data_fim: feriasEndDate, observacao: feriasDescription });
    } else {
      createVacation.mutate({ user_id: Number(feriasRadiologistId), data_inicio: feriasStartDate, data_fim: feriasEndDate, observacao: feriasDescription });
    }
    setFeriasDialogOpen(false); resetFeriasForm();
  };

  const handleDeleteEvent = (ev: CalendarEvent) => {
    if (ev.type === 'reuniao') deleteMeeting.mutate(ev.id);
    else deleteVacation.mutate(ev.id);
  };

  const getParticipantName = (id: number) => rads.find(r => r.id === id)?.nome ?? 'Admin';
  const getRadiologistInitial = (id: number) => {
    const rad = rads.find(r => r.id === id);
    if (!rad) return '?';
    return rad.nome.replace(/^(Dr\.|Dra\.)\s*/, '').charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Calendário</h1><p className="text-muted-foreground text-sm">Férias, reuniões e eventos da equipe</p></div>
        <div className="flex items-center gap-2">
          {role === 'admin' && <Button variant="outline" onClick={openFeriasDialog}><Palmtree className="h-4 w-4 mr-2" /> Adicionar Férias</Button>}
          {(role === 'admin' || role === 'radiologista') && <Button onClick={openCreateDialog}><Plus className="h-4 w-4 mr-2" /> Nova Reunião</Button>}
        </div>
      </div>

      {/* Meeting Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingEvent ? 'Editar Reunião' : 'Nova Reunião'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1"><Label>Título</Label><Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ex: Reunião de alinhamento" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1"><Label>Data</Label><Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} /></div>
              <div className="space-y-1"><Label>Horário</Label><Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} /></div>
              <div className="space-y-1"><Label>Duração</Label>
                <Select value={String(newDuration)} onValueChange={v => setNewDuration(Number(v))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{durationOptions.map(d => <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Participantes</Label>
              <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                {participantOptions.map(p => (
                  <div key={p.id} className="flex items-center gap-2">
                    <Checkbox id={`part-${p.id}`} checked={newParticipants.includes(p.id)} onCheckedChange={() => toggleParticipant(p.id)} />
                    <label htmlFor={`part-${p.id}`} className="text-sm cursor-pointer">{p.name}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1"><Label>Descrição</Label><Textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Detalhes..." rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancelar</Button>
            <Button onClick={handleSaveEvent} disabled={!newTitle || !newDate || !newTime || newParticipants.length === 0}>{editingEvent ? 'Salvar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vacation Dialog */}
      <Dialog open={feriasDialogOpen} onOpenChange={(open) => { setFeriasDialogOpen(open); if (!open) resetFeriasForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingFerias ? 'Editar Férias' : 'Adicionar Férias'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1"><Label>Radiologista</Label>
              <Select value={feriasRadiologistId} onValueChange={setFeriasRadiologistId}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{rads.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.nome}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Início</Label><Input type="date" value={feriasStartDate} onChange={e => setFeriasStartDate(e.target.value)} /></div>
              <div className="space-y-1"><Label>Fim</Label><Input type="date" value={feriasEndDate} onChange={e => setFeriasEndDate(e.target.value)} /></div>
            </div>
            <div className="space-y-1"><Label>Descrição</Label><Textarea value={feriasDescription} onChange={e => setFeriasDescription(e.target.value)} rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setFeriasDialogOpen(false); resetFeriasForm(); }}>Cancelar</Button>
            <Button onClick={handleSaveFerias} disabled={!feriasRadiologistId || !feriasStartDate || !feriasEndDate}>{editingFerias ? 'Salvar' : 'Criar'}</Button>
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
                cell: "flex-1 h-12 text-center text-sm p-0 relative",
                day: "h-12 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground font-semibold",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_hidden: "invisible",
              }}
              modifiers={{ ferias: eventDays.ferias, reuniao: eventDays.reuniao }}
              modifiersStyles={{ ferias: { position: 'relative' }, reuniao: { position: 'relative' } }}
              components={{
                DayContent: ({ date }) => {
                  const hasFer = eventDays.ferias.some(d => isSameDay(d, date));
                  const hasReun = eventDays.reuniao.some(d => isSameDay(d, date));
                  return (
                    <div className="relative flex flex-col items-center gap-0.5 w-full h-full justify-center">
                      {hasFer && <div className="absolute inset-x-1 inset-y-0 bg-amber-400/20 rounded-md" />}
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
                <div key={`${ev.type}-${ev.id}`} className={cn("rounded-lg border p-3 space-y-2", ev.type === 'ferias' ? 'border-amber-500/40 bg-amber-500/10' : 'border-blue-500/30 bg-blue-500/5')}>
                  {ev.type === 'ferias' ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700 font-semibold text-sm">
                          {getRadiologistInitial(ev.participantIds[0])}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{ev.title}</p>
                          <p className="text-xs text-muted-foreground">{ev.startDate} → {ev.endDate}</p>
                        </div>
                      </div>
                      {role === 'admin' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditFeriasDialog(ev)}><Pencil className="h-3.5 w-3.5 mr-2" /> Editar</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteEvent(ev)}><Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{ev.title}</p>
                          {ev.time && <p className="text-xs text-muted-foreground">{ev.time}{ev.duration ? ` · ${formatDuration(ev.duration)}` : ''}</p>}
                        </div>
                        {role === 'admin' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(ev)}><Pencil className="h-3.5 w-3.5 mr-2" /> Editar</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteEvent(ev)}><Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      {ev.description && <p className="text-xs text-muted-foreground">{ev.description}</p>}
                      <div className="flex flex-wrap gap-1">
                        {ev.participantIds.map(pid => (
                          <Badge key={pid} variant="secondary" className="text-xs">{getParticipantName(pid)}</Badge>
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
