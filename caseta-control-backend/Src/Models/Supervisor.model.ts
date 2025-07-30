
import { Schema, model, Document } from 'mongoose';

export interface ISupervisor extends Document {
  name: string;
  email: string;
  password: string;
  is_active: boolean;
  assignment_date: Date;
  assigned_location?: string;
}

const SupervisorSchema = new Schema<ISupervisor>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  assignment_date: { type: Date, default: Date.now },
  assigned_location: { type: String },
});

export default model<ISupervisor>('Supervisor', SupervisorSchema);