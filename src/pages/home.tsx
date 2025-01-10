import { Box, Button, Card, CardContent, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from 'src/api/api';
import { Iconify } from 'src/components/iconify';
import { showToast } from 'src/components/toast';
import { CONFIG } from 'src/config-global';
import { apiClient } from 'src/services/api/api-client';

interface AnalyticsData {
  today: number;
  yesterday: number;
  last7Days: number;
}

// Helper function for comma formatting
const formatNumber = (num: number) => num.toLocaleString('en-US');

export default function Page() {
  // 1. Local state for analytics data
  const [ridesData, setRidesData] = useState<AnalyticsData>({
    today: 0,
    yesterday: 0,
    last7Days: 0,
  });

  const [invoicesData, setInvoicesData] = useState<AnalyticsData>({
    today: 0,
    yesterday: 0,
    last7Days: 0,
  });

  // 2. Loading state
  const [loading, setLoading] = useState<boolean>(false);

  // 3. Fetch data when the component mounts
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true); // Start loader
    try {
      // Fetch rides
      const ridesRes = await apiClient.get('/ride-stats');
      setRidesData(ridesRes.data);

      // Fetch invoices
      const invoicesRes = await apiClient.get('/invoice-stats');
      setInvoicesData(invoicesRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  // 4. Define your dashboard cards
  const DASHBOARD_CARDS = [
    {
      title: 'Rides (Today)',
      color: 'primary' as const,
      value: ridesData.today,
    },
    {
      title: 'Rides (Yesterday)',
      color: 'primary' as const,
      value: ridesData.yesterday,
    },
    {
      title: 'Rides (Last 7 days)',
      color: 'primary' as const,
      value: ridesData.last7Days,
    },
    {
      title: 'Collection (Today)',
      color: 'success' as const,
      value: invoicesData.today,
    },
    {
      title: 'Collection (Yesterday)',
      color: 'success' as const,
      value: invoicesData.yesterday,
    },
    {
      title: 'Collection (Last 7 days)',
      color: 'success' as const,
      value: invoicesData.last7Days,
    },
  ] as const;

  const createNewSession = useCallback(() => {
    api.session.startSession
      .then((res) => {
        showToast.success(res?.message);
      })
      .catch((err) => {
        showToast.error(err?.response?.error)
      })
  }, []);

  return (
    <>
      <Helmet>
        <title>{`Dashboard - ${CONFIG.appName}`}</title>
        <meta
          name="description"
          content="Go Kart Racing Management Dashboard - Manage sessions, users, and live racing events"
        />
      </Helmet>

      <Box sx={{ py: 5, px: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">
            Go Kart Racing Dashboard
          </Typography>

          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={()=>createNewSession()}
          >
            New Session
          </Button>
        </Stack>
        <Grid container spacing={3}>
          {DASHBOARD_CARDS.map((card, index) => (
            <Grid key={index} item xs={12} md={4}>
              {/* Wrapper Box with position: relative */}
              <Box sx={{ position: 'relative' }}>
                <Card
                  sx={{
                    boxShadow: (theme) => theme.customShadows.z8,
                    '&:hover': {
                      bgcolor: 'background.neutral',
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      pb: '16px !important',
                    }}
                  >
                    <Box
                      sx={{
                        width: 128,
                        height: 64,
                        display: 'flex',
                        borderRadius: 1.5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: (theme) =>
                          alpha(theme.palette[card.color].main, 0.08),
                      }}
                    >
                      <Typography variant="h5" component="h3">
                        {formatNumber(card.value)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {card.title}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Overlay Loader - only shows when loading */}
                {loading && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1, // match card corners if desired
                      zIndex: 9999, // ensure it’s on top
                    }}
                  >
                    <CircularProgress />
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}
