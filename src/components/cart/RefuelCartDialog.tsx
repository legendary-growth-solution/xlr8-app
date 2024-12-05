import { useState } from 'react';
import { Typography } from '@mui/material';
import { Cart } from 'src/types/cart';
import BaseDialog from '../common/BaseDialog';
import FormField from '../common/FormField';

interface RefuelCartDialogProps {
  open: boolean;
  onClose: () => void;
  cart: Cart | null;
  onRefuel?: any;
}

export default function RefuelCartDialog({ open, onClose, cart, onRefuel }: RefuelCartDialogProps) {
  const [amount, setAmount] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const handleRefuel = () => {
    onRefuel({
      amount: parseFloat(amount),
      cost: parseFloat(cost),
      notes,
    });
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
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <FormField
        label="Cost"
        type="number"
        value={cost}
        onChange={(e) => setCost(e.target.value)}
      />
      <FormField
        label="Notes"
        multiline
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </BaseDialog>
  );
}
