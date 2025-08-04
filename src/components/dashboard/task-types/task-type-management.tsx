'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
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
  Chip,
  Alert,
} from '@mui/material';
import { PencilSimpleIcon, TrashIcon, PlusIcon, EyeIcon } from '@phosphor-icons/react/dist/ssr';
import { taskTypesApi, type TaskType, type CreateTaskTypeRequest, type UpdateTaskTypeRequest } from '@/lib/api/taskTypes';
import { useUser } from '@/hooks/use-user';

interface TaskTypeFormData {
  name: string;
  price: string;
}

const initialFormData: TaskTypeFormData = {
  name: '',
  price: '',
};

export function TaskTypeManagement(): React.JSX.Element {
  const { user } = useUser();
  const [taskTypes, setTaskTypes] = React.useState<TaskType[]>([]);
  const [totalTaskTypes, setTotalTaskTypes] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [openDialog, setOpenDialog] = React.useState(false);
  const [openViewDialog, setOpenViewDialog] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [editingTaskType, setEditingTaskType] = React.useState<TaskType | null>(null);
  const [viewingTaskType, setViewingTaskType] = React.useState<TaskType | null>(null);
  const [deletingTaskType, setDeletingTaskType] = React.useState<TaskType | null>(null);
  const [formData, setFormData] = React.useState<TaskTypeFormData>(initialFormData);
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [editFormErrors, setEditFormErrors] = React.useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;

  const loadTaskTypes = React.useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await taskTypesApi.getTaskTypes(token, queryParams.toString());
      
      if (response.success && response.data) {
        setTaskTypes(response.data.taskTypes);
        setTotalTaskTypes(response.data.total);
      }
    } catch (error) {
      console.error('Error loading task types:', error);
      setErrorMessage('Failed to load task types');
    } finally {
      setLoading(false);
    }
  }, [token, page, rowsPerPage, searchTerm]);

  React.useEffect(() => {
    loadTaskTypes();
  }, [loadTaskTypes]);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleOpenDialog = (taskType?: TaskType) => {
    if (taskType) {
      setEditingTaskType(taskType);
      setFormData({
        name: taskType.name,
        price: taskType.price.toString(),
      });
    } else {
      setEditingTaskType(null);
      setFormData(initialFormData);
    }
    setFormErrors({});
    setEditFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTaskType(null);
    setFormData(initialFormData);
    setFormErrors({});
    setEditFormErrors({});
  };

  const handleViewTaskType = (taskType: TaskType) => {
    setViewingTaskType(taskType);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewingTaskType(null);
  };

  const handleDeleteClick = (taskType: TaskType) => {
    setDeletingTaskType(taskType);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeletingTaskType(null);
  };

  const handleFormChange = (field: keyof TaskTypeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (editingTaskType) {
      setEditFormErrors(prev => ({ ...prev, [field]: '' }));
    } else {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      errors.name = 'Name too long (max 100 characters)';
    }

    const price = parseFloat(formData.price);
    if (!formData.price.trim()) {
      errors.price = 'Price is required';
    } else if (isNaN(price) || price < 0) {
      errors.price = 'Price must be at least 0 VND';
    } else if (price > 999999) {
      errors.price = 'Price too high (max 999,999 VND)';
    }

    if (editingTaskType) {
      setEditFormErrors(errors);
    } else {
      setFormErrors(errors);
    }
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!token) return;

    if (!validateForm()) return;

    try {
      const taskTypeData: CreateTaskTypeRequest | UpdateTaskTypeRequest = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
      };

      if (editingTaskType) {
        await taskTypesApi.updateTaskType(token, editingTaskType.id, taskTypeData);
        setSuccessMessage('Task type updated successfully');
      } else {
        await taskTypesApi.createTaskType(token, taskTypeData as CreateTaskTypeRequest);
        setSuccessMessage('Task type created successfully');
      }

      handleCloseDialog();
      loadTaskTypes();
    } catch (error) {
      console.error('Error saving task type:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save task type');
    }
  };

  const handleDelete = async () => {
    if (!token || !deletingTaskType) return;

    try {
      await taskTypesApi.deleteTaskType(token, deletingTaskType.id);
      setSuccessMessage('Task type deleted successfully');
      handleCloseDeleteDialog();
      loadTaskTypes();
    } catch (error) {
      console.error('Error deleting task type:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete task type');
    }
  };



  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Task Type Management</Typography>
        <Button
          variant="contained"
          startIcon={<PlusIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Task Type
        </Button>
      </Stack>

      {/* Messages */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextField
                fullWidth
                label="Search task types"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by name..."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Task Types Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Price (VND)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : taskTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>No task types found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                taskTypes.map((taskType) => (
                  <TableRow key={taskType.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{taskType.name}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {formatPrice(taskType.price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={taskType.isActive ? 'Active' : 'Inactive'}
                        color={taskType.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(taskType.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(taskType.updatedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(taskType)}
                          color="primary"
                        >
                          <PencilSimpleIcon />
                        </IconButton>
                                                 <IconButton
                           size="small"
                           onClick={() => handleViewTaskType(taskType)}
                           color="info"
                         >
                           <EyeIcon />
                         </IconButton>
                                                 <IconButton
                           size="small"
                           onClick={() => handleDeleteClick(taskType)}
                           color="error"
                         >
                           <TrashIcon />
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
          count={totalTaskTypes}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTaskType ? 'Edit Task Type' : 'Add New Task Type'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              error={!!(editingTaskType ? editFormErrors.name : formErrors.name)}
              helperText={editingTaskType ? editFormErrors.name : formErrors.name}
            />
            <TextField
              fullWidth
              label="Price (VND)"
              value={formData.price}
              onChange={(e) => handleFormChange('price', e.target.value)}
              error={!!(editingTaskType ? editFormErrors.price : formErrors.price)}
              helperText={(editingTaskType ? editFormErrors.price : formErrors.price) || 'Enter price in VND (e.g., 1000000)'}
              InputProps={{
                startAdornment: <InputAdornment position="start">₫</InputAdornment>,
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTaskType ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Task Type Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Task Type Details</DialogTitle>
        <DialogContent>
          {viewingTaskType && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">
                  {viewingTaskType.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Price (VND)
                </Typography>
                <Typography variant="body1">
                  {formatPrice(viewingTaskType.price)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={viewingTaskType.isActive ? 'Active' : 'Inactive'}
                  color={viewingTaskType.isActive ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(viewingTaskType.createdAt)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(viewingTaskType.updatedAt)}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          {deletingTaskType && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to delete the task type "{deletingTaskType.name}"?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This action cannot be undone. The task type will be permanently removed from the system.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 