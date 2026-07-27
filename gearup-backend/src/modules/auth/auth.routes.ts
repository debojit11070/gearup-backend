import { Router } from 'express';
import { register, login, getMe } from './auth.controller';
import { validate } from '../../middlewares/validate';
import { registerSchema, loginSchema } from './auth.validation';
import { auth } from '../../middlewares/auth';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', auth, getMe);

export const authRouter = router;
