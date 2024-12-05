import { useState, useEffect } from 'react';
import { Card, Stack, Button, TextField, Box } from '@mui/material';
import DataTable from 'src/components/table/DataTable';
import PageContainer from 'src/components/common/PageContainer';
import PageHeader from 'src/components/common/PageHeader';
import { Iconify } from 'src/components/iconify';
import ExportMenu from 'src/components/export/ExportMenu';
import { LapLog } from 'src/types/cart';
import { cartApi } from 'src/services/api/cart.api';

export default function CartLapLogsPage() {
  const [logs, setLogs] = useState<LapLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const fetchLapLogs = async () => {
    try {
      setLoading(true);
      const response = await cartApi.getLapLogs();
      setLogs(response);
    } catch (error) {
      console.error('Failed to fetch lap logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLapLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.cartName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.sessionId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const transformLogData = (logsArg: LapLog[]) => logsArg.map(log => ({
    'Cart Name': log.cartName,
    'Session ID': log.sessionId,
    'Lap Number': log.lapNumber,
    'Lap Time': log.lapTime,
    'Timestamp': new Date(log.timestamp).toLocaleString(),
  }));

  const columns = [
    { id: 'cartName', label: 'Cart Name', minWidth: 100 },
    { id: 'sessionId', label: 'Session ID', minWidth: 120 },
    { id: 'lapNumber', label: 'Lap #', minWidth: 80 },
    { id: 'lapTime', label: 'Lap Time', minWidth: 120 },
    { 
      id: 'timestamp', 
      label: 'Timestamp',
      minWidth: 180,
      format: (value: string) => new Date(value).toLocaleString(),
    },
  ];

  return (
    <PageContainer title="Lap Logs">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <PageHeader title="Lap Logs" />
        <Button
          variant="outlined"
          startIcon={<Iconify icon="eva:download-fill" />}
          onClick={handleExportClick}
        >
          Export Data
        </Button>
      </Stack>

      <ExportMenu
        anchorEl={anchorEl}
        onClose={handleExportClose}
        data={filteredLogs}
        filename="lap-logs"
        transformData={transformLogData}
      />

      <Card>
        <Box sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', mr: 1 }} />,
            }}
          />
          <DataTable
            loading={loading}
            columns={columns}
            rows={filteredLogs}
          />
        </Box>
      </Card>
    </PageContainer>
  );
} 