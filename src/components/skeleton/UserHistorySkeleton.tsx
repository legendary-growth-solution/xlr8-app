import { Box, Card, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export function UserHistorySkeleton() {
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Skeleton variant="rounded" height={60} width="50%" />
      </Box>
      <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Skeleton variant="rounded" height={24} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="rounded" height={24} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="rounded" height={24} />
                </TableCell>
                <TableCell align="right">
                  <Skeleton variant="rounded" height={24} />
                </TableCell>
                <TableCell align="right">
                  <Skeleton variant="rounded" height={24} />
                </TableCell>
                <TableCell align="right">
                  <Skeleton variant="rounded" height={24} />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton variant="rounded" height={24} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rounded" height={24} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rounded" height={24} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="rounded" height={24} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="rounded" height={24} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="rounded" height={24} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <Skeleton variant="rounded" width={200} height={36} />
        </Box>
      </Card>
    </>
  );
} 