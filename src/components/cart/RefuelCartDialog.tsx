import { Typography } from '@mui/material';
import { Cart } from 'src/types/cart';
import BaseDialog from '../common/BaseDialog';
import FormField from '../common/FormField';

interface RefuelCartDialogProps {
  open: boolean;
  onClose: () => void;
  cart: Cart | null;
}

export default function RefuelCartDialog({ open, onClose, cart }: RefuelCartDialogProps) {
  const handleRefuel = () => {
    onClose();
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={`Refuel Cart - ${cart?.name}`}
      onSubmit={handleRefuel}
      submitText="Refuel"
    >
      <Typography variant="body2" color="text.secondary">
        Current Fuel Level: {cart?.fuelLevel}%
      </Typography>
      <FormField
        label="Fuel Amount (Liters)"
        type="number"
      />
      <FormField
        label="Cost"
        type="number"
      />
      <FormField
        label="Notes"
        multiline
        rows={3}
      />
    </BaseDialog>
  );
} 