import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
} from "@mui/material";

interface SessionLapTableSkeletonProps {
  rows?: number;
}

export function SessionLapTableSkeleton({ rows = 4 }: SessionLapTableSkeletonProps) {
  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Lap Number</TableCell>
              <TableCell>Racers</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(rows)].map((_, rowIndex) => (
              <TableRow key={`lap-skeleton-${rowIndex}`}>
                <TableCell>
                  <Skeleton variant="text" width={30} height={24} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[...Array(3)].map((__, userIndex) => (
                      <Box
                        key={`user-skeleton-${rowIndex}-${userIndex}`}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 1,
                          borderRadius: 1,
                          width: '100%'
                        }}
                      >
                        <Skeleton variant="circular" width={28} height={28} />
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          flex: 1,
                          justifyContent: 'space-between'
                        }}>
                          <Skeleton 
                            variant="rounded" 
                            width="60%" 
                            height={32} 
                            sx={{ borderRadius: '16px' }}
                          />
                          <Skeleton 
                            variant="rounded" 
                            width={100} 
                            height={32} 
                            sx={{ borderRadius: '16px' }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 