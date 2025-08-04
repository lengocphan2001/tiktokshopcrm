import { Router } from 'express'
import { UserController } from '../controllers/userController'
import { requireAdminRole, authenticateToken } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { 
  createUserSchema, 
  updateUserSchema, 
  paginationSchema 
} from '../utils/validation'

const router = Router()
const userController = new UserController()

// GET /api/users - Get all users with pagination (admin only)
router.get('/', requireAdminRole, validateRequest(paginationSchema), userController.getUsers.bind(userController))

// GET /api/users/messaging - Get users for messaging (authenticated users)
router.get('/messaging', authenticateToken, userController.getUsersForMessaging.bind(userController))

// POST /api/users - Create new user (admin only)
router.post('/', requireAdminRole, validateRequest(createUserSchema), userController.createUser.bind(userController))

// PUT /api/users/profile - Update own profile (authenticated users) - MUST COME BEFORE /:id
router.put('/profile', authenticateToken, validateRequest(updateUserSchema), userController.updateOwnProfile.bind(userController))

// GET /api/users/:id - Get user by ID
router.get('/:id', requireAdminRole, userController.getUserById.bind(userController))

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', requireAdminRole, validateRequest(updateUserSchema), userController.updateUser.bind(userController))

// DELETE /api/users/:id - Delete user
router.delete('/:id', requireAdminRole, userController.deleteUser.bind(userController))

// PATCH /api/users/:id/deactivate - Deactivate user
router.patch('/:id/deactivate', requireAdminRole, userController.deactivateUser.bind(userController))

// PATCH /api/users/:id/activate - Activate user
router.patch('/:id/activate', requireAdminRole, userController.activateUser.bind(userController))

export default router 