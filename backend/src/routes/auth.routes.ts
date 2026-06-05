import { Router } from 'express';
import { register, login, logout, getMe, verifyOtp, registerOwner } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login',    login);
router.post('/logout',   logout);
router.get('/me',        authenticate, getMe);
router.post('/verify-otp', verifyOtp);
router.post('/register/owner', registerOwner);


export default router;