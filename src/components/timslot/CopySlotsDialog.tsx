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
} from '@mui/material';

interface CopySlotsDialogProps {
  open: boolean;
  onClose: () => void;
  onCopy: (sourceDay: string) => void;
  currentDay: string;
  days: string[];
}

export default function CopySlotsDialog({
  open,
  onClose,
  onCopy,
  currentDay,
  days,
}: CopySlotsDialogProps) {
  const availableDays = days.filter(day => day !== currentDay);

  const handleCopy = () => {
    if (availableDays.length > 0) {
      onCopy(availableDays[0]);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Copy Time Slots</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Copy from day</InputLabel>
          <Select
            value={availableDays.length > 0 ? availableDays[0] : ''}
            label="Copy from day"
            onChange={(e) => onCopy(e.target.value)}
          >
            {availableDays.map((day) => (
              <MenuItem key={day} value={day}>
                {day}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleCopy}
          variant="contained"
          disabled={availableDays.length === 0}
        >
          Copy Slots
        </Button>
      </DialogActions>
    </Dialog>
  );
}
