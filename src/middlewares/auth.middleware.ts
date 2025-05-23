import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

export interface AuthenticatedRequest extends Request {
  user?: any; // ou IUser, seu tipo de usuário
  tenantId?: string;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Usuário não encontrado' });

    const reqAuth = req as AuthenticatedRequest;
    reqAuth.user = user;
    reqAuth.tenantId = user.tenantId; // setar tenantId aqui para facilitar acesso

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
