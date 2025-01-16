import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
} from '@mui/material';
import { Cart } from 'src/types/cart';

type Operation = 'refuel' | 'set' | 'remove';

interface RefuelCartDialogProps {
  open: boolean;
  onClose: () => void;
  cart: Cart | null;
  onRefuel: (data: { amount: number; cost: number; operation: Operation; notes?: string }) => void;
}

export default function RefuelCartDialog({ open, onClose, cart, onRefuel }: RefuelCartDialogProps) {
  const [amount, setAmount] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [operation, setOperation] = useState<Operation>('refuel');

  const fuelCapacity = cart?.fuelCapacity || 10;
  const currentVolume = ((cart?.current_level || 0) * (cart?.fuel_capacity || 3.1)) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);

    // Validate fuel operations
    if (operation === 'refuel' && currentVolume + numAmount > fuelCapacity) {
      alert(`Cannot add ${numAmount}L. Maximum capacity is ${fuelCapacity}L`);
      return;
    }
    if (operation === 'set' && numAmount > fuelCapacity) {
      alert(`Cannot set fuel to ${numAmount}L. Maximum capacity is ${fuelCapacity}L`);
      return;
    }
    if (operation === 'remove' && currentVolume - numAmount < 0) {
      alert(`Cannot remove ${numAmount}L. Current fuel level is ${currentVolume.toFixed(1)}L`);
      return;
    }

    onRefuel({
      amount: numAmount,
      cost: operation === 'refuel' ? Number(cost) : 0,
      operation,
      notes,
    });
    handleClose();
  };

  const handleClose = () => {
    setAmount('');
    setCost('');
    setNotes('');
    setOperation('refuel');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Fuel Level - {cart?.name}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Current Fuel Level: {currentVolume.toFixed(1)}L / {cart?.fuel_capacity}L ({cart?.current_level}%)
            </Typography>
          </Box>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Operation</InputLabel>
            <Select
              value={operation}
              label="Operation"
              onChange={(e) => setOperation(e.target.value as Operation)}
            >
              <MenuItem value="refuel">Refuel</MenuItem>
              <MenuItem value="set">Set</MenuItem>
              <MenuItem value="remove">Remove</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Amount (Liters)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ 
              min: 0,
              max: operation === 'remove' ? currentVolume : fuelCapacity,
              step: "0.1"
            }}
            sx={{ mb: 2 }}
            required
          />
          
          {operation === 'refuel' && (
            <TextField
              fullWidth
              label="Cost"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              inputProps={{ min: 0, step: "0.01" }}
              sx={{ mb: 2 }}
              required
            />
          )}
          
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
