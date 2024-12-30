import { TableRow, TableCell, Checkbox, Stack, Box } from '@mui/material';

interface UserTableSkeletonProps {
  rows?: number;
}

export function UserTableSkeleton({ rows = 5 }: UserTableSkeletonProps) {
  return (
    <>
      {[...Array(rows)].map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell padding="checkbox">
            <Checkbox disabled />
          </TableCell>
          <TableCell>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'background.neutral',
                }}
              />
              <Box
                sx={{
                  width: 120,
                  height: 20,
                  borderRadius: 0.5,
                  bgcolor: 'background.neutral',
                }}
              />
            </Stack>
          </TableCell>
          <TableCell>
            <Stack spacing={1}>
              <Box
                sx={{
                  width: 160,
                  height: 20,
                  borderRadius: 0.5,
                  bgcolor: 'background.neutral',
                }}
              />
              <Box
                sx={{
                  width: 120,
                  height: 20,
                  borderRadius: 0.5,
                  bgcolor: 'background.neutral',
                }}
              />
            </Stack>
          </TableCell>
          <TableCell align="center">
            <Stack direction="row" spacing={1} justifyContent="center">
              <Box
                sx={{
                  width: 120,
                  height: 40,
                  borderRadius: 0.5,
                  bgcolor: 'background.neutral',
                }}
              />
              <Box
                sx={{
                  width: 80,
                  height: 40,
                  borderRadius: 0.5,
                  bgcolor: 'background.neutral',
                }}
              />
            </Stack>
          </TableCell>
          <TableCell align="center">
            <Box
              sx={{
                width: 80,
                height: 24,
                borderRadius: 12,
                mx: 'auto',
                bgcolor: 'background.neutral',
              }}
            />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
} 