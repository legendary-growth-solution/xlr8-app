import { Box, Stack, Typography, Paper } from '@mui/material';
import DataTable from '../table/DataTable';

interface BillingUser {
  user: {
    name: string;
  };
  plan: {
    name: string;
    cost: number;
  };
  time_in_minutes: number;
}

interface BillingData {
  billing_data: {
    total_amount: number;
    total_discount: number;
    total_cgst: number;
    total_sgst: number;
    grand_total: number;
  };
  users: BillingUser[];
}

interface BillingDetailsTableProps {
  billingData: BillingData;
}

export function BillingDetailsTable({ billingData }: BillingDetailsTableProps) {
  const billing = billingData?.billing_data || {
    total_amount: 0,
    total_discount: 0,
    total_cgst: 0,
    total_sgst: 0,
    grand_total: 0,
  };

  const columns = [
    {
      id: 'name',
      label: 'Item',
      minWidth: 200,
      format: (_: any, row: BillingUser) => (
        <Stack spacing={0.5}>
          <Typography variant="body2">{row.user?.name || 'N/A'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.plan?.name || 'N/A'} Plan ({row.time_in_minutes || 0} mins)
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'rate',
      label: 'Unit Price',
      align: 'right' as const,
      format: (_: any, row: BillingUser) => `₹${(row.plan?.cost || 0).toFixed(2)}`,
    },
    {
      id: 'quantity',
      label: 'Qty',
      align: 'center' as const,
      format: () => '1',
    },
  ];

  const summaryItems = [
    { label: 'Amount', value: billing.total_amount },
    { label: 'Discount', value: billing.total_discount },
    { label: 'CGST (9%)', value: billing.total_cgst },
    { label: 'SGST (9%)', value: billing.total_sgst },
    { label: 'Total Amount', value: billing.grand_total },
  ];

  if (!billingData?.billing_data) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography color="text.secondary" align="center">
          No billing details available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Billing Details
      </Typography>

      <DataTable
        columns={columns}
        rows={billingData.users || []}
        emptyState={{
          title: 'No billing details available',
          icon: 'mdi:receipt-text-outline',
        }}
      />

      <Paper sx={{ mt: 3, p: 2, bgcolor: 'background.neutral' }}>
        <Stack spacing={1}>
          {summaryItems.map((item) => (
            <Stack
              key={item.label}
              direction="row"
              justifyContent="space-between"
              sx={{
                typography: 'body2',
                fontWeight: item.label === 'Total Amount' ? 'bold' : 'regular',
              }}
            >
              <span>{item.label}</span>
              <span>₹{item.value.toFixed(2)}</span>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
} 