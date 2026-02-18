'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit, Image as ImageIcon, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup } from '@/components/ui/field';
import { toast } from 'sonner';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface Infographic {
  id: string;
  title: string;
  description: string;
  imagePath: string;
  categories: string[];
  uploadedAt: string;
}

export default function InfographicsPage() {
  const [infographics, setInfographics] = useState<Infographic[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Infographic | null>(null);
  const [editingItem, setEditingItem] = useState<Infographic | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchInfographics();
  }, []);

  const fetchInfographics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/infographics');
      if (!response.ok) throw new Error('Failed to fetch infographics');
      const data = await response.json();
      setInfographics(data.data || []);
    } catch {
      toast.error('Error al cargar las infografías');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEditDialog = (infographic: Infographic) => {
    setEditingItem(infographic);
    setTitle(infographic.title);
    setDescription(infographic.description);
    setCategories(infographic.categories);
    setImagePreview(infographic.imagePath);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setCategories([]);
    setCategoryInput('');
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && categoryInput.trim()) {
      e.preventDefault();
      const newCategory = categoryInput.trim();
      if (!categories.includes(newCategory)) {
        setCategories([...categories, newCategory]);
      }
      setCategoryInput('');
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategories(categories.filter(cat => cat !== categoryToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast.error('Por favor completa título y descripción');
      return;
    }

    if (categories.length === 0) {
      toast.error('Agrega al menos una categoría');
      return;
    }

    if (!editingItem && !imageFile) {
      toast.error('Por favor selecciona una imagen');
      return;
    }

    setSubmitting(true);
    
    try {
      const formData = new FormData();
      if (editingItem) {
        formData.append('id', editingItem.id);
      }
      formData.append('title', title);
      formData.append('description', description);
      formData.append('categories', categories.join(','));
      if (imageFile) {
        formData.append('file', imageFile);
      }

      const response = await fetch('/api/infographics', {
        method: editingItem ? 'PUT' : 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save infographic');
      }

      toast.success(editingItem ? 'Infografía actualizada exitosamente' : 'Infografía creada exitosamente');
      handleCloseDialog();
      fetchInfographics();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar la infografía');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/infographics?id=${deletingItem.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete infographic');

      toast.success('Infografía eliminada exitosamente');
      setDeleteDialogOpen(false);
      setDeletingItem(null);
      fetchInfographics();
    } catch {
      toast.error('Error al eliminar la infografía');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInfographics = infographics.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.categories.some(cat => cat.toLowerCase().includes(query))
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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
          <div className="p-3 rounded-xl bg-linear-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
            <ImageIcon className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-lab-white">Infografías</h2>
            <p className="text-lab-gray-400 text-sm mt-1">Gestiona las infografías educativas</p>
          </div>
        </div>
        <Button
          onClick={handleOpenDialog}
          className="bg-linear-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Infografía
        </Button>
      </div>

      {/* Stats Card */}
      <Card className="bg-lab-gray-100/50 border-lab-white/10">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-lab-gray-400 mb-1">Total de Infografías</p>
              <p className="text-3xl font-bold text-lab-white">{infographics.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30">
              <ImageIcon className="w-8 h-8 text-teal-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="bg-lab-gray-100/50 border-lab-white/10">
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lab-gray-400" />
            <Input
              placeholder="Buscar por título, descripción o categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-lab-gray-200 border-lab-white/10 text-lab-white placeholder:text-lab-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-lab-gray-100/50 border-lab-white/10">
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-lab-white/10">
                  <th className="text-left py-4 px-4 text-lab-gray-400 font-medium">Imagen</th>
                  <th className="text-left py-4 px-4 text-lab-gray-400 font-medium">Título</th>
                  <th className="text-left py-4 px-4 text-lab-gray-400 font-medium">Descripción</th>
                  <th className="text-left py-4 px-4 text-lab-gray-400 font-medium">Categorías</th>
                  <th className="text-left py-4 px-4 text-lab-gray-400 font-medium">Fecha</th>
                  <th className="text-right py-4 px-4 text-lab-gray-400 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-lab-gray-400/30 border-t-teal-500 rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : filteredInfographics.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-lab-gray-400">
                      {searchQuery ? 'No se encontraron resultados' : 'No hay infografías aún'}
                    </td>
                  </tr>
                ) : (
                  filteredInfographics.map((item) => (
                    <tr key={item.id} className="border-b border-lab-white/10 hover:bg-lab-gray-200/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-lab-gray-200">
                          <Image
                            src={item.imagePath}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4 text-lab-white font-medium">
                        {truncateText(item.title, 40)}
                      </td>
                      <td className="py-4 px-4 text-lab-gray-400 text-sm">
                        {truncateText(item.description, 60)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {item.categories.slice(0, 2).map((cat) => (
                            <Badge
                              key={cat}
                              variant="outline"
                              className="bg-teal-500/10 text-teal-400 border-teal-500/30 text-xs"
                            >
                              {cat}
                            </Badge>
                          ))}
                          {item.categories.length > 2 && (
                            <Badge
                              variant="outline"
                              className="bg-lab-gray-300/10 text-lab-gray-400 border-lab-gray-400/30 text-xs"
                            >
                              +{item.categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-lab-gray-400 text-sm">
                        {formatDate(item.uploadedAt)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditDialog(item)}
                            className="text-lab-blue hover:text-lab-blue/80 hover:bg-lab-blue/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingItem(item);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-lab-gray-100 border-lab-white/10 text-lab-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Infografía' : 'Agregar Infografía'}</DialogTitle>
            <DialogDescription className="text-lab-gray-400">
              {editingItem ? 'Actualiza la información de la infografía' : 'Completa los datos de la nueva infografía'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <Field>
                <label className="text-sm font-medium text-lab-white">
                  Título <span className="text-red-400">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título de la infografía"
                  className="bg-lab-gray-200 border-lab-white/10 text-lab-white"
                  required
                />
              </Field>

              <Field>
                <label className="text-sm font-medium text-lab-white">
                  Descripción <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe el contenido de la infografía"
                  className="w-full min-h-[100px] px-3 py-2 rounded-md bg-lab-gray-200 border border-lab-white/10 text-lab-white placeholder:text-lab-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </Field>

              <Field>
                <label className="text-sm font-medium text-lab-white">
                  Categorías <span className="text-red-400">*</span>
                </label>
                <div className="space-y-2">
                  <Input
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyDown={handleAddCategory}
                    placeholder="Escribe una categoría y presiona Enter"
                    className="bg-lab-gray-200 border-lab-white/10 text-lab-white"
                  />
                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-lab-gray-200 rounded-md border border-lab-white/10">
                      {categories.map((cat) => (
                        <Badge
                          key={cat}
                          variant="outline"
                          className="bg-teal-500/10 text-teal-400 border-teal-500/30 pl-3 pr-1 py-1"
                        >
                          {cat}
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(cat)}
                            className="ml-2 hover:bg-teal-500/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-lab-gray-400">
                    Presiona Enter después de escribir cada categoría
                  </p>
                </div>
              </Field>

              <Field>
                <label className="text-sm font-medium text-lab-white">
                  Imagen {!editingItem && <span className="text-red-400">*</span>}
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white py-0 file:mr-4 file:py-2 file:px-4 file:h-auto file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-500/20 file:text-teal-400 hover:file:bg-teal-500/30 cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-4 relative w-full h-64 rounded-lg overflow-hidden border border-lab-white/10">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-contain bg-lab-gray-200"
                      sizes="(max-width: 768px) 100vw, 600px"
                    />
                  </div>
                )}
              </Field>
            </FieldGroup>

            <div className="flex justify-end gap-3 pt-4 border-t border-lab-white/10">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={submitting}
                className="border-lab-white/10 text-lab-white hover:bg-lab-gray-200"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-linear-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
              >
                {submitting ? 'Guardando...' : editingItem ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-lab-gray-100 border-lab-white/10 text-lab-white">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription className="text-lab-gray-400">
              ¿Estás seguro de que deseas eliminar la infografía &quot;{deletingItem?.title}&quot;? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={submitting}
              className="border-lab-white/10 text-lab-white hover:bg-lab-gray-200"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
