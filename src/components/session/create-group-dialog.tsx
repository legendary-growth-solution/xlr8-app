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
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!data.name?.trim()) {
      setError('Group name is required');
      return;
    }
    setError('');
    onSubmit();
  };

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
            error={!!error}
            helperText={error}
            onChange={(e) => {
              onChange('name', e.target.value);
              if (error) setError('');
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <LoadingButton loading={loading} onClick={handleSubmit} variant="contained">
          Create
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
} 