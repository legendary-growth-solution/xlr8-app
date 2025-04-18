import {
  Box,
  Card,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { Iconify } from 'src/components/iconify';
import { UserStatsSkeleton } from 'src/components/skeleton';
import { userApi, UserStats } from 'src/services/api/user.api';
import { formatTime } from 'src/utils/format-time';

export default function UserStatsPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await userApi.getStats(userId);
        setStats(response);
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setError('Failed to load user statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [userId]);

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 3, mb: 5 }}>
        <Stack direction="row" alignItems="center" mb={3}>
          <Typography
            variant="body2"
            sx={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
            onClick={handleBackClick}
          >
            <Iconify icon="eva:arrow-back-fill" width={16} height={16} sx={{ mr: 0.5 }} />
            Back to Users
          </Typography>
        </Stack>
        <UserStatsSkeleton />
      </Container>
    );
  }

  if (error || !stats) {
    return (
      <Container>
        <Paper sx={{ p: 4, mt: 5, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h5" color="error">
            {error || 'No stats available'}
          </Typography>
          <Box mt={3}>
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer', display: 'inline-block' }}
              onClick={handleBackClick}
            >
              &larr; Go Back
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${stats.user_name}'s Stats | XLR8`}</title>
      </Helmet>

      <Container maxWidth="lg" sx={{ mt: 3, mb: 5 }}>
        <Stack direction="row" alignItems="center" mb={3}>
          <Typography
            variant="body2"
            sx={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
            onClick={handleBackClick}
          >
            <Iconify icon="eva:arrow-back-fill" width={16} height={16} sx={{ mr: 0.5 }} />
            Back to Users
          </Typography>
        </Stack>

        <Box mb={4} textAlign="center">
          <Typography variant="h4" gutterBottom>
            {stats.user_name}&apos;s Racing Statistics
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom textAlign="center">
                Performance Overview
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1} alignItems="center" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                    <Typography color="text.secondary" variant="subtitle2">
                      Total Sessions
                    </Typography>
                    <Typography variant="h4">{stats.stats.total_sessions}</Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1} alignItems="center" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                    <Typography color="text.secondary" variant="subtitle2">
                      Total Laps
                    </Typography>
                    <Typography variant="h4">{stats.stats.total_laps}</Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1} alignItems="center" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                    <Typography color="text.secondary" variant="subtitle2">
                      Best Lap
                    </Typography>
                    <Typography variant="h4">
                      {stats.stats.best_time ? formatTime(stats.stats.best_time) : '-'}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1} alignItems="center" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                    <Typography color="text.secondary" variant="subtitle2">
                      Average Lap
                    </Typography>
                    <Typography variant="h4">
                      {stats.stats.average_lap_time ? formatTime(stats.stats.average_lap_time) : '-'}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
} 