// Models/Session.model.ts
import { Schema, model, Document } from 'mongoose';

export interface ISession extends Document {
  user_id: string;
  user_type: 'student' | 'supervisor';
  refresh_token: string;
  expires_at: Date;
  created_at: Date;
  last_used: Date;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
}

const SessionSchema = new Schema<ISession>({
  user_id: { type: String, required: true },
  user_type: { type: String, enum: ['student', 'supervisor'], required: true },
  refresh_token: { type: String, required: true, unique: true },
  expires_at: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
  last_used: { type: Date, default: Date.now },
  ip_address: { type: String },
  user_agent: { type: String },
  is_active: { type: Boolean, default: true },
});

// Índice para limpiar sesiones expiradas automáticamente
SessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default model<ISession>('Session', SessionSchema);