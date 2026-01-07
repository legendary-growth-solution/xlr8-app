import { Box, Card, CardHeader, Skeleton } from '@mui/material';

export function StatsGraphSkeleton() {
  return (
    <Card>
      <CardHeader
        title={<Skeleton variant="text" width={200} height={32} />}
        subheader={<Skeleton variant="text" width={150} height={24} />}
      />
      <Box sx={{ py: 2.5, px: 2.5, height: 364 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          {[...Array(2)].map((_, i) => (
            <Box key={`legend-${i}`} sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
              <Skeleton variant="circular" width={16} height={16} sx={{ mr: 1 }} />
              <Skeleton variant="text" width={80} />
            </Box>
          ))}
        </Box>

        <Box sx={{ position: 'relative', height: 'calc(100% - 60px)' }}>
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: 50,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              py: 2,
            }}
          >
            {[...Array(5)].map((_, i) => (
              <Skeleton key={`y-left-${i}`} variant="text" width={30} />
            ))}
          </Box>

          <Box
            sx={{
              position: 'absolute',
              right: 0,
              top: 0,
              height: '100%',
              width: 60,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              py: 2,
            }}
          >
            {[...Array(5)].map((_, i) => (
              <Skeleton key={`y-right-${i}`} variant="text" width={40} />
            ))}
          </Box>

          <Box sx={{ position: 'absolute', left: 60, right: 70, top: 10, bottom: 40 }}>
            {[...Array(2)].map((_, i) => (
              <Skeleton
                key={`line-${i}`}
                variant="text"
                sx={{
                  position: 'absolute',
                  top: `${30 + i * 25}%`,
                  left: 0,
                  right: 0,
                  height: 3,
                  borderRadius: 1,
                }}
              />
            ))}
          </Box>

          <Box
            sx={{
              position: 'absolute',
              left: 60,
              right: 70,
              bottom: 0,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            {[...Array(7)].map((_, i) => (
              <Skeleton key={`x-${i}`} variant="text" width={30} />
            ))}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

