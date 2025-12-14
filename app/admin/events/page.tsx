'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit, Calendar as CalendarIcon, Clock, MapPin, Link as LinkIcon, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  description: string;
  typeOfEvent: string;
  startDate: string;
  endDate: string | null;
  startTime: string;
  endTime: string;
  location: string;
  link: string | null;
  uploadedAt: string;
}

const EVENT_TYPES = [
  { value: 'conference', label: 'Conferencia' },
  { value: 'workshop', label: 'Taller' },
  { value: 'seminar', label: 'Seminario' },
  { value: 'lecture', label: 'Clase Magistral' },
  { value: 'symposium', label: 'Simposio' },
  { value: 'meeting', label: 'Reunión' },
  { value: 'other', label: 'Otro' },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [typeOfEvent, setTypeOfEvent] = useState('conference');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isSameDay, setIsSameDay] = useState(true);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data.data || []);
    } catch (error) {
      toast.error('Error al cargar los eventos');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setTitle(event.title);
      setDescription(event.description);
      setTypeOfEvent(event.typeOfEvent);
      setStartDate(new Date(event.startDate));
      setEndDate(event.endDate ? new Date(event.endDate) : undefined);
      setIsSameDay(!event.endDate || event.startDate === event.endDate);
      setStartTime(event.startTime);
      setEndTime(event.endTime);
      setLocation(event.location);
      setLink(event.link || '');
    } else {
      setEditingEvent(null);
      setTitle('');
      setDescription('');
      setTypeOfEvent('conference');
      setStartDate(undefined);
      setEndDate(undefined);
      setIsSameDay(true);
      setStartTime('');
      setEndTime('');
      setLocation('');
      setLink('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setTypeOfEvent('conference');
    setStartDate(undefined);
    setEndDate(undefined);
    setIsSameDay(true);
    setStartTime('');
    setEndTime('');
    setLocation('');
    setLink('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !startDate || !startTime || !endTime || !location.trim()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (!isSameDay && !endDate) {
      toast.error('Por favor selecciona la fecha de fin');
      return;
    }

    setSubmitting(true);

    try {
      const body = {
        title,
        description,
        typeOfEvent,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: isSameDay ? null : (endDate ? format(endDate, 'yyyy-MM-dd') : null),
        startTime,
        endTime,
        location,
        link: link.trim() || null,
      };

      const url = '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';

      if (editingEvent) {
        Object.assign(body, { id: editingEvent.id });
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save event');
      }

      toast.success(
        editingEvent
          ? 'Evento actualizado exitosamente'
          : 'Evento creado exitosamente'
      );

      handleCloseDialog();
      fetchEvents();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al guardar el evento'
      );
      console.error('Error saving event:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEvent) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/events?id=${deletingEvent.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete event');
      }

      toast.success('Evento eliminado exitosamente');
      setDeleteDialogOpen(false);
      setDeletingEvent(null);
      fetchEvents();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al eliminar el evento'
      );
      console.error('Error deleting event:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // Remove seconds
  };

  const getEventTypeLabel = (type: string) => {
    return EVENT_TYPES.find(t => t.value === type)?.label || type;
  };

  const isUpcoming = (startDateString: string, endDateString: string | null) => {
    const endDate = endDateString ? new Date(endDateString) : new Date(startDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return endDate >= today;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <CalendarIcon className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-lab-white">Eventos</h2>
            <p className="text-lab-gray-400 text-sm mt-1">Gestiona los eventos del laboratorio</p>
          </div>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Evento
        </Button>
      </div>

      {/* Stats Card */}
      <Card className="bg-lab-gray-100/50 border-lab-white/10">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-lab-gray-400 mb-1">Total de Eventos</p>
              <p className="text-3xl font-bold text-lab-white">{events.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <CalendarIcon className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-lab-gray-100/50 border-lab-white/10">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-lab-gray-400 mx-auto mb-4" />
              <p className="text-lab-gray-400">No hay eventos registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <div className="inline-block min-w-full align-middle px-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-lab-white/10 hover:bg-transparent">
                      <TableHead className="text-lab-gray-400">Estado</TableHead>
                      <TableHead className="text-lab-gray-400">Evento</TableHead>
                      <TableHead className="text-lab-gray-400">Tipo</TableHead>
                      <TableHead className="text-lab-gray-400">Fecha & Hora</TableHead>
                      <TableHead className="text-lab-gray-400">Ubicación</TableHead>
                      <TableHead className="text-lab-gray-400 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id} className="border-lab-white/10 hover:bg-lab-white/5">
                        <TableCell>
                          <Badge
                            className={
                              isUpcoming(event.startDate, event.endDate)
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-lab-gray-400/20 text-lab-gray-400 border-lab-gray-400/30'
                            }
                          >
                            {isUpcoming(event.startDate, event.endDate) ? 'Próximo' : 'Pasado'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-lab-white">{event.title}</p>
                            <p className="text-sm text-lab-gray-400 line-clamp-1">{event.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-lab-gray-400">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-400 rounded border border-purple-500/30">
                            {getEventTypeLabel(event.typeOfEvent)}
                          </span>
                        </TableCell>
                        <TableCell className="text-lab-gray-400">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-3.5 h-3.5" />
                              <span className="text-sm">
                                {formatDate(event.startDate)}
                                {event.endDate && event.startDate !== event.endDate && (
                                  <> - {formatDate(event.endDate)}</>
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="text-sm">{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-lab-gray-400">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-sm truncate max-w-[150px]">{event.location}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {event.link && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(event.link!, '_blank')}
                                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                              >
                                <LinkIcon className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(event)}
                              className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeletingEvent(event);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-lab-gray-100 border-lab-white/20 text-lab-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {editingEvent ? 'Editar Evento' : 'Crear Evento'}
            </DialogTitle>
            <DialogDescription className="text-lab-gray-400">
              {editingEvent
                ? 'Actualiza la información del evento'
                : 'Crea un nuevo evento para el laboratorio'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <FieldGroup className="space-y-4">
              <Field>
                <Label className="text-lab-white">
                  Título <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Nombre del evento"
                  className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white placeholder:text-lab-gray-400"
                />
              </Field>

              <Field>
                <Label className="text-lab-white">
                  Descripción <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Descripción del evento"
                  rows={4}
                  className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white placeholder:text-lab-gray-400"
                />
              </Field>

              <Field>
                <Label className="text-lab-white">
                  Tipo de Evento <span className="text-red-400">*</span>
                </Label>
                <Select value={typeOfEvent} onValueChange={setTypeOfEvent} required>
                  <SelectTrigger className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-lab-gray-100 border-lab-white/20">
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-lab-white">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <Label className="text-lab-white">
                  Fecha de Inicio <span className="text-red-400">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal bg-lab-gray-200/50 border-lab-white/10 text-lab-white hover:bg-lab-gray-200/70 hover:text-lab-white ${
                        !startDate && 'text-lab-gray-400'
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP', { locale: es }) : 'Selecciona una fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-lab-gray-100 border-lab-white/20" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      locale={es}
                      className="rounded-md"
                    />
                  </PopoverContent>
                </Popover>
              </Field>

              <Field>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-lab-white">¿Es del mismo día?</Label>
                  <Switch
                    checked={isSameDay}
                    onCheckedChange={setIsSameDay}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>
              </Field>

              {!isSameDay && (
                <Field>
                  <Label className="text-lab-white">
                    Fecha de Fin <span className="text-red-400">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal bg-lab-gray-200/50 border-lab-white/10 text-lab-white hover:bg-lab-gray-200/70 hover:text-lab-white ${
                          !endDate && 'text-lab-gray-400'
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PPP', { locale: es }) : 'Selecciona una fecha'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-lab-gray-100 border-lab-white/20" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        locale={es}
                        disabled={(date) => startDate ? date < startDate : false}
                        className="rounded-md"
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <Label className="text-lab-white">
                    Hora de Inicio <span className="text-red-400">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={startTime.split(':')[0] || '09'}
                      onValueChange={(hour) => {
                        const minute = startTime.split(':')[1] || '00';
                        setStartTime(`${hour}:${minute}`);
                      }}
                    >
                      <SelectTrigger className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-lab-gray-400" />
                          <SelectValue placeholder="HH" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-lab-gray-100 border-lab-white/20 max-h-[200px]">
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <SelectItem key={hour} value={hour} className="text-lab-white">
                              {hour}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <span className="flex items-center text-lab-white">:</span>
                    <Select
                      value={startTime.split(':')[1] || '00'}
                      onValueChange={(minute) => {
                        const hour = startTime.split(':')[0] || '09';
                        setStartTime(`${hour}:${minute}`);
                      }}
                    >
                      <SelectTrigger className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent className="bg-lab-gray-100 border-lab-white/20 max-h-[200px]">
                        {Array.from({ length: 60 }, (_, i) => {
                          const minute = i.toString().padStart(2, '0');
                          return (
                            <SelectItem key={minute} value={minute} className="text-lab-white">
                              {minute}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </Field>

                <Field>
                  <Label className="text-lab-white">
                    Hora de Fin <span className="text-red-400">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={endTime.split(':')[0] || '10'}
                      onValueChange={(hour) => {
                        const minute = endTime.split(':')[1] || '00';
                        setEndTime(`${hour}:${minute}`);
                      }}
                    >
                      <SelectTrigger className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-lab-gray-400" />
                          <SelectValue placeholder="HH" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-lab-gray-100 border-lab-white/20 max-h-[200px]">
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <SelectItem key={hour} value={hour} className="text-lab-white">
                              {hour}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <span className="flex items-center text-lab-white">:</span>
                    <Select
                      value={endTime.split(':')[1] || '00'}
                      onValueChange={(minute) => {
                        const hour = endTime.split(':')[0] || '10';
                        setEndTime(`${hour}:${minute}`);
                      }}
                    >
                      <SelectTrigger className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent className="bg-lab-gray-100 border-lab-white/20 max-h-[200px]">
                        {Array.from({ length: 60 }, (_, i) => {
                          const minute = i.toString().padStart(2, '0');
                          return (
                            <SelectItem key={minute} value={minute} className="text-lab-white">
                              {minute}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </Field>
              </div>

              <Field>
                <Label className="text-lab-white">
                  Ubicación <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  placeholder="Lugar donde se realizará el evento"
                  className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white placeholder:text-lab-gray-400"
                />
              </Field>

              <Field>
                <Label className="text-lab-white">Enlace</Label>
                <Input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://ejemplo.com/evento"
                  className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white placeholder:text-lab-gray-400"
                />
                <p className="text-xs text-lab-gray-400 mt-1">Opcional: enlace para más información o registro</p>
              </Field>
            </FieldGroup>

            <div className="flex justify-end gap-3 pt-4 border-t border-lab-white/10 mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCloseDialog}
                disabled={submitting}
                className="text-lab-gray-400 hover:text-lab-white hover:bg-lab-white/5"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>{editingEvent ? 'Actualizar' : 'Crear'} Evento</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-lab-gray-100 border-lab-white/20 text-lab-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-400">Eliminar Evento</DialogTitle>
            <DialogDescription className="text-lab-gray-400">
              ¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {deletingEvent && (
            <div className="py-4">
              <p className="font-semibold text-lab-white mb-1">{deletingEvent.title}</p>
              <p className="text-sm text-lab-gray-400 mb-2">{deletingEvent.description}</p>
              <div className="flex items-center gap-4 text-xs text-lab-gray-500">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {formatDate(deletingEvent.startDate)}
                  {deletingEvent.endDate && deletingEvent.startDate !== deletingEvent.endDate && (
                    <> - {formatDate(deletingEvent.endDate)}</>
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {deletingEvent.location}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingEvent(null);
              }}
              disabled={submitting}
              className="text-lab-gray-400 hover:text-lab-white hover:bg-lab-white/5"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
