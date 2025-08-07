'use client';

import * as React from 'react'
import { Box, Container, Typography, Paper, Grid } from '@mui/material'
import { TimeClock } from '@/components/timekeeping/TimeClock'
import { TimeStats } from '@/components/timekeeping/TimeStats'
import { TimeRecords } from '@/components/timekeeping/TimeRecords'
import { useUser } from '@/hooks/use-user'

export default function TimekeepingPage() {
  const { user } = useUser()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading user...</p>
      </div>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Timekeeping
      </Typography>
      
      <Grid container spacing={3}>
        {/* Time Clock - Main action area */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <TimeClock userId={user.id} />
          </Paper>
        </Grid>

        {/* Time Statistics */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <TimeStats userId={user.id} />
          </Paper>
        </Grid>

        {/* Time Records */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <TimeRecords userId={user.id} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}
