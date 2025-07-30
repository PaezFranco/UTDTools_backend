const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class StudentsAPI {
  // Obtener todos los estudiantes
  static async getAllStudents() {
    try {
      const response = await fetch(`${API_URL}/students`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching students:', error);
      throw new Error('Error al cargar estudiantes');
    }
  }

  // Obtener estudiante por ID de MongoDB
  static async getStudentById(id) {
    try {
      const response = await fetch(`${API_URL}/students/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Estudiante no encontrado');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching student by ID:', error);
      throw error;
    }
  }

  // Obtener estudiante por matrícula
  static async getStudentByStudentId(studentId) {
    try {
      const response = await fetch(`${API_URL}/students/by-student-id/${studentId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Estudiante no encontrado');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching student by student ID:', error);
      throw error;
    }
  }

  // Crear nuevo estudiante
  static async createStudent(studentData) {
    try {
      const response = await fetch(`${API_URL}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear estudiante');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  // Actualizar estudiante
  static async updateStudent(id, studentData) {
    try {
      const response = await fetch(`${API_URL}/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar estudiante');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  // Eliminar estudiante
  static async deleteStudent(id) {
    try {
      const response = await fetch(`${API_URL}/students/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar estudiante');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }

  // Bloquear/desbloquear estudiante
  static async toggleStudentBlock(studentId, blocked, blockReason = '') {
    try {
      const response = await fetch(`${API_URL}/students/block/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blocked,
          block_reason: blockReason
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar estado del estudiante');
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling student block:', error);
      throw error;
    }
  }

  // Buscar estudiantes
  static async searchStudents(searchParams) {
    try {
      const queryParams = new URLSearchParams();
      
      if (searchParams.name) queryParams.append('name', searchParams.name);
      if (searchParams.career) queryParams.append('career', searchParams.career);
      if (searchParams.semester) queryParams.append('semester', searchParams.semester);
      if (searchParams.group) queryParams.append('group', searchParams.group);

      const response = await fetch(`${API_URL}/students/search?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching students:', error);
      throw new Error('Error al buscar estudiantes');
    }
  }

  // Registrar huella dactilar
  static async registerFingerprint(studentId) {
    try {
      const response = await fetch(`${API_URL}/students/fingerprint/${studentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar huella dactilar');
      }

      return await response.json();
    } catch (error) {
      console.error('Error registering fingerprint:', error);
      throw error;
    }
  }

  // Verificar huella dactilar
  static async verifyFingerprint(studentId) {
    try {
      const response = await fetch(`${API_URL}/students/fingerprint/verify/${studentId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al verificar huella dactilar');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying fingerprint:', error);
      throw error;
    }
  }

  // Obtener estudiantes con huella registrada
  static async getStudentsWithFingerprint() {
    try {
      const response = await fetch(`${API_URL}/students/with-fingerprint`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching students with fingerprint:', error);
      throw new Error('Error al obtener estudiantes con huella');
    }
  }
}

// Funciones de mapeo entre formatos
export const mapBackendToFrontend = (backendStudent) => {
  return {
    id: backendStudent._id,
    studentId: backendStudent.student_id,
    name: backendStudent.full_name || '',
    email: backendStudent.email,
    status: backendStudent.blocked ? 'Bloqueado' : 'Activo',
    loans: 0, // Este campo no existe en el backend
    career: backendStudent.career || '',
    cuatrimestre: backendStudent.semester || 1,
    phone: backendStudent.phone || '',
    registrationDate: backendStudent.registration_date ? 
      new Date(backendStudent.registration_date).toISOString().split('T')[0] : 
      new Date().toISOString().split('T')[0],
    blockReason: backendStudent.block_reason || '',
    fingerprintId: backendStudent.registered_fingerprint ? 'Registrada' : 'No registrada',
    group: backendStudent.group || '',
    isProfileComplete: backendStudent.is_profile_complete || false,
    registeredFingerprint: backendStudent.registered_fingerprint || false
  };
};

export const mapFrontendToBackend = (frontendStudent) => {
  return {
    student_id: frontendStudent.studentId,
    full_name: frontendStudent.name,
    email: frontendStudent.email,
    career: frontendStudent.career,
    semester: frontendStudent.cuatrimestre,
    phone: frontendStudent.phone,
    group: frontendStudent.group || '',
    blocked: frontendStudent.status === 'Bloqueado',
    block_reason: frontendStudent.blockReason || '',
    is_profile_complete: true
  };
};

export default StudentsAPI;