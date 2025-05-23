import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from '../src/config/db';
import authRoutes from './routes/auth.routes';
import agendaRoutes from './routes/agenda.routes';
import stripeRoutes from './routes/stripe.routes';
import { stripeWebhook } from './controllers/stripeWebhook.controller';
import userRoutes from './routes/userRoutes';

// configuracoes
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// conecxoes
app.use(cors());
app.use(express.json());

// Rota do webhook Stripe (precisa do raw body para validar a assinatura)
// Atenção: essa rota precisa vir *antes* de qualquer middleware que faça parse do JSON
app.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);


// rotas do sistema
app.use('/auth', authRoutes);
app.use('/agenda', agendaRoutes);
app.use('/', stripeRoutes);
app.use('/user', userRoutes);

// conecxao com DB
connectDatabase();


// rodando o servidor
app.get('/', (req, res) => {
  res.send('MkPlanner AI Backend is running 🚀');
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
