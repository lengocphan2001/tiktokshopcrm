'use client';

import * as React from 'react';
import {
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

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export function UserManagement(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('');
  const [statusFilter, setStatusFilter] = React.useState<string>('');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [createUserData, setCreateUserData] = React.useState<CreateUserData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'USER',
    status: 'ACTIVE',
  });

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'ADMIN';

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
          role: 'USER',
          status: 'ACTIVE',
        });
        loadUsers();
      } else {
        setError(response.message || 'Failed to create user');
      }
    } catch (error) {
      setError('Failed to create user');
      console.error('Create user error:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await usersApi.deleteUser(token, userId);
      
      if (response.success) {
        loadUsers();
      } else {
        setError(response.message || 'Failed to delete user');
      }
    } catch (error) {
      setError('Failed to delete user');
      console.error('Delete user error:', error);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = currentStatus 
        ? await usersApi.deactivateUser(token, userId)
        : await usersApi.activateUser(token, userId);
      
      if (response.success) {
        loadUsers();
      } else {
        setError(response.message || 'Failed to update user status');
      }
    } catch (error) {
      setError('Failed to update user status');
      console.error('Toggle user status error:', error);
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
            onClick={() => setCreateDialogOpen(true)}
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
                              onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                              color={user.isActive ? 'warning' : 'success'}
                            >
                              {user.isActive ? <EyeSlashIcon /> : <EyeIcon />}
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteUser(user.id)}
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
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="First Name"
              value={createUserData.firstName}
              onChange={(e) => setCreateUserData({ ...createUserData, firstName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={createUserData.lastName}
              onChange={(e) => setCreateUserData({ ...createUserData, lastName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={createUserData.email}
              onChange={(e) => setCreateUserData({ ...createUserData, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={createUserData.phone}
              onChange={(e) => setCreateUserData({ ...createUserData, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={createUserData.password}
              onChange={(e) => setCreateUserData({ ...createUserData, password: e.target.value })}
              fullWidth
            />
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained">
            Create User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 