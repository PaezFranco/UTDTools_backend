import { Schema, model, Document, Types } from 'mongoose';

export interface ITool extends Document {
  available_quantity: any;
  name: any;
 
  uniqueId: string;           
  specificName: string;      
  generalName: string;        
  category: string;           
  
  // Estados
  status: 'Disponible' | 'En Préstamo' | 'Mantenimiento';
  maintenance_status: 'OK' | 'Sugerido' | 'Urgente' | 'N/A';
  
  // Fechas de mantenimiento
  last_maintenance?: Date;
  next_maintenance?: Date;
  
  // Contadores y métricas
  usage_count: number;
  accumulated_use: number;
  average_use_time: number;
  
  // Campos adicionales
  description?: string;
  image?: string;
  maintenance_alert: boolean;
  last_review_date?: Date;
  assigned_supervisor?: Types.ObjectId;
  
  // Campos de auditoría
  createdAt?: Date;
  updatedAt?: Date;
}

const ToolSchema = new Schema({
  // Campos principales
  uniqueId: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  specificName: { 
    type: String, 
    required: true,
    trim: true
  },
  generalName: { 
    type: String, 
    required: true,
    trim: true
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Eléctrica', 'Manual', 'Medición', 'Consumible', 'Seguridad', 'Otra'],
    default: 'Otra'
  },
  
  // Estados
  status: { 
    type: String, 
    enum: ['Disponible', 'En Préstamo', 'Mantenimiento'], 
    default: 'Disponible'
  },
  maintenance_status: { 
    type: String, 
    enum: ['OK', 'Sugerido', 'Urgente', 'N/A'], 
    default: 'OK'
  },
  
  // Fechas de mantenimiento
  last_maintenance: { 
    type: Date,
    default: Date.now
  },
  next_maintenance: { 
    type: Date,
    default: function() {
      // 6 meses después de la fecha actual
      const sixMonthsLater = new Date();
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
      return sixMonthsLater;
    }
  },
  
  // Contadores y métricas
  usage_count: { 
    type: Number, 
    default: 0,
    min: 0
  },
  accumulated_use: { 
    type: Number, 
    default: 0,
    min: 0
  },
  average_use_time: { 
    type: Number, 
    default: 0,
    min: 0
  },
  
  // Campos adicionales (opcionales)
  description: { 
    type: String,
    trim: true
  },
  image: { 
    type: String,
    trim: true
  },
  maintenance_alert: { 
    type: Boolean, 
    default: false 
  },
  last_review_date: { 
    type: Date 
  },
  assigned_supervisor: { 
    type: Schema.Types.ObjectId, 
    ref: 'Supervisor' 
  },
  available_quantity: {
  type: Number,
  required: true,
  min: 0,
  default: 1
},
total_quantity: {
  type: Number,
  required: true,
  min: 1,
  default: 1
},

}, {
  timestamps: true, // Esto añade automáticamente createdAt y updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar el rendimiento
ToolSchema.index({ uniqueId: 1 });
ToolSchema.index({ category: 1 });
ToolSchema.index({ status: 1 });
ToolSchema.index({ maintenance_status: 1 });

// Middleware para validaciones adicionales
ToolSchema.pre<ITool>('save', function (next) {
  if (this.category === 'Consumible') {
    this.maintenance_status = 'N/A';
    this.last_maintenance = undefined;
    this.next_maintenance = undefined;
  }
  next();
});

export default model<ITool>('Tool', ToolSchema);