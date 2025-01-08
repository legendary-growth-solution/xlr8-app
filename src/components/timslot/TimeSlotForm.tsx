import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { createTimeSlot, updateTimeSlot } from 'src/services/api/timeslots';
import { TimeSlot } from 'src/types/bookings';

interface TimeSlotFormProps {
  open: boolean;
  onClose: () => void;
  slot?: TimeSlot | null;
  day: string;
}

export default function TimeSlotForm({ open, onClose, slot, day }: TimeSlotFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    start_time: '',
    end_time: '',
    max_slots: '',
  });

  useEffect(() => {
    if (slot) {
      setFormData({
        start_time: slot.start_time,
        end_time: slot.end_time,
        max_slots: String(slot.max_slots),
      });
    } else {
      setFormData({
        start_time: '',
        end_time: '',
        max_slots: '',
      });
    }
  }, [slot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const data = {
      ...formData,
      day: day.toLowerCase(),
      max_slots: Number(formData.max_slots),
    };

    try {
      if (slot) {
        await updateTimeSlot(slot.id, data);
      } else {
        await createTimeSlot(data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving time slot:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{slot ? 'Edit Time Slot' : 'Add Time Slot'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Start Time"
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              label="End Time"
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              label="Maximum Slots"
              type="number"
              value={formData.max_slots}
              onChange={(e) => setFormData({ ...formData, max_slots: e.target.value })}
              InputProps={{ inputProps: { min: 1 } }}
              fullWidth
              required
              disabled={loading}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Box sx={{ position: 'relative' }}>
            <Button type="submit" variant="contained" disabled={loading}>
              Save
            </Button>
            {loading && (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
}