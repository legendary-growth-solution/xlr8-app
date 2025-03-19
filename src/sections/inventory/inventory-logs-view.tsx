import {
  Box,
  Card,
  CircularProgress,
  Stack,
  Table,
  TableContainer,
  TablePagination,
  TextField,
  Typography
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DataTable from 'src/components/table/DataTable';
import { showToast } from 'src/components/toast';
import { API_ENDPOINTS } from 'src/services/api/endpoints';
import { InventoryLog, InventoryLogsResponse } from 'src/types/inventory';


export default function InventoryLogsView() {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const dateParams: Record<string, string> = {};
    if (startDate) {
      dateParams.start_date = startDate.toISOString();
    }
    if (endDate) {
      dateParams.end_date = endDate.toISOString();
    }
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        per_page: String(rowsPerPage),
        ...dateParams
      });

      const response = await fetch(`${API_ENDPOINTS.INVENTORY.LOGS}?${params}`);
      const data: InventoryLogsResponse = await response.json();
      setLogs(data.logs);
      setTotalItems(data.pagination.totalItems);
    } catch (error) {
      console.error('Error fetching inventory logs:', error);
      showToast.error('Failed to fetch inventory logs');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <>
    <Helmet>
    <title>Logs | Inventory</title>
  </Helmet>

  <Box sx={{ p: 3 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
      <Typography variant="h4">Logs</Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            type="date"
            label="Start Date"
            value={startDate ? startDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="End Date"
            value={endDate ? endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
    </Stack>
      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: loading ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
          <Table>
            <DataTable
              columns={[
                { id: 'item_name', label: 'Item', align: 'left' },
                { 
                  id: 'quantity', 
                  label: 'Quantity Change', 
                  align: 'right', 
                  format: (value, row: any) => {
                    if (row.operation === 'delete') return 'Item Deleted';
                    return `${row.previous_quantity || 0} → ${row.new_quantity}`;
                  }
                },
                { 
                  id: 'operation', 
                  label: 'Operation', 
                  align: 'center', 
                  format: (value) => (
                    <span style={{ color: value === 'add' ? 'green' : value === 'delete' ? 'orange' : 'red' }}>
                      {value.toUpperCase()}
                    </span>
                  )
                },
                { id: 'remarks', label: 'Remarks', align: 'left' },
                { id: 'timestamp', label: 'Date', align: 'left', format: (value) => new Date(value).toLocaleString() },
              ]}
              rows={logs}
            />
          </Table>
        </TableContainer>

        <TablePagination
          page={page}
          component="div"
          count={totalItems}
          rowsPerPage={rowsPerPage}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>
      </Box>
      </>
  );
}