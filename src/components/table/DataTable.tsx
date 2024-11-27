import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, CircularProgress, Box } from '@mui/material';

export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any, row?: any) => string | JSX.Element;
  noWrap?: boolean;
  sx?: object;
}

interface DataTableProps {
  columns: Column[];
  rows: any[];
  loading?: boolean;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (pageSize: number) => void;
  actions?: (row: any) => JSX.Element;
}

export default function DataTable({
  columns,
  rows,
  loading = false,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  actions,
}: DataTableProps) {
  const handleChangePage = (_: unknown, newPage: number) => {
    onPageChange?.(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange?.(parseInt(event.target.value, 10));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', borderRadius: '0 0 8px 8px' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  sx={{
                    minWidth: column.minWidth,
                    whiteSpace: column.noWrap ? 'nowrap' : 'normal',
                    bgcolor: 'primary.lighter',
                    color: 'primary.darker',
                    fontWeight: 600,
                    borderTopLeftRadius: index === 0 ? 8 : 0,
                    borderTopRightRadius: index === columns.length - 1 && !actions ? 8 : 0,
                    ...column.sx,
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              {actions && (
                <TableCell 
                  align="right"
                  sx={{ 
                    bgcolor: 'primary.lighter',
                    color: 'primary.darker',
                    fontWeight: 600,
                    borderTopRightRadius: 8,
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow hover tabIndex={-1} key={row.id}>
                {columns.map((column) => {
                  const value = row[column.id];
                  return (
                    <TableCell 
                      key={column.id} 
                      align={column.align}
                      sx={{
                        whiteSpace: column.noWrap ? 'nowrap' : 'normal',
                        ...column.sx,
                      }}
                    >
                      {column.format ? column.format(value, row) : value}
                    </TableCell>
                  );
                })}
                {actions && (
                  <TableCell align="right">
                    {actions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {(onPageChange || onRowsPerPageChange) && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Box>
  );
} 