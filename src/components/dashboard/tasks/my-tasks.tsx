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
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';

import { useUser } from '@/hooks/use-user';
import { tasksApi, Task } from '@/lib/api/tasks';
import { ModernDatePicker } from '@/components/core/date-picker';
import dayjs from 'dayjs';

export function MyTasks(): React.JSX.Element {
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

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = React.useState(false);
  const [viewingTask, setViewingTask] = React.useState<Task | null>(null);
  const [updatingTask, setUpdatingTask] = React.useState<Task | null>(null);
  const [statusData, setStatusData] = React.useState('');
  const [resultData, setResultData] = React.useState('');

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  const loadMyTasks = React.useCallback(async () => {
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
        assigneeId: currentUser?.id,
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;

      const response = await tasksApi.getTasksByAssignee(token, currentUser?.id || '', params);
      
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
  }, [page, rowsPerPage, searchTerm, statusFilter, currentUser?.id]);

  React.useEffect(() => {
    if (currentUser?.id) {
      loadMyTasks();
    }
  }, [loadMyTasks]);

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

  const handleViewTask = (task: Task) => {
    setViewingTask(task);
    setViewDialogOpen(true);
  };

  const handleUpdateClick = (task: Task) => {
    setUpdatingTask(task);
    setStatusData(task.status);
    setResultData(task.result || '');
    setUpdateDialogOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!updatingTask) return;

    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Update both status and result
      const statusResponse = await tasksApi.updateTaskStatus(token, updatingTask.id, statusData);
      const resultResponse = await tasksApi.updateTaskResult(token, updatingTask.id, resultData);
      
      if (statusResponse.success && resultResponse.success) {
        setUpdateDialogOpen(false);
        setUpdatingTask(null);
        setStatusData('');
        setResultData('');
        loadMyTasks();
        showSuccess('Task updated successfully!');
      } else {
        setError('Failed to update task');
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
          <Typography variant="h4">My Assigned Tasks</Typography>
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
                     <TableCell>Status</TableCell>
                     <TableCell>Start Date</TableCell>
                     <TableCell>End Date</TableCell>
                     <TableCell>Actions</TableCell>
                   </TableRow>
                 </TableHead>
                <TableBody>
                                     {loading ? (
                     <TableRow>
                       <TableCell colSpan={6} align="center">
                         Loading...
                       </TableCell>
                     </TableRow>
                   ) : tasks.length === 0 ? (
                     <TableRow>
                       <TableCell colSpan={6} align="center">
                         No tasks assigned to you
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
                                                     <Stack direction="row" spacing={1}>
                             <Button
                               size="small"
                               variant="outlined"
                               onClick={() => handleViewTask(task)}
                               startIcon={<EyeIcon size={16} />}
                             >
                               View
                             </Button>
                             <Button
                               size="small"
                               variant="contained"
                               onClick={() => handleUpdateClick(task)}
                               sx={{ minWidth: 'auto', px: 1 }}
                             >
                               Update
                             </Button>
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
                      {viewingTask.taskType?.name || 'N/A'}
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
                                 <Grid size={{ xs: 12, sm: 6 }}>
                   <Box>
                     <Typography variant="subtitle2" color="text.secondary">
                       Resource URL
                     </Typography>
                     <Typography variant="body1">
                       {viewingTask.resource ? (
                         <a href={viewingTask.resource} target="_blank" rel="noopener noreferrer">
                           {viewingTask.resource}
                         </a>
                       ) : (
                         'No resource URL provided'
                       )}
                     </Typography>
                   </Box>
                 </Grid>
                 <Grid size={{ xs: 12, sm: 6 }}>
                   <Box>
                     <Typography variant="subtitle2" color="text.secondary">
                       Result URL
                     </Typography>
                     <Typography variant="body1">
                       {viewingTask.result ? (
                         <a href={viewingTask.result} target="_blank" rel="noopener noreferrer">
                           {viewingTask.result}
                         </a>
                       ) : (
                         'No result URL provided'
                       )}
                     </Typography>
                   </Box>
                 </Grid>
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

      {/* Update Task Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update Task</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Task: {updatingTask?.name}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusData}
                    label="Status"
                    onChange={(e) => setStatusData(e.target.value)}
                  >
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Result URL"
                  value={resultData}
                  onChange={(e) => setResultData(e.target.value)}
                  fullWidth
                  helperText="Enter the URL to the task result"
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateTask} variant="contained">
            Update Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 