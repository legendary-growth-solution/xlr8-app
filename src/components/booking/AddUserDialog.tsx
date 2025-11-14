import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { BookingUser } from 'src/types/booking';
import { Plan } from 'src/types/session';

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onAddUser: (user: BookingUser) => void;
  plans: Plan[];
}

const AddUserDialog = ({ open, onClose, onAddUser, plans }: AddUserDialogProps) => {
  const [newUser, setNewUser] = useState<{
    name: string;
    phone: string;
    email: string;
    plan_id: string;
    time_in_minutes?: number;
  }>({
    name: '',
    phone: '',
    email: '',
    plan_id: plans.length > 0 ? plans[0].plan_id : '',
    time_in_minutes: undefined,
  });
  
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    phone?: string;
  }>({});

  const validatePhoneNumber = (phone: string) => {
    if (phone.length < 4) {
      return 'Phone number must be at least 4 digits';
    }
    if (phone.length > 15) {
      return 'Phone number cannot exceed 15 digits';
    }
    return '';
  };

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 15) {
      setNewUser({ ...newUser, phone: digitsOnly });
      if (digitsOnly) {
        setFormErrors((prev) => ({ ...prev, phone: undefined }));
      }
    }
  };
  
  useEffect(() => {
    if (open) {
      setNewUser({
        name: '',
        phone: '',
        email: '',
        plan_id: plans.length > 0 ? plans[0].plan_id : '',
        time_in_minutes: undefined,
      });
      setFormErrors({});
    }
  }, [open, plans]);
  
  const handleAddUser = () => {
    const validationErrors: { name?: string; phone?: string } = {};

    if (!newUser.name) {
      validationErrors.name = 'Name is required';
    }

    if (!newUser.phone) {
      validationErrors.phone = 'Phone is required';
    } else {
      const phoneValidationError = validatePhoneNumber(newUser.phone);
      if (phoneValidationError) {
        validationErrors.phone = phoneValidationError;
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }
    
    onAddUser({
      user_id: `new-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      plan_id: newUser.plan_id,
      is_new: true,
      time_in_minutes: newUser.time_in_minutes,
    });
    
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Create New User
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pb: 2 }}>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <FormControl fullWidth error={!!formErrors.name}>
            <TextField
              label="Name *"
              value={newUser.name}
              onChange={(e) => {
                setNewUser({ ...newUser, name: e.target.value });
                if (e.target.value) {
                  setFormErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
            />
            {formErrors.name && <FormHelperText>{formErrors.name}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth error={!!formErrors.phone}>
            <TextField
              label="Phone *"
              value={newUser.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              inputMode="numeric"
              inputProps={{
                maxLength: 15,
              }}
            />
            {formErrors.phone && <FormHelperText>{formErrors.phone}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth>
            <TextField
              label="Email (Optional)"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="new-user-plan-label">Select Plan</InputLabel>
            <Select
              labelId="new-user-plan-label"
              value={newUser.plan_id}
              onChange={(e) => setNewUser({ ...newUser, plan_id: e.target.value })}
              label="Select Plan"
            >
              {plans.map((plan) => (
                <MenuItem key={plan.plan_id} value={plan.plan_id}>
                  {plan.title || plan.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <TextField
              label="Custom Time (minutes)"
              type="number"
              value={newUser.time_in_minutes || ''}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : undefined;
                setNewUser({ ...newUser, time_in_minutes: value });
              }}
              InputProps={{ inputProps: { min: 1 } }}
            />
            <FormHelperText>Optional.</FormHelperText>
          </FormControl>
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleAddUser}>
          Add User
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserDialog; 