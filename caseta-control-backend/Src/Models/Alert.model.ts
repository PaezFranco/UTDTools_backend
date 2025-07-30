import { Schema, model, Document, Types } from 'mongoose';

export interface IAlert extends Document {
  student_id: Types.ObjectId;
  tool_id: Types.ObjectId;
  alert_type: 'not_returned' | 'delayed' | 'blocked';
  date: Date;
  resolved: boolean;
}

const alertSchema = new Schema<IAlert>({
  student_id: { type: Schema.Types.ObjectId, ref: 'Student' },
  tool_id: { type: Schema.Types.ObjectId, ref: 'Tool' },
  alert_type: { type: String, enum: ['not_returned', 'delayed', 'blocked'] },
  date: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
});

export default model<IAlert>('Alert', alertSchema);
