import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Cart } from 'src/types/cart';

interface MaintenanceDialogProps {
  open: boolean;
  onClose: () => void;
  cart: Cart | null;
  onSubmit: (data: { status: 'maintenance' | 'refueling' | 'available'; notes?: string }) => void;
}

export default function MaintenanceDialog({ open, onClose, cart, onSubmit }: MaintenanceDialogProps) {
  const [status, setStatus] = useState<'maintenance' | 'refueling' | 'available'>('maintenance');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (cart?.status === 'maintenance') {
      setStatus('available');
    } else if (cart?.status === 'refueling') {
      setStatus('available');
    } else {
      setStatus('maintenance');
    }
  }, [cart]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      status,
      notes,
    });
    handleClose();
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  const getStatusOptions = () => {
    if (cart?.status === 'maintenance') {
      return [
        { value: 'available', label: 'Mark Maintenance Complete' },
        { value: 'refueling', label: 'Send to Refueling' },
      ];
    }
    if (cart?.status === 'refueling') {
      return [
        { value: 'available', label: 'Mark Refueling Complete' },
        { value: 'maintenance', label: 'Send to Maintenance' },
      ];
    }
    return [
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'refueling', label: 'Refueling' },
    ];
  };

  const getDialogTitle = () => {
    if (cart?.status === 'maintenance') {
      return `Update Maintenance Status - ${cart?.name} (In Maintenance)`;
    }
    if (cart?.status === 'refueling') {
      return `Update Maintenance Status - ${cart?.name} (In Refueling)`;
    }
    return `Update Maintenance Status - ${cart?.name}`;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{getDialogTitle()}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              {getStatusOptions().map((option) => (
                <MenuItem key={option?.value} value={option?.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 