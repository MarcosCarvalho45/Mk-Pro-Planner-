import express from 'express';
import { stripeWebhook } from '../controllers/stripeWebhook.controller';
import { criarCheckoutSessionController } from '../controllers/stripe.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

router.post('/create-checkout-session',authenticate, criarCheckoutSessionController);

export default router;
