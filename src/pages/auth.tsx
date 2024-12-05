import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Stack, TextField, Typography, Container, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useAuth } from 'src/hooks/use-auth';

export default function AuthPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      await login(code);
      
      navigate('/');
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center"
        minHeight="100vh"
      >
        <Card sx={{ p: 5, width: '100%' }}>
          <Typography variant="h4" paragraph textAlign="center">
            Enter Access Code
          </Typography>
          
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 5 }} textAlign="center">
            Please enter your access code to continue
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your code"
                error={!!error}
                helperText={error}
                inputProps={{
                  style: { 
                    textAlign: 'center', 
                    fontSize: '1.5rem', 
                    letterSpacing: '0.5rem',
                    fontFamily: 'monospace'
                  }
                }}
              />

              <LoadingButton
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                loading={loading}
              >
                Verify Code
              </LoadingButton>
            </Stack>
          </form>
        </Card>
      </Box>
    </Container>
  );
} 