import { Box, Card, Grid, Skeleton, Stack, Paper } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { LeaderboardSkeleton } from './LeaderboardSkeleton';

export function SessionDetailSkeleton() {
  const theme = useTheme();

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Stack direction="column" spacing={2}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={150} height={20} />
        </Stack>
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rounded" width={100} height={36} />
          <Skeleton variant="rounded" width={120} height={36} />
        </Stack>
      </Stack>

      <Card sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton variant="text" width={150} height={30} />
              <div style={{ marginTop: '10px' }}>
                <Skeleton variant="text" width={100} height={20} />
                <Skeleton variant="text" width={150} height={30} />
              </div>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Leaderboard skeleton for inactive sessions */}
      <Box sx={{ p: 3, minHeight: '50vh', bgcolor: 'background.default', position: 'relative' }}>
        <Stack direction="row" alignItems="center" justifyContent="flex-end" mb={2}>
          <Skeleton variant="rounded" width={120} height={30} />
        </Stack>

        <Paper
          elevation={24}
          sx={{
            p: 3,
            borderRadius: 2,
            background: alpha(theme.palette.background.paper, 0.9),
            margin: '0 auto',
            mt: 4,
            position: 'relative',
          }}
        >
          {/* Leaderboard header */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton variant="text" width={100} height={30} />
            <Skeleton variant="text" width={100} height={30} />
          </Box>

          {/* Leaderboard title */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Skeleton variant="text" width={200} height={60} sx={{ mx: 'auto' }} />
          </Box>

          {/* Leaderboard content */}
          <LeaderboardSkeleton rowCount={5} />

          {/* Leaderboard footer */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Skeleton variant="text" width={150} height={24} />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
