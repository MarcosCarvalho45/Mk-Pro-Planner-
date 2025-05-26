import { Request, Response } from 'express';
import { Agenda } from '../models/agenda.model';
import { gerarAgendaComIA } from '../services/ai.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import User from '../models/user.model';

// GET agendas
export const getAgendas = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?._id;
    const tenantId = req.user?.tenantId || req.tenantId;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const agendas = await Agenda.find({ userId, tenantId }).sort({ createdAt: -1 });

    return res.status(200).json({
      agendas,
      message: 'Agendas carregadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar agendas:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar agendas' });
  }
};

// POST create agenda via AI
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

    const totalAgendas = await Agenda.countDocuments({ userId });
    let maxAgendas = 0;
    switch (user.subscription) {
      case 'free':
        maxAgendas = Infinity;
        break;
      case 'start':
        maxAgendas = Infinity;
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

    const agendaGerada = await gerarAgendaComIA(prompt);

    if (!agendaGerada || !Array.isArray(agendaGerada.eventos)) {
      return res.status(500).json({ message: 'Formato inválido recebido da IA' });
    }

    const novaAgenda = new Agenda({
      userId,
      tenantId,
      nomeAgenda: agendaGerada.nomeAgenda,
      eventos: agendaGerada.eventos,
    });

    const salva = await novaAgenda.save();

    return res.status(201).json({ message: 'Agenda criada com sucesso', agenda: salva });
  } catch (error) {
    console.error('Erro ao criar agenda via IA:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// PUT update agenda
export const updateAgenda = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?._id;
    const tenantId = req.user?.tenantId || req.tenantId;
    const agendaId = req.params.id;
    const updates = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const agenda = await Agenda.findOne({ _id: agendaId, userId, tenantId });
    if (!agenda) {
      return res.status(404).json({ message: 'Agenda não encontrada' });
    }

    if (updates.nomeAgenda !== undefined) {
      agenda.nomeAgenda = updates.nomeAgenda;
    }
    if (updates.tarefas !== undefined) {
      agenda.eventos = updates.tarefas; // ideal validar aqui
    }

    await agenda.save();

    return res.status(200).json({ message: 'Agenda atualizada com sucesso', agenda });

  } catch (error) {
    console.error('Erro ao atualizar agenda:', error);
    return res.status(500).json({ message: 'Erro interno ao atualizar agenda' });
  }
};

// DELETE agenda
export const deleteAgenda = async (
  req: AuthenticatedRequest & { params: { _id: string } },
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId || req.tenantId;
    const { _id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const agenda = await Agenda.findOne({ _id: _id, userId, tenantId });
    if (!agenda) {
      return res.status(404).json({ message: 'Agenda não encontrada' });
    }

    await Agenda.findByIdAndDelete(_id);

    return res.json({ message: 'Agenda deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar agenda:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

