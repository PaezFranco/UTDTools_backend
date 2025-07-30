import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserCircle, Mail, Save, Clock, MapPin, CalendarCheck, KeyRound, Camera, Upload, Loader2, AlertTriangle, LogOut, User, Settings, Shield, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminProfilePage = () => {
  const [adminUser, setAdminUser] = useState(null);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef(null);
  
  const { toast } = useToast();
  const { user, apiRequest, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar datos del usuario desde el contexto de autenticación
    if (user) {
      const userWithDefaults = {
        ...user,
        assignmentDate: user.assignmentDate || user.createdAt || '2025-01-15',
        assignedLocation: user.assignedLocation || 'Pesado 1',
        shift: user.shift || 'Completo (8am - 5pm)',
        profileImage: user.profileImage || user.avatar || null,
        role: user.role || 'Administrador',
        lastLogin: user.lastLogin || new Date().toISOString()
      };
      setAdminUser(userWithDefaults);
      setProfileImage(userWithDefaults.profileImage);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validar contraseña
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!hasUpperCase) {
      return 'La contraseña debe contener al menos una letra mayúscula';
    }
    if (!hasLowerCase) {
      return 'La contraseña debe contener al menos una letra minúscula';
    }
    if (!hasNumbers) {
      return 'La contraseña debe contener al menos un número';
    }
    if (!hasSpecialChar) {
      return 'La contraseña debe contener al menos un carácter especial';
    }
    return null;
  };

  // Manejar selección de imagen
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Formato No Válido",
          description: "Por favor seleccione una imagen en formato JPG, PNG, GIF o WebP.",
          variant: "destructive"
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Archivo Muy Grande",
          description: "La imagen debe ser menor a 5MB.",
          variant: "destructive"
        });
        return;
      }

      uploadProfileImage(file);
    }
  };

  // Subir imagen de perfil
  const uploadProfileImage = async (file) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      // Usar el endpoint correcto según tu API
      const response = await apiRequest('/auth/profile/upload-image', {
        method: 'POST',
        body: formData,
        // No incluir Content-Type para FormData
      });

      if (response.ok) {
        const result = await response.json();
        
        // Actualizar imagen localmente
        const imageUrl = result.imageUrl || result.profileImage;
        setProfileImage(imageUrl);
        setAdminUser(prev => ({ ...prev, profileImage: imageUrl }));
        
        toast({
          title: "✅ Imagen Actualizada",
          description: "Tu foto de perfil ha sido actualizada exitosamente.",
          duration: 4000
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir la imagen');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Fallback: mostrar imagen localmente como simulación
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      setAdminUser(prev => ({ ...prev, profileImage: imageUrl }));
      
      toast({
        title: "📸 Imagen Actualizada (Simulación)",
        description: "La imagen se muestra localmente. Configura el endpoint de subida de imágenes en tu API.",
        duration: 5000
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Confirmar cambio de contraseña
  const handlePasswordConfirm = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast({
        title: " Campos Incompletos",
        description: "Por favor complete todos los campos de contraseña.",
        variant: "destructive"
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: " Error de Contraseña",
        description: "Las nuevas contraseñas no coinciden.",
        variant: "destructive"
      });
      return;
    }
    const passwordMessages = {
      length: "La contraseña debe tener al menos 8 caracteres",
      uppercase: "La contraseña debe contener al menos una letra mayúscula",
      lowercase: "La contraseña debe contener al menos una letra minúscula",
      number: "La contraseña debe contener al menos un número",
      special: "La contraseña debe contener al menos un carácter especial"
    };
    // Validar seguridad de la nueva contraseña
    // file deepcode ignore NoHardcodedPasswords: <please specify a reason of ignoring this>
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      toast({
        title: "Contraseña Débil",
        description: passwordMessages[passwordError],
        variant: "destructive"
      });
      return;
    }

    if (formData.currentPassword && formData.currentPassword === formData.newPassword) {
      toast({
        title: " Contraseña Igual",
        description: "La nueva contraseña debe ser diferente a la actual.",
        variant: "destructive"
      });
      return;
    }

    setShowPasswordConfirm(true);
  };
  
  // Cambiar contraseña
  const handlePasswordSubmit = async () => {
    setIsChangingPassword(true);
    
    try {
      const response = await apiRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        toast({
          title: " Contraseña Actualizada",
          description: "Tu contraseña ha sido cambiada exitosamente. Por seguridad, se recomienda cerrar sesión y volver a iniciarla.",
          duration: 6000
        });
        
        // Limpiar formulario y cerrar modal
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsEditingPassword(false);
        setShowPasswordConfirm(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar contraseña');
      }
    } catch (error) {
      console.error('Error changing password:', error);

      toast({
        title: " Error",
        description: error.message || "Contraseña actual incorrecta.",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Confirmar cerrar sesión
  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(true);
  };

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "👋 Sesión Cerrada",
        description: "Has cerrado sesión exitosamente. ¡Hasta luego!",
        duration: 3000
      });
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "❌ Error",
        description: "Hubo un problema al cerrar sesión. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-gray-600">Cargando perfil del administrador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header móvil */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-teal-700">Mi Perfil</h1>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogoutConfirm}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header desktop */}
          <div className="hidden sm:flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-teal-700">Mi Perfil de Administrador</h1>
          
          </div>
          
          <Card className="bg-white shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="relative mx-auto">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Perfil"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-teal-600 shadow-lg"
                  />
                ) : (
                  <UserCircle className="w-20 h-20 sm:w-24 sm:h-24 text-teal-600" />
                )}
                
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 h-8 w-8 sm:h-10 sm:w-10 rounded-full border-teal-600 bg-white hover:bg-teal-50"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  title="Cambiar foto de perfil"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              
              <CardTitle className="text-xl sm:text-2xl text-gray-900 mt-4">{adminUser.name}</CardTitle>
              <CardDescription className="text-gray-600">{adminUser.email}</CardDescription>
              
              <div className="flex items-center justify-center gap-2 mt-2">
                <Shield className="h-4 w-4 text-teal-600" />
                <span className="text-sm text-teal-600 font-medium">{adminUser.role}</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Información personal */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminName" className="text-sm font-medium text-gray-700">Nombre Completo</Label>
                  <Input 
                    id="adminName" 
                    value={adminUser.name} 
                    readOnly 
                    className="bg-gray-50 border-gray-300 text-gray-600 cursor-not-allowed" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminEmail" className="text-sm font-medium text-gray-700">Correo Electrónico</Label>
                  <Input 
                    id="adminEmail" 
                    type="email" 
                    value={adminUser.email} 
                    readOnly 
                    className="bg-gray-50 border-gray-300 text-gray-600 cursor-not-allowed" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminShift" className="text-sm font-medium text-gray-700">Turno Asignado</Label>
                  <div className="flex items-center p-3 rounded-md bg-gray-50 border border-gray-300">
                    <Clock className="w-5 h-5 mr-2 text-teal-600" />
                    <span className="text-gray-900">{adminUser.shift}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminAssignmentDate" className="text-sm font-medium text-gray-700">Fecha de Asignación</Label>
                  <div className="flex items-center p-3 rounded-md bg-gray-50 border border-gray-300">
                    <CalendarCheck className="w-5 h-5 mr-2 text-teal-600" />
                    <span className="text-gray-900">{new Date(adminUser.assignmentDate).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminAssignedLocation" className="text-sm font-medium text-gray-700">Lugar Asignado</Label>
                  <Input 
                    id="adminAssignedLocation" 
                    value={adminUser.assignedLocation} 
                    readOnly 
                    className="bg-gray-50 border-gray-300 text-gray-600 cursor-not-allowed" 
                  />
                </div>
              </div>

              <hr className="my-6 border-gray-200" />
              
              {/* Sección de cambio de contraseña */}
              {!isEditingPassword ? (
                <Button 
                  onClick={() => setIsEditingPassword(true)} 
                  variant="outline" 
                  className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  <KeyRound className="mr-2 h-4 w-4" /> 
                  Cambiar Contraseña
                </Button>
              ) : (
                <div className="space-y-4 pt-2">
                  <h3 className="text-lg font-semibold text-teal-700">Cambiar Contraseña</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Contraseña Actual</Label>
                    <div className="relative">
                      <Input 
                        id="currentPassword" 
                        name="currentPassword" 
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Ingresa tu contraseña actual" 
                        value={formData.currentPassword} 
                        onChange={handleInputChange} 
                        className="pr-10" 
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">Nueva Contraseña</Label>
                    <div className="relative">
                      <Input 
                        id="newPassword" 
                        name="newPassword" 
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolos" 
                        value={formData.newPassword} 
                        onChange={handleInputChange} 
                        className="pr-10" 
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</Label>
                    <div className="relative">
                      <Input 
                        id="confirmPassword" 
                        name="confirmPassword" 
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repite la nueva contraseña" 
                        value={formData.confirmPassword} 
                        onChange={handleInputChange} 
                        className="pr-10" 
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => {
                        setIsEditingPassword(false);
                        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="w-full sm:w-auto"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="button"
                      onClick={handlePasswordConfirm}
                      className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700"
                    >
                      <Save className="mr-2 h-4 w-4" /> 
                      Cambiar Contraseña
                    </Button>
                  </div>
                </div>
              )}

              {/* Botón de cerrar sesión móvil */}
              <div className="sm:hidden pt-6">
                <Button 
                  onClick={handleLogoutConfirm}
                  variant="destructive"
                  className="w-full"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modal de confirmación de cambio de contraseña */}
      <Dialog open={showPasswordConfirm} onOpenChange={setShowPasswordConfirm}>
        <DialogContent className="w-[95vw] max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-orange-600 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Confirmar Cambio de Contraseña
            </DialogTitle>
            <DialogDescription className="text-sm">
              ¿Estás seguro de que quieres cambiar tu contraseña? Esta acción no se puede deshacer y se recomienda cerrar sesión después del cambio.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordConfirm(false)}
              disabled={isChangingPassword}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handlePasswordSubmit}
              disabled={isChangingPassword}
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cambiando...
                </>
              ) : (
                'Sí, Cambiar Contraseña'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de cerrar sesión */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="w-[95vw] max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center">
              <LogOut className="mr-2 h-5 w-5" />
              Confirmar Cerrar Sesión
            </DialogTitle>
            <DialogDescription className="text-sm">
              ¿Estás seguro de que quieres cerrar tu sesión? Tendrás que volver a iniciar sesión para acceder al sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowLogoutConfirm(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleLogout}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sí, Cerrar Sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProfilePage;