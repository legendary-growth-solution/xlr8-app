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

interface DisqualifyDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
  isDisqualifying: boolean;
  disqualifyReason: string;
  setDisqualifyReason: (reason: string) => void;
  handleDisqualify: () => void;
}

export function DisqualifyDialog({
  open,
  onClose,
  user,
  isDisqualifying,
  disqualifyReason,
  setDisqualifyReason,
  handleDisqualify,
}: DisqualifyDialogProps) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: 'error.lighter', color: 'error.dark' }}>
        Disqualify Racer
      </DialogTitle>
      <DialogContent sx={{ pt: 2, pb: 1, mt: 2 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Are you sure you want to disqualify {user.user_name}?
        </Typography>
        <TextField
          autoFocus
          label="Reason for disqualification"
          fullWidth
          value={disqualifyReason}
          onChange={(e) => setDisqualifyReason(e.target.value)}
          placeholder="Please provide a reason"
          variant="outlined"
          multiline
          rows={2}
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
          onClick={handleDisqualify}
          loading={isDisqualifying}
          variant="contained"
          color="error"
        >
          Disqualify
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
} 