'use client';

import React from 'react';
import {
  Box,
  Button,
  Typography,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CameraIcon, XIcon } from '@phosphor-icons/react/dist/ssr';
import { uploadApi } from '@/lib/api/upload';

interface AvatarUploadProps {
  value?: string;
  onChange: (avatarUrl: string) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

export function AvatarUpload({
  value,
  onChange,
  disabled = false,
  error = false,
  helperText,
}: AvatarUploadProps) {
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setUploadError('Authentication required');
        return;
      }

      const response = await uploadApi.uploadAvatar(token, file);
      
      if (response.success && response.data) {
        // Construct the full URL to the uploaded file
        const avatarUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/avatars/${response.data.filename}`;
        onChange(avatarUrl);
      } else {
        setUploadError(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          p: 2,
          border: '2px dashed',
          borderColor: error ? 'error.main' : 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          '&:hover': {
            borderColor: disabled ? 'divider' : 'primary.main',
            bgcolor: disabled ? 'background.paper' : 'action.hover',
          },
        }}
        onClick={handleClick}
      >
        {value ? (
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={value}
              sx={{
                width: 100,
                height: 100,
                border: '2px solid',
                borderColor: error ? 'error.main' : 'divider',
              }}
            />
            {!disabled && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveAvatar();
                }}
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'error.dark',
                  },
                }}
              >
                <XIcon size={16} />
              </IconButton>
            )}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            {uploading ? (
              <CircularProgress size={60} />
            ) : (
              <CameraIcon size={60} color="var(--mui-palette-text-secondary)" />
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {uploading ? 'Uploading...' : 'Click to upload avatar'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              PNG, JPG up to 5MB
            </Typography>
          </Box>
        )}
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />

      {uploadError && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {uploadError}
        </Alert>
      )}

      {helperText && !uploadError && (
        <Typography variant="caption" color={error ? 'error' : 'text.secondary'} sx={{ mt: 1, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
} 