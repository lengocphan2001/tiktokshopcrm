import { Router } from 'express'
import { TaskTypeController } from '../controllers/taskTypeController'
import { requireAdminRole } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { 
  createTaskTypeSchema, 
  updateTaskTypeSchema, 
  taskTypePaginationSchema 
} from '../utils/validation'

const router = Router()
const taskTypeController = new TaskTypeController()

// All routes require admin access
router.use(requireAdminRole)

// GET /api/task-types - Get all task types with pagination
router.get('/', validateRequest(taskTypePaginationSchema), taskTypeController.getTaskTypes.bind(taskTypeController))

// GET /api/task-types/:id - Get task type by ID
router.get('/:id', taskTypeController.getTaskTypeById.bind(taskTypeController))

// POST /api/task-types - Create new task type (admin only)
router.post('/', validateRequest(createTaskTypeSchema), taskTypeController.createTaskType.bind(taskTypeController))

// PUT /api/task-types/:id - Update task type
router.put('/:id', validateRequest(updateTaskTypeSchema), taskTypeController.updateTaskType.bind(taskTypeController))

// DELETE /api/task-types/:id - Delete task type
router.delete('/:id', taskTypeController.deleteTaskType.bind(taskTypeController))

// PATCH /api/task-types/:id/deactivate - Deactivate task type
router.patch('/:id/deactivate', taskTypeController.deactivateTaskType.bind(taskTypeController))

// PATCH /api/task-types/:id/activate - Activate task type
router.patch('/:id/activate', taskTypeController.activateTaskType.bind(taskTypeController))

export default router 