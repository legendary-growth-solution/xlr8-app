import { Card, Grid, Skeleton } from '@mui/material';

interface GroupSkeletonProps {
  count?: number;
}

export function GroupSkeleton({ count = 3 }: GroupSkeletonProps) {
  return (
    <Grid container spacing={3}>
      {[...Array(count)].map((_, index) => (
        <Grid key={index} item xs={12} md={6} lg={4}>
          <Card sx={{ p: 3 }}>
            <Skeleton variant="text" width="80%" height={30} />
            <Skeleton variant="text" width="60%" height={20} sx={{ my: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={150} />
          </Card>
        </Grid>
      ))}
    </Grid>
  );
} 