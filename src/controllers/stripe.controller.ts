import { Request, Response } from 'express';
import {
  criarCheckoutSession,
} from '../services/stripe.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware'; // importe sua interface

import User from '../models/user.model';

export async function criarCheckoutSessionController(req: AuthenticatedRequest, res: Response):Promise<any> {
  try {
    const userId = (req as any).user.id;
    const { priceId, successUrl, cancelUrl } = req.body;

    if (!priceId || !successUrl || !cancelUrl) {
      return res.status(400).json({ message: 'priceId, successUrl e cancelUrl são obrigatórios' });
    }

    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({ message: 'Usuário ou cliente Stripe não encontrado' });
    }

    const session = await criarCheckoutSession(
      user.stripeCustomerId,
      priceId,
      successUrl,
      cancelUrl
    );

    return res.status(201).json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return res.status(500).json({ message: 'Erro interno ao criar sessão de checkout' });
  }
}
