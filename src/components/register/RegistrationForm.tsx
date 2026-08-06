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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First Name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last Name is required';
    }

    if (!formData.age || Number.isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
      newErrors.age = 'Valid age is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
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
      const rawPhone = formData.phone.trim();
      const cc = formData.countryCode.trim() || '+91';
      const fullPhone = `${cc}${rawPhone}`;
      const payload = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        age: Number(formData.age),
        country_code: cc,
        phone: rawPhone,
        full_phone: fullPhone,
        dob: formData.dob,
        selfCheckin: true,
      };
      await userApi.create(payload);
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
    const value = e.target.value;
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