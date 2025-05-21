import { Response } from 'express';
import { Agenda, IAgenda } from '../models/agenda.model';
import { gerarAgendaComIA } from '../services/ai.service'; // seu serviço OpenAI
import { AuthenticatedRequest } from '../middlewares/auth.middleware'; // seu tipo estendido
import User from '../models/user.model';

// Cria agenda com geração via IA
export const createAgendaViaAI = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt é obrigatório' });
    }

    // Busca o usuário para saber o plano
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Chama o serviço que já retorna objeto JSON parseado (array)
    const agendaItems = await gerarAgendaComIA(prompt);

    if (!Array.isArray(agendaItems)) {
      return res.status(500).json({ message: 'Formato inválido, esperado array de agendas' });
    }

    // Conta quantas agendas o usuário já possui
    const totalAgendas = await Agenda.countDocuments({ userId });

    // Define limite de agendas por plano
    let maxAgendas = 0;
    switch(user.subscription) {
      case 'free':
        maxAgendas = 1;
        break;
      case 'start':
        maxAgendas = 5;
        break;
      case 'platinum':
        maxAgendas = Infinity; // ilimitado
        break;
      default:
        maxAgendas = 0;
    }

    // Verifica se ao adicionar as novas agendas ultrapassa o limite
    if (totalAgendas + agendaItems.length > maxAgendas) {
      const limiteMsg = maxAgendas === Infinity ? 'ilimitado' : maxAgendas.toString();
      return res.status(403).json({ message: `Limite de agendas excedido para seu plano (${user.subscription}). Você pode criar até ${limiteMsg} agendas.` });
    }

    // Salvar cada item de agenda no banco, associando ao usuário
    const agendasCriadas: IAgenda[] = [];
    for (const item of agendaItems) {
      const novaAgenda = new Agenda({
        userId,
        title: item.titulo,
        description: item.descricao,
        date: new Date(`${item.data}T${item.hora}:00`),
      });
      const salva = await novaAgenda.save();
      agendasCriadas.push(salva);
    }

    return res.status(201).json({ message: 'Agenda criada com sucesso', agendas: agendasCriadas });

  } catch (error) {
    console.error('Erro ao criar agenda via IA:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
