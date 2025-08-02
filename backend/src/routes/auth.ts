import { Router } from 'express'
import { AuthController } from '../controllers/authController'
import { authenticateToken } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { loginSchema } from '../utils/validation'

const router = Router()
const authController = new AuthController()

// POST /api/auth/login
router.post('/login', validateRequest(loginSchema), authController.login.bind(authController))

// GET /api/auth/me
router.get('/me', authenticateToken, authController.me.bind(authController))

export default router 