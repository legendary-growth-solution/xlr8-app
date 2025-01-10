import { Box, Button, IconButton, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import DataTable, { Column } from 'src/components/table/DataTable';
import { DiscountCode } from 'src/types/billing';

interface DiscountTableProps {
  discounts: DiscountCode[];
  onEdit: (discount: DiscountCode) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  loading?: boolean;
}

export function DiscountTable({ 
  discounts, 
  onEdit, 
  onDelete, 
  onAdd,
  loading = false 
}: DiscountTableProps) {
  const columns: Column[] = [
    { id: 'code', label: 'Code' },
    { id: 'description', label: 'Description' },
    { 
      id: 'type', 
      label: 'Type',
      align: 'center',
      format: (value, row) => row.type === 'percent' ? 'Percent' : 'Absolute'
    },
    { 
      id: 'value', 
      label: 'Value',
      align: 'right',
      format: (value, row) => row.type === 'percent' ? `${value}%` : `₹${value}`
    },
    { 
      id: 'usage_count', 
      label: 'Usage Count',
      align: 'right',
      format: (value) => value ?? '-'
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      format: (value) => value?.toUpperCase() ?? "-"
      // format: (value) => (
      //   <Switch checked={value === 'active'} disabled />
      // )
    }
  ];

  const renderEmptyState = () => (
    <Box sx={{ textAlign: 'center', py: 3 }}>
      <Typography variant="h6" paragraph>
        No Discount Codes Yet
      </Typography>
      <Button variant="contained" onClick={onAdd}>
        Create Discount Code
      </Button>
    </Box>
  );

  const renderActions = (row: DiscountCode) => (
    <>
      <IconButton onClick={() => onEdit(row)}>
        <Iconify icon="eva:edit-fill" />
      </IconButton>
      <IconButton onClick={() => onDelete(row?.discount_id)} color="error">
        <Iconify icon="eva:trash-2-outline" />
      </IconButton>
    </>
  );

  return (
    <DataTable
      columns={columns}
      rows={discounts}
      actions={renderActions}
      loading={loading}
      emptyState={{
        icon: 'mdi:ticket-percent-outline',
        title: 'No Discount Codes Added Yet',
        content: (
          <Button variant="contained" onClick={onAdd}>
            Create Discount Code
          </Button>
        )
      }}
    />
  );
} 