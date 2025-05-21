import { Response } from 'express';
import { Agenda, IAgenda } from '../models/agenda.model';
import { gerarAgendaComIA } from '../services/ai.service'; 
import { AuthenticatedRequest } from '../middlewares/auth.middleware'; 
import User from '../models/user.model';

// Cria agenda com geração via IA
export const createAgendaViaAI = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?._id;
      // Exemplo: tenantId vindo do usuário ou do request
    const tenantId = req.user?.tenantId || req.tenantId;
    
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

    // Aqui definimos uma estimativa de quantas agendas a IA vai gerar
    // Se sabe a quantidade exata, ajuste esse número conforme necessário
    const agendasASeremGeradas = 1;

    // Verifica se ao adicionar as novas agendas ultrapassa o limite
    if (totalAgendas + agendasASeremGeradas > maxAgendas) {
      const limiteMsg = maxAgendas === Infinity ? 'ilimitado' : maxAgendas.toString();
      return res.status(403).json({ message: `Limite de agendas excedido para seu plano (${user.subscription}). Você pode criar até ${limiteMsg} agendas.` });
    }

    // Só chama a IA se o usuário ainda estiver dentro do limite
    const agendaItems = await gerarAgendaComIA(prompt);

    if (!Array.isArray(agendaItems)) {
      return res.status(500).json({ message: 'Formato inválido, esperado array de agendas' });
    }

    // Se a IA gerar mais itens do que o limite permite, corte o excesso
    const allowedToCreate = maxAgendas === Infinity ? agendaItems.length : Math.min(agendaItems.length, maxAgendas - totalAgendas);
    const agendaItemsFiltrados = agendaItems.slice(0, allowedToCreate);

    const agendasCriadas: IAgenda[] = [];
    for (const item of agendaItemsFiltrados) {
      const novaAgenda = new Agenda({
        userId,
        tenantId,
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
