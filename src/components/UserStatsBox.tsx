import { Card, Divider, Grid, Stack, Typography } from '@mui/material';
import { formatTime } from 'src/utils/format-time';

interface UserStatsBoxProps {
  stats: {
    total_sessions: number;
    total_laps: number;
    best_time: number | null;
    average_lap_time: number | null;
    total_time: number | null;
  };
}

export default function UserStatsBox({ stats }: UserStatsBoxProps) {
  return (
    <Card sx={{ p: 3, height: '100%', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom textAlign="center">
        Performance Overview
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        {[
          { label: 'Total Sessions', value: stats.total_sessions },
          { label: 'Total Laps', value: stats.total_laps },
          { label: 'Best Lap', value: stats.best_time ? formatTime(stats.best_time) : '-' },
          { label: 'Average Lap Time', value: stats.average_lap_time ? formatTime(stats.average_lap_time) : '-' },
          { label: 'Total Time', value: stats.total_time ? formatTime(stats.total_time) : '-' },
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Stack spacing={1} alignItems="center" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
              <Typography color="text.secondary" variant="subtitle2">
                {item.label}
              </Typography>
              <Typography variant="h4">{item.value}</Typography>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
} 