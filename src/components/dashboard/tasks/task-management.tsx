'use client';

import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { PencilIcon } from '@phosphor-icons/react/dist/ssr/Pencil';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';

import { useUser } from '@/hooks/use-user';
import { tasksApi, Task, CreateTaskRequest, UpdateTaskRequest } from '@/lib/api/tasks';
import { usersApi } from '@/lib/api/users';
import { taskTypesApi } from '@/lib/api/taskTypes';
import { ModernDatePicker } from '@/components/core/date-picker';
import dayjs from 'dayjs';

interface TaskType {
  id: string;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

interface CreateTaskData {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  resource?: string;
  result?: string;
  taskTypeId: string;
  assigneeId: string;
}

export function TaskManagement(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [totalTasks, setTotalTasks] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('');
  const [taskTypeFilter, setTaskTypeFilter] = React.useState<string>('');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [viewingTask, setViewingTask] = React.useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = React.useState<Task | null>(null);

  // Form data
  const [createTaskData, setCreateTaskData] = React.useState<CreateTaskData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    resource: '',
    result: '',
    taskTypeId: '',
    assigneeId: '',
  });

  const [editTaskData, setEditTaskData] = React.useState<Partial<CreateTaskData>>({});

  // Dropdown data
  const [taskTypes, setTaskTypes] = React.useState<TaskType[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  const validateCreateTask = (): boolean => {
    if (!createTaskData.name.trim()) {
      setError('Task name is required');
      return false;
    }
    if (!createTaskData.startDate) {
      setError('Start date is required');
      return false;
    }
    if (!createTaskData.endDate) {
      setError('End date is required');
      return false;
    }
    if (!createTaskData.taskTypeId) {
      setError('Task type is required');
      return false;
    }
    if (!createTaskData.assigneeId) {
      setError('Assignee is required');
      return false;
    }
    if (new Date(createTaskData.startDate) > new Date(createTaskData.endDate)) {
      setError('End date must be equal to or after start date');
      return false;
    }
    return true;
  };

  const validateEditTask = (): boolean => {
    if (!editTaskData.name?.trim()) {
      setError('Task name is required');
      return false;
    }
    if (editTaskData.startDate && editTaskData.endDate) {
      if (new Date(editTaskData.startDate) > new Date(editTaskData.endDate)) {
        setError('End date must be equal to or after start date');
        return false;
      }
    }
    return true;
  };

  const loadTasks = React.useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (taskTypeFilter) params.taskTypeId = taskTypeFilter;

      const response = await tasksApi.getTasks(token, params);
      
      if (response.success && response.data) {
        setTasks(response.data.tasks);
        setTotalTasks(response.data.total);
      } else {
        setError(response.message || 'Failed to load tasks');
      }
    } catch (error) {
      setError('Failed to load tasks');
      console.error('Load tasks error:', error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, statusFilter, taskTypeFilter]);

  const loadTaskTypes = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) return;

      const response = await taskTypesApi.getTaskTypes(token, 'limit=100');
      
      if (response.success && response.data) {
        setTaskTypes(response.data.taskTypes);
      }
    } catch (error) {
      console.error('Load task types error:', error);
    }
  }, []);

  const loadUsers = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) return;

      const response = await usersApi.getUsers(token, '');
      if (response.success && response.data) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Load users error:', error);
    }
  }, []);

  React.useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  React.useEffect(() => {
    loadTaskTypes();
    loadUsers();
  }, [loadTaskTypes, loadUsers]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'IN_PROGRESS':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleCreateTask = async () => {
    setError(null);
    setSuccess(null);

    if (!validateCreateTask()) {
      return;
    }

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Send only the task data - backend will handle createdById and updatedBy
      const taskData = createTaskData;

      const response = await tasksApi.createTask(token, taskData);
      
      if (response.success) {
        setCreateDialogOpen(false);
        setCreateTaskData({
          name: '',
          description: '',
          startDate: '',
          endDate: '',
          resource: '',
          result: '',
          taskTypeId: '',
          assigneeId: '',
        });
        loadTasks();
        showSuccess('Task created successfully!');
      } else {
        setError(response.message || 'Failed to create task');
      }
    } catch (error) {
      setError('Failed to create task');
      console.error('Create task error:', error);
    }
  };

  const handleViewTask = (task: Task) => {
    setViewingTask(task);
    setViewDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    const editData = {
      name: task.name,
      description: task.description || '',
      startDate: task.startDate,
      endDate: task.endDate,
      resource: task.resource || '',
      result: task.result || '',
      taskTypeId: task.taskTypeId,
      assigneeId: task.assigneeId,
    };
    
    setSelectedTask(task);
    setEditTaskData(editData);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (task: Task) => {
    setDeletingTask(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;

    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await tasksApi.deleteTask(token, deletingTask.id);
      
      if (response.success) {
        setDeleteDialogOpen(false);
        setDeletingTask(null);
        loadTasks();
        showSuccess('Task deleted successfully!');
      } else {
        setError(response.message || 'Failed to delete task');
      }
    } catch (error) {
      setError('Failed to delete task');
      console.error('Delete task error:', error);
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;

    setError(null);
    setSuccess(null);

    if (!validateEditTask()) {
      return;
    }

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Filter out empty values and send only the task data
      const filteredData: any = {};
      Object.entries(editTaskData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          filteredData[key] = value;
        }
      });

      const response = await tasksApi.updateTask(token, selectedTask.id, filteredData);
      
      if (response.success) {
        setEditDialogOpen(false);
        setSelectedTask(null);
        setEditTaskData({});
        loadTasks();
        showSuccess('Task updated successfully!');
      } else {
        setError(response.message || 'Failed to update task');
      }
    } catch (error) {
      setError('Failed to update task');
      console.error('Update task error:', error);
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Task Management</Typography>
          <Button
            startIcon={<PlusIcon />}
            variant="contained"
            onClick={() => setCreateDialogOpen(true)}
            disabled={currentUser.role !== 'ADMIN'}
          >
            Add Task
          </Button>
        </Box>

        {/* Filters */}
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <TextField
                label="Search"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: 200 }}
              />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Task Type</InputLabel>
                <Select
                  value={taskTypeFilter}
                  label="Task Type"
                  onChange={(e) => setTaskTypeFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {taskTypes.map((taskType) => (
                    <MenuItem key={taskType.id} value={taskType.id}>
                      {taskType.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        {/* Tasks Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Task</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Assignee</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : tasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No tasks found
                      </TableCell>
                    </TableRow>
                  ) : (
                    tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {task.name}
                            </Typography>
                            {task.description && (
                              <Typography variant="body2" color="text.secondary">
                                {task.description}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {task.taskType?.name || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {task.assignee.firstName} {task.assignee.lastName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={task.status.replace('_', ' ')}
                            color={getStatusColor(task.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(task.startDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(task.endDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {task.taskType ? formatCurrency(task.taskType.price) : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={() => handleViewTask(task)}
                              color="primary"
                            >
                              <EyeIcon size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleEditTask(task)}
                              color="primary"
                            >
                              <PencilIcon size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(task)}
                              color="error"
                            >
                              <TrashIcon size={16} />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={totalTasks}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </CardContent>
        </Card>
      </Stack>

      {/* Create Task Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Task Name"
                  value={createTaskData.name}
                  onChange={(e) => setCreateTaskData({ ...createTaskData, name: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Description"
                  value={createTaskData.description}
                  onChange={(e) => setCreateTaskData({ ...createTaskData, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  helperText="Optional: Task description"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ModernDatePicker
                  label="Start Date"
                  value={createTaskData.startDate}
                  onChange={(value) => setCreateTaskData({ ...createTaskData, startDate: value })}
                  minDate={dayjs().startOf('day')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ModernDatePicker
                  label="End Date"
                  value={createTaskData.endDate}
                  onChange={(value) => setCreateTaskData({ ...createTaskData, endDate: value })}
                  minDate={dayjs(createTaskData.startDate || undefined)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Task Type</InputLabel>
                  <Select
                    value={createTaskData.taskTypeId}
                    label="Task Type"
                    onChange={(e) => setCreateTaskData({ ...createTaskData, taskTypeId: e.target.value })}
                  >
                    {taskTypes.map((taskType) => (
                      <MenuItem key={taskType.id} value={taskType.id}>
                        {taskType.name} - {formatCurrency(taskType.price)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Assignee</InputLabel>
                  <Select
                    value={createTaskData.assigneeId}
                    label="Assignee"
                    onChange={(e) => setCreateTaskData({ ...createTaskData, assigneeId: e.target.value })}
                  >
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Resource URL"
                  value={createTaskData.resource}
                  onChange={(e) => setCreateTaskData({ ...createTaskData, resource: e.target.value })}
                  fullWidth
                  helperText="Optional: URL to task resources"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Result URL"
                  value={createTaskData.result}
                  onChange={(e) => setCreateTaskData({ ...createTaskData, result: e.target.value })}
                  fullWidth
                  helperText="Optional: URL to task results"
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Task Name"
                  value={editTaskData.name || ''}
                  onChange={(e) => setEditTaskData({ ...editTaskData, name: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Description"
                  value={editTaskData.description || ''}
                  onChange={(e) => setEditTaskData({ ...editTaskData, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  helperText="Optional: Task description"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ModernDatePicker
                  label="Start Date"
                  value={editTaskData.startDate || ''}
                  onChange={(value) => setEditTaskData({ ...editTaskData, startDate: value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ModernDatePicker
                  label="End Date"
                  value={editTaskData.endDate || ''}
                  onChange={(value) => setEditTaskData({ ...editTaskData, endDate: value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Task Type</InputLabel>
                  <Select
                    value={editTaskData.taskTypeId || ''}
                    label="Task Type"
                    onChange={(e) => setEditTaskData({ ...editTaskData, taskTypeId: e.target.value })}
                  >
                    {taskTypes.map((taskType) => (
                      <MenuItem key={taskType.id} value={taskType.id}>
                        {taskType.name} - {formatCurrency(taskType.price)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Assignee</InputLabel>
                  <Select
                    value={editTaskData.assigneeId || ''}
                    label="Assignee"
                    onChange={(e) => setEditTaskData({ ...editTaskData, assigneeId: e.target.value })}
                  >
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Resource URL"
                  value={editTaskData.resource || ''}
                  onChange={(e) => setEditTaskData({ ...editTaskData, resource: e.target.value })}
                  fullWidth
                  helperText="Optional: URL to task resources"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Result URL"
                  value={editTaskData.result || ''}
                  onChange={(e) => setEditTaskData({ ...editTaskData, result: e.target.value })}
                  fullWidth
                  helperText="Optional: URL to task results"
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateTask} variant="contained">
            Update Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Task Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Task Details</DialogTitle>
        <DialogContent>
          {viewingTask && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Task Name
                    </Typography>
                    <Typography variant="h6">
                      {viewingTask.name}
                    </Typography>
                  </Box>
                </Grid>
                {viewingTask.description && (
                  <Grid size={{ xs: 12 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {viewingTask.description}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Task Type
                    </Typography>
                    <Typography variant="body1">
                      {viewingTask.taskType?.name || 'N/A'} - {viewingTask.taskType ? formatCurrency(viewingTask.taskType.price) : 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={viewingTask.status.replace('_', ' ')}
                      color={getStatusColor(viewingTask.status) as any}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Assignee
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Avatar
                        src={viewingTask.assignee.avatar}
                        sx={{ width: 40, height: 40 }}
                      >
                        {viewingTask.assignee.firstName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">
                          {viewingTask.assignee.firstName} {viewingTask.assignee.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {viewingTask.assignee.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created By
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Avatar
                        src={viewingTask.createdBy.avatar}
                        sx={{ width: 40, height: 40 }}
                      >
                        {viewingTask.createdBy.firstName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">
                          {viewingTask.createdBy.firstName} {viewingTask.createdBy.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {viewingTask.createdBy.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Start Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(viewingTask.startDate)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      End Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(viewingTask.endDate)}
                    </Typography>
                  </Box>
                </Grid>
                {viewingTask.resource && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Resource URL
                      </Typography>
                      <Typography variant="body1">
                        <a href={viewingTask.resource} target="_blank" rel="noopener noreferrer">
                          {viewingTask.resource}
                        </a>
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {viewingTask.result && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Result URL
                      </Typography>
                      <Typography variant="body1">
                        <a href={viewingTask.result} target="_blank" rel="noopener noreferrer">
                          {viewingTask.result}
                        </a>
                      </Typography>
                    </Box>
                  </Grid>
                )}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(viewingTask.createdAt)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Updated At
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(viewingTask.updatedAt)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the task "{deletingTask?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteTask} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 