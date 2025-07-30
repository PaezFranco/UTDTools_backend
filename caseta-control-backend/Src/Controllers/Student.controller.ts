  
import { Request, Response } from 'express';
import Student from '../Models/Student.model';
import bcrypt from 'bcrypt';

// Obtener todos los estudiantes
export const getAllStudents = async (_req: Request, res: Response) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estudiantes', error });
  }
};

// Obtener estudiante por ID
export const getStudentById = async (req: Request, res: Response) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Estudiante no encontrado' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estudiante', error });
  }
};

// Obtener estudiante por student_id (matrícula)
export const getStudentByStudentId = async (req: Request, res: Response) => {
  try {
    const student = await Student.findOne({ student_id: req.params.student_id });
    if (!student) return res.status(404).json({ message: 'Estudiante no encontrado' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estudiante', error });
  }
};

// Crear nuevo estudiante
export const createStudent = async (req: Request, res: Response) => {
  try {
    const { student_id, email, password, ...otherData } = req.body;

    // Verificar si el estudiante ya existe
    const existingStudent = await Student.findOne({ 
      $or: [{ student_id }, { email }] 
    });
    
    if (existingStudent) {
      return res.status(400).json({ 
        message: 'El estudiante ya existe con esa matrícula o email' 
      });
    }

    // Hashear password si se proporciona
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const newStudent = new Student({
      student_id,
      email,
      password: hashedPassword,
      registration_source: 'admin',
      is_profile_complete: true,
      ...otherData
    });

    const savedStudent = await newStudent.save();
    
    // No devolver la contraseña en la respuesta
    const { password: _, ...studentResponse } = savedStudent.toObject();
    res.status(201).json(studentResponse);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear estudiante', error });
  }
};

// Actualizar perfil de estudiante
export const updateStudentProfile = async (req: Request, res: Response) => {
  try {
    const { password, ...updateData } = req.body;
    
    // Si se proporciona una nueva contraseña, hashearla
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    ).select('-password');

    if (!student) return res.status(404).json({ message: 'Estudiante no encontrado' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar estudiante', error });
  }
};

// Registrar huella dactilar (para la app C#)
export const registerFingerprint = async (req: Request, res: Response) => {
  try {
    const { student_id } = req.params;
    
    const student = await Student.findOneAndUpdate(
      { student_id },
      { registered_fingerprint: true },
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    res.json({ 
      message: 'Huella dactilar registrada exitosamente',
      student: student
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar huella dactilar', error });
  }
};

// Verificar huella dactilar (para la app C#)
export const verifyFingerprint = async (req: Request, res: Response) => {
  try {
    const { student_id } = req.params;
    
    const student = await Student.findOne({ student_id }).select('-password');

    if (!student) {
      return res.status(404).json({ 
        message: 'Estudiante no encontrado',
        verified: false 
      });
    }

    if (student.blocked) {
      return res.status(403).json({ 
        message: `Estudiante bloqueado: ${student.block_reason}`,
        verified: false,
        blocked: true,
        block_reason: student.block_reason
      });
    }

    if (!student.registered_fingerprint) {
      return res.status(400).json({ 
        message: 'El estudiante no tiene huella dactilar registrada',
        verified: false 
      });
    }

    res.json({ 
      message: 'Huella dactilar verificada exitosamente',
      verified: true,
      student: student
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar huella dactilar', error });
  }
};

// Obtener estudiantes con huella registrada
export const getStudentsWithFingerprint = async (_req: Request, res: Response) => {
  try {
    const students = await Student.find({ registered_fingerprint: true }).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estudiantes con huella', error });
  }
};

// Bloquear/desbloquear estudiante
export const toggleStudentBlock = async (req: Request, res: Response) => {
  try {
    const { student_id } = req.params;
    const { blocked, block_reason } = req.body;

    const updateData: any = { blocked };
    if (blocked && block_reason) {
      updateData.block_reason = block_reason;
    } else if (!blocked) {
      updateData.block_reason = undefined;
    }

    const student = await Student.findOneAndUpdate(
      { student_id },
      updateData,
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    res.json({ 
      message: blocked ? 'Estudiante bloqueado' : 'Estudiante desbloqueado',
      student: student
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar estado del estudiante', error });
  }
};

// Eliminar estudiante
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Estudiante no encontrado' });
    res.json({ message: 'Estudiante eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar estudiante', error });
  }
};

// Buscar estudiantes por criterios
export const searchStudents = async (req: Request, res: Response) => {
  try {
    const { name, career, semester, group } = req.query;
    
    const searchCriteria: any = {};
    
    if (name) {
      searchCriteria.full_name = { $regex: name, $options: 'i' };
    }
    if (career) {
      searchCriteria.career = { $regex: career, $options: 'i' };
    }
    if (semester) {
      searchCriteria.semester = parseInt(semester as string);
    }
    if (group) {
      searchCriteria.group = { $regex: group, $options: 'i' };
    }

    const students = await Student.find(searchCriteria).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar estudiantes', error });
  }
};

// Obtener estudiante por código
export const getStudentByCode = async (req: Request, res: Response) => {
  try {
    const { studentCode } = req.params;
    
    console.log(`Searching for student with code: ${studentCode}`);
    
    const student = await Student.findOne({ student_id: studentCode });
    
    if (!student) {
      return res.status(404).json({
        message: 'Estudiante no encontrado',
        studentCode
      });
    }

    console.log(`Student found: ${student.full_name} (${student.student_id})`);
    
    res.json({
      student: {
        _id: student._id,
        student_id: student.student_id,
        full_name: student.full_name,
        email: student.email,
        phone: student.phone,
        career: student.career,
        semester: student.semester,
        group: student.group,
        blocked: student.blocked,
        block_reason: student.block_reason,
        registered_fingerprint: student.registered_fingerprint,
        registration_date: student.registration_date
      }
    });

  } catch (error: any) {
    console.error('Error getting student by code:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ========== FUNCIONES PARA APP MÓVIL ==========

// Registro desde aplicación móvil (sin autenticación requerida)
// Reemplazar la función registerFromMobile en tu Student.controller.ts

export const registerFromMobile = async (req: Request, res: Response) => {
  try {
    const { 
      email, 
      password, 
      device_info, 
      app_version 
    } = req.body;

    console.log('Datos recibidos:', { email, password: '***', device_info, app_version });

    // Validar datos requeridos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Validar que sea email institucional
    if (!email.toLowerCase().endsWith('@utd.edu.mx')) {
      return res.status(400).json({
        success: false,
        message: 'Solo se permite el registro con correo institucional (@utd.edu.mx)'
      });
    }

    // Verificar si el email ya existe
    const existingStudent = await Student.findOne({ email: email.toLowerCase() });
    
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una cuenta con este correo electrónico'
      });
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(password, 10);

    // CORREGIR: Extraer nombre y matrícula del email
    const emailPrefix = email.split('@')[0]; // "ron_3141230033"
    
    // Separar nombre y matrícula
    const parts = emailPrefix.split('_');
    let extractedName = '';
    let extractedMatricula: string | undefined = undefined; // CAMBIO: usar undefined
    
    if (parts.length >= 2) {
      // Si tiene formato nombre_matricula
      extractedName = parts[0]; // "ron"
      extractedMatricula = parts[1]; // "3141230033"
    } else {
      // Si no tiene underscore, usar todo como nombre
      extractedName = emailPrefix;
      extractedMatricula = undefined; // CAMBIO: usar undefined en lugar de null
    }

    console.log('Datos extraídos:', { 
      emailPrefix, 
      extractedName, 
      extractedMatricula 
    });

    // Crear objeto de datos del estudiante
    const studentData: any = {
      email: email.toLowerCase(),
      password: hashedPassword,
      full_name: extractedName,
      
      // Campos específicos para registro móvil
      registration_source: 'mobile',
      is_mobile_registration_pending: true,
      is_profile_complete: false,
      
      // Metadata del dispositivo
      mobile_registration_data: {
        device_info: device_info || 'Unknown device',
        app_version: app_version || '1.0.0',
        registration_ip: req.ip
      }
    };

    // Solo agregar student_id si existe
    if (extractedMatricula) {
      studentData.student_id = extractedMatricula;
    }

    // Crear estudiante con registro pendiente desde móvil
    const newStudent = new Student(studentData);

    const savedStudent = await newStudent.save();
    
    console.log('Estudiante guardado:', {
      id: savedStudent._id,
      name: savedStudent.full_name,
      student_id: savedStudent.student_id,
      email: savedStudent.email
    });

    // No devolver la contraseña en la respuesta
    const { password: _, ...studentResponse } = savedStudent.toObject();
    
    res.status(201).json({
      success: true,
      message: 'Registro exitoso. Tu cuenta será completada por un administrador pronto.',
      student: studentResponse
    });
  } catch (error: any) {
    console.error('Error en registro móvil:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener registros pendientes desde móvil para el dashboard
export const getMobilePendingRegistrations = async (_req: Request, res: Response) => {
  try {
    const pendingStudents = await Student.find({ 
      is_mobile_registration_pending: true,
      registration_source: 'mobile'
    })
    .select('-password')
    .sort({ registration_date: -1 }); // Más recientes primero

    console.log('Registros pendientes encontrados:', pendingStudents.length);
    console.log('Datos del primer registro:', pendingStudents[0]); // Debug

    const formattedPending = pendingStudents.map(student => ({
      id: student._id,
      name: student.full_name || student.email.split('@')[0], // Usar nombre del email si full_name no existe
      studentId: student.student_id || null, // null si no tiene matrícula asignada
      email: student.email,
      registrationDate: student.registration_date.toISOString().split('T')[0], // YYYY-MM-DD
      deviceInfo: student.mobile_registration_data?.device_info || 'Unknown',
      appVersion: student.mobile_registration_data?.app_version || '1.0.0'
    }));

    console.log('Datos formateados:', formattedPending); // Debug

    res.json(formattedPending);
  } catch (error) {
    console.error('Error obteniendo registros pendientes:', error);
    res.status(500).json({ message: 'Error al obtener registros pendientes', error });
  }
};

// Completar registro desde dashboard web
// Reemplazar la función completeMobileRegistration en tu Student.controller.ts

export const completeMobileRegistration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { student_id, career, semester, group, phone } = req.body;

    console.log('=== COMPLETANDO REGISTRO ===');
    console.log('ID del estudiante:', id);
    console.log('Datos recibidos:', { student_id, career, semester, group, phone });

    // Validar datos requeridos
    if (!student_id || !career || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Matrícula, carrera y cuatrimestre son requeridos'
      });
    }

    // Verificar que la matrícula no esté en uso por otro estudiante
    const existingWithId = await Student.findOne({ 
      student_id, 
      _id: { $ne: id } 
    });
    
    if (existingWithId) {
      console.log('ERROR: Matrícula ya existe para otro estudiante');
      return res.status(400).json({
        success: false,
        message: 'La matrícula ya está registrada para otro estudiante'
      });
    }

    // Buscar el estudiante por ID
    const student = await Student.findById(id);
    
    if (!student) {
      console.log('ERROR: Estudiante no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    console.log('✅ Estudiante encontrado:');
    console.log('- Email:', student.email);
    console.log('- Nombre actual:', student.full_name);
    console.log('- Registro pendiente actual:', student.is_mobile_registration_pending);

    if (!student.is_mobile_registration_pending) {
      console.log('ADVERTENCIA: Este estudiante no tiene registro pendiente');
      return res.status(400).json({
        success: false,
        message: 'Este estudiante no tiene registro pendiente'
      });
    }

    // Actualizar datos del estudiante
    console.log('Actualizando estudiante...');
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        student_id,
        career,
        semester: parseInt(semester),
        group: group || '',
        phone: phone || '',
        is_mobile_registration_pending: false, // IMPORTANTE: Cambiar a false
        is_profile_complete: true
      },
      { new: true }
    ).select('-password');

    if (!updatedStudent) {
      console.log('ERROR: No se pudo actualizar el estudiante');
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar el estudiante'
      });
    }

    console.log('✅ Estudiante actualizado exitosamente:');
    console.log('- ID:', updatedStudent._id);
    console.log('- Matrícula:', updatedStudent.student_id);
    console.log('- Carrera:', updatedStudent.career);
    console.log('- Cuatrimestre:', updatedStudent.semester);
    console.log('- Registro pendiente:', updatedStudent.is_mobile_registration_pending);
    console.log('- Perfil completo:', updatedStudent.is_profile_complete);

    res.json({
      success: true,
      message: 'Registro completado exitosamente',
      student: updatedStudent
    });

    console.log('=== FIN COMPLETAR REGISTRO ===');
  } catch (error: any) {
    console.error('ERROR FATAL completando registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al completar registro',
      error: error.message
    });
  }
};


// Reemplazar la función mobileLogin en tu Student.controller.ts

export const mobileLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log('=== INICIO LOGIN MÓVIL ===');
    console.log('Email:', email);

    // Validar datos requeridos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar estudiante por email
    const student = await Student.findOne({ email: email.toLowerCase() });
    
    if (!student) {
      console.log('ERROR: Estudiante no encontrado');
      return res.status(401).json({ 
        success: false,
        message: 'Credenciales incorrectas' 
      });
    }

    console.log('✅ Estudiante encontrado:', {
      email: student.email,
      hasPassword: !!student.password,
      isPending: student.is_mobile_registration_pending,
      isBlocked: student.blocked,
      registrationSource: student.registration_source
    });

    // Verificar contraseña
    if (!student.password) {
      console.log('ERROR: Estudiante sin contraseña');
      return res.status(401).json({ 
        success: false,
        message: 'Credenciales incorrectas' 
      });
    }

    const passwordMatch = await bcrypt.compare(password, student.password);
    if (!passwordMatch) {
      console.log('ERROR: Contraseña incorrecta');
      return res.status(401).json({ 
        success: false,
        message: 'Credenciales incorrectas' 
      });
    }

    console.log('✅ Contraseña correcta');

    // Verificar si está bloqueado
    if (student.blocked) {
      console.log('ERROR: Estudiante bloqueado');
      return res.status(403).json({ 
        success: false,
        message: `Cuenta bloqueada: ${student.block_reason}`,
        blocked: true
      });
    }

    // CAMBIO IMPORTANTE: Permitir login independientemente del estado pendiente
    // El estudiante SIEMPRE puede entrar a la app móvil
    
    console.log('✅ Login exitoso');
    
    // No devolver la contraseña en la respuesta
    const { password: _, ...studentData } = student.toObject();
    
    // Respuesta exitosa con información del estado
    res.json({
      success: true,
      message: 'Login exitoso',
      student: {
        ...studentData,
        // Información adicional para la app
        profileStatus: {
          isComplete: student.is_profile_complete,
          isPending: student.is_mobile_registration_pending,
          hasBasicInfo: !!(student.full_name && student.student_id),
          hasCareer: !!student.career
        }
      }
    });

    console.log('Usuario logueado exitosamente - Estado:', {
      isPending: student.is_mobile_registration_pending,
      isComplete: student.is_profile_complete
    });
    console.log('=== FIN LOGIN MÓVIL ===');

  } catch (error: any) {
    console.error('ERROR FATAL en login móvil:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error en autenticación', 
      error: error.message 
    });
  }
};



// AGREGAR AL FINAL DEL ARCHIVO Student.controller.ts

// Obtener estudiante por email (para sincronización con móvil)
export const getStudentByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    
    console.log(`🔍 Buscando estudiante por email: ${email}`);
    
    const student = await Student.findOne({ email: email.toLowerCase() }).select('-password');
    
    if (!student) {
      console.log(`❌ Estudiante no encontrado para email: ${email}`);
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    console.log(`✅ Estudiante encontrado: ${student.full_name} (${student.email})`);
    console.log(`📊 Estado del perfil: completo=${student.is_profile_complete}, pendiente=${student.is_mobile_registration_pending}`);
    
    res.json({
      success: true,
      student: student
    });

  } catch (error: any) {
    console.error('❌ Error obteniendo estudiante por email:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login móvil con sincronización completa (reemplaza al mobileLogin original)
export const mobileLoginWithSync = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log('=== 🚀 INICIO LOGIN MÓVIL CON SYNC ===');
    console.log('📧 Email:', email);

    // Validar datos requeridos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar estudiante por email
    const student = await Student.findOne({ email: email.toLowerCase() });
    
    if (!student) {
      console.log('❌ Estudiante no encontrado');
      return res.status(401).json({ 
        success: false,
        message: 'Credenciales incorrectas' 
      });
    }

    console.log('✅ Estudiante encontrado:', {
      id: student._id,
      email: student.email,
      name: student.full_name,
      hasPassword: !!student.password,
      isPending: student.is_mobile_registration_pending,
      isBlocked: student.blocked,
      isComplete: student.is_profile_complete,
      registrationSource: student.registration_source
    });

    // Verificar contraseña
    if (!student.password) {
      console.log('❌ Estudiante sin contraseña configurada');
      return res.status(401).json({ 
        success: false,
        message: 'Credenciales incorrectas' 
      });
    }

    const passwordMatch = await bcrypt.compare(password, student.password);
    if (!passwordMatch) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ 
        success: false,
        message: 'Credenciales incorrectas' 
      });
    }

    console.log('🔐 Contraseña verificada correctamente');

    // Verificar si está bloqueado
    if (student.blocked) {
      console.log('🚫 Estudiante bloqueado:', student.block_reason);
      return res.status(403).json({ 
        success: false,
        message: `Cuenta bloqueada: ${student.block_reason}`,
        blocked: true
      });
    }

    console.log('✅ Login exitoso - Preparando datos completos para sincronización');
    
    // No devolver la contraseña en la respuesta
    const { password: _, ...studentData } = student.toObject();
    
    // Respuesta exitosa con TODA la información del estudiante actualizada
    const responseData = {
      success: true,
      message: 'Login exitoso',
      student: {
        _id: studentData._id,
        email: studentData.email,
        full_name: studentData.full_name || '',
        student_id: studentData.student_id || '',
        phone: studentData.phone || '',
        career: studentData.career || '',
        semester: studentData.semester || '',
        group: studentData.group || '',
       
        
        // Estados del perfil
        is_profile_complete: studentData.is_profile_complete,
        is_mobile_registration_pending: studentData.is_mobile_registration_pending,
        registration_source: studentData.registration_source,
        blocked: studentData.blocked || false,
        block_reason: studentData.block_reason || '',
        registered_fingerprint: studentData.registered_fingerprint || false,
        registration_date: studentData.registration_date,
        
        // Información adicional para la app
        profileStatus: {
          isComplete: student.is_profile_complete,
          isPending: student.is_mobile_registration_pending,
          hasBasicInfo: !!(student.full_name && student.student_id),
          hasCareer: !!student.career,
          needsCompletion: student.is_mobile_registration_pending && !student.is_profile_complete
        }
      }
    };

    console.log('📱 Enviando datos completos a la app móvil');
    console.log('📊 Estado del perfil:', responseData.student.profileStatus);
    
    res.json(responseData);

    console.log('=== ✅ FIN LOGIN MÓVIL CON SYNC ===');

  } catch (error: any) {
    console.error('❌ ERROR FATAL en login móvil:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error en autenticación', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

