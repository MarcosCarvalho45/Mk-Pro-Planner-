import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { createAgendaViaAI } from '../controllers/agenda.controller';

const router = Router();

// POST para criar agenda via IA
router.post('/generate', authenticate, createAgendaViaAI);

export default router;
