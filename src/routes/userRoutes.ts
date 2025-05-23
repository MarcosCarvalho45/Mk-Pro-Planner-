import express from 'express';
import { getUserProfile } from '../controllers/userController';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/me', authenticate, getUserProfile);

export default router;
