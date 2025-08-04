'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useUser } from '@/hooks/use-user';

export function AccountInfo(): React.JSX.Element {
  const { user: currentUser } = useUser();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            <Avatar 
              src={currentUser.avatar} 
              sx={{ height: '80px', width: '80px' }}
            >
              {currentUser.firstName.charAt(0)}
            </Avatar>
          </div>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">
              {currentUser.firstName} {currentUser.lastName}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {currentUser.email}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Role: {currentUser.role}
            </Typography>
            {currentUser.phone && (
              <Typography color="text.secondary" variant="body2">
                Phone: {currentUser.phone}
              </Typography>
            )}
            {currentUser.address && (
              <Typography color="text.secondary" variant="body2">
                Address: {currentUser.address}
              </Typography>
            )}
            {currentUser.bankAccount && (
              <Typography color="text.secondary" variant="body2">
                Bank Account: {currentUser.bankAccount}
              </Typography>
            )}
            {currentUser.dateOfBirth && (
              <Typography color="text.secondary" variant="body2">
                Date of Birth: {new Date(currentUser.dateOfBirth).toLocaleDateString()}
              </Typography>
            )}
            {currentUser.about && (
              <Typography color="text.secondary" variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                "{currentUser.about}"
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions>
        <Button fullWidth variant="text" disabled>
          Profile picture updated via form
        </Button>
      </CardActions>
    </Card>
  );
}

