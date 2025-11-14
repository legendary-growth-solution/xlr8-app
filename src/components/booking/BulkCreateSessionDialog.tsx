import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

interface BulkCreateSessionDialogProps {
  open: boolean;
  onClose: () => void;
  selectedBookingsCount: number;
  onConfirm: () => void;
  loading: boolean;
}

export function BulkCreateSessionDialog({
  open,
  onClose,
  selectedBookingsCount,
  onConfirm,
  loading,
}: BulkCreateSessionDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Create Session
      </DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to create a session with {selectedBookingsCount} selected group{selectedBookingsCount > 1 ? 's' : ''}?
          This will convert the selected bookings into an active racing session.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          loading={loading}
          onClick={onConfirm}
          color="success"
        >
          Create Session
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
