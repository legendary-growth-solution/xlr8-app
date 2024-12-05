import { useState } from 'react';
import { Card, Stack, TextField, Typography, Container, Box, Button, Select, MenuItem } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { mainApi } from 'src/services/api/main.api';
import { Iconify } from 'src/components/iconify';

export default function PasswordHashPage() {
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('operator ');
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordCheck, setPasswordCheck] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const generateHash = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await mainApi.generateHash(password, role);
      setHash(data.hash);
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      console.error('Error generating hash:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hash);
  };

  const checkPassword = (pass: string) => {
    const length = pass.length >= 8;
    const uppercase = /[A-Z]/.test(pass);
    const lowercase = /[a-z]/.test(pass);
    const number = /[0-9]/.test(pass);
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    setPasswordCheck({
      length,
      uppercase,
      lowercase,
      number,
      specialChar,
    });
  };

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Card sx={{ p: 5 }}>
        <Typography variant="h4" paragraph textAlign="center">
          Generate Password Hash
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 5 }} textAlign="center">
          Generate a secure hash for access codes that can be stored in the database
        </Typography>

        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Enter Password/Code"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              checkPassword(e.target.value);
            }}
            type="password"
            error={!!error}
            helperText={error}
          />

          <Select
            fullWidth
            value={role}
            onChange={(e) => setRole(e.target.value)}
            label="Role"
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="operator">Operator</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </Select>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Password Strength:
            </Typography>
            <Stack direction="row" flexWrap="wrap">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Iconify sx={{ color: passwordCheck.length ? 'success.main' : 'error.main' }} icon="mdi:check-circle" />
                <Typography sx={{ mx: 1, mr: 1.5 }}>At least 8 characters</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Iconify sx={{ color: passwordCheck.uppercase ? 'success.main' : 'error.main' }} icon="mdi:check-circle" />
                <Typography sx={{ mx: 1, mr: 1.5 }}>Uppercase letter</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Iconify sx={{ color: passwordCheck.lowercase ? 'success.main' : 'error.main' }} icon="mdi:check-circle" />
                <Typography sx={{ mx: 1, mr: 1.5 }}>Lowercase letter</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Iconify sx={{ color: passwordCheck.number ? 'success.main' : 'error.main' }} icon="mdi:check-circle" />
                <Typography sx={{ mx: 1, mr: 1.5 }}>Number</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Iconify sx={{ color: passwordCheck.specialChar ? 'success.main' : 'error.main' }} icon="mdi:check-circle" />
                <Typography sx={{ mx: 1, mr: 1.5 }}>Special character</Typography>
              </Box>
            </Stack>
          </Box>

          <LoadingButton
            fullWidth
            size="large"
            variant="contained"
            onClick={generateHash}
            loading={loading}
            disabled={!password || Object.values(passwordCheck).some(check => !check)}
          >
            Generate Hash
          </LoadingButton>

          {hash && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Generated Hash:
              </Typography>
              <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    wordBreak: 'break-all',
                    fontFamily: 'monospace' 
                  }}
                >
                  {hash}
                </Typography>
              </Card>
              <Button
                fullWidth
                variant="outlined"
                onClick={copyToClipboard}
                sx={{ mt: 1 }}
              >
                Copy to Clipboard
              </Button>
            </Box>
          )}
        </Stack>
      </Card>
    </Container>
  );
}