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
import { CountryCodeSelect } from 'src/components/common/CountryCodeSelect';

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onAddUser: (user: BookingUser) => void;
  plans: Plan[];
}

const AddUserDialog = ({ open, onClose, onAddUser, plans }: AddUserDialogProps) => {
  const [newUser, setNewUser] = useState<{
    firstName: string;
    lastName: string;
    age: string;
    country_code: string;
    phone: string;
    email: string;
    plan_id: string;
    time_in_minutes?: number;
  }>({
    firstName: '',
    lastName: '',
    age: '',
    country_code: '+91',
    phone: '',
    email: '',
    plan_id: plans.length > 0 ? plans[0].plan_id : '',
    time_in_minutes: undefined,
  });
  
  const [formErrors, setFormErrors] = useState<{
    firstName?: string;
    lastName?: string;
    age?: string;
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
        firstName: '',
        lastName: '',
        age: '',
        country_code: '+91',
        phone: '',
        email: '',
        plan_id: plans.length > 0 ? plans[0].plan_id : '',
        time_in_minutes: undefined,
      });
      setFormErrors({});
    }
  }, [open, plans]);
  
  const handleAddUser = () => {
    const validationErrors: { firstName?: string; lastName?: string; age?: string; phone?: string } = {};

    if (!newUser.firstName.trim()) {
      validationErrors.firstName = 'First Name is required';
    }

    if (!newUser.lastName.trim()) {
      validationErrors.lastName = 'Last Name is required';
    }

    if (!newUser.age || Number.isNaN(Number(newUser.age)) || Number(newUser.age) <= 0) {
      validationErrors.age = 'Valid age is required';
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
    
    const cc = newUser.country_code.trim() || '+91';
    const fullPhone = `${cc}${newUser.phone}`;
    const fullName = `${newUser.firstName.trim()} ${newUser.lastName.trim()}`;

    onAddUser({
      user_id: `new-${Date.now()}`,
      name: fullName,
      first_name: newUser.firstName.trim(),
      last_name: newUser.lastName.trim(),
      email: newUser.email,
      phone: newUser.phone,
      country_code: cc,
      full_phone: fullPhone,
      age: Number(newUser.age),
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
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth error={!!formErrors.firstName}>
              <TextField
                label="First Name"
                value={newUser.firstName}
                onChange={(e) => {
                  setNewUser({ ...newUser, firstName: e.target.value });
                  if (e.target.value) {
                    setFormErrors((prev) => ({ ...prev, firstName: undefined }));
                  }
                }}
              />
              {formErrors.firstName && <FormHelperText>{formErrors.firstName}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth error={!!formErrors.lastName}>
              <TextField
                label="Last Name"
                value={newUser.lastName}
                onChange={(e) => {
                  setNewUser({ ...newUser, lastName: e.target.value });
                  if (e.target.value) {
                    setFormErrors((prev) => ({ ...prev, lastName: undefined }));
                  }
                }}
              />
              {formErrors.lastName && <FormHelperText>{formErrors.lastName}</FormHelperText>}
            </FormControl>
          </Stack>

          <FormControl fullWidth error={!!formErrors.age}>
            <TextField
              label="Age"
              type="number"
              value={newUser.age}
              onChange={(e) => {
                setNewUser({ ...newUser, age: e.target.value });
                if (e.target.value) {
                  setFormErrors((prev) => ({ ...prev, age: undefined }));
                }
              }}
              inputProps={{ min: 1, max: 120 }}
            />
            {formErrors.age && <FormHelperText>{formErrors.age}</FormHelperText>}
          </FormControl>

          <Stack direction="row" spacing={2} alignItems="center">
            <CountryCodeSelect
              value={newUser.country_code}
              onChange={(val) => setNewUser({ ...newUser, country_code: val })}
              sx={{ width: 140 }}
            />
            <FormControl fullWidth error={!!formErrors.phone}>
              <TextField
                label="Phone"
                value={newUser.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                inputMode="numeric"
                inputProps={{
                  maxLength: 15,
                }}
              />
              {formErrors.phone && <FormHelperText>{formErrors.phone}</FormHelperText>}
            </FormControl>
          </Stack>

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