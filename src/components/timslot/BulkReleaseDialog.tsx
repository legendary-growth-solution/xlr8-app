import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';

import type { TimeSlot } from 'src/types/bookings';

interface BulkReleaseDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  day: string;
  slots: TimeSlot[];
  releasing: boolean;
}

export default function BulkReleaseDialog({
  open,
  onClose,
  onConfirm,
  day,
  slots,
  releasing,
}: BulkReleaseDialogProps) {
  const occupiedSlotsCount = slots.filter(s => {
    if (!s.last_booked_for) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookedDate = new Date(s.last_booked_for);
    bookedDate.setHours(0, 0, 0, 0);

    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    return bookedDate >= today && bookedDate <= weekFromNow;
  }).length;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Release All Slots for {day}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to release all occupied time slots for {day}? This will make all slots available for new bookings.
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Slots to be released:</strong> {occupiedSlotsCount}
            </Typography>
          </Box>
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
          {releasing ? 'Releasing...' : 'Release All'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
