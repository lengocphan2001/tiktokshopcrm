import { Router } from 'express'
import { TaskController } from '../controllers/taskController'
import { authenticateToken, requireAdminRole } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { createTaskSchema, updateTaskSchema, taskPaginationSchema } from '../utils/validation'

const router = Router()
const taskController = new TaskController()

// All routes require authentication
router.use(authenticateToken)

// Admin-only routes
router.post(
  '/',
  requireAdminRole,
  validateRequest(createTaskSchema),
  taskController.createTask.bind(taskController)
)

router.put(
  '/:id',
  requireAdminRole,
  validateRequest(updateTaskSchema),
  taskController.updateTask.bind(taskController)
)

router.delete(
  '/:id',
  requireAdminRole,
  taskController.deleteTask.bind(taskController)
)

router.post(
  '/:id/activate',
  requireAdminRole,
  taskController.activateTask.bind(taskController)
)

router.post(
  '/:id/deactivate',
  requireAdminRole,
  taskController.deactivateTask.bind(taskController)
)

// Routes accessible by all authenticated users
router.get(
  '/:id',
  taskController.getTaskById.bind(taskController)
)

router.post(
  '/list',
  validateRequest(taskPaginationSchema),
  taskController.getTasks.bind(taskController)
)

router.post(
  '/assignee/:assigneeId',
  validateRequest(taskPaginationSchema),
  taskController.getTasksByAssignee.bind(taskController)
)

router.put(
  '/:id/status',
  taskController.updateTaskStatus.bind(taskController)
)

router.put(
  '/:id/result',
  taskController.updateTaskResult.bind(taskController)
)

export { router as taskRoutes } 