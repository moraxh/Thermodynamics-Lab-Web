'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Image as ImageIcon, Search, Calendar } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup } from '@/components/ui/field';
import { toast } from 'sonner';
import Image from 'next/image';

interface GalleryImage {
  id: string;
  path: string;
  uploadedAt: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingImage, setDeletingImage] = useState<GalleryImage | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gallery');
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setImages(data.data || []);
    } catch (error) {
      toast.error('Error al cargar las imágenes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setImageFile(null);
    setImagePreview(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) {
      toast.error('Por favor selecciona una imagen');
      return;
    }

    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      toast.success('Imagen subida exitosamente');
      handleCloseDialog();
      fetchImages();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al subir la imagen');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingImage) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/gallery?id=${deletingImage.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete image');

      toast.success('Imagen eliminada exitosamente');
      setDeleteDialogOpen(false);
      setDeletingImage(null);
      fetchImages();
    } catch (error) {
      toast.error('Error al eliminar la imagen');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredImages = images.filter((image) => {
    return image.path.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <ImageIcon className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-lab-white">Galería</h2>
            <p className="text-lab-gray-400 text-sm mt-1">Gestiona las imágenes de la galería</p>
          </div>
        </div>
        <Button
          onClick={handleOpenDialog}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          Subir Imagen
        </Button>
      </div>

      {/* Stats Card */}
      <Card className="bg-lab-gray-100/50 border-lab-white/10">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-lab-gray-400 mb-1">Total de Imágenes</p>
              <p className="text-3xl font-bold text-lab-white">{images.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <ImageIcon className="w-8 h-8 text-purple-400" />
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
              placeholder="Buscar imágenes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-lab-gray-200/50 border-lab-white/10 text-lab-white placeholder:text-lab-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      <Card className="bg-lab-gray-100/50 border-lab-white/10">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-lab-gray-400 mx-auto mb-4" />
              <p className="text-lab-gray-400">No se encontraron imágenes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="group relative aspect-square rounded-lg overflow-hidden bg-lab-gray-200 border border-lab-white/10 hover:border-purple-500/50 transition-all"
                >
                  <Image
                    src={image.path}
                    alt="Gallery image"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-lab-black via-lab-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 text-xs text-lab-gray-400 mb-3">
                        <Calendar className="w-3 h-3" />
                        {formatDate(image.uploadedAt)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeletingImage(image);
                          setDeleteDialogOpen(true);
                        }}
                        className="w-full bg-red-600/80 hover:bg-red-600 text-white"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-lab-gray-100 border-lab-white/20 text-lab-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Subir Imagen</DialogTitle>
            <DialogDescription className="text-lab-gray-400">
              Agrega una nueva imagen a la galería del laboratorio
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <FieldGroup>
              <Field>
                <Label className="text-lab-white">Imagen <span className="text-red-400">*</span></Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative w-full h-64 rounded-lg overflow-hidden bg-lab-gray-200/50 border-2 border-lab-white/10 mb-4">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 rounded-lg bg-lab-gray-200/50 border-2 border-dashed border-lab-white/10 flex items-center justify-center mb-4">
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 text-lab-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-lab-gray-400">Vista previa de la imagen</p>
                      </div>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                    className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white py-0 file:mr-4 file:py-2 file:px-4 file:h-auto file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30 cursor-pointer"
                  />
                  <p className="text-xs text-lab-gray-400 mt-2">
                    Formatos aceptados: JPG, PNG, WEBP
                  </p>
                </div>
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
                disabled={submitting || !imageFile}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Subiendo...
                  </>
                ) : (
                  <>Subir Imagen</>
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
            <DialogTitle className="text-2xl font-bold text-red-400">Eliminar Imagen</DialogTitle>
            <DialogDescription className="text-lab-gray-400">
              ¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {deletingImage && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-lab-gray-200/50 border border-lab-white/10 my-4">
              <Image
                src={deletingImage.path}
                alt="Image to delete"
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingImage(null);
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
