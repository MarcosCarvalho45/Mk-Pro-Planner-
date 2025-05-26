import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/me', authenticate, getUserProfile);

router.put('/profile', authenticate, updateUserProfile);

export default router;
