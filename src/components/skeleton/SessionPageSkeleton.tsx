import { Box, Card, Grid, Skeleton, Stack } from '@mui/material';
import { GroupSkeleton } from './GroupSkeleton';

export function SessionPageSkeleton() {
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
              <Skeleton variant="rectangular" width={60} height={30} />
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton variant="text" width={60} height={30} />
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton variant="text" width={150} height={30} />
            </Stack>
          </Grid>
        </Grid>
      </Card>

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Skeleton variant="text" width={100} height={30} />
        <Skeleton variant="rectangular" width={120} height={36} />
      </Stack>

      <GroupSkeleton />
    </Box>
  );
}
