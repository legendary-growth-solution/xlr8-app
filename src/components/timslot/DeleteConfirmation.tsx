import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';
import { useState } from 'react';
  
  interface DeleteConfirmationProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
  }
  
  export default function DeleteConfirmation({ open, onClose, onConfirm }: DeleteConfirmationProps) {
    const [loading, setLoading] = useState(false);
  
    const handleConfirm = async () => {
      setLoading(true);
      try {
        await onConfirm();
        onClose(); // Close the dialog if the operation is successful
      } catch (error) {
        console.error('Error deleting time slot:', error);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Time Slot</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this time slot? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Box sx={{ position: 'relative' }}>
            <Button
              onClick={handleConfirm}
              color="error"
              variant="contained"
              disabled={loading}
            >
              Delete
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
      </Dialog>
    );
  }
  