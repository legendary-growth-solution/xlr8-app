import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { InventoryItem } from 'src/types/inventory';

interface InventoryItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<InventoryItem>) => void;
  item?: InventoryItem;
  mode: 'create' | 'edit';
}

const categories = [
  'Spare Parts',
  'Tools',
  'Safety Equipment',
  'Consumables',
  'Other',
];

export default function InventoryItemDialog({
  open,
  onClose,
  onSubmit,
  item,
  mode,
}: InventoryItemDialogProps) {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    is_car_part: false,
    quantity: 0,
    avg_price: 0,
    category: 'Other',
    low_stock_number: 0,
  });

  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData(item);
    } else {
      setFormData({
        name: '',
        is_car_part: false,
        quantity: 0,
        avg_price: 0,
        category: 'Other',
        low_stock_number: 0,
      });
    }
  }, [item, mode]);

  const handleChange = (field: keyof InventoryItem, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({
      name: '',
      is_car_part: false,
      quantity: 0,
      avg_price: 0,
      category: 'Other',
      low_stock_number: 0,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Add New Item' : 'Edit Item'}</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          margin="normal"
        />
        <FormControlLabel
          control={
            <Switch
              checked={formData.is_car_part}
              onChange={(e) => handleChange('is_car_part', e.target.checked)}
            />
          }
          label="Is Car Part"
          sx={{ my: 1 }}
        />
        <TextField
          fullWidth
          label="Quantity"
          type="number"
          value={formData.quantity}
          onChange={(e) => handleChange('quantity', parseInt(e.target.value, 10))}
          margin="normal"
        />
        {/* <TextField
          fullWidth
          label="Average Price"
          type="number"
          value={formData.avg_price}
          onChange={(e) => handleChange('avg_price', parseFloat(e.target.value))}
          margin="normal"
        /> */}
        <TextField
          fullWidth
          label="Low Stock Alert"
          type="number"
          value={formData.low_stock_number}
          onChange={(e) => handleChange('low_stock_number', parseInt(e.target.value, 10))}
          margin="normal"
        />
        <TextField
          fullWidth
          select
          label="Category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          margin="normal"
        >
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {mode === 'create' ? 'Create' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}