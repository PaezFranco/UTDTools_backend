// import { Schema, model, Document, Types } from 'mongoose';

// export interface ILoan extends Document {
//   student_id: Types.ObjectId;
//   supervisor_id: Types.ObjectId;
//   tools_borrowed: { tool_id: Types.ObjectId; quantity: number }[];
//   loan_date: Date;
//   estimated_return_date: Date;
//   actual_return_date?: Date;
//   status: 'active' | 'returned' | 'delayed';
//   configured_time: number; // in minutes
// }

// const LoanSchema = new Schema<ILoan>({
//   student_id: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
//   supervisor_id: { type: Schema.Types.ObjectId, ref: 'Supervisor', required: true },
//   tools_borrowed: [
//     {
//       tool_id: { type: Schema.Types.ObjectId, ref: 'Tool' },
//       quantity: { type: Number },
//     },
//   ],
//   loan_date: { type: Date, default: Date.now },
//   estimated_return_date: { type: Date, required: true },
//   actual_return_date: { type: Date },
//   status: { type: String, enum: ['active', 'returned', 'delayed'], default: 'active' },
//   configured_time: { type: Number, default: 360 },
// });

// export default model<ILoan>('Loan', LoanSchema);
import { Schema, model, Document, Types } from 'mongoose';

// Interface para notificaciones
export interface INotification {
  type: 'overdue_email' | 'overdue_sms' | 'reminder_call' | 'warning_email' | 'final_notice';
  sentAt: Date;
  sentBy: Types.ObjectId;
  daysOverdue?: number;
  sentTo?: string;
  method?: 'email' | 'sms' | 'call' | 'system';
  message?: string;
  success?: boolean;
}

// Interface para herramientas prestadas
export interface IToolBorrowed {
  tool_id: Types.ObjectId;
  quantity: number;
  returned_quantity?: number;
  condition_borrowed?: string;
  condition_returned?: string;
  notes?: string;
}

// Interface principal del préstamo
export interface ILoan extends Document {
  student_id: Types.ObjectId;
  supervisor_id: Types.ObjectId;
  tools_borrowed: IToolBorrowed[];
  loan_date: Date;
  estimated_return_date: Date;
  actual_return_date?: Date;
  status: 'active' | 'returned' | 'delayed';
  configured_time: number; // in minutes
  notifications?: INotification[]; // Campo agregado para notificaciones
  blocked_by?: Types.ObjectId; // Quién bloqueó el préstamo (si aplica)
  blocked_at?: Date; // Cuándo se bloqueó el préstamo
  last_reminder_sent?: Date; // Última vez que se envió recordatorio
  reminder_count?: number; // Contador de recordatorios enviados
}

// Schema para notificaciones
const NotificationSchema = new Schema<INotification>({
  type: { 
    type: String, 
    enum: ['overdue_email', 'overdue_sms', 'reminder_call', 'warning_email', 'final_notice'],
    required: true 
  },
  sentAt: { type: Date, default: Date.now },
  sentBy: { type: Schema.Types.ObjectId, ref: 'Supervisor', required: true },
  daysOverdue: { type: Number },
  sentTo: { type: String }, // Email, teléfono, etc.
  method: { 
    type: String, 
    enum: ['email', 'sms', 'call', 'system'],
    default: 'email' 
  },
  message: { type: String },
  success: { type: Boolean, default: true }
}, { 
  timestamps: false, // No necesitamos timestamps adicionales
  _id: true // Cada notificación tendrá su propio _id
});

// Schema para herramientas prestadas
const ToolBorrowedSchema = new Schema<IToolBorrowed>({
  tool_id: { type: Schema.Types.ObjectId, ref: 'Tool', required: true },
  quantity: { type: Number, required: true, min: 1 },
  returned_quantity: { type: Number, default: 0, min: 0 },
  condition_borrowed: { 
    type: String, 
    enum: ['excellent', 'good', 'fair', 'poor', 'damaged'],
    default: 'good' 
  },
  condition_returned: { 
    type: String, 
    enum: ['excellent', 'good', 'fair', 'poor', 'damaged'] 
  },
  notes: { type: String, maxlength: 500 }
}, { 
  _id: false // No necesitamos _id para sub-documentos simples
});

// Schema principal del préstamo
const LoanSchema = new Schema<ILoan>({
  student_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true,
    index: true // Índice para búsquedas rápidas
  },
  supervisor_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Supervisor', 
    required: true 
  },
  tools_borrowed: {
    type: [ToolBorrowedSchema],
    required: true,
    validate: {
      validator: function(tools: IToolBorrowed[]) {
        return tools && tools.length > 0;
      },
      message: 'At least one tool must be borrowed'
    }
  },
  loan_date: { 
    type: Date, 
    default: Date.now,
    index: true // Índice para ordenamiento por fecha
  },
  estimated_return_date: { 
    type: Date, 
    required: true,
    index: true // Índice para encontrar préstamos vencidos rápidamente
  },
  actual_return_date: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'returned', 'delayed'], 
    default: 'active',
    index: true // Índice para filtrar por status
  },
  configured_time: { 
    type: Number, 
    default: 360, // 6 horas por defecto
    min: 1,
    max: 10080 // Máximo 7 días (10080 minutos)
  },
  
  // ========== CAMPOS NUEVOS PARA NOTIFICACIONES ==========
  notifications: {
    type: [NotificationSchema],
    default: []
  },
  blocked_by: { 
    type: Schema.Types.ObjectId, 
    ref: 'Supervisor' 
  },
  blocked_at: { type: Date },
  last_reminder_sent: { 
    type: Date,
    index: true // Para encontrar préstamos que necesitan recordatorio
  },
  reminder_count: { 
    type: Number, 
    default: 0,
    min: 0
  }
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
  versionKey: false // Remueve el campo __v
});

// ========== ÍNDICES COMPUESTOS PARA MEJOR PERFORMANCE ==========

// Índice para encontrar préstamos vencidos activos
LoanSchema.index({ 
  status: 1, 
  estimated_return_date: 1 
});

// Índice para encontrar préstamos por estudiante y status
LoanSchema.index({ 
  student_id: 1, 
  status: 1 
});

// Índice para reportes por fecha
LoanSchema.index({ 
  loan_date: 1, 
  supervisor_id: 1 
});

// ========== MÉTODOS VIRTUALES ==========

// Virtual para calcular días vencidos
LoanSchema.virtual('daysOverdue').get(function() {
  if (this.status !== 'active' && this.status !== 'delayed') return 0;
  
  const now = new Date();
  const dueDate = new Date(this.estimated_return_date);
  
  if (now <= dueDate) return 0;
  
  const diffTime = now.getTime() - dueDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual para obtener el nivel de urgencia
LoanSchema.virtual('urgencyLevel').get(function() {
  const daysOverdue = this.get('daysOverdue');
  
  if (daysOverdue <= 0) return 'on_time';
  if (daysOverdue <= 3) return 'recent';
  if (daysOverdue <= 7) return 'urgent';
  return 'critical';
});

// ========== MÉTODOS DE INSTANCIA ==========

// Método para agregar notificación
LoanSchema.methods.addNotification = function(notificationData: Partial<INotification>) {
  if (!this.notifications) {
    this.notifications = [];
  }
  
  this.notifications.push({
    ...notificationData,
    sentAt: new Date()
  });
  
  this.last_reminder_sent = new Date();
  this.reminder_count = (this.reminder_count || 0) + 1;
  
  return this.save();
};

// Método para verificar si se puede enviar recordatorio
LoanSchema.methods.canSendReminder = function(cooldownMinutes: number = 5) {
  if (!this.last_reminder_sent) return true;
  
  const now = new Date();
  const lastSent = new Date(this.last_reminder_sent);
  const diffMinutes = (now.getTime() - lastSent.getTime()) / (1000 * 60);
  
  return diffMinutes >= cooldownMinutes;
};

// ========== MÉTODOS ESTÁTICOS ==========

// Método estático para encontrar préstamos vencidos
LoanSchema.statics.findOverdue = function() {
  return this.find({
    status: { $in: ['active', 'delayed'] },
    estimated_return_date: { $lt: new Date() }
  }).populate('student_id supervisor_id tools_borrowed.tool_id');
};

// Método estático para estadísticas de vencidos
LoanSchema.statics.getOverdueStats = function() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  
  return Promise.all([
    // Total vencidos
    this.countDocuments({
      status: { $in: ['active', 'delayed'] },
      estimated_return_date: { $lt: now }
    }),
    // Críticos (>7 días)
    this.countDocuments({
      status: { $in: ['active', 'delayed'] },
      estimated_return_date: { $lt: sevenDaysAgo }
    }),
    // Urgentes (3-7 días)
    this.countDocuments({
      status: { $in: ['active', 'delayed'] },
      estimated_return_date: { $lt: threeDaysAgo, $gte: sevenDaysAgo }
    }),
    // Recientes (1-3 días)
    this.countDocuments({
      status: { $in: ['active', 'delayed'] },
      estimated_return_date: { $lt: now, $gte: threeDaysAgo }
    })
  ]).then(([total, critical, urgent, recent]) => ({
    total,
    critical,
    urgent,
    recent
  }));
};

// ========== MIDDLEWARE ==========

// Pre-save middleware para actualizar status si está vencido
LoanSchema.pre('save', function() {
  if (this.isModified('estimated_return_date') || this.isNew) {
    const now = new Date();
    const dueDate = new Date(this.estimated_return_date);
    
    if (this.status === 'active' && now > dueDate) {
      this.status = 'delayed';
    }
  }
});

// Post-save middleware para logging
LoanSchema.post('save', function() {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Loan ${this._id} saved with status: ${this.status}`);
  }
});

export default model<ILoan>('Loan', LoanSchema);