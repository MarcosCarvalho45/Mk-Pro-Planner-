import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { createAgendaViaAI, deleteAgenda, getAgendas, updateAgenda } from '../controllers/agenda.controller';

const router = Router();

// POST para criar agenda via IA
router.post('/generate', authenticate, createAgendaViaAI);

router.get('/', authenticate, getAgendas);

router.put('/:id',authenticate, updateAgenda);

router.delete('/:_id',authenticate, deleteAgenda);

export default router;
