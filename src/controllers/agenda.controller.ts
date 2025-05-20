import { Response } from 'express';
import { Agenda, IAgenda } from '../models/agenda.model';
import { gerarAgendaComIA } from '../services/ai.service'; // seu serviço OpenAI
import { AuthenticatedRequest } from '../middlewares/auth.middleware'; // seu tipo estendido

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

    // Chama o serviço que já retorna objeto JSON parseado (array)
    const agendaItems = await gerarAgendaComIA(prompt);

    if (!Array.isArray(agendaItems)) {
      return res.status(500).json({ message: 'Formato inválido, esperado array de agendas' });
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
