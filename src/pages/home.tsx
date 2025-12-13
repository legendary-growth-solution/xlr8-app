import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Card,
  Button,
  CardContent,
  Grid,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { api } from 'src/api/api';
import { CONFIG } from 'src/config-global';
import { showToast } from 'src/components/toast';
import { CartStatsGraph } from 'src/components/booking/cart-stats-graph';
import { RecentSessions } from 'src/components/booking/recent-sessions';
import { StatsGraph } from 'src/components/booking/stats-graph';
import { dashboardApi } from 'src/services/api/dashboard.api';

interface DashboardStats {
  today: { amount: number; rides: number };
  yesterday: { amount: number; rides: number };
  last7Days: { amount: number; rides: number };
  totals: { amount: number; rides: number };
  last7DaysData?: Array<{ date: string; amount: number; rides: number }>;
  cartStats?: {
    byId: Record<string, number>;
    byType: Record<string, number>;
  };
}

type DailyCartData = {
  cart_stats_by_date?: Record<string, {
    cart_by_id_count?: Record<string, number>;
    cart_by_type_count?: Record<string, number>;
  }>;
  cart_id_to_rfid?: Record<string, string>;
};

interface RecentSession {
  session_id?: string;
  name?: string;
  start_time?: string;
  end_time?: string;
  active?: boolean;
}

const formatNumber = (num: number) => num?.toLocaleString('en-US');

export default function Page() {
  const [stats, setStats] = useState<DashboardStats>({
    today: { amount: 0, rides: 0 },
    yesterday: { amount: 0, rides: 0 },
    last7Days: { amount: 0, rides: 0 },
    totals: { amount: 0, rides: 0 },
    last7DaysData: [],
    cartStats: { byId: {}, byType: {} },
  });

  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionsLoading, setSessionsLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [dailyCartData, setDailyCartData] = useState<DailyCartData>({});
  const navigate = useNavigate();
  
  const fetchRecentSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const response = await api.session.getCompletedSessions({
        page: 1,
        pageSize: 5,
      });
      const sessions = response.sessions || [];
      setRecentSessions(sessions);
    } catch (error) {
      console.error('Failed to fetch recent sessions:', error);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const fetchDailyCartStats = useCallback(async () => {
    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      const startDate = sevenDaysAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      const data = await dashboardApi.getCartStats(startDate, endDate);
      setDailyCartData(data);
    } catch (error) {
      console.error('Failed to fetch daily cart stats:', error);
    }
  }, []);

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const data = await dashboardApi.getDashboardStats(timezone);
      setStats(data);
      await Promise.all([fetchRecentSessions(), fetchDailyCartStats()]);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchRecentSessions, fetchDailyCartStats]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const handleCreateSession = async () => {
    setCreating(true);
    api.session.createSession()
      .then((res) => {
        showToast.success(res?.message || 'Session created successfully');
        navigate(`/active-session`);
        console.log(res);
      })
      .catch((err) => {
        console.log(err, "err");
        showToast.error(err?.response?.data?.error || 'Failed to create session');
      })
      .finally(() => {
        setCreating(false);
      });
    await fetchAnalyticsData();
  };

  const DASHBOARD_CARDS = [
    {
      title: 'Rides (Today)',
      color: 'primary' as const,
      value: stats.today.rides,
      loading,
    },
    {
      title: 'Rides (Yesterday)',
      color: 'primary' as const,
      value: stats.yesterday.rides,
      loading,
    },
    {
      title: 'Rides (Last 7 days)',
      color: 'primary' as const,
      value: stats.last7Days.rides,
      loading,
    },
    {
      title: 'Collection (Today)',
      color: 'success' as const,
      value: stats.today.amount,
      loading,
    },
    {
      title: 'Collection (Yesterday)',
      color: 'success' as const,
      value: stats.yesterday.amount,
      loading,
    },
    {
      title: 'Collection (Last 7 days)',
      color: 'success' as const,
      value: stats.last7Days.amount,
      loading,
    },
  ] as const;

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
          <Typography variant="h4">Go Kart Racing Dashboard</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateSession}
            disabled={creating}
          >
            {creating ? 'Creating...' : 'Create Session'}
          </Button>
        </Stack>
        <Grid container spacing={3}>
          {DASHBOARD_CARDS.map((card, index) => (
            <Grid key={index} item xs={12} md={4}>
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
                        bgcolor: (theme) => alpha(theme.palette[card.color].main, 0.08),
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

                {card.loading && (
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
                      borderRadius: 1,
                      zIndex: 9999,
                    }}
                  >
                    <CircularProgress />
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <StatsGraph
              title="Last 7 Days Statistics"
              subheader="Rides and Collection Overview"
              data={stats.last7DaysData || []}
              loading={loading}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <CartStatsGraph
              title="Cart Usage by RFID"
              subheader="Top carts by number of rides"
              data={stats.cartStats?.byId || {}}
              dailyData={dailyCartData}
              loading={loading}
              type="byId"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CartStatsGraph
              title="Cart Usage by Type"
              subheader="Cart types by number of rides"
              data={stats.cartStats?.byType || {}}
              dailyData={dailyCartData}
              loading={loading}
              type="byType"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <RecentSessions
              sessions={recentSessions}
              loading={sessionsLoading}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
