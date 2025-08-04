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
import { EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';

import { useUser } from '@/hooks/use-user';
import { usersApi } from '@/lib/api/users';
import { ModernDatePicker } from '@/components/core/date-picker';
import { AvatarUpload } from '@/components/core/avatar-upload';
import dayjs from 'dayjs';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  bankAccount?: string;
  about?: string;
  address?: string;
  dateOfBirth?: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  avatar?: string;
  bankAccount?: string;
  about?: string;
  address?: string;
  dateOfBirth?: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export function UserManagement(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('');
  const [statusFilter, setStatusFilter] = React.useState<string>('');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [viewingUser, setViewingUser] = React.useState<User | null>(null);
  const [deletingUser, setDeletingUser] = React.useState<User | null>(null);
  const [createUserData, setCreateUserData] = React.useState<CreateUserData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    avatar: '',
    bankAccount: '',
    about: '',
    address: '',
    dateOfBirth: '',
    role: 'USER',
    status: 'ACTIVE',
  });
  const [editUserData, setEditUserData] = React.useState<Partial<CreateUserData>>({});

  // Validation states
  const [createErrors, setCreateErrors] = React.useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = React.useState<Record<string, string>>({});

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'ADMIN';

  // Show success notification and clear after delay
  const showSuccess = (message: string) => {
    setSuccess(message);
    setError(null); // Clear any existing errors
    setTimeout(() => {
      setSuccess(null);
    }, 3000); // Clear after 3 seconds
  };

  // Validation functions
  const validateCreateUser = (): boolean => {
    console.log('=== VALIDATION DEBUG ===');
    console.log('Validating create user data:', createUserData);
    console.log('firstName:', createUserData.firstName, 'type:', typeof createUserData.firstName);
    console.log('lastName:', createUserData.lastName, 'type:', typeof createUserData.lastName);
    console.log('email:', createUserData.email, 'type:', typeof createUserData.email);
    console.log('password:', createUserData.password, 'type:', typeof createUserData.password);
    
    const errors: Record<string, string> = {};

    // Required fields
    if (!createUserData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (createUserData.firstName.length > 50) {
      errors.firstName = 'First name must be less than 50 characters';
    }

    if (!createUserData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (createUserData.lastName.length > 50) {
      errors.lastName = 'Last name must be less than 50 characters';
    }

    if (!createUserData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createUserData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!createUserData.password) {
      errors.password = 'Password is required';
    } else if (createUserData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    // Optional fields with validation
    if (createUserData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(createUserData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Avatar validation removed since we're now uploading files

    if (createUserData.dateOfBirth) {
      const date = new Date(createUserData.dateOfBirth);
      if (isNaN(date.getTime())) {
        errors.dateOfBirth = 'Please enter a valid date';
      } else if (date > new Date()) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }

    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditUser = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!editUserData.firstName?.trim()) {
      errors.firstName = 'First name is required';
    } else if (editUserData.firstName.length > 50) {
      errors.firstName = 'First name must be less than 50 characters';
    }

    if (!editUserData.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    } else if (editUserData.lastName.length > 50) {
      errors.lastName = 'Last name must be less than 50 characters';
    }

    if (!editUserData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editUserData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Optional fields with validation
    if (editUserData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(editUserData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Avatar validation removed since we're now uploading files

    if (editUserData.dateOfBirth) {
      const date = new Date(editUserData.dateOfBirth);
      if (isNaN(date.getTime())) {
        errors.dateOfBirth = 'Please enter a valid date';
      } else if (date > new Date()) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Debug information
  console.log('Current user:', currentUser);
  console.log('Is admin:', isAdmin);
  console.log('User role:', currentUser?.role);

  const loadUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await usersApi.getUsers(token, params.toString());
      
      if (response.success) {
        setUsers(response.data.users);
        setTotalUsers(response.data.total);
      } else {
        setError(response.message || 'Failed to load users');
      }
    } catch (error) {
      setError('Failed to load users');
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, roleFilter, statusFilter]);

  React.useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [loadUsers, isAdmin]);

  const handleCreateUser = async () => {
    // Clear any existing messages
    setError(null);
    setSuccess(null);
    
    // Validate form data
    if (!validateCreateUser()) {
      return;
    }

    console.log('=== CREATE USER DEBUG ===');
    console.log('Create user data before API call:', createUserData);
    console.log('Create user data type:', typeof createUserData);
    console.log('Create user data keys:', Object.keys(createUserData));
    console.log('Create user data values:', Object.values(createUserData));

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await usersApi.createUser(token, createUserData);
      
      if (response.success) {
        setCreateDialogOpen(false);
        setCreateUserData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          avatar: '',
          bankAccount: '',
          about: '',
          address: '',
          dateOfBirth: '',
          role: 'USER',
          status: 'ACTIVE',
        });
        loadUsers();
        showSuccess('User created successfully!');
      } else {
        // Handle specific validation errors
        if (response.message === 'Email already exists') {
          setCreateErrors({ email: 'Email already exists' });
        } else if (response.message === 'Phone number already exists') {
          setCreateErrors({ phone: 'Phone number already exists' });
                } else {
          setError(response.message || 'Failed to create user');
        }
      }
    } catch (error) {
      setError('Failed to create user');
      console.error('Create user error:', error);
    }
  };

  const handleViewUser = (user: User) => {
    setViewingUser(user);
    setViewDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    console.log('=== EDIT USER DEBUG ===');
    console.log('User to edit:', user);
    
    const editData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || '',
      bankAccount: user.bankAccount || '',
      about: user.about || '',
      address: user.address || '',
      dateOfBirth: user.dateOfBirth || '',
      role: user.role,
      status: user.status,
    };
    
    console.log('Setting edit data:', editData);
    
    setSelectedUser(user);
    setEditUserData(editData);
    setEditErrors({});
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    // Clear any existing messages
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await usersApi.deleteUser(token, deletingUser.id);
      
      if (response.success) {
        setDeleteDialogOpen(false);
        setDeletingUser(null);
        loadUsers();
        showSuccess('User deleted successfully!');
      } else {
        setError(response.message || 'Failed to delete user');
      }
    } catch (error) {
      setError('Failed to delete user');
      console.error('Delete user error:', error);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    // Clear any existing messages
    setError(null);
    setSuccess(null);

    // Validate form data
    if (!validateEditUser()) {
      return;
    }

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Send all non-undefined values, including empty strings for optional fields
      const filteredData: any = {};
      Object.entries(editUserData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          filteredData[key] = value;
        }
      });

      console.log('Sending update data:', filteredData);
      console.log('Original edit data:', editUserData);
      console.log('Selected user ID:', selectedUser?.id);
      console.log('Edit form data keys:', Object.keys(editUserData));
      console.log('Edit form data values:', Object.values(editUserData));
      console.log('Edit form data type:', typeof editUserData);
      console.log('Edit form data is object:', typeof editUserData === 'object');
      console.log('Edit form data is null:', editUserData === null);
      console.log('Edit form data is undefined:', editUserData === undefined);

      const response = await usersApi.updateUser(token, selectedUser.id, filteredData);
      
      if (response.success) {
        setEditDialogOpen(false);
        setSelectedUser(null);
        setEditUserData({});
        loadUsers();
        showSuccess('User updated successfully!');
      } else {
        // Handle specific validation errors
        if (response.message === 'Email already exists') {
          setEditErrors({ email: 'Email already exists' });
        } else if (response.message === 'Phone number already exists') {
          setEditErrors({ phone: 'Phone number already exists' });
        } else {
          setError(response.message || 'Failed to update user');
        }
      }
    } catch (error) {
      setError('Failed to update user');
      console.error('Update user error:', error);
    }
  };



  // Show debug information
  if (!currentUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Loading user information...
        </Alert>
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Access denied. Only administrators can manage users.
          <br />
          Current user role: {currentUser.role}
          <br />
          User: {currentUser.firstName} {currentUser.lastName} ({currentUser.email})
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Debug Info */}
        <Alert severity="info">
          Debug: User role is {currentUser.role}, Admin access granted
        </Alert>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">User Management</Typography>
          <Button
            startIcon={<PlusIcon />}
            variant="contained"
            onClick={() => {
              setCreateErrors({});
              setCreateDialogOpen(true);
            }}
          >
            Add User
          </Button>
        </Box>

        {/* Filters */}
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <TextField
                label="Search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: 200 }}
              />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="USER">User</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                  <MenuItem value="SUSPENDED">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent>
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
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Last Login</TableCell>
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
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {user.firstName} {user.lastName}
                          </Typography>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            color={user.role === 'ADMIN' ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.status}
                            color={
                              user.status === 'ACTIVE'
                                ? 'success'
                                : user.status === 'SUSPENDED'
                                ? 'error'
                                : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={() => handleViewUser(user)}
                              color="info"
                            >
                              <EyeIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleEditUser(user)}
                              color="primary"
                            >
                              <PencilIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(user)}
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
              count={totalUsers}
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

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="First Name"
                  value={createUserData.firstName}
                  onChange={(e) => {
                    console.log('First name changed to:', e.target.value);
                    setCreateUserData({ ...createUserData, firstName: e.target.value });
                    // Clear error when user starts typing
                    if (createErrors.firstName) {
                      setCreateErrors({ ...createErrors, firstName: '' });
                    }
                  }}
                  fullWidth
                  error={!!createErrors.firstName}
                  helperText={createErrors.firstName}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Last Name"
                  value={createUserData.lastName}
                  onChange={(e) => {
                    setCreateUserData({ ...createUserData, lastName: e.target.value });
                    // Clear error when user starts typing
                    if (createErrors.lastName) {
                      setCreateErrors({ ...createErrors, lastName: '' });
                    }
                  }}
                  fullWidth
                  error={!!createErrors.lastName}
                  helperText={createErrors.lastName}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Email"
                  type="email"
                  value={createUserData.email}
                  onChange={(e) => {
                    setCreateUserData({ ...createUserData, email: e.target.value });
                    // Clear error when user starts typing
                    if (createErrors.email) {
                      setCreateErrors({ ...createErrors, email: '' });
                    }
                  }}
                  fullWidth
                  error={!!createErrors.email}
                  helperText={createErrors.email}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Phone"
                  value={createUserData.phone}
                  onChange={(e) => {
                    setCreateUserData({ ...createUserData, phone: e.target.value });
                    // Clear error when user starts typing
                    if (createErrors.phone) {
                      setCreateErrors({ ...createErrors, phone: '' });
                    }
                  }}
                  fullWidth
                  error={!!createErrors.phone}
                  helperText={createErrors.phone}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Password"
                  type="password"
                  value={createUserData.password}
                  onChange={(e) => {
                    console.log('Password changed to:', e.target.value);
                    setCreateUserData({ ...createUserData, password: e.target.value });
                    // Clear error when user starts typing
                    if (createErrors.password) {
                      setCreateErrors({ ...createErrors, password: '' });
                    }
                  }}
                  fullWidth
                  error={!!createErrors.password}
                  helperText={createErrors.password}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Avatar
                </Typography>
                <AvatarUpload
                  value={createUserData.avatar}
                  onChange={(avatarUrl) => setCreateUserData({ ...createUserData, avatar: avatarUrl })}
                  error={!!createErrors.avatar}
                  helperText={createErrors.avatar || "Optional: Upload user's avatar image"}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Bank Account"
                  value={createUserData.bankAccount}
                  onChange={(e) => setCreateUserData({ ...createUserData, bankAccount: e.target.value })}
                  fullWidth
                  helperText="Optional: Bank account information"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Address"
                  value={createUserData.address}
                  onChange={(e) => setCreateUserData({ ...createUserData, address: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                  helperText="Optional: User's address"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="About"
                  value={createUserData.about}
                  onChange={(e) => setCreateUserData({ ...createUserData, about: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  helperText="Optional: Brief description about the user"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ModernDatePicker
                  label="Date of Birth"
                  value={createUserData.dateOfBirth}
                  onChange={(value) => setCreateUserData({ ...createUserData, dateOfBirth: value })}
                  error={!!createErrors.dateOfBirth}
                  helperText={createErrors.dateOfBirth || "Optional: User's date of birth"}
                  maxDate={dayjs()} // Cannot select future dates
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={createUserData.role}
                    label="Role"
                    onChange={(e) => setCreateUserData({ ...createUserData, role: e.target.value as 'ADMIN' | 'USER' })}
                  >
                    <MenuItem value="USER">User</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={createUserData.status}
                    label="Status"
                    onChange={(e) => setCreateUserData({ ...createUserData, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' })}
                  >
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                    <MenuItem value="SUSPENDED">Suspended</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained">
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {viewingUser && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1">
                      {viewingUser.firstName} {viewingUser.lastName}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {viewingUser.email}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {viewingUser.phone || 'Not provided'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date of Birth
                    </Typography>
                    <Typography variant="body1">
                      {viewingUser.dateOfBirth 
                        ? new Date(viewingUser.dateOfBirth).toLocaleDateString()
                        : 'Not provided'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Role
                    </Typography>
                    <Chip
                      label={viewingUser.role}
                      color={viewingUser.role === 'ADMIN' ? 'primary' : 'default'}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={viewingUser.status}
                      color={
                        viewingUser.status === 'ACTIVE'
                          ? 'success'
                          : viewingUser.status === 'SUSPENDED'
                          ? 'error'
                          : 'default'
                      }
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Avatar
                    </Typography>
                    {viewingUser.avatar ? (
                      <Avatar
                        src={viewingUser.avatar}
                        sx={{ width: 80, height: 80 }}
                      />
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        Not provided
                      </Typography>
                    )}
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Bank Account
                    </Typography>
                    <Typography variant="body1">
                      {viewingUser.bankAccount || 'Not provided'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {viewingUser.address || 'Not provided'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      About
                    </Typography>
                    <Typography variant="body1">
                      {viewingUser.about || 'Not provided'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(viewingUser.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(viewingUser.updatedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Login
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {viewingUser.lastLoginAt
                        ? new Date(viewingUser.lastLoginAt).toLocaleDateString()
                        : 'Never'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created By
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {viewingUser.createdBy || 'System'}
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

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="First Name"
                  value={editUserData.firstName || ''}
                  onChange={(e) => {
                    console.log('First name changed:', e.target.value);
                    setEditUserData({ ...editUserData, firstName: e.target.value });
                    // Clear error when user starts typing
                    if (editErrors.firstName) {
                      setEditErrors({ ...editErrors, firstName: '' });
                    }
                  }}
                  fullWidth
                  error={!!editErrors.firstName}
                  helperText={editErrors.firstName}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Last Name"
                  value={editUserData.lastName || ''}
                  onChange={(e) => {
                    setEditUserData({ ...editUserData, lastName: e.target.value });
                    // Clear error when user starts typing
                    if (editErrors.lastName) {
                      setEditErrors({ ...editErrors, lastName: '' });
                    }
                  }}
                  fullWidth
                  error={!!editErrors.lastName}
                  helperText={editErrors.lastName}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Email"
                  type="email"
                  value={editUserData.email || ''}
                  onChange={(e) => {
                    setEditUserData({ ...editUserData, email: e.target.value });
                    // Clear error when user starts typing
                    if (editErrors.email) {
                      setEditErrors({ ...editErrors, email: '' });
                    }
                  }}
                  fullWidth
                  error={!!editErrors.email}
                  helperText={editErrors.email}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Phone"
                  value={editUserData.phone || ''}
                  onChange={(e) => {
                    setEditUserData({ ...editUserData, phone: e.target.value });
                    // Clear error when user starts typing
                    if (editErrors.phone) {
                      setEditErrors({ ...editErrors, phone: '' });
                    }
                  }}
                  fullWidth
                  error={!!editErrors.phone}
                  helperText={editErrors.phone}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Avatar
                </Typography>
                <AvatarUpload
                  value={editUserData.avatar || ''}
                  onChange={(avatarUrl) => setEditUserData({ ...editUserData, avatar: avatarUrl })}
                  error={!!editErrors.avatar}
                  helperText={editErrors.avatar || "Optional: Upload user's avatar image"}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Bank Account"
                  value={editUserData.bankAccount || ''}
                  onChange={(e) => setEditUserData({ ...editUserData, bankAccount: e.target.value })}
                  fullWidth
                  helperText="Optional: Bank account information"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Address"
                  value={editUserData.address || ''}
                  onChange={(e) => setEditUserData({ ...editUserData, address: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                  helperText="Optional: User's address"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="About"
                  value={editUserData.about || ''}
                  onChange={(e) => setEditUserData({ ...editUserData, about: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  helperText="Optional: Brief description about the user"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ModernDatePicker
                  label="Date of Birth"
                  value={editUserData.dateOfBirth || ''}
                  onChange={(value) => setEditUserData({ ...editUserData, dateOfBirth: value })}
                  error={!!editErrors.dateOfBirth}
                  helperText={editErrors.dateOfBirth || "Optional: User's date of birth"}
                  maxDate={dayjs()} // Cannot select future dates
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={editUserData.role || 'USER'}
                    label="Role"
                    onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value as 'ADMIN' | 'USER' })}
                  >
                    <MenuItem value="USER">User</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editUserData.status || 'ACTIVE'}
                    label="Status"
                    onChange={(e) => setEditUserData({ ...editUserData, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' })}
                  >
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                    <MenuItem value="SUSPENDED">Suspended</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained">
            Update User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          {deletingUser && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to delete the user "{deletingUser.firstName} {deletingUser.lastName}"?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This action cannot be undone. The user will be permanently removed from the system.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 