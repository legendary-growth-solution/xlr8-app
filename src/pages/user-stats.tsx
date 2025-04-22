import {
  Box,
  Container,
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
import UserStatsBox from 'src/components/UserStatsBox';

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

        <UserStatsBox stats={stats.stats} />
      </Container>
    </>
  );
} 