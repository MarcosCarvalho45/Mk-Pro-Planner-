import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { criarCliente } from '../services/stripe.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const register = async (req: Request, res: Response): Promise<any> => {
  const { name, email, phone, password, tenantId } = req.body;

  if (!name || !email || !phone || !password || !tenantId) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: 'Email já registrado' });

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Criar cliente no Stripe
    const stripeCustomer = await criarCliente(email);

    // Criar usuário no banco
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      tenantId,
      stripeCustomerId: stripeCustomer.id, // Salvando ID do cliente Stripe
      subscription: 'free',
      subscriptionStatus: 'active',
      subscriptionStart: new Date(),
    });

    const token = jwt.sign({ id: user._id, tenantId: user.tenantId }, JWT_SECRET, { expiresIn: '1h' });

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        tenantId: user.tenantId,
        subscription: user.subscription,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionStart: user.subscriptionStart
      }
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return res.status(500).json({ message: 'Erro ao criar conta' });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Usuário não encontrado' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Senha inválida' });

  const token = jwt.sign({ id: user._id, tenantId: user.tenantId }, JWT_SECRET, { expiresIn: '1h' });
  
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      tenantId: user.tenantId,
      subscription: user.subscription || 'gratuito',
      subscriptionStatus: user.subscriptionStatus || 'inativo',
      subscriptionStart: user.subscriptionStart
    }
  });

};
