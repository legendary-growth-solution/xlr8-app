import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
} from '@mui/material';

interface BaseDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  onSubmit: () => void;
  submitText?: string;
  submitDisabled?: boolean;
  children: React.ReactNode;
}

export default function BaseDialog({
  open,
  onClose,
  title,
  onSubmit,
  submitText = 'Submit',
  submitDisabled = false,
  children,
}: BaseDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {children}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={submitDisabled}>
          {submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 