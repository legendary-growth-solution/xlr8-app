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

interface CreateGroupDialogProps {
  open: boolean;
  loading: boolean;
  data: {
    name: string;
  };
  onClose: () => void;
  onChange: (field: string, value: string | number) => void;
  onSubmit: () => void;
}

export function CreateGroupDialog({
  open,
  loading,
  data,
  onClose,
  onChange,
  onSubmit,
}: CreateGroupDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Group</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Group Name"
            value={data.name}
            required
            onChange={(e) => onChange('name', e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <LoadingButton loading={loading} onClick={onSubmit} variant="contained">
          Create
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
} 