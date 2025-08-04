'use client';

import * as React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useUser } from '@/hooks/use-user';
import { usersApi } from '@/lib/api/users';
import { uploadApi } from '@/lib/api/upload';
import { AvatarUpload } from '@/components/core/avatar-upload';
import { ModernDatePicker } from '@/components/core/date-picker';
import { UserContext } from '@/contexts/user-context';
import dayjs from 'dayjs';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  bankAccount?: string;
  about?: string;
  address?: string;
  dateOfBirth?: string;
}

export function AccountDetailsForm(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const userContext = React.useContext(UserContext);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
    bankAccount: '',
    about: '',
    address: '',
    dateOfBirth: '',
  });

  React.useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        avatar: currentUser.avatar || '',
        bankAccount: currentUser.bankAccount || '',
        about: currentUser.about || '',
        address: currentUser.address || '',
        dateOfBirth: currentUser.dateOfBirth || '',
      });
    }
  }, [currentUser]);

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!currentUser) {
      setError('User not found');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Filter out empty values
      const updateData: any = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          updateData[key] = value;
        }
      });

      const response = await usersApi.updateOwnProfile(token, updateData);
      
      if (response.success) {
        showSuccess('Profile updated successfully!');
        // Refresh user data to update header, profile preview, etc.
        if (userContext?.checkSession) {
          await userContext.checkSession();
        }
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (error) {
      setError('Failed to update profile');
      console.error('Update profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await uploadApi.uploadAvatar(token, file);
      
      if (response.success && response.data) {
        const avatarUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/avatars/${response.data.filename}`;
        setFormData(prev => ({ ...prev, avatar: avatarUrl }));
        showSuccess('Avatar uploaded successfully!');
        // Refresh user data to update header avatar
        if (userContext?.checkSession) {
          await userContext.checkSession();
        }
      } else {
        setError(response.message || 'Failed to upload avatar');
      }
    } catch (error) {
      setError('Failed to upload avatar');
      console.error('Upload avatar error:', error);
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader subheader="Update your profile information" title="Profile" />
        <Divider />
        <CardContent>
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
                         {/* Avatar Upload */}
             <Box sx={{ display: 'flex', justifyContent: 'center' }}>
               <AvatarUpload
                 value={formData.avatar}
                 onChange={(avatarUrl) => setFormData({ ...formData, avatar: avatarUrl })}
               />
             </Box>

            <Grid container spacing={3}>
              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="First name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Last name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Email address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Phone number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>
                             <Grid size={{ md: 6, xs: 12 }}>
                 <ModernDatePicker
                   label="Date of Birth"
                   value={formData.dateOfBirth || ''}
                   onChange={(value) => setFormData({ ...formData, dateOfBirth: value })}
                 />
               </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Bank Account"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="About"
                  name="about"
                  multiline
                  rows={4}
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  helperText="Tell us about yourself"
                />
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save changes'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
