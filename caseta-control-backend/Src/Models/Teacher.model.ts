import { Schema, model, Document } from 'mongoose';

export interface ITeacher extends Document {
  teacher_id: string; // Clave única del maestro
  full_name: string;
  email: string;
  phone?: string;
  department?: string;
  active: boolean;
}

const TeacherSchema = new Schema<ITeacher>({
  teacher_id: { type: String, required: true, unique: true },
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  department: { type: String },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Índices para mejorar performance
TeacherSchema.index({ teacher_id: 1 });
TeacherSchema.index({ email: 1 });

export default model<ITeacher>('Teacher', TeacherSchema);