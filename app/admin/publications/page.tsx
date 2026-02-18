'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit, BookOpen, ExternalLink, FileText, Calendar as CalendarIcon, Users } from 'lucide-react';
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
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Publication {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'book' | 'thesis' | 'technical_report' | 'monograph' | 'other';
  authors: string[];
  publicationDate: string;
  filePath: string | null;
  link: string | null;
}

const PUBLICATION_TYPES = [
  { value: 'article', label: 'Artículo' },
  { value: 'book', label: 'Libro' },
  { value: 'thesis', label: 'Tesis' },
  { value: 'technical_report', label: 'Reporte Técnico' },
  { value: 'monograph', label: 'Monografía' },
  { value: 'other', label: 'Otro' },
];

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [deletingPublication, setDeletingPublication] = useState<Publication | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>('other');
  const [authors, setAuthors] = useState('');
  const [publicationDate, setPublicationDate] = useState<Date | undefined>(undefined);
  const [link, setLink] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/publications');
      if (!response.ok) throw new Error('Failed to fetch publications');
      const data = await response.json();
      setPublications(data.data || []);
    } catch (error) {
      toast.error('Error al cargar las publicaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (publication?: Publication) => {
    if (publication) {
      setEditingPublication(publication);
      setTitle(publication.title);
      setDescription(publication.description);
      setType(publication.type);
      setAuthors(publication.authors.join(', '));
      setPublicationDate(new Date(publication.publicationDate));
      setLink(publication.link || '');
    } else {
      setEditingPublication(null);
      setTitle('');
      setDescription('');
      setType('other');
      setAuthors('');
      setPublicationDate(undefined);
      setLink('');
      setFile(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPublication(null);
    setTitle('');
    setDescription('');
    setType('other');
    setAuthors('');
    setPublicationDate(undefined);
    setLink('');
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file && !link && !editingPublication) {
      toast.error('Debes proporcionar un archivo o un enlace');
      return;
    }

    if (!publicationDate) {
      toast.error('Debes seleccionar una fecha de publicación');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('type', type);
      formData.append('authors', JSON.stringify(authors.split(',').map(a => a.trim())));
      formData.append('publicationDate', publicationDate.toISOString());
      if (link) formData.append('link', link);
      if (file) formData.append('file', file);

      const url = '/api/publications';
      const method = editingPublication ? 'PUT' : 'POST';

      if (editingPublication) {
        formData.append('id', editingPublication.id);
      }

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save publication');
      }

      toast.success(editingPublication ? 'Publicación actualizada exitosamente' : 'Publicación creada exitosamente');
      handleCloseDialog();
      fetchPublications();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar la publicación');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPublication) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/publications?id=${deletingPublication.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete publication');

      toast.success('Publicación eliminada exitosamente');
      setDeleteDialogOpen(false);
      setDeletingPublication(null);
      fetchPublications();
    } catch (error) {
      toast.error('Error al eliminar la publicación');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeLabel = (type: string) => {
    return PUBLICATION_TYPES.find(t => t.value === type)?.label || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      article: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      book: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      thesis: 'bg-green-500/20 text-green-300 border-green-500/50',
      technical_report: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
      monograph: 'bg-pink-500/20 text-pink-300 border-pink-500/50',
      other: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
    };
    return colors[type] || colors.other;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
            <BookOpen className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-lab-white">Publicaciones</h2>
            <p className="text-lab-gray-400 text-sm mt-1">Gestiona las publicaciones del laboratorio</p>
          </div>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Publicación
        </Button>
      </div>

      {/* Stats Card */}
      <Card className="bg-lab-gray-100/50 border-lab-white/10">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-lab-gray-400 mb-1">Total de Publicaciones</p>
              <p className="text-3xl font-bold text-lab-white">{publications.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-lab-gray-100/50 border-lab-white/10">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : publications.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-lab-gray-400 mx-auto mb-4" />
              <p className="text-lab-gray-400">No hay publicaciones registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <div className="inline-block min-w-full align-middle px-6">
                <Table>
                <TableHeader>
                  <TableRow className="border-lab-white/10 hover:bg-transparent">
                    <TableHead className="text-lab-gray-400">Título</TableHead>
                    <TableHead className="text-lab-gray-400">Tipo</TableHead>
                    <TableHead className="text-lab-gray-400">Autores</TableHead>
                    <TableHead className="text-lab-gray-400">Fecha</TableHead>
                    <TableHead className="text-lab-gray-400">Recursos</TableHead>
                    <TableHead className="text-lab-gray-400 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publications.map((publication) => (
                    <TableRow key={publication.id} className="border-lab-white/10 hover:bg-lab-white/5">
                      <TableCell className="font-medium text-lab-white max-w-xs truncate">
                        {publication.title}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getTypeBadgeColor(publication.type)} border`}>
                          {getTypeLabel(publication.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-lab-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">{publication.authors.length}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-lab-gray-400">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span className="text-sm">
                            {new Date(publication.publicationDate).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {publication.filePath && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                              <FileText className="w-3 h-3 mr-1" />
                              Archivo
                            </Badge>
                          )}
                          {publication.link && (
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Link
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(publication)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingPublication(publication);
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
            <DialogTitle className="text-2xl font-bold">
              {editingPublication ? 'Editar Publicación' : 'Nueva Publicación'}
            </DialogTitle>
            <DialogDescription className="text-lab-gray-400">
              {editingPublication
                ? 'Actualiza la información de la publicación'
                : 'Agrega una nueva publicación al laboratorio'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <FieldGroup>
              <Field>
                <Label className="text-lab-white">
                  Título <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Título de la publicación"
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
                  placeholder="Descripción breve de la publicación"
                  rows={4}
                  className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white placeholder:text-lab-gray-400"
                />
              </Field>

              <Field>
                <Label className="text-lab-white">
                  Tipo <span className="text-red-400">*</span>
                </Label>
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-lab-gray-100 border-lab-white/20">
                    {PUBLICATION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="text-lab-white">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <Label className="text-lab-white">
                  Autores <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  required
                  placeholder="Autor 1, Autor 2, Autor 3"
                  className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white placeholder:text-lab-gray-400"
                />
                <p className="text-xs text-lab-gray-400 mt-1">Separa los autores con comas</p>
              </Field>

              <Field>
                <Label className="text-lab-white">
                  Fecha de Publicación <span className="text-red-400">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal bg-lab-gray-200/50 border-lab-white/10 text-lab-white hover:bg-lab-gray-200/70 hover:text-lab-white ${
                        !publicationDate && 'text-lab-gray-400'
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {publicationDate ? format(publicationDate, 'PPP', { locale: es }) : 'Selecciona una fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-lab-gray-100 border-lab-white/20" align="start">
                    <Calendar
                      mode="single"
                      selected={publicationDate}
                      onSelect={setPublicationDate}
                      initialFocus
                      locale={es}
                      className="rounded-md"
                    />
                  </PopoverContent>
                </Popover>
              </Field>

              <Field>
                <Label className="text-lab-white">Enlace Externo</Label>
                <Input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://ejemplo.com/publicacion"
                  className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white placeholder:text-lab-gray-400"
                />
                <p className="text-xs text-lab-gray-400 mt-1">Opcional: enlace al documento en línea</p>
              </Field>

              <Field>
                <Label className="text-lab-white">Archivo PDF/DOC</Label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white py-0 file:mr-4 file:py-2 file:px-4 file:h-auto file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 cursor-pointer"
                />
                <p className="text-xs text-lab-gray-400 mt-1">
                  {editingPublication ? 'Opcional: subir nuevo archivo' : 'Opcional si proporcionas un enlace'}
                </p>
              </Field>
            </FieldGroup>

            <div className="flex justify-end gap-3 pt-4 border-t border-lab-white/10">
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
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>{editingPublication ? 'Actualizar' : 'Crear'} Publicación</>
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
            <DialogTitle className="text-2xl font-bold text-red-400">Eliminar Publicación</DialogTitle>
            <DialogDescription className="text-lab-gray-400">
              ¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {deletingPublication && (
            <div className="my-4 p-4 rounded-lg bg-lab-gray-200/50 border border-lab-white/10">
              <p className="font-semibold text-lab-white mb-1">{deletingPublication.title}</p>
              <p className="text-sm text-lab-gray-400">{deletingPublication.authors.join(', ')}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingPublication(null);
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
