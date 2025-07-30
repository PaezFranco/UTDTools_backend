
// import { Schema, model, Document } from 'mongoose';

// export interface IStudent extends Document {
//   student_id: string;
//   email: string;
//   password?: string;
//   full_name?: string;
//   career?: string;
//   semester?: number;
//   group?: string;
//   phone?: string;
//   is_profile_complete: boolean;
//   registered_fingerprint: boolean;
//   blocked: boolean;
//   block_reason?: string;
//   registration_date: Date;
// }

// const StudentSchema = new Schema<IStudent>({
//   student_id: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String },
//   full_name: { type: String },
//   career: { type: String },
//   semester: { type: Number },
//   group: { type: String },
//   phone: { type: String },
//   is_profile_complete: { type: Boolean, default: false },
//   registered_fingerprint: { type: Boolean, default: false },
//   blocked: { type: Boolean, default: false },
//   block_reason: { type: String },
//   registration_date: { type: Date, default: Date.now },
// });

// export default model<IStudent>('Student', StudentSchema);

// import { Schema, model, Document } from 'mongoose';

// export interface IStudent extends Document {
//   student_id: string;
//   email: string;
//   password?: string;
//   full_name?: string;
//   career?: string;
//   semester?: number;
//   group?: string;
//   phone?: string;
//   is_profile_complete: boolean;
//   registered_fingerprint: boolean;
//   blocked: boolean;
//   block_reason?: string;
//   registration_date: Date;
//   // NUEVOS CAMPOS PARA MANEJAR REGISTROS DESDE MÓVIL
//   registration_source: 'mobile' | 'web' | 'admin';
//   is_mobile_registration_pending: boolean;
//   mobile_registration_data?: {
//     device_info?: string;
//     app_version?: string;
//     registration_ip?: string;
//   };
// }

// const StudentSchema = new Schema<IStudent>({
//   student_id: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String },
//   full_name: { type: String },
//   career: { type: String },
//   semester: { type: Number },
//   group: { type: String },
//   phone: { type: String },
//   is_profile_complete: { type: Boolean, default: false },
//   registered_fingerprint: { type: Boolean, default: false },
//   blocked: { type: Boolean, default: false },
//   block_reason: { type: String },
//   registration_date: { type: Date, default: Date.now },
//   // NUEVOS CAMPOS
//   registration_source: { 
//     type: String, 
//     enum: ['mobile', 'web', 'admin'], 
//     default: 'web' 
//   },
//   is_mobile_registration_pending: { 
//     type: Boolean, 
//     default: false 
//   },
//   mobile_registration_data: {
//     device_info: { type: String },
//     app_version: { type: String },
//     registration_ip: { type: String }
//   }
// });

// export default model<IStudent>('Student', StudentSchema);

// import { Schema, model, Document } from 'mongoose';

// export interface IStudent extends Document {
//   student_id?: string; // CAMBIO: Ahora es opcional
//   email: string;
//   password?: string;
//   full_name?: string;
//   career?: string;
//   semester?: number;
//   group?: string;
//   phone?: string;
//   is_profile_complete: boolean;
//   registered_fingerprint: boolean;
//   blocked: boolean;
//   block_reason?: string;
//   registration_date: Date;
//   // CAMPOS PARA MANEJAR REGISTROS DESDE MÓVIL
//   registration_source: 'mobile' | 'web' | 'admin';
//   is_mobile_registration_pending: boolean;
//   mobile_registration_data?: {
//     device_info?: string;
//     app_version?: string;
//     registration_ip?: string;
//   };
// }

// const StudentSchema = new Schema<IStudent>({
//   // CAMBIO: student_id ya no es required, y tiene sparse: true para permitir múltiples null
//   student_id: { 
//     type: String, 
//     unique: true, 
//     sparse: true // Permite múltiples documentos con student_id = null
//   },
//   email: { type: String, required: true, unique: true },
//   password: { type: String },
//   full_name: { type: String },
//   career: { type: String },
//   semester: { type: Number },
//   group: { type: String },
//   phone: { type: String },
//   is_profile_complete: { type: Boolean, default: false },
//   registered_fingerprint: { type: Boolean, default: false },
//   blocked: { type: Boolean, default: false },
//   block_reason: { type: String },
//   registration_date: { type: Date, default: Date.now },
//   // CAMPOS PARA MÓVIL
//   registration_source: { 
//     type: String, 
//     enum: ['mobile', 'web', 'admin'], 
//     default: 'web' 
//   },
//   is_mobile_registration_pending: { 
//     type: Boolean, 
//     default: false 
//   },
//   mobile_registration_data: {
//     device_info: { type: String },
//     app_version: { type: String },
//     registration_ip: { type: String }
//   }
// });

// export default model<IStudent>('Student', StudentSchema);

import { Schema, model, Document } from 'mongoose';

export interface IStudent extends Document {
  student_id?: string;
  email: string;
  password?: string;
  full_name?: string;
  career?: string;
  semester?: number;
  group?: string;
  phone?: string;
  is_profile_complete: boolean;
  registered_fingerprint: boolean;
  blocked: boolean;
  block_reason?: string;
  registration_date: Date;
  registration_source: 'mobile' | 'web' | 'admin';
  is_mobile_registration_pending: boolean;
  mobile_registration_data?: {
    device_info?: string;
    app_version?: string;
    registration_ip?: string;
  };
}

const StudentSchema = new Schema<IStudent>({
  // SOLUCIÓN: Usar un campo condicional para la unicidad
  student_id: { 
    type: String,
    unique: true,
    sparse: true, // Solo aplica unicidad a valores no-null
    default: undefined // Usar undefined en lugar de null
  },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  full_name: { type: String },
  career: { type: String },
  semester: { type: Number },
  group: { type: String },
  phone: { type: String },
  is_profile_complete: { type: Boolean, default: false },
  registered_fingerprint: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },
  block_reason: { type: String },
  registration_date: { type: Date, default: Date.now },
  registration_source: { 
    type: String, 
    enum: ['mobile', 'web', 'admin'], 
    default: 'web' 
  },
  is_mobile_registration_pending: { 
    type: Boolean, 
    default: false 
  },
  mobile_registration_data: {
    device_info: { type: String },
    app_version: { type: String },
    registration_ip: { type: String }
  }
});

// IMPORTANTE: Agregar índice compuesto para permitir múltiples registros sin student_id
StudentSchema.index(
  { student_id: 1 }, 
  { 
    unique: true, 
    sparse: true,
    partialFilterExpression: { student_id: { $exists: true, $ne: null } }
  }
);

// Índice para optimizar búsquedas por email

export default model<IStudent>('Student', StudentSchema);