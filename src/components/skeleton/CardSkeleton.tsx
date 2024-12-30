import { Card, Stack, Box, Skeleton } from '@mui/material';

interface CardSkeletonProps {
  height?: number;
}

export function CardSkeleton({ height = 200 }: CardSkeletonProps) {
  return (
    <Card sx={{ p: 3, height }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Skeleton variant="text" width={120} height={24} />
          <Skeleton variant="circular" width={40} height={40} />
        </Stack>
        <Box sx={{ flexGrow: 1 }}>
          <Stack spacing={1}>
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={20} />
            <Skeleton variant="text" width="80%" height={20} />
          </Stack>
        </Box>
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Skeleton variant="rounded" width={80} height={36} />
          <Skeleton variant="rounded" width={80} height={36} />
        </Stack>
      </Stack>
    </Card>
  );
} 