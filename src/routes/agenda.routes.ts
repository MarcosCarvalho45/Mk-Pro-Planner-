import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { createAgendaViaAI, getAgendas } from '../controllers/agenda.controller';

const router = Router();

// POST para criar agenda via IA
router.post('/generate', authenticate, createAgendaViaAI);

router.get('/', authenticate, getAgendas);

export default router;
