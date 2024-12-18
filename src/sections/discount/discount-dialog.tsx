import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Switch,
  Typography,
  MenuItem,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DiscountFormData } from 'src/types/billing';

interface DiscountDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  formData: DiscountFormData;
  setFormData: (data: DiscountFormData) => void;
  isEdit: boolean;
}

export function DiscountDialog({
  open,
  onClose,
  onSubmit,
  loading,
  formData,
  setFormData,
  isEdit,
}: DiscountDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit Discount Code' : 'New Discount Code'}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            disabled={isEdit}
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            select
            fullWidth
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'absolute' | 'percent' })}
          >
            <MenuItem value="absolute">Absolute (₹)</MenuItem>
            <MenuItem value="percent">Percentage (%)</MenuItem>
          </TextField>
          <TextField
            fullWidth
            type="number"
            label={`Value (${formData.type === 'percent' ? '%' : '₹'})`}
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
          />
          <Stack direction="row" alignItems="center" spacing={1}>
            <Switch
              checked={formData.status === 'active'}
              onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
            />
            <Typography>Active</Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <LoadingButton loading={loading} variant="contained" onClick={onSubmit}>
          {isEdit ? 'Update' : 'Create'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
} 