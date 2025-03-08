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
import { useState } from 'react';

interface CreateGroupDialogProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export function CreateGroupDialog({ open, loading, onClose, onSubmit }: CreateGroupDialogProps) {
  const [error, setError] = useState('');
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (!value?.trim()) {
      setError('Group name is required');
      return;
    }
    setError('');
    onSubmit(value);
  };

  const handleClose = () => {
    setValue('');
    setError('');
    onClose();
    setValue('');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Group</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Group Name"
            value={value}
            required
            error={!!error}
            helperText={error}
            onChange={(e) => setValue(e?.target?.value)}
            disabled={loading}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <LoadingButton loading={loading} onClick={handleSubmit} variant="contained">
          Create
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
