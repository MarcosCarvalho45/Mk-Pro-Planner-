import { Schema, model, Document, Types } from 'mongoose';

export interface IAgenda extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const agendaSchema = new Schema<IAgenda>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Agenda = model<IAgenda>('Agenda', agendaSchema);
