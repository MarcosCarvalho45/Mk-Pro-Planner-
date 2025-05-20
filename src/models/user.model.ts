import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  tenantId: string;
  subscription: 'free' | 'start' | 'platinum';
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete'; // status da assinatura Stripe
  subscriptionCurrentPeriodEnd?: Date; // fim da validade da assinatura
  stripeCustomerId?: string; // id do cliente no Stripe
  stripeSubscriptionId?: string; // id da assinatura no Stripe
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  tenantId: { type: String, required: true },
  subscription: { type: String, enum: ['free', 'start', 'platinum'], default: 'free' },
  subscriptionStatus: { type: String, enum: ['active', 'canceled', 'past_due', 'unpaid', 'incomplete'] },
  subscriptionCurrentPeriodEnd: { type: Date },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
});

export default mongoose.model<IUser>('User', UserSchema);
