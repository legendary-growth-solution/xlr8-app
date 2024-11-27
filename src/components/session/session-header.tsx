import { Stack, Typography, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';

interface SessionHeaderProps {
  title: string;
  isActive: boolean;
  onBack: () => void;
  onEndSession: () => void;
}

export function SessionHeader({ title, isActive, onBack, onEndSession }: SessionHeaderProps) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
      <Typography variant="h4">{title}</Typography>

      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          onClick={onBack}
        >
          Back
        </Button>
        {isActive && (
          <Button
            variant="contained"
            color="error"
            onClick={onEndSession}
          >
            End Session
          </Button>
        )}
      </Stack>
    </Stack>
  );
} 