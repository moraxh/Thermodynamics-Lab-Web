'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { UserCog, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup } from '@/components/ui/field';
import { toast } from 'sonner';
import { useSession, signOut } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [submitting, setSubmitting] = useState(false);

  // Username form state
  const [username, setUsername] = useState(session?.user?.name || '');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('El nombre de usuario es requerido');
      return;
    }

    if (username === session?.user?.name) {
      toast.info('El nombre de usuario no ha cambiado');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update username');
      }

      const data = await response.json();

      // Update session with new name
      await update({
        name: data.data.name,
      });

      toast.success('Nombre de usuario actualizado exitosamente');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al actualizar el nombre de usuario'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update password');
      }

      toast.success('Contraseña actualizada exitosamente. Serás redirigido al login...');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Sign out after password change
      setTimeout(() => {
        signOut({ callbackUrl: '/login' });
      }, 2000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al actualizar la contraseña'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
          <UserCog className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-lab-white">Configuración de Cuenta</h2>
          <p className="text-lab-gray-400 text-sm mt-1">Actualiza tu nombre de usuario y contraseña</p>
        </div>
      </div>

      {/* Username Card */}
      <Card className="bg-lab-gray-100/50 border-lab-white/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-lab-white">Nombre de Usuario</h3>
              <p className="text-sm text-lab-gray-400">Cambia tu nombre de usuario para iniciar sesión</p>
            </div>
          </div>

          <form onSubmit={handleUpdateUsername}>
            <FieldGroup className="space-y-4">
              <Field>
                <Label className="text-lab-white">
                  Nuevo Nombre de Usuario <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Ingresa tu nuevo nombre de usuario"
                  className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white placeholder:text-lab-gray-400"
                />
                <p className="text-xs text-lab-gray-400 mt-1">
                  Usuario actual: <span className="text-blue-400">{session?.user?.name}</span>
                </p>
              </Field>
            </FieldGroup>

            <div className="flex justify-end mt-6">
              <Button
                type="submit"
                disabled={submitting || username === session?.user?.name}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar Nombre de Usuario'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Card */}
      <Card className="bg-lab-gray-100/50 border-lab-white/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <Lock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-lab-white">Contraseña</h3>
              <p className="text-sm text-lab-gray-400">Cambia tu contraseña para mayor seguridad</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword}>
            <FieldGroup className="space-y-4">
              <Field>
                <Label className="text-lab-white">
                  Contraseña Actual <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Ingresa tu contraseña actual"
                    className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white placeholder:text-lab-gray-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lab-gray-400 hover:text-lab-white transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              <Field>
                <Label className="text-lab-white">
                  Nueva Contraseña <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Ingresa tu nueva contraseña"
                    className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white placeholder:text-lab-gray-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lab-gray-400 hover:text-lab-white transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-lab-gray-400 mt-1">Debe tener al menos 6 caracteres</p>
              </Field>

              <Field>
                <Label className="text-lab-white">
                  Confirmar Nueva Contraseña <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirma tu nueva contraseña"
                    className="bg-lab-gray-200/50 border-lab-white/10 text-lab-white placeholder:text-lab-gray-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lab-gray-400 hover:text-lab-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>
            </FieldGroup>

            <div className="bg-lab-yellow/10 border border-lab-yellow/30 rounded-lg p-4 mt-6">
              <p className="text-sm text-lab-yellow">
                ⚠️ <strong>Importante:</strong> Al cambiar tu contraseña, serás redirigido al login y deberás iniciar sesión nuevamente.
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar Contraseña'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
