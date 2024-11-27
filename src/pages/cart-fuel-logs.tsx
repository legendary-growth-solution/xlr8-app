import { useState, useEffect } from 'react';
import { Card } from '@mui/material';
import { FuelLog } from 'src/types/cart';
import DataTable from 'src/components/table/DataTable';
import { MOCK_FUEL_LOGS } from 'src/services/mock/mock-data';
import PageContainer from 'src/components/common/PageContainer';
import PageHeader from 'src/components/common/PageHeader';

export default function CartFuelLogsPage() {
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { id: 'cartId', label: 'Cart ID', minWidth: 100 },
    { id: 'date', label: 'Date', minWidth: 120 },
    { id: 'amount', label: 'Amount (L)', minWidth: 100 },
    { id: 'cost', label: 'Cost', minWidth: 100, format: (value: number) => `₹${value.toFixed(2)}` },
    { 
      id: 'fuelLevel', 
      label: 'Fuel Level',
      minWidth: 150,
      format: (value: number, row: FuelLog) => `${row.previousLevel}% → ${row.currentLevel}%`,
    },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLogs(MOCK_FUEL_LOGS);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <PageContainer title="Fuel Logs">
      <PageHeader title="Fuel Logs" />
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