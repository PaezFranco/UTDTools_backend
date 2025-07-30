import { Schema, model, Document, Types } from 'mongoose';

export interface IReturn extends Document {
  loan_id: Types.ObjectId;
  student_id: Types.ObjectId;
  supervisor_id: Types.ObjectId;
  tools_returned: { tool_id: Types.ObjectId; quantity: number; condition: string }[];
  return_date: Date;
  notes?: string;
  admin_id: Types.ObjectId;
  late_return: boolean;
  penalty_applied?: boolean;
  penalty_amount?: number;
  return_status: 'partial' | 'complete';
  createdAt?: Date;
  updatedAt?: Date;
}

const ReturnSchema = new Schema<IReturn>({
  loan_id: { type: Schema.Types.ObjectId, ref: 'Loan', required: true },
  student_id: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  supervisor_id: { type: Schema.Types.ObjectId, ref: 'Supervisor', required: true },
  tools_returned: [
    {
      tool_id: { type: Schema.Types.ObjectId, ref: 'Tool', required: true },
      quantity: { type: Number, required: true, min: 1 },
      condition: { 
        type: String, 
        enum: ['Excelente', 'Bueno', 'Regular', 'Dañado'], 
        default: 'Bueno' 
      }
    }
  ],
  return_date: { type: Date, default: Date.now },
  notes: { type: String, trim: true },
  admin_id: { type: Schema.Types.ObjectId, ref: 'Supervisor', required: true },
  late_return: { type: Boolean, default: false },
  penalty_applied: { type: Boolean, default: false },
  penalty_amount: { type: Number, default: 0, min: 0 },
  return_status: { 
    type: String, 
    enum: ['partial', 'complete'], 
    default: 'complete' 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar el rendimiento
ReturnSchema.index({ loan_id: 1 });
ReturnSchema.index({ student_id: 1 });
ReturnSchema.index({ return_date: -1 });

export default model<IReturn>('Return', ReturnSchema);