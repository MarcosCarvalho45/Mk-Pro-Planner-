import { Schema, model, Document, Types } from 'mongoose';

export interface IEvento {
  summary: string;
  location?: string;
  description?: string;
  start: {
    dateTime: string; // ISO 8601 com fuso, ex: 2025-05-23T10:00:00-03:00
    timeZone: string;  // ex: America/Sao_Paulo
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: { email: string }[];
  reminders?: {
    useDefault: boolean;
    overrides?: { method: string; minutes: number }[];
  };
}

export interface IAgenda extends Document {
  userId: Types.ObjectId;
  tenantId: string;
  nomeAgenda: string;
  eventos: IEvento[];
  createdAt: Date;
  updatedAt: Date;
}

const eventoSchema = new Schema<IEvento>(
  {
    summary: { type: String, required: true },
    location: { type: String },
    description: { type: String },
    start: {
      dateTime: { type: String, required: true },
      timeZone: { type: String, required: true },
    },
    end: {
      dateTime: { type: String, required: true },
      timeZone: { type: String, required: true },
    },
    attendees: [
      {
        email: { type: String, required: true },
      },
    ],
    reminders: {
      useDefault: { type: Boolean, required: true },
      overrides: [
        {
          method: { type: String, required: true },
          minutes: { type: Number, required: true },
        },
      ],
    },
  },
  { _id: false }
);

const agendaSchema = new Schema<IAgenda>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tenantId: { type: String, required: true },
    nomeAgenda: { type: String, required: true },
    eventos: { type: [eventoSchema], required: true },
  },
  { timestamps: true }
);

export const Agenda = model<IAgenda>('Agenda', agendaSchema);
