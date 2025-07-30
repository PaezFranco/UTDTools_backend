// Componente FingerprintRegistration.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Fingerprint, Loader2 } from 'lucide-react';

const FingerprintRegistration = () => {
  const [studentId, setStudentId] = useState('');
  const [fingerprintSlot, setFingerprintSlot] = useState(1);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const ESP32_IP = 'http://192.168.68.73'; // Tu IP del ESP32

  const handleRegister = async () => {
    if (!studentId.trim()) {
      alert('Ingresa el ID del estudiante');
      return;
    }

    setIsRegistering(true);
    
    try {
      const response = await fetch(`${ESP32_IP}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: fingerprintSlot,
          student_id: studentId,
          notify_backend: true
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Huella registrada exitosamente!\nEstudiante: ${studentId}\nSlot: ${fingerprintSlot}`);
        
        // Limpiar campos
        setStudentId('');
        setFingerprintSlot(fingerprintSlot + 1);
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Error de conexión: ${error.message}`);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4 border rounded-lg">
      <h3 className="text-lg font-semibold flex items-center">
        <Fingerprint className="mr-2" />
        Registrar Huella
      </h3>
      
      <div className="space-y-2">
        <Label>ID del Estudiante</Label>
        <Input 
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Ej: amparo, ron, etc."
        />
      </div>
      
      <div className="space-y-2">
        <Label>Slot en Sensor (1-127)</Label>
        <Input 
          type="number"
          min="1"
          max="127"
          value={fingerprintSlot}
          onChange={(e) => setFingerprintSlot(parseInt(e.target.value))}
        />
      </div>
      
      <Button 
        onClick={handleRegister}
        disabled={isRegistering}
        className="w-full"
      >
        {isRegistering ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registrando... (Coloque dedo en sensor)
          </>
        ) : (
          <>
            <Fingerprint className="mr-2 h-4 w-4" />
            Registrar Huella
          </>
        )}
      </Button>
      
      {isRegistering && (
        <div className="text-center p-4 bg-blue-50 rounded">
          <p className="text-blue-700 font-semibold"> Instrucciones:</p>
          <p className="text-sm text-blue-600">
            1. Coloque el dedo en el sensor AS608<br/>
            2. Retire el dedo cuando se indique<br/>
            3. Coloque el mismo dedo nuevamente
          </p>
        </div>
      )}
    </div>
  );
};

export default FingerprintRegistration;