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

// All routes require admin access
router.use(requireAdminRole)

// GET /api/users - Get all users with pagination
router.get('/', validateRequest(paginationSchema), userController.getUsers.bind(userController))

// GET /api/users/:id - Get user by ID
router.get('/:id', userController.getUserById.bind(userController))

// POST /api/users - Create new user (admin only)
router.post('/', validateRequest(createUserSchema), userController.createUser.bind(userController))

// PUT /api/users/:id - Update user
router.put('/:id', validateRequest(updateUserSchema), userController.updateUser.bind(userController))

// DELETE /api/users/:id - Delete user
router.delete('/:id', userController.deleteUser.bind(userController))

// PATCH /api/users/:id/deactivate - Deactivate user
router.patch('/:id/deactivate', userController.deactivateUser.bind(userController))

// PATCH /api/users/:id/activate - Activate user
router.patch('/:id/activate', userController.activateUser.bind(userController))

export default router 