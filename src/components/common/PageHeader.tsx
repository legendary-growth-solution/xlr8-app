import { Stack, Typography, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';

interface PageHeaderProps {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
      <Typography variant="h4">{title}</Typography>
      {action && (
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </Stack>
  );
} 