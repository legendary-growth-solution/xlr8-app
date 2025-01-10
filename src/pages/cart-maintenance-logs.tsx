import { Card } from '@mui/material';
import { useEffect, useState } from 'react';
import PageContainer from 'src/components/common/PageContainer';
import PageHeader from 'src/components/common/PageHeader';
import DataTable from 'src/components/table/DataTable';
import { cartApi } from 'src/services/api/cart.api';
import { MaintenanceLog } from 'src/types/cart';

export default function CartMaintenanceLogsPage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await cartApi.getMaintenanceLogs({});
      console.log(response);
      setLogs(response?.records);
    } catch (error) {
      console.error('Failed to fetch maintenance logs', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      id: 'cart_name',
      label: 'Cart Name',
      minWidth: 120,
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value: string) => value.toUpperCase(),
    },
    {
      id: 'notes',
      label: 'Notes',
      minWidth: 200,
    },
    {
      id: 'timestamp',
      label: 'Timestamp',
      minWidth: 160,
      format: (value: string) => new Date(value).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    },
  ];

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <PageContainer title="Maintenance Logs">
      <PageHeader title="Maintenance Logs" />

      <Card>
        <DataTable loading={loading} columns={columns} rows={logs} />
      </Card>
    </PageContainer>
  );
} 