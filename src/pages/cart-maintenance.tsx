import { useState, useEffect } from 'react';
import { Card } from '@mui/material';
import { MaintenanceLog } from 'src/types/cart';
import DataTable from 'src/components/table/DataTable';
import { MOCK_MAINTENANCE_LOGS } from 'src/services/mock/mock-data';
import PageContainer from 'src/components/common/PageContainer';
import PageHeader from 'src/components/common/PageHeader';

export default function CartMaintenancePage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { id: 'cartId', label: 'Cart ID', minWidth: 100 },
    { id: 'date', label: 'Date', minWidth: 120 },
    { id: 'type', label: 'Type', minWidth: 100 },
    { id: 'description', label: 'Description', minWidth: 200 },
    { id: 'cost', label: 'Cost', minWidth: 100, format: (value: number) => `₹${value.toFixed(2)}` },
    { id: 'nextMaintenanceDate', label: 'Next Maintenance', minWidth: 120 },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLogs(MOCK_MAINTENANCE_LOGS);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <PageContainer title="Cart Maintenance">
      <PageHeader 
        title="Cart Maintenance" 
        action={{
          label: "Schedule Maintenance",
          onClick: () => {},
        }}
      />
      <Card>
        <DataTable
          loading={loading}
          columns={columns}
          rows={logs}
        />
      </Card>
    </PageContainer>
  );
} 