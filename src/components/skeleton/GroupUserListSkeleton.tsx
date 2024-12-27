import { Stack, Skeleton } from '@mui/material';

export function GroupUserListSkeleton() {
  return (
    <Stack spacing={2}>
      {[...Array(3)].map((_, index) => (
        <Stack key={index} direction="row" alignItems="center" spacing={2}>
          <Skeleton variant="circular" width={40} height={40} />
          <Stack spacing={0.5} flex={1}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </Stack>
          <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
        </Stack>
      ))}
    </Stack>
  );
} 