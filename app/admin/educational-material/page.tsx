'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit, BookOpen, Calendar, Download } from 'lucide-react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface EducationalMaterial {
  id: string;
  title: string;
  description: string;
  filePath: string;
  uploadedAt: string;
}

export default function EducationalMaterialPage() {
  const [materials, setMaterials] = useState<EducationalMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<EducationalMaterial | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<EducationalMaterial | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/educational-material');
      if (!response.ok) throw new Error('Failed to fetch materials');
      const data = await response.json();
      setMaterials(data.data || []);
    } catch (error) {
      toast.error('Error al cargar el material educativo');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (material?: EducationalMaterial) => {
    if (material) {
      setEditingMaterial(material);
      setTitle(material.title);
      setDescription(material.description);
    } else {
      setEditingMaterial(null);
      setTitle('');
      setDescription('');
      setFile(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMaterial(null);
    setTitle('');
    setDescription('');
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (!editingMaterial && !file) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (file) formData.append('file', file);

      const url = '/api/educational-material';
      const method = editingMaterial ? 'PUT' : 'POST';

      if (editingMaterial) {
        formData.append('id', editingMaterial.id);
      }

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save material');
      }

      toast.success(
        editingMaterial
          ? 'Material actualizado exitosamente'
          : 'Material creado exitosamente'
      );

      handleCloseDialog();
      fetchMaterials();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al guardar el material'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingMaterial) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/educational-material?id=${deletingMaterial.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete material');
      }

      toast.success('Material eliminado exitosamente');
      setDeleteDialogOpen(false);
      setDeletingMaterial(null);
      fetchMaterials();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al eliminar el material'
      );
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

  const getFileExtension = (filePath: string) => {
    return filePath.split('.').pop()?.toUpperCase() || 'FILE';
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <BookOpen className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-lab-white">Material Educativo</h2>
            <p className="text-lab-gray-400 text-sm mt-1">Gestiona el contenido educacional del laboratorio</p>
          </div>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Material
        </Button>
      </div>

      {/* Stats Card */}
      <Card className="bg-lab-gray-100/50 border-lab-white/10">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-lab-gray-400 mb-1">Total de Materiales</p>
              <p className="text-3xl font-bold text-lab-white">{materials.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <BookOpen className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-lab-gray-100/50 border-lab-white/10">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-lab-gray-400 mx-auto mb-4" />
              <p className="text-lab-gray-400">No hay material educativo registrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <div className="inline-block min-w-full align-middle px-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-lab-white/10 hover:bg-transparent">
                      <TableHead className="text-lab-gray-400">Tipo</TableHead>
                      <TableHead className="text-lab-gray-400">Título</TableHead>
                      <TableHead className="text-lab-gray-400">Descripción</TableHead>
                      <TableHead className="text-lab-gray-400">Fecha</TableHead>
                      <TableHead className="text-lab-gray-400 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id} className="border-lab-white/10 hover:bg-lab-white/5">
                        <TableCell>
                          <div className="flex items-center justify-center w-16 h-10 rounded-lg bg-green-500/10 border border-green-500/30">
                            <span className="text-xs font-bold text-green-400">
                              {getFileExtension(material.filePath)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-lab-white max-w-xs truncate">
                          {material.title}
                        </TableCell>
                        <TableCell className="text-lab-gray-400 max-w-md truncate">
                          {material.description}
                        </TableCell>
                        <TableCell className="text-lab-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{formatDate(material.uploadedAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(material.filePath, '_blank')}
                              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(material)}
                              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeletingMaterial(material);
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
        <DialogContent className="bg-lab-gray-100 border-lab-white/20 text-lab-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {editingMaterial ? 'Editar Material' : 'Agregar Material'}
            </DialogTitle>
            <DialogDescription className="text-lab-gray-400">
              {editingMaterial
                ? 'Actualiza la información del material educativo'
                : 'Sube nuevo material educativo al sistema'}
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
                  placeholder="Nombre del material"
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
                  placeholder="Descripción del material educativo"
                  rows={4}
                  className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white placeholder:text-lab-gray-400"
                />
              </Field>

              <Field>
                <Label className="text-lab-white">
                  Archivo {!editingMaterial && <span className="text-red-400">*</span>}
                </Label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white py-0 file:mr-4 file:py-2 file:px-4 file:h-auto file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-500/20 file:text-green-400 hover:file:bg-green-500/30 cursor-pointer"
                />
                <p className="text-xs text-lab-gray-400 mt-1">
                  {editingMaterial
                    ? 'Opcional: sube un nuevo archivo para reemplazar el actual'
                    : 'Formatos permitidos: PDF, DOC, DOCX, PPT, PPTX, ZIP'}
                </p>
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
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>{editingMaterial ? 'Actualizar' : 'Crear'} Material</>
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
            <DialogTitle className="text-2xl font-bold text-red-400">Eliminar Material</DialogTitle>
            <DialogDescription className="text-lab-gray-400">
              ¿Estás seguro de que deseas eliminar este material educativo? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {deletingMaterial && (
            <div className="py-4">
              <p className="font-semibold text-lab-white mb-1">{deletingMaterial.title}</p>
              <p className="text-sm text-lab-gray-400">{deletingMaterial.description}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingMaterial(null);
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
