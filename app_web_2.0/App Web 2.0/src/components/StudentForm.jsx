import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Fingerprint } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const StudentForm = ({ studentData, onSubmit, onCancel, predefinedCareers, isEditing, isCompletingRegistration }) => {
  const [formData, setFormData] = useState(studentData);
  const { toast } = useToast();

  useEffect(() => {
    setFormData(studentData);
  }, [studentData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "studentId") {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      } else {
        toast({
          title: "Límite Alcanzado",
          description: "La matrícula no puede exceder los 10 dígitos.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: name === 'cuatrimestre' || name === 'loans' ? parseInt(value) || '' : value }));
    }
  };

  const handleCareerChange = (value) => {
    setFormData(prev => ({ ...prev, career: value }));
  };

  const handleStatusChange = (value) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleRegisterFingerprint = () => {
    const newFingerprintId = `FP-SIM-${Date.now().toString().slice(-5)}`;
    setFormData(prev => ({ ...prev, fingerprintId: newFingerprintId }));
    toast({
      title: "Registro de Huella (Simulado)",
      description: `Coloque el dedo... ¡Huella registrada! ID Asignado: ${newFingerprintId}`,
      duration: 5000,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.studentId.length !== 10) {
      toast({
        title: "Matrícula Inválida",
        description: "La matrícula debe contener exactamente 10 dígitos.",
        variant: "destructive",
      });
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} id="student-form-modal-component" className="py-4 flex-grow overflow-y-auto px-4 overflow-x-hidden">
      
      {/* Sección 1: Datos Básicos */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-teal-700 border-b border-teal-200 pb-2">
          Información Básica
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Matrícula */}
          <div className="space-y-1">
            <Label htmlFor="studentId-form" className="text-custom-gold text-sm font-medium">
              Matrícula *
            </Label>
            <Input
              id="studentId-form"
              name="studentId"
              value={formData?.studentId || ''}
              onChange={handleInputChange}
              className="bg-input border-custom-gold/30 focus:border-custom-gold h-10"
              required
             
              readOnly={isCompletingRegistration || (isEditing && !isCompletingRegistration)}
              pattern="\d{10}"
              title="La matrícula debe contener 10 números."
              maxLength={10}
            />
            <p className="text-xs text-gray-500">10 dígitos numéricos</p>
          </div>

          {/* Cuatrimestre */}
          <div className="space-y-1">
            <Label htmlFor="cuatrimestre-form" className="text-custom-gold text-sm font-medium">
              Cuatrimestre *
            </Label>
            <Input 
              id="cuatrimestre-form" 
              name="cuatrimestre" 
              type="number" 
              min="1" 
              max="12" 
              value={formData?.cuatrimestre || 1} 
              onChange={handleInputChange} 
              className="bg-input border-custom-gold/30 focus:border-custom-gold h-10" 
              required 
            />
            <p className="text-xs text-gray-500">1 - 12</p>
          </div>
        </div>

        {/* Nombre Completo */}
        <div className="space-y-1">
          <Label htmlFor="name-form" className="text-custom-gold text-sm font-medium">
            Nombre Completo *
          </Label>
          <Input
            id="name-form"
            name="name"
            value={formData?.name || ''}
            onChange={handleInputChange}
            className="bg-input border-custom-gold/30 focus:border-custom-gold h-10"
            required
            placeholder="Nombre completo del estudiante"
            readOnly={isCompletingRegistration}
          />
        </div>

        {/* Carrera */}
        <div className="space-y-1">
          <Label htmlFor="career-form" className="text-custom-gold text-sm font-medium">
            Carrera *
          </Label>
          <Select
            value={formData?.career || ''}
            onValueChange={handleCareerChange}
          >
            <SelectTrigger className="w-full bg-input border-custom-gold/30 focus:border-custom-gold text-foreground h-10">
              <SelectValue placeholder="Seleccione una carrera" />
            </SelectTrigger>
            <SelectContent className="bg-card border-custom-gold/50 text-foreground">
              {predefinedCareers.map(career => (
                <SelectItem key={career} value={career}>{career}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sección 2: Datos de Contacto */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-teal-700 border-b border-teal-200 pb-2">
          Información de Contacto
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email-form" className="text-custom-gold text-sm font-medium">
              Email Institucional *
            </Label>
            <Input 
              id="email-form" 
              name="email" 
              type="email" 
              value={formData?.email || ''} 
              onChange={handleInputChange} 
              className="bg-input border-custom-gold/30 focus:border-custom-gold h-10" 
              required 
              placeholder="nombre_matricula@utd.edu.mx"
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-1">
            <Label htmlFor="phone-form" className="text-custom-gold text-sm font-medium">
              Teléfono
            </Label>
            <Input 
              id="phone-form" 
              name="phone" 
              type="tel" 
              value={formData?.phone || ''} 
              onChange={handleInputChange} 
              className="bg-input border-custom-gold/30 focus:border-custom-gold h-10" 
              placeholder="618 123 4567"
            />
          </div>
        </div>
      </div>

      {/* Sección 3: Estado y Configuración */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-teal-700 border-b border-teal-200 pb-2">
          Estado y Configuración
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Estado */}
          <div className="space-y-1">
            <Label htmlFor="status-form" className="text-custom-gold text-sm font-medium">
              Estado *
            </Label>
            <Select
              value={formData?.status || 'Activo'}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-full bg-input border-custom-gold/30 focus:border-custom-gold text-foreground h-10">
                <SelectValue placeholder="Seleccione estado" />
              </SelectTrigger>
              <SelectContent className="bg-card border-custom-gold/50 text-foreground">
                <SelectItem value="Activo">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Activo
                  </span>
                </SelectItem>
                <SelectItem value="Bloqueado">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Bloqueado
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Motivo de Bloqueo - Solo si está bloqueado */}
          {formData?.status === 'Bloqueado' && (
            <div className="space-y-1">
              <Label htmlFor="blockReason-form" className="text-custom-gold text-sm font-medium">
                Motivo del Bloqueo *
              </Label>
              <Input 
                id="blockReason-form" 
                name="blockReason" 
                value={formData?.blockReason || ''} 
                onChange={handleInputChange} 
                className="bg-input border-custom-gold/30 focus:border-custom-gold h-10" 
                placeholder="Especifique el motivo del bloqueo"
                required={formData?.status === 'Bloqueado'}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sección 4: Huella Digital */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-teal-700 border-b border-teal-200 pb-2">
          Identificación Biométrica
        </h3>
        
        <div className="space-y-1">
          <Label htmlFor="fingerprintId-form" className="text-custom-gold text-sm font-medium">
            ID Huella Digital
          </Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              id="fingerprintId-form"
              name="fingerprintId"
              value={formData?.fingerprintId || ''}
              onChange={handleInputChange}
              className="flex-grow bg-input border-custom-gold/30 focus:border-custom-gold h-10"
              placeholder="Sin huella registrada"
              readOnly={!!formData?.fingerprintId && !isCompletingRegistration && !isEditing}
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleRegisterFingerprint} 
              className="border-teal-600 text-teal-600 hover:bg-teal-50 hover:text-teal-700 shrink-0 h-10 px-4"
            >
              <Fingerprint className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Registrar Huella</span>
              <span className="sm:hidden">Registrar</span>
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${formData?.fingerprintId ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <p className="text-xs text-gray-500">
              {formData?.fingerprintId 
                ? `Huella registrada: ${formData.fingerprintId}` 
                : 'Sin huella registrada - Opcional para identificación rápida'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Campos ocultos */}
      <input type="hidden" name="id" value={formData?.id || ''} />
      <input type="hidden" name="registrationDate" value={formData?.registrationDate || ''} />
      <input type="hidden" name="loans" value={formData?.loans || 0} />

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-6 border-t border-gray-200">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 h-10 px-6"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="bg-teal-600 hover:bg-teal-700 text-white h-10 px-6"
        >
          {isEditing ? 'Actualizar Estudiante' : 'Guardar Estudiante'}
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;