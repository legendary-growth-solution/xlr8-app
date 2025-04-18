import { Box, Card, Divider, Grid, Skeleton, Stack, Typography } from '@mui/material';

export function UserStatsSkeleton() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Skeleton variant="rounded" height={60} width="50%" />
        </Box>
        <Card sx={{ p: 3, height: '100%', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Skeleton variant="rounded" height={30} width="30%" />
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Stack
                  spacing={1}
                  alignItems="center"
                  sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}
                >
                  <Skeleton variant="rounded" height={20} width="60%" />
                  <Skeleton variant="rounded" height={40} width="40%" />
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Grid>
    </Grid>
  );
} 