import { useState, useEffect } from 'react';
import { Card, Stack, Button, TextField, Box } from '@mui/material';
import { FuelLog } from 'src/types/cart';
import DataTable from 'src/components/table/DataTable';
import { cartApi } from 'src/services/api/cart.api';
import PageContainer from 'src/components/common/PageContainer';
import PageHeader from 'src/components/common/PageHeader';
import { Iconify } from 'src/components/iconify';
import ExportMenu from 'src/components/export/ExportMenu';

export default function CartFuelLogsPage() {
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const fetchFuelLogs = async () => {
    try {
      setLoading(true);
      const response = await cartApi.getFuelLogs();
      setLogs(response);
    } catch (error) {
      console.error('Failed to fetch fuel logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.cartName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const transformLogData = (logsArg: FuelLog[]) => logsArg.map(log => ({
    'Cart Name': log.cartName,
    'Date': new Date(log.date).toLocaleString(),
    'Amount (L)': log.amount,
    'Cost (₹)': log.cost.toFixed(2),
    'Previous Level': `${log.previousLevel}%`,
    'Current Level': `${log.currentLevel}%`,
  }));

  const columns = [
    { id: 'cartName', label: 'Cart Name', minWidth: 100 },
    { id: 'date', label: 'Date', minWidth: 120, format: (value: string) => new Date(value).toLocaleString() },
    { id: 'amount', label: 'Amount (L)', minWidth: 100 },
    { id: 'cost', label: 'Cost', minWidth: 100, format: (value: number) => `₹${value.toFixed(2)}` },
    { 
      id: 'fuelLevel', 
      label: 'Fuel Level',
      minWidth: 150,
      format: (value: number, row: FuelLog) => `${row.previousLevel}% → ${row.currentLevel}%`,
    },
  ];

  return (
    <PageContainer title="Fuel Logs">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <PageHeader title="Fuel Logs" />
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
        filename="fuel-logs"
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