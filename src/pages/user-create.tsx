import { LoadingButton } from '@mui/lab';
import { Box, Button, Card, Grid, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { userApi } from 'src/services/api/user.api';
import { CountryCodeSelect } from 'src/components/common/CountryCodeSelect';

export default function UserCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    countryCode: '+91',
    phone: '',
  });
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

    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
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

    let rawPhone = formData.phone.trim();
    const cc = formData.countryCode.trim() || '+91';
    if (cc === '+91') {
      rawPhone = rawPhone.replace(/^0+/, '');
    }
    const fullPhone = `${cc}${rawPhone}`;

    const submitData = {
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      email: formData.email.trim(),
      age: Number(formData.age),
      country_code: cc,
      phone: rawPhone,
      full_phone: fullPhone,
    };

    try {
      setLoading(true);
      await userApi.create(submitData);
      navigate('/users');
    } catch (error: any) {
      console.error('Error creating user:', error);
      const serverError = error.response?.data?.error || 'Failed to create user. Please try again.';
      setErrors(prev => ({
        ...prev,
        submit: serverError,
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create New User</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Create New User</Typography>
        </Stack>

        <Card sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Age"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                  error={!!errors.age}
                  helperText={errors.age}
                  inputProps={{ min: 1, max: 120 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CountryCodeSelect
                    value={formData.countryCode}
                    onChange={(val) => setFormData({ ...formData, countryCode: val })}
                    sx={{ minWidth: 100 }}
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    error={!!errors.phone}
                    helperText={errors.phone}
                  />
                </Stack>
              </Grid>

              {/* <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date of Birth"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid> */}

              {errors.submit && (
                <Grid item xs={12}>
                  <Typography color="error" variant="body2">
                    {errors.submit}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined" onClick={() => navigate('/users')}>
                    Cancel
                  </Button>
                  <LoadingButton
                    loading={loading}
                    type="submit"
                    variant="contained"
                  >
                    Create User
                  </LoadingButton>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </Card>
      </Box>
    </>
  );
} 