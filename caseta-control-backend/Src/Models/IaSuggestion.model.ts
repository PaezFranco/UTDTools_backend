import { Schema, model, Document, Types } from 'mongoose';

export interface IIaSuggestion extends Document {
  tools_id: Types.ObjectId[];
  risk: 'medium' | 'high';
  reasons: {
    accumulated_use: number;
    frequent_delays: number;
    not_returned: number;
  };
  suggested_date: Date;
  attended: boolean;
  attended_by: Types.ObjectId[];
}

const IaSuggestionSchema = new Schema<IIaSuggestion>({
  tools_id: [{ type: Schema.Types.ObjectId, ref: 'Tool' }],
  risk: { type: String, enum: ['medium', 'high'] },
  reasons: {
    accumulated_use: { type: Number },
    frequent_delays: { type: Number },
    not_returned: { type: Number },
  },
  suggested_date: { type: Date, default: Date.now },
  attended: { type: Boolean, default: false },
  attended_by: [{ type: Schema.Types.ObjectId, ref: 'Supervisor' }],
});

export default model<IIaSuggestion>('IaSuggestion', IaSuggestionSchema);
