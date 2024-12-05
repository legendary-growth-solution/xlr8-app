import { Card, Grid, Stack, Typography, Box, Badge } from '@mui/material';
import { Session } from 'src/types/session';

interface SessionInfoProps {
  session: Session;
}

export function SessionInfo({ session }: SessionInfoProps) {
  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Stack spacing={1} alignItems="flex-start">
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', mt: "18px !important", ml: "24px !important" }}>
              <Badge
                badgeContent={session.status.toUpperCase()}
                color={session.status === 'active' ? 'success' : 'warning'}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              />
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Participants
            </Typography>
            <Typography variant="body1">
              {session.current_participants}/{session.max_participants}
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Start Time
            </Typography>
            <Typography variant="body1">
              {new Date(session.start_time).toLocaleString()}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
} 