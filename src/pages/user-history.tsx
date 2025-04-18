import {
  Box,
  Button,
  Card,
  Container,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { Iconify } from 'src/components/iconify';
import { UserHistorySkeleton } from 'src/components/skeleton';
import { userApi, UserSessionHistory } from 'src/services/api/user.api';
import { fDateTime } from 'src/utils/format-time';

// Number of items per page
const PAGE_SIZE = 10;

export default function UserHistoryPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<UserSessionHistory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUserHistory = async () => {
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await userApi.getSessionHistory(userId, {
          page,
          limit: PAGE_SIZE,
        });
        setSessions(response);
        setTotalPages(Math.ceil(response.total_count / PAGE_SIZE) || 1);
      } catch (err) {
        console.error('Error fetching user session history:', err);
        setError('Failed to load user session history');
      } finally {
        setLoading(false);
      }
    };

    fetchUserHistory();
  }, [userId, page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleViewStatsClick = () => {
    if (userId) {
      navigate(`/users/${userId}/stats`);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 3, mb: 5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography
            variant="body2"
            sx={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
            onClick={handleBackClick}
          >
            <Iconify icon="eva:arrow-back-fill" width={16} height={16} sx={{ mr: 0.5 }} />
            Back to Users
          </Typography>
        </Stack>
        <UserHistorySkeleton />
      </Container>
    );
  }

  if (error || !sessions) {
    return (
      <Container>
        <Paper sx={{ p: 4, mt: 5, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h5" color="error">
            {error || 'No session history available'}
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
        <title>{`${sessions.user_name}'s History | XLR8`}</title>
      </Helmet>

      <Container maxWidth="lg" sx={{ mt: 3, mb: 5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography
            variant="body2"
            sx={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
            onClick={handleBackClick}
          >
            <Iconify icon="eva:arrow-back-fill" width={16} height={16} sx={{ mr: 0.5 }} />
            Back to Users
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mdi:chart-box" />}
            onClick={handleViewStatsClick}
          >
            View Stats
          </Button>
        </Stack>

        <Box mb={4} textAlign="center">
          <Typography variant="h4" gutterBottom>
            {sessions.user_name ? `${sessions.user_name}&apos;s History` : 'User History'}
          </Typography>
          {sessions.total_count > 0 && (
            <Typography variant="body2" color="text.secondary">
              Showing {sessions.sessions.length} of {sessions.total_count} sessions
            </Typography>
          )}
        </Box>

        <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {sessions.sessions.length > 0 ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Session Date</TableCell>
                      <TableCell>Session ID</TableCell>
                      <TableCell align="right">Laps</TableCell>
                      <TableCell align="right">Best Lap</TableCell>
                      <TableCell align="right">Total Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessions.sessions.map((session) => (
                      <TableRow key={`${session.session_id}_${session.group_id}`} hover>
                        <TableCell>
                          {session.start_time ? fDateTime(session.start_time) : 'N/A'}
                        </TableCell>
                        <TableCell>{session.session_id}</TableCell>
                        <TableCell align="right">{session.performance?.total_laps || 0}</TableCell>
                        <TableCell align="right">
                          {session.performance?.best_lap ? `${(session.performance.best_lap)}s` : 'N/A'}
                        </TableCell>
                        <TableCell align="right">
                          {session.performance?.total_time
                            ? `${Math.floor(session.performance.total_time)}m`
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            </>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <Typography color="text.secondary">No session history found</Typography>
            </Paper>
          )}
        </Card>
      </Container>
    </>
  );
} 