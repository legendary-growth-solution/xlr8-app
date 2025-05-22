import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { User } from 'src/types/session';

interface PenaltyDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
  hasPenalty: boolean;
  penaltySeconds: number | string;
  setPenaltySeconds: (seconds: string) => void;
  isApplyingPenalty: boolean;
  handleApplyPenalty: () => void;
}

export function PenaltyDialog({
  open,
  onClose,
  user,
  hasPenalty,
  penaltySeconds,
  setPenaltySeconds,
  isApplyingPenalty,
  handleApplyPenalty,
}: PenaltyDialogProps) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: 'warning.lighter', color: 'warning.dark' }}>
        {hasPenalty ? 'Update Penalty' : 'Add Time Penalty'}
      </DialogTitle>
      <DialogContent sx={{ pt: 2, pb: 1, mt: 2 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {hasPenalty 
            ? `Current penalty for ${user.user_name}: ${user.penalty_seconds}s`
            : `Add a time penalty to ${user.user_name}'s best lap time:`}
        </Typography>
        <TextField
          autoFocus
          label="Penalty (seconds)"
          fullWidth
          value={penaltySeconds}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
              setPenaltySeconds(value);
            }
          }}
          placeholder="e.g. 3.5"
          variant="outlined"
          InputProps={{
            endAdornment: <Typography variant="body2">seconds</Typography>,
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
        >
          Cancel
        </Button>
        <LoadingButton
          onClick={handleApplyPenalty}
          loading={isApplyingPenalty}
          variant="contained"
          color="warning"
          disabled={penaltySeconds === ''}
        >
          {hasPenalty ? 'Update Penalty' : 'Apply Penalty'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
} 