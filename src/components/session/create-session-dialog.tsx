import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

interface CreateSessionDialogProps {
  open: boolean;
  loading: boolean;
  data: {
    name?: string;
    maxParticipants?: number;
  };
  onClose: () => void;
  onChange: (field: string, value: string | number) => void;
  onSubmit: () => void;
}

export function CreateSessionDialog({
  open,
  loading,
  data,
  onClose,
  onChange,
  onSubmit,
}: CreateSessionDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Session</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Session Name"
            value={data.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="e.g., Morning Race Session"
            helperText="Optional: Give this session a memorable name"
          />
          <TextField
            fullWidth
            type="number"
            label="Maximum Participants"
            value={data.maxParticipants || ''}
            onChange={(e) => onChange('maxParticipants', parseInt(e.target.value, 10))}
            placeholder="e.g., 30"
            inputProps={{ min: 1 }}
            helperText="Optional: Set a limit for the number of participants"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <LoadingButton 
          loading={loading} 
          onClick={onSubmit} 
          variant="contained"
        >
          Create Session
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
} 