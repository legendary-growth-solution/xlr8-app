import {
  Box,
  Card,
  Chip,
  Stack,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { triggerCsvDownload } from 'src/services/api/report.api';

interface ReportTablePreviewProps {
  filename: string;
  headers: string[];
  filteredRows: string[][];
  totalCount: number;
  rawCsv: string;
  page: number;
  rowsPerPage: number;
  searchQuery: string;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  onSearchChange: (query: string) => void;
}

export function ReportTablePreview({
  filename,
  headers,
  filteredRows,
  totalCount,
  rawCsv,
  page,
  rowsPerPage,
  searchQuery,
  onPageChange,
  onRowsPerPageChange,
  onSearchChange,
}: ReportTablePreviewProps) {
  return (
    <Card sx={{ p: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Detailed Data Table
            </Typography>
            <Chip
              label={`${totalCount} Records`}
              color="primary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Showing generated results for {filename}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <TextField
            size="small"
            placeholder="Search in table..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:magnifer-linear" width={18} />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 240 } }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="solar:download-bold-duotone" width={18} />}
            onClick={() => triggerCsvDownload(rawCsv, filename)}
          >
            Download CSV
          </Button>
        </Stack>
      </Stack>

      <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, maxHeight: 440 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {headers.map((header, idx) => (
                <TableCell
                  key={idx}
                  sx={{
                    fontWeight: 700,
                    bgcolor: (t) => alpha(t.palette.background.neutral || t.palette.action.hover, 0.9),
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headers.length} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No matching records found in table.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, rowIdx) => (
                  <TableRow key={rowIdx} hover>
                    {row.map((cell, cellIdx) => (
                      <TableCell key={cellIdx}>{cell || '-'}</TableCell>
                    ))}
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
      />
    </Card>
  );
}
