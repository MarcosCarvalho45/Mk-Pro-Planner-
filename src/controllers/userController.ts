import { Request, Response } from 'express';
import User from '../models/user.model';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user.id; // assumindo que o middleware de auth já colocou isso no req
    const user = await User.findById(userId).select('-password'); // não trazer senha
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};


export const updateUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user.id;
    const { name, email, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    await user.save();

    const { password, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};