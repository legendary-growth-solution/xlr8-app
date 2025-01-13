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
  TextField,
} from '@mui/material';
import { useState } from 'react';

interface NewCartDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: {
    name: string;
    rfidtag: string;
    fuelLevel?: number;
    fuelCapacity?: number;
    variant?: string;
    model?: string;
  }) => void;
}

export default function NewCartDialog({ open, onClose, onAdd }: NewCartDialogProps) {
  const [name, setName] = useState('');
  const [rfidtag, setRfidtag] = useState('');
  const [fuelLevel, setFuelLevel] = useState('');
  const [fuelCapacity, setFuelCapacity] = useState('');
  const [variant, setVariant] = useState('');
  const [model, setModel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name,
      rfidtag,
      fuelLevel: fuelLevel ? Number(fuelLevel) : undefined,
      fuelCapacity: fuelCapacity ? Number(fuelCapacity) : undefined,
      variant: variant || undefined,
      model: model || undefined,
    });
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setRfidtag('');
    setFuelLevel('');
    setFuelCapacity('');
    setVariant('');
    setModel('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Cart</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Cart Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="RFID Tag"
            value={rfidtag}
            onChange={(e) => setRfidtag(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Cart Variant</InputLabel>
            <Select
              value={variant}
              label="Cart Variant"
              onChange={(e) => setVariant(e.target.value)}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="1">Level 1</MenuItem>
              <MenuItem value="2">Level 2</MenuItem>
              <MenuItem value="3">Level 3</MenuItem>
            </Select>
          </FormControl>
          {/* <TextField
            fullWidth
            label="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            sx={{ mb: 2 }}
          /> */}
          <TextField
            fullWidth
            label="Fuel Capacity (Liters) [Default: 10L]"
            type="number"
            value={fuelCapacity}
            onChange={(e) => setFuelCapacity(e.target.value)}
            inputProps={{ min: 0, step: "0.1" }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Initial Fuel Level (%) [Default: 100%]"
            type="number"
            value={fuelLevel}
            onChange={(e) => setFuelLevel(e.target.value)}
            inputProps={{ min: 0, max: 100, step: "1" }}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Add Cart
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 