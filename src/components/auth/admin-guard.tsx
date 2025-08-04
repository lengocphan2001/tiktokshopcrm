'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography } from '@mui/material';
import { useUser } from '@/hooks/use-user';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminGuard({ children, fallback }: AdminGuardProps): React.JSX.Element {
  const { user } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Show loading while checking user
  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  // Show access denied for non-admin users
  if (user.role !== 'ADMIN') {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have permission to access this page. Only administrators can access this area.
        </Typography>
      </Box>
    );
  }

  // Show the protected content for admin users
  return <>{children}</>;
} 