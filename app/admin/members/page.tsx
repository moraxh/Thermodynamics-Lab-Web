'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Users, Search, Image as ImageIcon } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Field, FieldGroup } from '@/components/ui/field';
import { toast } from 'sonner';
import Image from 'next/image';

interface Member {
  id: string;
  fullName: string;
  position: string;
  photo: string | null;
  typeOfMember: string;
}

const memberTypes = [
  { value: 'Director', label: 'Director' },
  { value: 'Subdirector', label: 'Subdirector' },
  { value: 'Estudiante de Doctorado', label: 'Estudiante de Doctorado' },
  { value: 'Estudiante de Maestría', label: 'Estudiante de Maestría' },
  { value: 'Estudiante de Licenciatura', label: 'Estudiante de Licenciatura' },
  { value: 'Investigador', label: 'Investigador' },
  { value: 'Colaborador', label: 'Colaborador' },
];

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    position: '',
    typeOfMember: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/members');
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      console.log('Fetched members data:', data);
      console.log('Members array:', data.data);
      setMembers(data.data || []);
    } catch (error) {
      toast.error('Error al cargar los miembros');
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (member?: Member) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        fullName: member.fullName,
        position: member.position,
        typeOfMember: member.typeOfMember,
      });
      setPhotoPreview(member.photo);
    } else {
      setEditingMember(null);
      setFormData({ fullName: '', position: '', typeOfMember: '' });
      setPhotoPreview(null);
    }
    setPhotoFile(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMember(null);
    setFormData({ fullName: '', position: '', typeOfMember: '' });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.position || !formData.typeOfMember) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('position', formData.position);
      formDataToSend.append('typeOfMember', formData.typeOfMember);
      
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      if (editingMember) {
        formDataToSend.append('id', editingMember.id);
      }

      const url = '/api/members';
      const method = editingMember ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save member');
      }

      toast.success(editingMember ? 'Miembro actualizado exitosamente' : 'Miembro creado exitosamente');
      handleCloseDialog();
      fetchMembers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar el miembro');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingMember) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/members?id=${deletingMember.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete member');

      toast.success('Miembro eliminado exitosamente');
      setDeleteDialogOpen(false);
      setDeletingMember(null);
      fetchMembers();
    } catch (error) {
      toast.error('Error al eliminar el miembro');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || member.typeOfMember === filterType;
    return matchesSearch && matchesType;
  });

  console.log('Members state:', members);
  console.log('Filtered members:', filteredMembers);
  console.log('Loading:', loading);

  const getMemberTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Director': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      'Subdirector': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      'Investigador': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      'Estudiante de Doctorado': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      'Estudiante de Maestría': 'bg-teal-500/10 text-teal-400 border-teal-500/30',
      'Estudiante de Licenciatura': 'bg-green-500/10 text-green-400 border-green-500/30',
      'Colaborador': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-400 border-gray-500/30';
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-lab-white">Miembros del Equipo</h2>
            <p className="text-lab-gray-400 text-sm mt-1">Gestiona los miembros del laboratorio</p>
          </div>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Miembro
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-lab-gray-100/50 border-lab-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-lab-gray-400">Total Miembros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-lab-white">{members.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-lab-gray-100/50 border-lab-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-lab-gray-400">Investigadores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-400">
              {members.filter(m => m.typeOfMember === 'Investigador').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-lab-gray-100/50 border-lab-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-lab-gray-400">Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-400">
              {members.filter(m => m.typeOfMember.includes('Estudiante')).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-lab-gray-100/50 border-lab-white/10">
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lab-gray-400" />
              <Input
                placeholder="Buscar por nombre o posición..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-lab-gray-200/50 border-lab-white/10 text-lab-white placeholder:text-lab-gray-400"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[240px] bg-lab-gray-200/50 border-lab-white/10 text-lab-white">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {memberTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card className="bg-lab-gray-100/50 border-lab-white/10">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-lab-gray-400 mx-auto mb-4" />
              <p className="text-lab-gray-400">No se encontraron miembros</p>
            </div>
          ) : (
            <div className="overflow-x-auto px-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-lab-white/10 hover:bg-transparent">
                    <TableHead className="text-lab-gray-400">Foto</TableHead>
                    <TableHead className="text-lab-gray-400">Nombre Completo</TableHead>
                    <TableHead className="text-lab-gray-400">Posición</TableHead>
                    <TableHead className="text-lab-gray-400">Tipo</TableHead>
                    <TableHead className="text-lab-gray-400 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id} className="border-lab-white/10 hover:bg-lab-white/5">
                      <TableCell>
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-lab-gray-200/50 border border-lab-white/10">
                          {member.photo ? (
                            <Image
                              src={member.photo}
                              alt={member.fullName}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lab-gray-400">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-lab-white">{member.fullName}</TableCell>
                      <TableCell className="text-lab-gray-400">{member.position}</TableCell>
                      <TableCell>
                        <Badge className={`${getMemberTypeColor(member.typeOfMember)} border`}>
                          {member.typeOfMember}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(member)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingMember(member);
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
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-lab-gray-100 border-lab-white/20 text-lab-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingMember ? 'Editar Miembro' : 'Nuevo Miembro'}
            </DialogTitle>
            <DialogDescription className="text-lab-gray-400">
              {editingMember
                ? 'Actualiza la información del miembro del equipo'
                : 'Agrega un nuevo miembro al equipo del laboratorio'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <FieldGroup>
              {/* Photo Upload */}
              <Field>
                <Label className="text-lab-white">Foto del Miembro</Label>
                <div className="mt-2">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-lab-gray-200/50 border-2 border-lab-white/10 flex items-center justify-center shrink-0">
                      {photoPreview ? (
                        <Image
                          src={photoPreview}
                          alt="Preview"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-lab-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-h-24">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white py-0 file:mr-4 file:py-2 file:px-4 file:h-auto file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 cursor-pointer"
                      />
                      <p className="text-xs text-lab-gray-400 mt-2">
                        Formatos aceptados: JPG, PNG, WEBP
                      </p>
                    </div>
                  </div>
                </div>
              </Field>

              {/* Full Name */}
              <Field>
                <Label htmlFor="fullName" className="text-lab-white">
                  Nombre Completo <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ej: Dr. Juan Pérez García"
                  required
                  className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white placeholder:text-lab-gray-400 focus:border-blue-500"
                />
              </Field>

              {/* Position */}
              <Field>
                <Label htmlFor="position" className="text-lab-white">
                  Posición/Cargo <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Ej: Investigador Principal"
                  required
                  className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white placeholder:text-lab-gray-400 focus:border-blue-500"
                />
              </Field>

              {/* Member Type */}
              <Field>
                <Label htmlFor="typeOfMember" className="text-lab-white">
                  Tipo de Miembro <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={formData.typeOfMember}
                  onValueChange={(value) => setFormData({ ...formData, typeOfMember: value })}
                >
                  <SelectTrigger className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {memberTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>{editingMember ? 'Actualizar' : 'Crear'} Miembro</>
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
            <DialogTitle className="text-2xl font-bold text-red-400">Eliminar Miembro</DialogTitle>
            <DialogDescription className="text-lab-gray-400">
              ¿Estás seguro de que deseas eliminar a{' '}
              <span className="font-semibold text-lab-white">{deletingMember?.fullName}</span>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingMember(null);
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
