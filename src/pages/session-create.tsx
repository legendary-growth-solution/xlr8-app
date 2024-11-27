import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Stack, Button, TextField, Typography, Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { sessionApi } from 'src/services/api/session.api';

export default function SessionCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    maxParticipants: 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await sessionApi.create({
        ...formData,
        status: 'active',
        currentParticipants: 0,
        start_time: new Date().toISOString(),
      });
      navigate('/sessions');
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create New Session</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Create New Session</Typography>
        </Stack>

        <Card sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Session Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Maximum Participants"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value, 10) })}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined" onClick={() => navigate('/sessions')}>
                    Cancel
                  </Button>
                  <LoadingButton
                    loading={loading}
                    type="submit"
                    variant="contained"
                  >
                    Create Session
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