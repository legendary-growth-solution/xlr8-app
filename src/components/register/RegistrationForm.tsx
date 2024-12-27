import { useState } from 'react';
import { Grid, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { userApi } from 'src/services/api/user.api';
import { formFields, initialFormData } from './formConfig';

interface RegistrationFormProps {
  onSuccess: () => void;
}

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be exactly 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      formData.selfCheckin = true;
      await userApi.create(formData);
      onSuccess();
    } catch (error) {
      console.error('Error registering user:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Registration failed. Please try again.',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = e.target.value;
    if (field === 'phone') {
      value = value.slice(0, 10);
    }
    setFormData({ ...formData, [field]: value });
  };

  return (
    <>
      <Typography 
        variant="h4" 
        align="center" 
        mb={4}
        sx={{
          fontWeight: 'bold',
          color: 'primary.main',
        }}
      >
        Register New Account
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {formFields.map((field) => (
            <Grid item xs={12} key={field.name}>
              <TextField
                fullWidth
                label={field.label}
                type={field.type}
                value={formData[field.name]}
                onChange={handleInputChange(field.name)}
                required={field.required}
                error={!!errors[field.name]}
                helperText={errors[field.name]}
                InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
              />
            </Grid>
          ))}

          {errors.submit && (
            <Grid item xs={12}>
              <Typography color="error" variant="body2" align="center">
                {errors.submit}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <LoadingButton
              fullWidth
              size="large"
              loading={loading}
              type="submit"
              variant="contained"
            >
              Register
            </LoadingButton>
          </Grid>
        </Grid>
      </form>
    </>
  );
} 