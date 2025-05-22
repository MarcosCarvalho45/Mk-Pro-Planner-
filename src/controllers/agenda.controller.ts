import { Response } from 'express';
import { Agenda, IAgenda } from '../models/agenda.model';
import { gerarAgendaComIA } from '../services/ai.service'; 
import { AuthenticatedRequest } from '../middlewares/auth.middleware'; 
import User from '../models/user.model';

export const getAgendas = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?._id;
    const tenantId = req.user?.tenantId || req.tenantId;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Busca todas as agendas do usuário + tenant
    const agendas = await Agenda.find({ userId, tenantId }).sort({ createdAt: -1 });

    return res.status(200).json({
      agendas, // retorna o array dentro do objeto
      message: 'Agendas carregadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar agendas:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar agendas' });
  }
};


// Cria agenda com geração via IA
export const createAgendaViaAI = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?._id;
    const tenantId = req.user?.tenantId || req.tenantId;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt é obrigatório' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Limites de agendas podem ser controlados por plano se quiser
    // Aqui só um exemplo simples:
    const totalAgendas = await Agenda.countDocuments({ userId });
    let maxAgendas = 0;
    switch (user.subscription) {
      case 'free':
        maxAgendas = Infinity;
        break;
      case 'start':
        maxAgendas = 5;
        break;
      case 'platinum':
        maxAgendas = Infinity;
        break;
      default:
        maxAgendas = 0;
    }

    if (totalAgendas >= maxAgendas) {
      return res.status(403).json({ message: `Limite de agendas excedido para seu plano (${user.subscription}).` });
    }

    // Gera a agenda via IA
    const agendaGerada = await gerarAgendaComIA(prompt);

    if (!agendaGerada || !Array.isArray(agendaGerada.tarefas)) {
      return res.status(500).json({ message: 'Formato inválido recebido da IA' });
    }

    // Cria o documento completo com nomeAgenda e tarefas
    const novaAgenda = new Agenda({
      userId,
      tenantId,
      nomeAgenda: agendaGerada.nomeAgenda,
      tarefas: agendaGerada.tarefas,
    });

    const salva = await novaAgenda.save();

    return res.status(201).json({ message: 'Agenda criada com sucesso', agenda: salva });

  } catch (error) {
    console.error('Erro ao criar agenda via IA:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
