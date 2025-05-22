import { Schema, model, Document, Types } from 'mongoose';

export interface ITarefa {
  titulo: string;
  descricao?: string;
  dia: string;       // Formato "dd-MM-yyyy"
  diaSemana: string; // Ex: "segunda-feira"
  hora: string;      // Formato "HH:mm"
}

export interface IAgenda extends Document {
  userId: Types.ObjectId;
  tenantId: string;
  nomeAgenda: string;
  tarefas: ITarefa[];
  createdAt: Date;
  updatedAt: Date;
}

const tarefaSchema = new Schema<ITarefa>(
  {
    titulo: { type: String, required: true },
    descricao: { type: String },
    dia: { type: String, required: true },
    diaSemana: { type: String, required: true },
    hora: { type: String, required: true },
  },
  { _id: false } // para evitar criar _id automático em cada tarefa
);

const agendaSchema = new Schema<IAgenda>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tenantId: { type: String, required: true },
    nomeAgenda: { type: String, required: true },
    tarefas: { type: [tarefaSchema], required: true },
  },
  { timestamps: true }
);

export const Agenda = model<IAgenda>('Agenda', agendaSchema);
