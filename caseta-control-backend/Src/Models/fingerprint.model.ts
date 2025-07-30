import { Schema, model, Document } from 'mongoose';

export interface IFingerprint extends Document {
  student_id: string;
  fingerprint_id: number;
  registeredAt: Date;
}

const fingerprintSchema = new Schema<IFingerprint>({
  student_id: { type: String, required: true, unique: true },
  fingerprint_id: { type: Number, required: true },
  registeredAt: { type: Date, default: Date.now }
});

export const Fingerprint = model<IFingerprint>('Fingerprint', fingerprintSchema);
