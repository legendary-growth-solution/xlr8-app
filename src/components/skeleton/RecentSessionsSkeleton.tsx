import { Card, CardContent, CardHeader, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export function RecentSessionsSkeleton() {
  return (
    <Card>
      <CardHeader
        sx={{
          pb: 2,
        }}
        title={<Skeleton variant="text" width={200} height={32} />}
        subheader={<Skeleton variant="text" width={150} height={24} />}
      />
      <CardContent sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Skeleton variant="text" width={120} height={24} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={150} height={24} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={150} height={24} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={150} height={24} />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton variant="text" width={100} height={20} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={120} height={20} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={140} height={20} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={140} height={20} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

