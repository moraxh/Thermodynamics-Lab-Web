'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit, Video as VideoIcon, Calendar, Play } from 'lucide-react';
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
import Image from 'next/image';

interface Video {
  id: string;
  title: string;
  description: string;
  videoPath: string;
  thumbnailPath: string | null;
  uploadedAt: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<Video | null>(null);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/videos');
      if (!response.ok) throw new Error('Failed to fetch videos');
      const data = await response.json();
      setVideos(data.data || []);
    } catch (error) {
      toast.error('Error al cargar los videos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (video?: Video) => {
    if (video) {
      setEditingVideo(video);
      setTitle(video.title);
      setDescription(video.description);
      setThumbnailPreview(video.thumbnailPath);
    } else {
      setEditingVideo(null);
      setTitle('');
      setDescription('');
      setVideoFile(null);
      setThumbnailFile(null);
      setThumbnailPreview(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingVideo(null);
    setTitle('');
    setDescription('');
    setVideoFile(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile && !editingVideo) {
      toast.error('Debes seleccionar un archivo de video');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (videoFile) formData.append('video', videoFile);
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

      const url = '/api/videos';
      const method = editingVideo ? 'PUT' : 'POST';

      if (editingVideo) {
        formData.append('id', editingVideo.id);
      }

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save video');
      }

      toast.success(editingVideo ? 'Video actualizado exitosamente' : 'Video subido exitosamente');
      handleCloseDialog();
      fetchVideos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar el video');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingVideo) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/videos?id=${deletingVideo.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete video');

      toast.success('Video eliminado exitosamente');
      setDeleteDialogOpen(false);
      setDeletingVideo(null);
      fetchVideos();
    } catch (error) {
      toast.error('Error al eliminar el video');
    } finally {
      setSubmitting(false);
    }
  };

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
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
            <VideoIcon className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-lab-white">Videos</h2>
            <p className="text-lab-gray-400 text-sm mt-1">Gestiona los videos del laboratorio</p>
          </div>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg shadow-red-500/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          Subir Video
        </Button>
      </div>

      {/* Stats Card */}
      <Card className="bg-lab-gray-100/50 border-lab-white/10">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-lab-gray-400 mb-1">Total de Videos</p>
              <p className="text-3xl font-bold text-lab-white">{videos.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <VideoIcon className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-lab-gray-100/50 border-lab-white/10">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <VideoIcon className="w-12 h-12 text-lab-gray-400 mx-auto mb-4" />
              <p className="text-lab-gray-400">No hay videos registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <div className="inline-block min-w-full align-middle px-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-lab-white/10 hover:bg-transparent">
                      <TableHead className="text-lab-gray-400">Vista Previa</TableHead>
                      <TableHead className="text-lab-gray-400">Título</TableHead>
                      <TableHead className="text-lab-gray-400">Descripción</TableHead>
                      <TableHead className="text-lab-gray-400">Fecha</TableHead>
                      <TableHead className="text-lab-gray-400 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos.map((video) => (
                      <TableRow key={video.id} className="border-lab-white/10 hover:bg-lab-white/5">
                        <TableCell>
                          <button
                            onClick={() => {
                              setPreviewVideo(video);
                              setPreviewDialogOpen(true);
                            }}
                            className="relative w-24 h-16 rounded-lg overflow-hidden bg-lab-gray-200 border border-lab-white/10 group cursor-pointer"
                          >
                            {video.thumbnailPath ? (
                              <Image
                                src={video.thumbnailPath}
                                alt={video.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Play className="w-6 h-6 text-lab-gray-400" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="w-8 h-8 text-white" />
                            </div>
                          </button>
                        </TableCell>
                        <TableCell className="font-medium text-lab-white max-w-xs truncate">
                          {video.title}
                        </TableCell>
                        <TableCell className="text-lab-gray-400 max-w-md truncate">
                          {video.description}
                        </TableCell>
                        <TableCell className="text-lab-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{formatDate(video.uploadedAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(video)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeletingVideo(video);
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
              {editingVideo ? 'Editar Video' : 'Subir Video'}
            </DialogTitle>
            <DialogDescription className="text-lab-gray-400">
              {editingVideo
                ? 'Actualiza la información del video'
                : 'Agrega un nuevo video al laboratorio'}
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
                  placeholder="Título del video"
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
                  placeholder="Descripción del video"
                  rows={4}
                  className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white placeholder:text-lab-gray-400"
                />
              </Field>

              <Field>
                <Label className="text-lab-white">
                  Archivo de Video {!editingVideo && <span className="text-red-400">*</span>}
                </Label>
                <Input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  required={!editingVideo}
                  className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white py-0 file:mr-4 file:py-2 file:px-4 file:h-auto file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-500/20 file:text-red-400 hover:file:bg-red-500/30 cursor-pointer"
                />
                <p className="text-xs text-lab-gray-400 mt-2">
                  {editingVideo 
                    ? 'Opcional: subir nuevo video (MP4, WebM, OGG. Max 100MB)'
                    : 'Formatos aceptados: MP4, WebM, OGG. Máximo 100MB'
                  }
                </p>
              </Field>

              <Field>
                <Label className="text-lab-white">Miniatura</Label>
                {thumbnailPreview && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-lab-gray-200/50 border-2 border-lab-white/10 mb-4">
                    <Image
                      src={thumbnailPreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white py-0 file:mr-4 file:py-2 file:px-4 file:h-auto file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-500/20 file:text-red-400 hover:file:bg-red-500/30 cursor-pointer"
                />
                <p className="text-xs text-lab-gray-400 mt-2">
                  Opcional: imagen de portada para el video
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
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg shadow-red-500/25"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    {editingVideo ? 'Actualizando...' : 'Subiendo...'}
                  </>
                ) : (
                  <>{editingVideo ? 'Actualizar' : 'Subir'} Video</>
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
            <DialogTitle className="text-2xl font-bold text-red-400">Eliminar Video</DialogTitle>
            <DialogDescription className="text-lab-gray-400">
              ¿Estás seguro de que deseas eliminar este video? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {deletingVideo && (
            <div className="my-4 p-4 rounded-lg bg-lab-gray-200/50 border border-lab-white/10">
              {deletingVideo.thumbnailPath && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3">
                  <Image
                    src={deletingVideo.thumbnailPath}
                    alt={deletingVideo.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <p className="font-semibold text-lab-white mb-1">{deletingVideo.title}</p>
              <p className="text-sm text-lab-gray-400">{deletingVideo.description}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingVideo(null);
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

      {/* Video Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="bg-lab-gray-100 border-lab-white/20 text-lab-white sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              {previewVideo?.title}
            </DialogTitle>
            {previewVideo?.description && (
              <DialogDescription className="text-lab-gray-400">
                {previewVideo.description}
              </DialogDescription>
            )}
          </DialogHeader>

          {previewVideo && (
            <div className="space-y-4">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-lab-gray-200 border border-lab-white/10">
                <video
                  src={previewVideo.videoPath}
                  controls
                  className="w-full h-full"
                  controlsList="nodownload"
                >
                  Tu navegador no soporta la reproducción de videos.
                </video>
              </div>

              <div className="flex items-center gap-2 text-sm text-lab-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Subido el {formatDate(previewVideo.uploadedAt)}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-lab-white/10">
            <Button
              variant="ghost"
              onClick={() => {
                setPreviewDialogOpen(false);
                setPreviewVideo(null);
              }}
              className="text-lab-gray-400 hover:text-lab-white hover:bg-lab-white/5"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
