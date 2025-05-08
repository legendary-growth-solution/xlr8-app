import React from 'react';
import { Box, Paper, Skeleton } from '@mui/material';

interface SessionLapGraphSkeletonProps {
  height?: string;
}

export function SessionLapGraphSkeleton({
  height = 'calc(100vh - 200px)',
}: SessionLapGraphSkeletonProps) {
  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2, height }}>
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Skeleton variant="text" width="30%" height={40} sx={{ mb: 2 }} />

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              {[...Array(3)].map((_, i) => (
                <Box key={`legend-${i}`} sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
                  <Skeleton variant="circular" width={16} height={16} sx={{ mr: 1 }} />
                  <Skeleton variant="text" width={80} />
                </Box>
              ))}
            </Box>

            <Box sx={{ flex: 1, position: 'relative' }}>
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: 40,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  py: 2,
                }}
              >
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={`y-${i}`} variant="text" width={30} />
                ))}
              </Box>

              <Box sx={{ position: 'absolute', left: 50, right: 10, top: 10, bottom: 30 }}>
                {[...Array(3)].map((_, i) => (
                  <Skeleton
                    key={`line-${i}`}
                    variant="text"
                    sx={{
                      position: 'absolute',
                      top: `${20 + i * 30}%`,
                      left: 0,
                      right: 0,
                      height: 2,
                      transform: 'none',
                    }}
                  />
                ))}
              </Box>

              <Box
                sx={{
                  position: 'absolute',
                  left: 50,
                  right: 10,
                  bottom: 0,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={`x-${i}`} variant="text" width={20} />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
