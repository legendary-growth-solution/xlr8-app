import type { TimeSlot } from 'src/types/bookings';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  DialogTitle,
  DialogContentText,
} from '@mui/material';

interface ReleaseSlotDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  slot: TimeSlot | null;
  releasing: boolean;
}

export default function ReleaseSlotDialog({
  open,
  onClose,
  onConfirm,
  slot,
  releasing,
}: ReleaseSlotDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Release Time Slot</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to release this time slot? This will make the slot available for new bookings.
          {slot && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Slot:</strong> {slot.start_time} - {slot.end_time}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Currently booked for:</strong> {slot.last_booked_for}
              </Typography>
            </Box>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={releasing}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="warning"
          variant="contained"
          disabled={releasing}
        >
          {releasing ? 'Releasing...' : 'Release'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
