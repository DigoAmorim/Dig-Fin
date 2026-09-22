import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from './AuthController';
import { requireAuth } from '../../shared/middleware/RequireAuth';
import { issueCsrfToken } from '../../shared/auth/Csrf';

const authRoutes = Router();
const controller = new AuthController();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false });

authRoutes.get('/csrf-token', (_request, response) => {
	response.json({ csrfToken: issueCsrfToken(response) });
});
authRoutes.post('/register', loginLimiter, controller.register);
authRoutes.post('/login', loginLimiter, controller.login);
authRoutes.post('/refresh', controller.refresh);
authRoutes.post('/logout', controller.logout);
authRoutes.get('/me', requireAuth, controller.me);

export { authRoutes };