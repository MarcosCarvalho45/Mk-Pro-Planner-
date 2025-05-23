import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { createAgendaViaAI, deleteAgenda, getAgendas, updateAgenda } from '../controllers/agenda.controller';

const router = Router();

// POST para criar agenda via IA
router.post('/generate', authenticate, createAgendaViaAI);

router.get('/', authenticate, getAgendas);

router.put('/:id', updateAgenda);

router.delete('/:Id', deleteAgenda);

export default router;
